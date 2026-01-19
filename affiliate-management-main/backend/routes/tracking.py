from flask import Blueprint, request, jsonify, Response
from database import execute_query, generate_uuid
from urllib.parse import urlparse
from datetime import datetime

bp = Blueprint('tracking', __name__)

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

@bp.route('/api/track', methods=['POST'])
def track_click():
    """Track a click on an affiliate link"""
    try:
        data = request.json
        affiliate_id = data.get('affiliate_id') or data.get('affiliateId')
        referrer = data.get('referrer') or request.headers.get('Referer', '')
        page_url = data.get('page_url', '')
        
        if not affiliate_id:
            return jsonify({'error': 'affiliate_id required'}), 400
        
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
        user_agent = request.headers.get('User-Agent', '')
        
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
        
        return jsonify({'success': True, 'click_id': click_id}), 200
        
    except Exception as e:
        print(f"Error tracking click: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/track-pixel', methods=['GET'])
def track_pixel():
    """Return a 1x1 tracking pixel"""
    # 1x1 transparent PNG
    pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Track if affiliate_id is provided
    affiliate_id = request.args.get('affiliate_id') or request.args.get('affiliateId')
    if affiliate_id:
        try:
            link = execute_query(
                "SELECT id, partner_id FROM affiliate_links WHERE link_code = %s",
                (affiliate_id,),
                fetch_one=True
            )
            
            if link:
                referrer = request.headers.get('Referer', '')
                referrer_domain = extract_domain(referrer)
                
                click_id = generate_uuid()
                ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
                if ip_address and ',' in ip_address:
                    ip_address = ip_address.split(',')[0].strip()
                user_agent = request.headers.get('User-Agent', '')
                
                execute_query(
                    """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer, referrer_domain)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                    (click_id, link['id'], link['partner_id'], affiliate_id, ip_address, user_agent, referrer, referrer_domain)
                )
                
                execute_query(
                    "UPDATE affiliate_links SET clicks = clicks + 1 WHERE id = %s",
                    (link['id'],)
                )
        except Exception as e:
            print(f"Error tracking pixel: {e}")
    
    return Response(pixel, mimetype='image/png')

@bp.route('/api/track-script', methods=['GET'])
def track_script():
    """Return a tracking JavaScript snippet"""
    script = """
(function() {
    var affiliateId = new URLSearchParams(window.location.search).get('affiliate-id') || 
                      new URLSearchParams(window.location.search).get('affiliate_id');
    if (affiliateId) {
        localStorage.setItem('affiliate_id', affiliateId);
        localStorage.setItem('affiliate_referrer', document.referrer);
        
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                affiliate_id: affiliateId,
                referrer: document.referrer,
                page_url: window.location.href
            })
        }).catch(function(err) {
            console.error('Affiliate tracking error:', err);
        });
    }
})();
"""
    return Response(script, mimetype='application/javascript')
