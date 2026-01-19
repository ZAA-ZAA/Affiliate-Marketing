import os

# MySQL Database Configuration
# Uses environment variables if available (Docker), otherwise defaults to local settings
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'root123'),
    'database': os.environ.get('DB_NAME', 'gleen_affiliate'),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Company name
COMPANY_NAME = 'GLEENT INC'

# Secret key for session management (change in production)
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
