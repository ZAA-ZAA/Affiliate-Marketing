# Quick Start Guide - Simple Steps

> **For detailed instructions, see `COMPLETE_GUIDE.md`**

## Step-by-Step Setup

### 1. Create Database

Open MySQL and run:
```sql
mysql -u root -p330122 < database_schema.sql
```

Or in MySQL Workbench:
- Open `database_schema.sql`
- Execute the script

This creates the database `gleen_affiliate` with all required tables.

### 2. Start Python Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r ../requirements.txt

# Start the server
python app.py
```

✅ Backend should be running on `http://localhost:5000`

### 3. Start Frontend

Open a NEW terminal:

```bash
# Navigate to project root
cd affiliate-management-main

# Install dependencies (first time only)
pnpm install

# Start development server
pnpm dev
```

✅ Frontend should be running on `http://localhost:8080`

### 4. Create Admin Account

1. Open browser: `http://localhost:8080/setup`
2. Fill in:
   - Business Name: `Gleen`
   - First Name: `Admin`
   - Last Name: `User`
   - Email: `admin@gleen.com`
   - Password: (choose a password)
3. Click "Create Admin Account"

### 5. Login and Test

1. Go to: `http://localhost:8080/login`
2. Login with your admin credentials
3. You'll see the dashboard

### 6. Add a Partner

1. Click "Add Partner" button
2. Fill in:
   - Email: `partner@example.com`
   - First Name: `John`
   - Last Name: `Doe`
   - Commission Rate: `10`
3. Click "Add Partner"

### 7. Generate Affiliate Link

1. Click "View Details" on the partner you just created
2. Click "Create Link"
3. Fill in:
   - Destination URL: `http://localhost:8080/demo`
   - Link Title: `Demo Page`
   - Description: (optional)
4. Click "Create Link"
5. Copy the generated link (it will have `?affiliate-id=XXXXX`)

### 8. Test Affiliate Tracking

1. Open the affiliate link you just copied in a new browser tab
   - Example: `http://localhost:8080/demo?affiliate-id=ABC12345`
2. Fill out the demo form:
   - Name: `Test User`
   - Email: `test@example.com`
   - (Other fields optional)
3. Click "Request Demo"
4. Go back to dashboard and refresh
5. Check the partner's stats:
   - Click count should be 1
   - Conversion count should be 1

## Troubleshooting

### Backend won't start
- Check if MySQL is running
- Verify database `gleen_affiliate` exists
- Check credentials in `backend/config.py`

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify proxy settings in `vite.config.ts`

### Database connection error
- Make sure MySQL is running
- Check username/password in `backend/config.py`
- Verify database exists: `SHOW DATABASES;`

## Default Database Config

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `330122`
- Database: `gleen_affiliate`

To change these, edit `backend/config.py`

## What's Working

✅ Admin login/setup
✅ Add partners
✅ Generate affiliate links
✅ Track clicks on affiliate links
✅ Track conversions (form submissions)
✅ View statistics in dashboard
✅ Demo form with affiliate tracking

## Next Steps

- Set up commission calculation
- Add affiliate partner login page
- Implement email notifications
- Add reporting features
