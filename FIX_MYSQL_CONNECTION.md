# Fix MySQL Connection Error

## The Problem
```
Access denied for user 'root'@'localhost' (using password: YES)
```

This means the MySQL password in the config doesn't match your actual MySQL password.

## Solution Options

### Option 1: Update the Config File (Recommended)

1. **Check your actual MySQL password**
   - What password did you set when you installed MySQL?
   - Or try logging into MySQL to verify:
     ```sql
     mysql -u root -p
     ```

2. **Update `backend/config.py`** with your correct password:
   ```python
   DB_CONFIG = {
       'host': 'localhost',
       'port': 3306,
       'user': 'root',
       'password': 'YOUR_ACTUAL_PASSWORD',  # Change this!
       'database': 'gleen_affiliate',
       'charset': 'utf8mb4',
       'autocommit': True
   }
   ```

3. **Restart the backend** (Ctrl+C and run `python app.py` again)

### Option 2: Reset MySQL Password (If You Forgot)

If you don't remember your MySQL password:

1. **Stop MySQL service**
2. **Start MySQL in safe mode** (varies by OS)
3. **Reset the password**
4. **Restart MySQL**

Or use MySQL Workbench to reset it through the GUI.

### Option 3: Create a New MySQL User

If you want to use a different user:

1. **Login to MySQL as root:**
   ```sql
   mysql -u root -p
   ```

2. **Create new user:**
   ```sql
   CREATE USER 'affiliate_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON gleen_affiliate.* TO 'affiliate_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update `backend/config.py`:**
   ```python
   'user': 'affiliate_user',
   'password': 'your_password',
   ```

### Option 4: Check if MySQL is Running

Make sure MySQL service is running:
- Windows: Check Services (services.msc) for "MySQL"
- Or try: `mysql -u root -p` to see if it connects

## Quick Test

Try connecting to MySQL manually:
```bash
mysql -u root -p330122
```

If this fails, the password is wrong. If it works, the password is correct and there might be a different issue.

## After Fixing

1. Restart the backend: `python app.py`
2. Try creating admin account again
3. Should work now!
