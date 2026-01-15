from flask import Blueprint, request, jsonify
from database import execute_query, generate_uuid
from datetime import datetime

bp = Blueprint('tracking', __name__)

@bp.route('/api/track', methods=['POST'])
def track_click():
    """Track a click on an affiliate link"""
    try:
        data = request.json
        affiliate_id = data.get('affiliate_id') or data.get('affiliateId')
        
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
        
        # Track the click
        click_id = generate_uuid()
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        referrer = request.headers.get('Referer', '')
        
        execute_query(
            """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (click_id, link['id'], link['partner_id'], affiliate_id, ip_address, user_agent, referrer)
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
    from flask import Response
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
                click_id = generate_uuid()
                ip_address = request.remote_addr
                user_agent = request.headers.get('User-Agent', '')
                referrer = request.headers.get('Referer', '')
                
                execute_query(
                    """INSERT INTO link_clicks (id, link_id, partner_id, affiliate_id, ip_address, user_agent, referrer)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (click_id, link['id'], link['partner_id'], affiliate_id, ip_address, user_agent, referrer)
                )
                
                execute_query(
                    "UPDATE affiliate_links SET clicks = clicks + 1 WHERE id = %s",
                    (link['id'],)
                )
        except Exception as e:
            print(f"Error tracking pixel: {e}")
    
    return Response(pixel, mimetype='image/png')
