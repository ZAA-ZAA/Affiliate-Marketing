from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid

bp = Blueprint('partners', __name__)

@bp.route('/api/affiliate-users', methods=['GET'])
def get_affiliate_users():
    """Get all affiliate users who signed up but may not have partner records"""
    try:
        # Get all affiliate users who don't have a partner record yet
        users = execute_query(
            """SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
                      CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END as has_partner
               FROM users u
               LEFT JOIN partners p ON u.id = p.user_id
               WHERE u.role = 'affiliate'
               ORDER BY u.created_at DESC""",
            fetch_all=True
        )
        
        users_list = []
        for user in users:
            users_list.append({
                'id': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'hasPartner': bool(user['has_partner']),
                'createdAt': user['created_at'].strftime('%Y-%m-%d') if user['created_at'] else None
            })
        
        return jsonify(users_list), 200
        
    except Exception as e:
        print(f"Error fetching affiliate users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partners', methods=['POST'])
def add_partner():
    """Add a new affiliate partner (admin only)"""
    try:
        data = request.json
        userId = data.get('userId')  # If selecting existing user
        email = data.get('email')
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        commissionRate = data.get('commissionRate', 10)
        
        user_id = None
        
        # If userId is provided, use existing user
        if userId:
            # Check if user exists and is affiliate
            user = execute_query(
                "SELECT id, email, first_name, last_name FROM users WHERE id = %s AND role = 'affiliate'",
                (userId,),
                fetch_one=True
            )
            
            if not user:
                return jsonify({'error': 'User not found or not an affiliate'}), 404
            
            # Check if user already has a partner record
            existing_partner = execute_query(
                "SELECT id FROM partners WHERE user_id = %s",
                (userId,),
                fetch_one=True
            )
            
            if existing_partner:
                return jsonify({'error': 'This user already has a partner account'}), 400
            
            user_id = userId
            email = user['email']
            firstName = user['first_name']
            lastName = user['last_name']
        else:
            # Create new user account
            if not all([email, firstName, lastName]):
                return jsonify({'error': 'Missing required fields'}), 400
            
            # Check if email already exists
            existing = execute_query(
                "SELECT id FROM users WHERE email = %s",
                (email,),
                fetch_one=True
            )
            
            if existing:
                return jsonify({'error': 'Email already exists'}), 400
            
            # Create user account for partner
            user_id = generate_uuid()
            # Generate a temporary password (in production, send email with password reset)
            import bcrypt
            temp_password = bcrypt.hashpw('temp_password_123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            execute_query(
                "INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES (%s, %s, %s, %s, %s, 'affiliate')",
                (user_id, email, temp_password, firstName, lastName)
            )
        
        # Create partner record
        partner_id = generate_uuid()
        execute_query(
            "INSERT INTO partners (id, user_id, commission_rate, status) VALUES (%s, %s, %s, 'active')",
            (partner_id, user_id, commissionRate)
        )
        
        # Get created partner with stats
        partner = execute_query(
            """SELECT p.id, u.email, u.first_name, u.last_name, p.commission_rate, p.status, p.created_at
               FROM partners p
               JOIN users u ON p.user_id = u.id
               WHERE p.id = %s""",
            (partner_id,),
            fetch_one=True
        )
        
        stats = get_partner_stats(partner_id)
        
        return jsonify({
            'id': partner['id'],
            'email': partner['email'],
            'firstName': partner['first_name'],
            'lastName': partner['last_name'],
            'commissionRate': float(partner['commission_rate']),
            'status': partner['status'],
            'joinedDate': partner['created_at'].strftime('%Y-%m-%d'),
            'totalClicks': stats['total_clicks'],
            'totalConversions': stats['total_conversions'],
            'totalEarnings': float(stats['total_earnings'])
        }), 201
        
    except Exception as e:
        print(f"Error adding partner: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partners', methods=['GET'])
def get_partners():
    """Get all affiliate partners"""
    try:
        partners = execute_query(
            """SELECT p.id, u.email, u.first_name, u.last_name, p.commission_rate, p.status, p.created_at
               FROM partners p
               JOIN users u ON p.user_id = u.id
               ORDER BY p.created_at DESC""",
            fetch_all=True
        )
        
        partners_with_stats = []
        for partner in partners:
            stats = get_partner_stats(partner['id'])
            partners_with_stats.append({
                'id': partner['id'],
                'email': partner['email'],
                'firstName': partner['first_name'],
                'lastName': partner['last_name'],
                'commissionRate': float(partner['commission_rate']),
                'status': partner['status'],
                'joinedDate': partner['created_at'].strftime('%Y-%m-%d'),
                'totalClicks': stats['total_clicks'],
                'totalConversions': stats['total_conversions'],
                'totalEarnings': float(stats['total_earnings'])
            })
        
        return jsonify(partners_with_stats), 200
        
    except Exception as e:
        print(f"Error fetching partners: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    try:
        # Total partners
        total_partners = execute_query(
            "SELECT COUNT(*) as count FROM partners",
            fetch_one=True
        )['count']
        
        # Total clicks
        total_clicks = execute_query(
            "SELECT COUNT(*) as count FROM link_clicks",
            fetch_one=True
        )['count']
        
        # Total conversions (demo requests)
        total_conversions = execute_query(
            "SELECT COUNT(*) as count FROM demo_requests",
            fetch_one=True
        )['count']
        
        # Total earnings (sum from affiliate_links)
        total_earnings = execute_query(
            "SELECT COALESCE(SUM(earnings), 0) as total FROM affiliate_links",
            fetch_one=True
        )['total'] or 0
        
        return jsonify({
            'total_partners': total_partners,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_earnings': float(total_earnings)
        }), 200
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def get_partner_stats(partner_id):
    """Get statistics for a specific partner"""
    try:
        # Total clicks
        total_clicks = execute_query(
            "SELECT COUNT(*) as count FROM link_clicks WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )['count']
        
        # Total conversions
        total_conversions = execute_query(
            "SELECT COUNT(*) as count FROM demo_requests WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )['count']
        
        # Total earnings
        total_earnings = execute_query(
            "SELECT COALESCE(SUM(earnings), 0) as total FROM affiliate_links WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )['total'] or 0
        
        return {
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_earnings': float(total_earnings)
        }
    except Exception as e:
        print(f"Error getting partner stats: {e}")
        return {
            'total_clicks': 0,
            'total_conversions': 0,
            'total_earnings': 0.0
        }
