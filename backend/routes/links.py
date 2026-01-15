from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid
import secrets
import string

bp = Blueprint('links', __name__)

def generate_link_code(length=8):
    """Generate a random link code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@bp.route('/api/links', methods=['POST'])
def create_link():
    """Create a new affiliate link"""
    try:
        data = request.json
        partnerId = data.get('partnerId')
        originalUrl = data.get('originalUrl')
        title = data.get('title')
        description = data.get('description', '')
        
        if not all([partnerId, originalUrl, title]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate URL
        try:
            from urllib.parse import urlparse
            result = urlparse(originalUrl)
            if not all([result.scheme, result.netloc]):
                raise ValueError("Invalid URL")
        except:
            return jsonify({'error': 'Invalid URL'}), 400
        
        # Check if partner exists
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
        execute_query(
            """INSERT INTO affiliate_links (id, partner_id, original_url, link_code, title, description)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (link_id, partnerId, originalUrl, link_code, title, description)
        )
        
        # Get created link
        link = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, clicks, conversions, earnings, created_at
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
    """Get all links for a partner"""
    try:
        links = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, clicks, conversions, earnings, created_at
               FROM affiliate_links
               WHERE partner_id = %s
               ORDER BY created_at DESC""",
            (partner_id,),
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
                'clicks': link['clicks'],
                'conversions': link['conversions'],
                'earnings': float(link['earnings']),
                'created_at': link['created_at'].isoformat()
            })
        
        return jsonify(links_list), 200
        
    except Exception as e:
        print(f"Error fetching partner links: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/links/detail/<link_id>', methods=['GET'])
def get_link(link_id):
    """Get a specific link"""
    try:
        link = execute_query(
            """SELECT id, partner_id, original_url, link_code, title, description, clicks, conversions, earnings, created_at
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
            'clicks': link['clicks'],
            'conversions': link['conversions'],
            'earnings': float(link['earnings']),
            'created_at': link['created_at'].isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error fetching link: {e}")
        return jsonify({'error': 'Internal server error'}), 500
