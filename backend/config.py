import os

# MySQL Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root123',
    'database': 'gleen_affiliate',
    'charset': 'utf8mb4',
    'autocommit': True
}

# Company name
COMPANY_NAME = 'GLEENT INC'

# Secret key for session management (change in production)
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
