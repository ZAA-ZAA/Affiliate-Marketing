from flask import Blueprint, request, jsonify
from functools import wraps
from database import execute_query, generate_uuid
from urllib.parse import urlparse
from datetime import datetime

bp = Blueprint('external', __name__)

# API Key validation decorator
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key is required'}), 401
        
        # Validate API key
        key_record = execute_query(
            "SELECT id, is_active FROM api_keys WHERE key_value = %s",
            (api_key,),
            fetch_one=True
        )
        
        if not key_record:
            return jsonify({'error': 'Invalid API key'}), 401
        
        if not key_record['is_active']:
            return jsonify({'error': 'API key is inactive'}), 401
        
        # Update last used timestamp
        execute_query(
            "UPDATE api_keys SET last_used_at = NOW() WHERE id = %s",
            (key_record['id'],)
        )
        
        return f(*args, **kwargs)
    return decorated_function

def extract_domain(url):
    """Extract domain from URL (e.g., facebook.com from https://www.facebook.com/page)"""
    if not url:
        return 'Direct'
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        # Remove www. prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain if domain else 'Direct'
    except:
        return 'Direct'

@bp.route('/api/external/track-click', methods=['POST'])
@require_api_key
def track_click_external():
    """Track a click from external demo form with referrer information"""
    try:
        data = request.json
        affiliate_id = data.get('affiliate_id') or data.get('affiliateId')
        referrer = data.get('referrer', '')
        user_agent = data.get('user_agent', request.headers.get('User-Agent', ''))
        page_url = data.get('page_url', '')
        
        if not affiliate_id:
            return jsonify({'error': 'affiliate_id is required'}), 400
        
        # Find partner by affiliate_id (link_code)
        link = execute_query(
            "SELECT id, partner_id FROM affiliate_links WHERE link_code = %s",
            (affiliate_id,),
            fetch_one=True
        )
        
        if not link:
            return jsonify({'error': 'Invalid affiliate ID'}), 404
        
        # Extract referrer domain
        referrer_domain = extract_domain(referrer)
        
        # Track the click
        click_id = generate_uuid()
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip_address and ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        execute_query(
            """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer, referrer_domain, page_url)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (click_id, link['id'], link['partner_id'], affiliate_id, ip_address, user_agent, referrer, referrer_domain, page_url)
        )
        
        # Update link clicks count
        execute_query(
            "UPDATE affiliate_links SET clicks = clicks + 1 WHERE id = %s",
            (link['id'],)
        )
        
        return jsonify({
            'success': True,
            'click_id': click_id,
            'referrer_domain': referrer_domain
        }), 200
        
    except Exception as e:
        print(f"Error tracking click (external): {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/external/addlead', methods=['POST'])
@require_api_key
def add_lead():
    """Add a lead/conversion from external demo form"""
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        company = data.get('company', '')
        phone = data.get('phone', '')
        message = data.get('message', '')
        affiliate_id = data.get('affiliate_id') or data.get('affiliateId')
        referrer = data.get('referrer', '')
        source_url = data.get('source_url', '')
        
        if not name or not email:
            return jsonify({'error': 'Name and email are required'}), 400
        
        # Extract referrer domain
        referrer_domain = extract_domain(referrer)
        
        # Find partner by affiliate_id if provided
        partner_id = None
        link_id = None
        if affiliate_id:
            link = execute_query(
                "SELECT id, partner_id FROM affiliate_links WHERE link_code = %s LIMIT 1",
                (affiliate_id,),
                fetch_one=True
            )
            if link:
                partner_id = link['partner_id']
                link_id = link['id']
        
        # Create demo request (conversion)
        request_id = generate_uuid()
        execute_query(
            """INSERT INTO demo_requests (id, partner_id, affiliate_id, name, email, company, phone, message, referrer, referrer_domain, source_url)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (request_id, partner_id, affiliate_id, name, email, company, phone, message, referrer, referrer_domain, source_url)
        )
        
        # If partner found, update conversion count on the link
        if link_id:
            execute_query(
                "UPDATE affiliate_links SET conversions = conversions + 1 WHERE id = %s",
                (link_id,)
            )
        
        return jsonify({
            'success': True,
            'message': 'Lead added successfully',
            'request_id': request_id,
            'is_affiliate': partner_id is not None
        }), 201
        
    except Exception as e:
        print(f"Error adding lead: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/clicks/details', methods=['GET'])
def get_click_details():
    """Get detailed click information grouped by referrer domain"""
    try:
        # Get clicks grouped by referrer domain
        clicks_by_source = execute_query(
            """SELECT 
                referrer_domain,
                COUNT(*) as click_count,
                MAX(clicked_at) as last_click
               FROM link_clicks
               GROUP BY referrer_domain
               ORDER BY click_count DESC""",
            fetch_all=True
        )
        
        # Get recent individual clicks
        recent_clicks = execute_query(
            """SELECT 
                lc.id, lc.affiliate_id, lc.referrer, lc.referrer_domain, 
                lc.ip_address, lc.clicked_at, lc.page_url,
                p.id as partner_id,
                u.first_name, u.last_name
               FROM link_clicks lc
               LEFT JOIN partners p ON lc.partner_id = p.id
               LEFT JOIN users u ON p.user_id = u.id
               ORDER BY lc.clicked_at DESC
               LIMIT 100""",
            fetch_all=True
        )
        
        return jsonify({
            'by_source': [{
                'source': row['referrer_domain'] or 'Direct',
                'clicks': row['click_count'],
                'last_click': row['last_click'].isoformat() if row['last_click'] else None
            } for row in clicks_by_source],
            'recent': [{
                'id': row['id'],
                'affiliate_id': row['affiliate_id'],
                'referrer': row['referrer'],
                'source': row['referrer_domain'] or 'Direct',
                'ip_address': row['ip_address'],
                'clicked_at': row['clicked_at'].isoformat() if row['clicked_at'] else None,
                'page_url': row['page_url'],
                'partner_name': f"{row['first_name']} {row['last_name']}" if row['first_name'] else 'Unknown'
            } for row in recent_clicks]
        }), 200
        
    except Exception as e:
        print(f"Error getting click details: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/conversions/details', methods=['GET'])
def get_conversion_details():
    """Get detailed conversion/lead information"""
    try:
        # Get conversions grouped by referrer domain
        conversions_by_source = execute_query(
            """SELECT 
                referrer_domain,
                COUNT(*) as conversion_count,
                MAX(requested_at) as last_conversion
               FROM demo_requests
               GROUP BY referrer_domain
               ORDER BY conversion_count DESC""",
            fetch_all=True
        )
        
        # Get all conversion details with form data
        conversions = execute_query(
            """SELECT 
                dr.id, dr.affiliate_id, dr.name, dr.email, dr.company, 
                dr.phone, dr.message, dr.referrer, dr.referrer_domain,
                dr.source_url, dr.requested_at, dr.partner_id,
                u.first_name as partner_first_name, u.last_name as partner_last_name
               FROM demo_requests dr
               LEFT JOIN partners p ON dr.partner_id = p.id
               LEFT JOIN users u ON p.user_id = u.id
               ORDER BY dr.requested_at DESC""",
            fetch_all=True
        )
        
        return jsonify({
            'by_source': [{
                'source': row['referrer_domain'] or 'Direct',
                'conversions': row['conversion_count'],
                'last_conversion': row['last_conversion'].isoformat() if row['last_conversion'] else None
            } for row in conversions_by_source],
            'leads': [{
                'id': row['id'],
                'affiliate_id': row['affiliate_id'],
                'name': row['name'],
                'email': row['email'],
                'company': row['company'],
                'phone': row['phone'],
                'message': row['message'],
                'referrer': row['referrer'],
                'source': row['referrer_domain'] or 'Direct',
                'source_url': row['source_url'],
                'submitted_at': row['requested_at'].isoformat() if row['requested_at'] else None,
                'partner_id': row['partner_id'],
                'partner_name': f"{row['partner_first_name']} {row['partner_last_name']}" if row['partner_first_name'] else None
            } for row in conversions]
        }), 200
        
    except Exception as e:
        print(f"Error getting conversion details: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partner/<partner_id>/clicks', methods=['GET'])
def get_partner_clicks(partner_id):
    """Get click details for a specific partner"""
    try:
        # Get clicks grouped by referrer domain for this partner
        clicks_by_source = execute_query(
            """SELECT 
                referrer_domain,
                COUNT(*) as click_count,
                MAX(clicked_at) as last_click
               FROM link_clicks
               WHERE partner_id = %s
               GROUP BY referrer_domain
               ORDER BY click_count DESC""",
            (partner_id,),
            fetch_all=True
        )
        
        # Get recent individual clicks for this partner
        recent_clicks = execute_query(
            """SELECT 
                id, affiliate_id, referrer, referrer_domain, 
                ip_address, clicked_at, page_url
               FROM link_clicks
               WHERE partner_id = %s
               ORDER BY clicked_at DESC
               LIMIT 50""",
            (partner_id,),
            fetch_all=True
        )
        
        return jsonify({
            'by_source': [{
                'source': row['referrer_domain'] or 'Direct',
                'clicks': row['click_count'],
                'last_click': row['last_click'].isoformat() if row['last_click'] else None
            } for row in clicks_by_source],
            'recent': [{
                'id': row['id'],
                'affiliate_id': row['affiliate_id'],
                'referrer': row['referrer'],
                'source': row['referrer_domain'] or 'Direct',
                'ip_address': row['ip_address'],
                'clicked_at': row['clicked_at'].isoformat() if row['clicked_at'] else None,
                'page_url': row['page_url']
            } for row in recent_clicks]
        }), 200
        
    except Exception as e:
        print(f"Error getting partner clicks: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/partner/<partner_id>/conversions', methods=['GET'])
def get_partner_conversions(partner_id):
    """Get conversion details for a specific partner"""
    try:
        # Get conversions grouped by referrer domain for this partner
        conversions_by_source = execute_query(
            """SELECT 
                referrer_domain,
                COUNT(*) as conversion_count,
                MAX(requested_at) as last_conversion
               FROM demo_requests
               WHERE partner_id = %s
               GROUP BY referrer_domain
               ORDER BY conversion_count DESC""",
            (partner_id,),
            fetch_all=True
        )
        
        # Get all conversions for this partner
        conversions = execute_query(
            """SELECT 
                id, affiliate_id, name, email, company, 
                phone, message, referrer, referrer_domain,
                source_url, requested_at
               FROM demo_requests
               WHERE partner_id = %s
               ORDER BY requested_at DESC""",
            (partner_id,),
            fetch_all=True
        )
        
        return jsonify({
            'by_source': [{
                'source': row['referrer_domain'] or 'Direct',
                'conversions': row['conversion_count'],
                'last_conversion': row['last_conversion'].isoformat() if row['last_conversion'] else None
            } for row in conversions_by_source],
            'leads': [{
                'id': row['id'],
                'affiliate_id': row['affiliate_id'],
                'name': row['name'],
                'email': row['email'],
                'company': row['company'],
                'phone': row['phone'],
                'message': row['message'],
                'referrer': row['referrer'],
                'source': row['referrer_domain'] or 'Direct',
                'source_url': row['source_url'],
                'submitted_at': row['requested_at'].isoformat() if row['requested_at'] else None
            } for row in conversions]
        }), 200
        
    except Exception as e:
        print(f"Error getting partner conversions: {e}")
        return jsonify({'error': 'Internal server error'}), 500
