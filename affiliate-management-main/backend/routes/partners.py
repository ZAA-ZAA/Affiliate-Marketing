from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid

bp = Blueprint('partners', __name__)

@bp.route('/api/affiliate-users', methods=['GET'])
def get_affiliate_users():
    """Get all affiliate users who are not yet active partners (pending, rejected, or no partner record)"""
    try:
        # Get affiliate users who are NOT active partners
        # This includes: no partner record, pending status, or rejected status
        users = execute_query(
            """SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
                      p.id as partner_id, p.status as partner_status
               FROM users u
               LEFT JOIN partners p ON u.id = p.user_id
               WHERE u.role = 'affiliate'
               AND (p.id IS NULL OR p.status IN ('pending', 'rejected'))
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
                'partnerId': user['partner_id'],
                'partnerStatus': user['partner_status'],
                'createdAt': user['created_at'].strftime('%Y-%m-%d') if user['created_at'] else None
            })
        
        return jsonify(users_list), 200
        
    except Exception as e:
        print(f"Error fetching affiliate users: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partners', methods=['POST'])
def add_partner():
    """Add a new affiliate partner or activate existing pending/rejected partner (admin only)"""
    try:
        data = request.json
        userId = data.get('userId')  # If selecting existing user
        commissionRate = data.get('commissionRate', 10)
        
        if not userId:
            return jsonify({'error': 'User ID is required'}), 400
        
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
            "SELECT id, status FROM partners WHERE user_id = %s",
            (userId,),
            fetch_one=True
        )
        
        partner_id = None
        
        if existing_partner:
            # User has existing partner record - update it to active
            if existing_partner['status'] == 'active':
                return jsonify({'error': 'This user is already an active partner'}), 400
            
            # Update existing partner to active status
            execute_query(
                "UPDATE partners SET status = 'active', commission_rate = %s WHERE id = %s",
                (commissionRate, existing_partner['id'])
            )
            partner_id = existing_partner['id']
        else:
            # Create new partner record
            partner_id = generate_uuid()
            execute_query(
                "INSERT INTO partners (id, user_id, commission_rate, status) VALUES (%s, %s, %s, 'active')",
                (partner_id, userId, commissionRate)
            )
        
        # Get partner with stats
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
    """Get all active affiliate partners (excluding pending)"""
    try:
        partners = execute_query(
            """SELECT p.id, u.email, u.first_name, u.last_name, p.commission_rate, p.status, p.created_at
               FROM partners p
               JOIN users u ON p.user_id = u.id
               WHERE p.status = 'active'
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

@bp.route('/api/partners/pending', methods=['GET'])
def get_pending_partners():
    """Get all pending affiliate partners awaiting approval"""
    try:
        partners = execute_query(
            """SELECT p.id, u.id as user_id, u.email, u.first_name, u.last_name, u.mobile_number, 
                      u.email_verified, p.commission_rate, p.status, p.created_at
               FROM partners p
               JOIN users u ON p.user_id = u.id
               WHERE p.status = 'pending'
               ORDER BY u.email_verified DESC, p.created_at DESC""",
            fetch_all=True
        )
        
        pending_list = []
        for partner in partners:
            pending_list.append({
                'id': partner['id'],
                'userId': partner['user_id'],
                'email': partner['email'],
                'firstName': partner['first_name'],
                'lastName': partner['last_name'],
                'mobileNumber': partner['mobile_number'],
                'emailVerified': bool(partner['email_verified']),
                'commissionRate': float(partner['commission_rate']),
                'status': partner['status'],
                'joinedDate': partner['created_at'].strftime('%Y-%m-%d %H:%M') if partner['created_at'] else None
            })
        
        return jsonify(pending_list), 200
        
    except Exception as e:
        print(f"Error fetching pending partners: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partners/<partner_id>/approve', methods=['POST'])
def approve_partner(partner_id):
    """Approve a pending affiliate partner (only if email is verified)"""
    try:
        # Check if partner exists with user info
        partner = execute_query(
            """SELECT p.id, p.status, u.email_verified, u.email
               FROM partners p
               JOIN users u ON p.user_id = u.id
               WHERE p.id = %s""",
            (partner_id,),
            fetch_one=True
        )
        
        if not partner:
            return jsonify({'error': 'Partner not found'}), 404
        
        if partner['status'] != 'pending':
            return jsonify({'error': 'Partner is not in pending status'}), 400
        
        # Check if email is verified - BLOCK approval if not verified
        if not partner['email_verified']:
            return jsonify({
                'error': 'Cannot approve partner. Email is not verified yet.',
                'emailVerified': False
            }), 400
        
        # Update status to active
        execute_query(
            "UPDATE partners SET status = 'active' WHERE id = %s",
            (partner_id,)
        )
        
        return jsonify({'message': 'Partner approved successfully', 'status': 'active'}), 200
        
    except Exception as e:
        print(f"Error approving partner: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partners/<partner_id>/reject', methods=['POST'])
def reject_partner(partner_id):
    """Reject a pending affiliate partner"""
    try:
        # Check if partner exists and is pending
        partner = execute_query(
            "SELECT id, status FROM partners WHERE id = %s",
            (partner_id,),
            fetch_one=True
        )
        
        if not partner:
            return jsonify({'error': 'Partner not found'}), 404
        
        if partner['status'] != 'pending':
            return jsonify({'error': 'Partner is not in pending status'}), 400
        
        # Update status to rejected
        execute_query(
            "UPDATE partners SET status = 'rejected' WHERE id = %s",
            (partner_id,)
        )
        
        return jsonify({'message': 'Partner rejected', 'status': 'rejected'}), 200
        
    except Exception as e:
        print(f"Error rejecting partner: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    try:
        # Total active partners
        total_partners = execute_query(
            "SELECT COUNT(*) as count FROM partners WHERE status = 'active'",
            fetch_one=True
        )['count']
        
        # Total pending partners
        pending_partners = execute_query(
            "SELECT COUNT(*) as count FROM partners WHERE status = 'pending'",
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
            'pending_partners': pending_partners,
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
