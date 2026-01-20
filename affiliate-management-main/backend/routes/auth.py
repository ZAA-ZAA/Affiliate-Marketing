from flask import Blueprint, request, jsonify
import bcrypt
from database import execute_query, generate_uuid

bp = Blueprint('auth', __name__)

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@bp.route('/api/auth/setup-admin', methods=['POST'])
def setup_admin():
    """Create the first admin account"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        businessName = data.get('businessName', 'GLEENT INC')
        
        # Check which fields are missing and provide specific error
        missing_fields = []
        if not email:
            missing_fields.append('email')
        if not password:
            missing_fields.append('password')
        if not firstName:
            missing_fields.append('firstName')
        if not lastName:
            missing_fields.append('lastName')
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Check if admin already exists
        existing = execute_query(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
            fetch_one=True
        )
        
        if existing:
            return jsonify({'error': 'Admin account already exists'}), 400
        
        # Check if email already exists
        existing_email = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (email,),
            fetch_one=True
        )
        
        if existing_email:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create admin user
        user_id = generate_uuid()
        password_hash = hash_password(password)
        
        execute_query(
            "INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES (%s, %s, %s, %s, %s, 'admin')",
            (user_id, email, password_hash, firstName, lastName)
        )
        
        return jsonify({
            'admin': {
                'id': user_id,
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'businessName': businessName
            }
        }), 201
        
    except Exception as e:
        print(f"Error setting up admin: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/admin-login', methods=['POST'])
def admin_login():
    """Admin login"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Get admin user
        user = execute_query(
            "SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = %s AND role = 'admin'",
            (email,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 400
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            return jsonify({'error': 'Invalid credentials'}), 400
        
        return jsonify({
            'admin': {
                'id': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name']
            }
        }), 200
        
    except Exception as e:
        print(f"Error logging in admin: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/affiliate-signup', methods=['POST'])
def affiliate_signup():
    """Affiliate partner signup - creates user and partner record with pending status"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        mobileNumber = data.get('mobileNumber', '')
        
        if not all([email, password, firstName, lastName]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if email already exists
        existing = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (email,),
            fetch_one=True
        )
        
        if existing:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create affiliate user
        user_id = generate_uuid()
        password_hash = hash_password(password)
        
        execute_query(
            "INSERT INTO users (id, email, password_hash, first_name, last_name, mobile_number, role) VALUES (%s, %s, %s, %s, %s, %s, 'affiliate')",
            (user_id, email, password_hash, firstName, lastName, mobileNumber)
        )
        
        # Create partner record with pending status (admin will approve)
        partner_id = generate_uuid()
        execute_query(
            "INSERT INTO partners (id, user_id, commission_rate, status) VALUES (%s, %s, %s, 'pending')",
            (partner_id, user_id, 10.00)  # Default 10% commission
        )
        
        return jsonify({
            'partner': {
                'id': partner_id,
                'userId': user_id,
                'email': email,
                'firstName': firstName,
                'lastName': lastName,
                'mobileNumber': mobileNumber,
                'commissionRate': 10.00,
                'status': 'pending'
            }
        }), 201
        
    except Exception as e:
        print(f"Error signing up affiliate: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/affiliate-login', methods=['POST'])
def affiliate_login():
    """Affiliate partner login"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Get affiliate user with partner info
        user = execute_query(
            """SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
                      p.id as partner_id, p.commission_rate, p.status
               FROM users u
               JOIN partners p ON u.id = p.user_id
               WHERE u.email = %s AND u.role = 'affiliate'""",
            (email,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 400
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            return jsonify({'error': 'Invalid credentials'}), 400
        
        return jsonify({
            'partner': {
                'id': user['partner_id'],
                'userId': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'commissionRate': float(user['commission_rate']),
                'status': user['status']
            }
        }), 200
        
    except Exception as e:
        print(f"Error logging in affiliate: {e}")
        return jsonify({'error': 'Internal server error'}), 500
