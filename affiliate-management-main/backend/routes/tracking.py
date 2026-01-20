from flask import Blueprint, request, jsonify, Response
from database import execute_query, generate_uuid
from urllib.parse import urlparse
from datetime import datetime

bp = Blueprint('tracking', __name__)

# Separator for general link affiliate IDs: {link_code}-P-{partner_id}
GENERAL_LINK_SEPARATOR = '-P-'

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

def parse_affiliate_id(affiliate_id):
    """
    Parse affiliate_id to extract link_code and partner_id
    For general links: {link_code}-P-{partner_id}
    For specific links: {link_code}
    Returns: (link_code, partner_id from affiliate_id or None)
    """
    if affiliate_id and GENERAL_LINK_SEPARATOR in affiliate_id:
        parts = affiliate_id.split(GENERAL_LINK_SEPARATOR)
        if len(parts) == 2:
            return parts[0], parts[1]
    return affiliate_id, None

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
        
        # Parse affiliate_id to handle general links
        link_code, partner_id_from_affiliate = parse_affiliate_id(affiliate_id)
        
        # Find link by link_code
        link = execute_query(
            "SELECT id, partner_id, source, is_general FROM affiliate_links WHERE link_code = %s",
            (link_code,),
            fetch_one=True
        )
        
        if not link:
            return jsonify({'error': 'Invalid affiliate ID'}), 404
        
        # Determine the partner_id
        # For general links, use the partner_id from the affiliate_id
        # For specific links, use the partner_id from the link
        if link['is_general'] and partner_id_from_affiliate:
            # Verify the partner exists
            partner = execute_query(
                "SELECT id FROM partners WHERE id = %s",
                (partner_id_from_affiliate,),
                fetch_one=True
            )
            partner_id = partner_id_from_affiliate if partner else None
        else:
            partner_id = link['partner_id']
        
        # Use the source from the link
        link_source = link['source'] or 'Direct'
        
        # Track the click
        click_id = generate_uuid()
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip_address and ',' in ip_address:
            ip_address = ip_address.split(',')[0].strip()
        user_agent = request.headers.get('User-Agent', '')
        
        execute_query(
            """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer, referrer_domain, page_url)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (click_id, link['id'], partner_id, affiliate_id, ip_address, user_agent, referrer, link_source, page_url)
        )
        
        # Update link clicks count (for the link itself)
        execute_query(
            "UPDATE affiliate_links SET clicks = clicks + 1 WHERE id = %s",
            (link['id'],)
        )
        
        return jsonify({
            'success': True, 
            'click_id': click_id,
            'source': link_source,
            'is_general': bool(link['is_general']),
            'partner_id': partner_id
        }), 200
        
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
            # Parse affiliate_id to handle general links
            link_code, partner_id_from_affiliate = parse_affiliate_id(affiliate_id)
            
            link = execute_query(
                "SELECT id, partner_id, source, is_general FROM affiliate_links WHERE link_code = %s",
                (link_code,),
                fetch_one=True
            )
            
            if link:
                # Determine the partner_id
                if link['is_general'] and partner_id_from_affiliate:
                    partner = execute_query(
                        "SELECT id FROM partners WHERE id = %s",
                        (partner_id_from_affiliate,),
                        fetch_one=True
                    )
                    partner_id = partner_id_from_affiliate if partner else None
                else:
                    partner_id = link['partner_id']
                
                referrer = request.headers.get('Referer', '')
                link_source = link['source'] or 'Direct'
                
                click_id = generate_uuid()
                ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
                if ip_address and ',' in ip_address:
                    ip_address = ip_address.split(',')[0].strip()
                user_agent = request.headers.get('User-Agent', '')
                
                execute_query(
                    """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer, referrer_domain)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                    (click_id, link['id'], partner_id, affiliate_id, ip_address, user_agent, referrer, link_source)
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
