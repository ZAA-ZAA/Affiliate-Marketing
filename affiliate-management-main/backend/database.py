import mysql.connector
from mysql.connector import Error
import uuid
from datetime import datetime
from config import DB_CONFIG

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise

def generate_uuid():
    """Generate a UUID string"""
    return str(uuid.uuid4())

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute a database query"""
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            connection.commit()
            result = cursor.rowcount
        
        cursor.close()
        return result
    except Error as e:
        if connection:
            connection.rollback()
        print(f"Database error: {e}")
        raise
    finally:
        if connection and connection.is_connected():
            connection.close()
