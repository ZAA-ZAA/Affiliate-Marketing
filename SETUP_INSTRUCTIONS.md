# Setup Instructions for Affiliate Management System

## Prerequisites

1. **MySQL Database** (Port 3306)
   - User: `root`
   - Password: `330122`
   - Make sure MySQL is running

2. **Python 3.8+** installed

3. **Node.js and pnpm** for frontend

## Step 1: Database Setup

1. Open MySQL command line or MySQL Workbench
2. Run the database schema file:

```bash
mysql -u root -p330122 < database_schema.sql
```

Or in MySQL Workbench:
- Open `database_schema.sql`
- Execute the script

This will create:
- Database: `gleen_affiliate`
- Tables: `users`, `partners`, `affiliate_links`, `link_clicks`, `demo_requests`

## Step 2: Python Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
```bash
pip install -r ../requirements.txt
```

5. Start the Flask backend server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

## Step 3: Frontend Setup

1. In a new terminal, navigate to the project root:
```bash
cd affiliate-management-main
```

2. Install frontend dependencies:
```bash
pnpm install
```

3. Update Vite config to proxy API requests to Python backend (if needed):
   - The frontend runs on port 8080 (default)
   - Make sure `vite.config.ts` proxies `/api/*` to `http://localhost:5000`

4. Start the frontend development server:
```bash
pnpm dev
```

The frontend will run on `http://localhost:8080`

## Step 4: Initial Admin Setup

1. Open your browser and go to: `http://localhost:8080/setup`
2. Fill in the admin account details:
   - Email: `admin@gleen.com`
   - Password: (choose a password)
   - First Name: `Admin`
   - Last Name: `User`
   - Business Name: `Gleen`

3. Click "Set Up Admin Account"

## Step 5: Login and Test

### Admin Login
1. Go to: `http://localhost:8080/login`
2. Use the admin credentials you just created
3. You'll be redirected to the dashboard

### Add a Partner
1. In the dashboard, click "Add Partner"
2. Fill in partner details:
   - Email: `partner@example.com`
   - First Name: `John`
   - Last Name: `Doe`
   - Commission Rate: `10` (percentage)
3. Click "Add Partner"

### Generate Affiliate Link
1. Click "View Details" on a partner
2. Click "Create Link"
3. Fill in:
   - Destination URL: `http://localhost:8080/demo`
   - Link Title: `Demo Page`
   - Description: (optional)
4. Click "Create Link"
5. Copy the generated affiliate link

### Test Affiliate Tracking
1. Use the affiliate link you just created (it will have `?affiliate-id=XXXXX`)
2. Or manually visit: `http://localhost:8080/demo?affiliate-id=XXXXX`
   (Replace XXXXX with the actual link code)
3. Fill out the demo form
4. Submit the form
5. Go back to the dashboard and check:
   - Click count should increase
   - Conversion count should increase when form is submitted

## Step 6: Affiliate Partner Login (Optional)

Affiliate partners can sign up and view their own stats:

1. Create an affiliate signup page (or use API directly)
2. Affiliate can sign up at: `POST /api/auth/affiliate-signup`
3. Affiliate can login at: `POST /api/auth/affiliate-login`

## API Endpoints

### Authentication
- `POST /api/auth/setup-admin` - Create first admin account
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/affiliate-signup` - Affiliate signup
- `POST /api/auth/affiliate-login` - Affiliate login

### Partners
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Add new partner (admin only)
- `GET /api/stats` - Get overall statistics

### Links
- `POST /api/links` - Create affiliate link
- `GET /api/links/:partnerId` - Get partner's links
- `GET /api/links/detail/:linkId` - Get specific link

### Tracking
- `POST /api/track` - Track a click
- `GET /api/track-pixel` - Tracking pixel

### Demo
- `POST /api/demo-request` - Submit demo request (tracks conversion)

## Default Credentials

After setup, you can login with:
- **Email:** The email you used during setup
- **Password:** The password you set during setup

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check credentials in `backend/config.py`
- Verify database `gleen_affiliate` exists

### Port Already in Use
- Backend: Change port in `backend/app.py` (default: 5000)
- Frontend: Change port in `vite.config.ts` (default: 8080)

### CORS Errors
- Make sure Flask-CORS is installed
- Check that backend is running on port 5000
- Verify frontend proxy configuration

## Sample Affiliate Link Format

```
http://localhost:8080/demo?affiliate-id=ABC12345
```

When someone clicks this link:
1. The click is tracked automatically
2. The affiliate-id is stored in the session
3. When they fill out the form, it's counted as a conversion

## Next Steps

- Set up commission calculation logic
- Add email notifications
- Implement affiliate partner dashboard
- Add reporting and analytics
- Set up production deployment
