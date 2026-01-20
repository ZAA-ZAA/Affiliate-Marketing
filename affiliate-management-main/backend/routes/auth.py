from flask import Blueprint, request, jsonify
import bcrypt
from database import execute_query, generate_uuid
from email_utils import generate_verification_code, get_code_expiry, send_verification_email
from datetime import datetime

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
        
        # Create admin user (admin is automatically verified)
        user_id = generate_uuid()
        password_hash = hash_password(password)
        
        execute_query(
            "INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified) VALUES (%s, %s, %s, %s, %s, 'admin', TRUE)",
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
    """Affiliate partner signup - creates user with pending verification"""
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
            "SELECT id, email_verified FROM users WHERE email = %s",
            (email,),
            fetch_one=True
        )
        
        if existing:
            # If user exists but not verified, allow resending verification
            if not existing['email_verified']:
                return jsonify({
                    'error': 'Email already registered but not verified. Please verify your email.',
                    'needsVerification': True,
                    'userId': existing['id']
                }), 400
            return jsonify({'error': 'Email already registered'}), 400
        
        # Generate verification code
        verification_code = generate_verification_code()
        code_expires = get_code_expiry()
        
        # Create affiliate user (NOT verified yet)
        user_id = generate_uuid()
        password_hash = hash_password(password)
        
        execute_query(
            """INSERT INTO users (id, email, password_hash, first_name, last_name, mobile_number, role, email_verified, verification_code, verification_code_expires) 
               VALUES (%s, %s, %s, %s, %s, %s, 'affiliate', FALSE, %s, %s)""",
            (user_id, email, password_hash, firstName, lastName, mobileNumber, verification_code, code_expires)
        )
        
        # Create partner record with pending status
        partner_id = generate_uuid()
        execute_query(
            "INSERT INTO partners (id, user_id, commission_rate, status) VALUES (%s, %s, %s, 'pending')",
            (partner_id, user_id, 10.00)
        )
        
        # Send verification email
        email_sent, email_message = send_verification_email(email, firstName, verification_code)
        
        if not email_sent:
            print(f"Warning: Failed to send verification email: {email_message}")
        
        return jsonify({
            'message': 'Signup successful! Please check your email for verification code.',
            'needsVerification': True,
            'userId': user_id,
            'email': email,
            'emailSent': email_sent
        }), 201
        
    except Exception as e:
        print(f"Error signing up affiliate: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    """Verify email with verification code"""
    try:
        data = request.json
        user_id = data.get('userId')
        code = data.get('code')
        
        if not user_id or not code:
            return jsonify({'error': 'User ID and verification code required'}), 400
        
        # Get user with verification info
        user = execute_query(
            """SELECT id, email, first_name, verification_code, verification_code_expires, email_verified
               FROM users WHERE id = %s""",
            (user_id,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already verified
        if user['email_verified']:
            return jsonify({'message': 'Email already verified', 'verified': True}), 200
        
        # Check if code matches
        if user['verification_code'] != code:
            return jsonify({'error': 'Invalid verification code'}), 400
        
        # Check if code expired
        if user['verification_code_expires'] and datetime.now() > user['verification_code_expires']:
            return jsonify({'error': 'Verification code has expired. Please request a new code.'}), 400
        
        # Update user as verified
        execute_query(
            """UPDATE users SET email_verified = TRUE, verification_code = NULL, verification_code_expires = NULL 
               WHERE id = %s""",
            (user_id,)
        )
        
        return jsonify({
            'message': 'Email verified successfully!',
            'verified': True,
            'email': user['email']
        }), 200
        
    except Exception as e:
        print(f"Error verifying email: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification code"""
    try:
        data = request.json
        user_id = data.get('userId')
        email = data.get('email')
        
        # Find user by ID or email
        if user_id:
            user = execute_query(
                "SELECT id, email, first_name, email_verified FROM users WHERE id = %s",
                (user_id,),
                fetch_one=True
            )
        elif email:
            user = execute_query(
                "SELECT id, email, first_name, email_verified FROM users WHERE email = %s",
                (email,),
                fetch_one=True
            )
        else:
            return jsonify({'error': 'User ID or email required'}), 400
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already verified
        if user['email_verified']:
            return jsonify({'message': 'Email already verified', 'verified': True}), 200
        
        # Generate new verification code
        verification_code = generate_verification_code()
        code_expires = get_code_expiry()
        
        # Update user with new code
        execute_query(
            "UPDATE users SET verification_code = %s, verification_code_expires = %s WHERE id = %s",
            (verification_code, code_expires, user['id'])
        )
        
        # Send new verification email
        email_sent, email_message = send_verification_email(user['email'], user['first_name'], verification_code)
        
        if not email_sent:
            return jsonify({'error': f'Failed to send verification email: {email_message}'}), 500
        
        return jsonify({
            'message': 'Verification code sent to your email',
            'userId': user['id'],
            'emailSent': True
        }), 200
        
    except Exception as e:
        print(f"Error resending verification: {e}")
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
            """SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.email_verified,
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
        
        # Check if email is verified
        if not user['email_verified']:
            return jsonify({
                'error': 'Please verify your email before logging in',
                'needsVerification': True,
                'userId': user['id'],
                'email': user['email']
            }), 403
        
        return jsonify({
            'partner': {
                'id': user['partner_id'],
                'userId': user['id'],
                'email': user['email'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'commissionRate': float(user['commission_rate']),
                'status': user['status'],
                'emailVerified': True
            }
        }), 200
        
    except Exception as e:
        print(f"Error logging in affiliate: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/auth/check-verification/<user_id>', methods=['GET'])
def check_verification(user_id):
    """Check if a user's email is verified"""
    try:
        user = execute_query(
            "SELECT id, email, email_verified FROM users WHERE id = %s",
            (user_id,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'userId': user['id'],
            'email': user['email'],
            'verified': bool(user['email_verified'])
        }), 200
        
    except Exception as e:
        print(f"Error checking verification: {e}")
        return jsonify({'error': 'Internal server error'}), 500
