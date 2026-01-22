from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid
import secrets
import string

bp = Blueprint('links', __name__)

# Predefined sources for link tracking
PREDEFINED_SOURCES = [
    'Facebook',
    'Instagram',
    'TikTok',
    'YouTube',
    'Twitter/X',
    'LinkedIn',
    'Email',
    'Website',
    'Blog',
    'Forum',
    'Direct'
]

# Separator for general link affiliate IDs: {link_code}-P-{partner_id}
GENERAL_LINK_SEPARATOR = '-P-'

def generate_link_code(length=8):
    """Generate a random link code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def parse_affiliate_id(affiliate_id):
    """
    Parse affiliate_id to extract link_code and partner_id
    For general links: {link_code}-P-{partner_id}
    For specific links: {link_code}
    Returns: (link_code, partner_id or None)
    """
    if GENERAL_LINK_SEPARATOR in affiliate_id:
        parts = affiliate_id.split(GENERAL_LINK_SEPARATOR)
        if len(parts) == 2:
            return parts[0], parts[1]
    return affiliate_id, None

def get_partner_stats_from_clicks(partner_id):
    """Get accurate click/conversion stats for a partner from link_clicks table"""
    try:
        # Total clicks for this partner (from link_clicks, not affiliate_links)
        clicks_result = execute_query(
            "SELECT COUNT(*) as count FROM link_clicks WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )
        total_clicks = clicks_result['count'] if clicks_result else 0
        
        # Total conversions for this partner (from demo_requests)
        conversions_result = execute_query(
            "SELECT COUNT(*) as count FROM demo_requests WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )
        total_conversions = conversions_result['count'] if conversions_result else 0
        
        # Total earnings (affiliate_links + partner_earnings)
        link_earnings = execute_query(
            "SELECT COALESCE(SUM(earnings), 0) as total FROM affiliate_links WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )
        link_earnings_total = float(link_earnings['total']) if link_earnings else 0.0
        
        pe_earnings = execute_query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM partner_earnings WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )
        pe_earnings_total = float(pe_earnings['total']) if pe_earnings else 0.0
        
        total_earnings = link_earnings_total + pe_earnings_total
        
        return {
            'clicks': total_clicks,
            'conversions': total_conversions,
            'earnings': total_earnings
        }
    except Exception as e:
        print(f"Error getting partner stats: {e}")
        return {'clicks': 0, 'conversions': 0, 'earnings': 0.0}

@bp.route('/api/links/sources', methods=['GET'])
def get_sources():
    """Get predefined sources for link tracking"""
    return jsonify(PREDEFINED_SOURCES), 200

@bp.route('/api/links', methods=['POST'])
def create_link():
    """Create a new affiliate link"""
    try:
        data = request.json
        partnerId = data.get('partnerId')
        originalUrl = data.get('originalUrl')
        title = data.get('title')
        description = data.get('description', '')
        source = data.get('source', 'Direct')
        is_general = data.get('isGeneral', False)
        
        if not all([originalUrl, title]):
            return jsonify({'error': 'Missing required fields (originalUrl, title)'}), 400
        
        # For non-general links, partnerId is required
        if not is_general and not partnerId:
            return jsonify({'error': 'Partner ID is required for non-general links'}), 400
        
        # Validate URL
        try:
            from urllib.parse import urlparse
            result = urlparse(originalUrl)
            if not all([result.scheme, result.netloc]):
                raise ValueError("Invalid URL")
        except:
            return jsonify({'error': 'Invalid URL'}), 400
        
        # For non-general links, check if partner exists
        if partnerId and not is_general:
            partner = execute_query(
                "SELECT id FROM partners WHERE id = %s",
                (partnerId,),
                fetch_one=True
            )
            if not partner:
                return jsonify({'error': 'Partner not found'}), 404
        
        # Generate unique link code
        link_code = generate_link_code()
        max_attempts = 10
        attempts = 0
        while attempts < max_attempts:
            existing = execute_query(
                "SELECT id FROM affiliate_links WHERE link_code = %s",
                (link_code,),
                fetch_one=True
            )
            if not existing:
                break
            link_code = generate_link_code()
            attempts += 1
        
        if attempts >= max_attempts:
            return jsonify({'error': 'Failed to generate unique link code'}), 500
        
        # Create affiliate link
        link_id = generate_uuid()
        
        if is_general:
            execute_query(
                """INSERT INTO affiliate_links (id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled)
                   VALUES (%s, NULL, %s, %s, %s, %s, %s, TRUE, TRUE)""",
                (link_id, originalUrl, link_code, title, description, source)
            )
        else:
            execute_query(
                """INSERT INTO affiliate_links (id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, FALSE, TRUE)""",
                (link_id, partnerId, originalUrl, link_code, title, description, source)
            )
        
        # Get created link
        link = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled, clicks, conversions, earnings, created_at
               FROM affiliate_links WHERE id = %s""",
            (link_id,),
            fetch_one=True
        )
        
        return jsonify({
            'id': link['id'],
            'partner_id': link['partner_id'],
            'original_url': link['original_url'],
            'link_code': link['link_code'],
            'title': link['title'],
            'description': link['description'],
            'source': link['source'],
            'is_general': bool(link['is_general']),
            'is_enabled': bool(link['is_enabled']),
            'clicks': link['clicks'],
            'conversions': link['conversions'],
            'earnings': float(link['earnings']),
            'created_at': link['created_at'].isoformat()
        }), 201
        
    except Exception as e:
        print(f"Error creating link: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/<partner_id>', methods=['GET'])
def get_partner_links(partner_id):
    """Get all links for a partner (includes general links with partner-specific affiliate IDs)"""
    try:
        # Get partner-specific links
        partner_links = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled, clicks, conversions, earnings, created_at
               FROM affiliate_links
               WHERE partner_id = %s
               ORDER BY created_at DESC""",
            (partner_id,),
            fetch_all=True
        )
        
        # Get general links
        general_links = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled, clicks, conversions, earnings, created_at
               FROM affiliate_links
               WHERE is_general = TRUE
               ORDER BY created_at DESC""",
            fetch_all=True
        )
        
        links_list = []
        
        # Add partner-specific links with their own stats
        for link in partner_links:
            links_list.append({
                'id': link['id'],
                'partner_id': link['partner_id'],
                'original_url': link['original_url'],
                'link_code': link['link_code'],  # Use original code for partner-specific links
                'title': link['title'],
                'description': link['description'],
                'source': link['source'] or 'Direct',
                'is_general': False,
                'is_enabled': bool(link['is_enabled']),
                'clicks': link['clicks'],
                'conversions': link['conversions'],
                'earnings': float(link['earnings']),
                'created_at': link['created_at'].isoformat()
            })
        
        # Add general links with partner-specific affiliate ID and stats
        for link in general_links:
            # Create unique affiliate-id for this partner: {link_code}-P-{partner_id}
            partner_affiliate_id = f"{link['link_code']}{GENERAL_LINK_SEPARATOR}{partner_id}"
            
            # Get this partner's clicks/conversions for this general link
            partner_clicks = execute_query(
                "SELECT COUNT(*) as count FROM link_clicks WHERE link_id = %s AND partner_id = %s",
                (link['id'], partner_id),
                fetch_one=True
            )
            partner_conversions = execute_query(
                "SELECT COUNT(*) as count FROM demo_requests WHERE affiliate_id = %s AND partner_id = %s",
                (partner_affiliate_id, partner_id),
                fetch_one=True
            )
            
            links_list.append({
                'id': link['id'],
                'partner_id': partner_id,  # Show as belonging to this partner for display
                'original_url': link['original_url'],
                'link_code': partner_affiliate_id,  # Unique affiliate-id per partner for general links
                'title': link['title'],
                'description': link['description'],
                'source': link['source'] or 'Direct',
                'is_general': True,
                'is_enabled': bool(link['is_enabled']),
                'clicks': partner_clicks['count'] if partner_clicks else 0,
                'conversions': partner_conversions['count'] if partner_conversions else 0,
                'earnings': 0.0,  # Earnings are tracked per partner-specific link only
                'created_at': link['created_at'].isoformat()
            })
        
        # Sort by enabled first, then by created_at
        links_list.sort(key=lambda x: (not x['is_enabled'], x['created_at']), reverse=True)
        
        # Calculate total earnings including partner_earnings
        link_earnings_total = sum(float(link.get('earnings', 0)) for link in links_list)
        pe_earnings = execute_query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM partner_earnings WHERE partner_id = %s",
            (partner_id,),
            fetch_one=True
        )
        pe_earnings_total = float(pe_earnings['total']) if pe_earnings else 0.0
        total_earnings = link_earnings_total + pe_earnings_total
        
        # Return links array with stats
        return jsonify({
            'links': links_list,
            'stats': {
                'totalEarnings': total_earnings
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching partner links: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/all', methods=['GET'])
def get_all_links():
    """Get all links (admin only) - for link management"""
    try:
        links = execute_query(
            """SELECT al.id, al.partner_id, al.original_url, al.link_code, al.title, al.description, 
                      al.source, al.is_general, al.is_enabled, al.clicks, al.conversions, al.earnings, al.created_at,
                      u.first_name, u.last_name
               FROM affiliate_links al
               LEFT JOIN partners p ON al.partner_id = p.id
               LEFT JOIN users u ON p.user_id = u.id
               ORDER BY al.is_general DESC, al.created_at DESC""",
            fetch_all=True
        )
        
        links_list = []
        for link in links:
            # For general links, get total clicks/conversions across all partners
            if link['is_general']:
                total_clicks = execute_query(
                    "SELECT COUNT(*) as count FROM link_clicks WHERE link_id = %s",
                    (link['id'],),
                    fetch_one=True
                )
                # Count conversions where affiliate_id starts with this link_code
                total_conversions = execute_query(
                    "SELECT COUNT(*) as count FROM demo_requests WHERE affiliate_id LIKE %s",
                    (f"{link['link_code']}%",),
                    fetch_one=True
                )
                clicks = total_clicks['count'] if total_clicks else 0
                conversions = total_conversions['count'] if total_conversions else 0
            else:
                clicks = link['clicks']
                conversions = link['conversions']
            
            links_list.append({
                'id': link['id'],
                'partner_id': link['partner_id'],
                'partner_name': f"{link['first_name']} {link['last_name']}" if link['first_name'] else 'General Link',
                'original_url': link['original_url'],
                'link_code': link['link_code'],
                'title': link['title'],
                'description': link['description'],
                'source': link['source'] or 'Direct',
                'is_general': bool(link['is_general']),
                'is_enabled': bool(link['is_enabled']),
                'clicks': clicks,
                'conversions': conversions,
                'earnings': float(link['earnings']),
                'created_at': link['created_at'].isoformat()
            })
        
        return jsonify(links_list), 200
        
    except Exception as e:
        print(f"Error fetching all links: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/general', methods=['GET'])
def get_general_links():
    """Get all general links"""
    try:
        links = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled, clicks, conversions, earnings, created_at
               FROM affiliate_links
               WHERE is_general = TRUE
               ORDER BY created_at DESC""",
            fetch_all=True
        )
        
        links_list = []
        for link in links:
            links_list.append({
                'id': link['id'],
                'partner_id': link['partner_id'],
                'original_url': link['original_url'],
                'link_code': link['link_code'],
                'title': link['title'],
                'description': link['description'],
                'source': link['source'] or 'Direct',
                'is_general': bool(link['is_general']),
                'is_enabled': bool(link['is_enabled']),
                'clicks': link['clicks'],
                'conversions': link['conversions'],
                'earnings': float(link['earnings']),
                'created_at': link['created_at'].isoformat()
            })
        
        return jsonify(links_list), 200
        
    except Exception as e:
        print(f"Error fetching general links: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/detail/<link_id>', methods=['GET'])
def get_link(link_id):
    """Get a specific link"""
    try:
        link = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, source, is_general, is_enabled, clicks, conversions, earnings, created_at
               FROM affiliate_links WHERE id = %s""",
            (link_id,),
            fetch_one=True
        )
        
        if not link:
            return jsonify({'error': 'Link not found'}), 404
        
        return jsonify({
            'id': link['id'],
            'partner_id': link['partner_id'],
            'original_url': link['original_url'],
            'link_code': link['link_code'],
            'title': link['title'],
            'description': link['description'],
            'source': link['source'] or 'Direct',
            'is_general': bool(link['is_general']),
            'is_enabled': bool(link['is_enabled']),
            'clicks': link['clicks'],
            'conversions': link['conversions'],
            'earnings': float(link['earnings']),
            'created_at': link['created_at'].isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error fetching link: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/<link_id>/toggle', methods=['POST'])
def toggle_link(link_id):
    """Toggle link enabled/disabled status"""
    try:
        # Check if link exists
        link = execute_query(
            "SELECT id, is_enabled FROM affiliate_links WHERE id = %s",
            (link_id,),
            fetch_one=True
        )
        
        if not link:
            return jsonify({'error': 'Link not found'}), 404
        
        # Toggle status
        new_status = not bool(link['is_enabled'])
        execute_query(
            "UPDATE affiliate_links SET is_enabled = %s WHERE id = %s",
            (new_status, link_id)
        )
        
        return jsonify({
            'message': f"Link {'enabled' if new_status else 'disabled'} successfully",
            'is_enabled': new_status
        }), 200
        
    except Exception as e:
        print(f"Error toggling link: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/<link_id>', methods=['DELETE'])
def delete_link(link_id):
    """Soft delete a link (disable it instead of actual delete)"""
    try:
        # Check if link exists
        link = execute_query(
            "SELECT id FROM affiliate_links WHERE id = %s",
            (link_id,),
            fetch_one=True
        )
        
        if not link:
            return jsonify({'error': 'Link not found'}), 404
        
        # Disable instead of delete
        execute_query(
            "UPDATE affiliate_links SET is_enabled = FALSE WHERE id = %s",
            (link_id,)
        )
        
        return jsonify({'message': 'Link disabled successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting link: {e}")
        return jsonify({'error': 'Internal server error'}), 500
