from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid
from datetime import datetime
from urllib.parse import urlparse

bp = Blueprint('demo', __name__)

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

@bp.route('/api/demo-request', methods=['POST'])
def submit_demo_request():
    """Submit a demo request form (tracks conversion)"""
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        company = data.get('company', '')
        phone = data.get('phone', '')
        message = data.get('message', '')
        affiliate_id = data.get('affiliate_id') or data.get('affiliateId')
        referrer = data.get('referrer') or request.headers.get('Referer', '')
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
        
        # Create demo request
        request_id = generate_uuid()
        execute_query(
            """INSERT INTO demo_requests (id, partner_id, affiliate_id, name, email, company, phone, message, referrer, referrer_domain, source_url)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (request_id, partner_id, affiliate_id, name, email, company, phone, message, referrer, referrer_domain, source_url)
        )
        
        # If partner found, update conversion count on the link
        if link_id:
            execute_query(
                """UPDATE affiliate_links 
                   SET conversions = conversions + 1 
                   WHERE id = %s""",
                (link_id,)
            )
        
        return jsonify({
            'success': True,
            'message': 'Demo request submitted successfully',
            'request_id': request_id
        }), 201
        
    except Exception as e:
        print(f"Error submitting demo request: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/demo', methods=['GET'])
def get_demo():
    """Demo endpoint"""
    return jsonify({
        'message': 'Demo endpoint',
        'timestamp': datetime.now().isoformat(),
        'data': {}
    }), 200
