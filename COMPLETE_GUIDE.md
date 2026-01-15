# Complete Guide: How to Run and Use the Affiliate Management System

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ MySQL installed and running (Port 3306)
- ✅ Python installed (check with `python --version`)
- ✅ Node.js installed (check with `node --version`)
- ✅ Database credentials: user=`root`, password=`330122`

---

## STEP 1: Create the Database

1. **Open MySQL Command Line or MySQL Workbench**

2. **Run the database schema:**
   ```sql
   mysql -u root -p330122 < database_schema.sql
   ```
   
   Or in MySQL Workbench:
   - Open `database_schema.sql`
   - Execute the script (F5 or Execute button)

3. **Verify database was created:**
   ```sql
   SHOW DATABASES;
   ```
   You should see `gleen_affiliate` in the list.

---

## STEP 2: Start the Python Backend

1. **Open a PowerShell/Terminal window**

2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\anj\Downloads\affiliate-management-main\affiliate-management-main\backend
   ```

3. **Activate virtual environment:**
   ```powershell
   venv\Scripts\activate
   ```
   You should see `(venv)` at the start of your prompt.

4. **Start the Flask server:**
   ```powershell
   python app.py
   ```

5. **You should see:**
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```
   
   ✅ **Keep this terminal open!** The backend must stay running.

---

## STEP 3: Start the Frontend

1. **Open a NEW PowerShell/Terminal window** (keep backend running!)

2. **Navigate to project root:**
   ```powershell
   cd C:\Users\anj\Downloads\affiliate-management-main\affiliate-management-main
   ```

3. **Start the frontend:**
   ```powershell
   npm run dev
   ```

4. **You should see:**
   ```
   VITE v6.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: use --host to expose
   ```

   ✅ **Keep this terminal open too!** The frontend must stay running.

---

## STEP 4: Create Your Admin Account

1. **Open your browser** and go to:
   ```
   http://localhost:8080/setup
   ```

2. **Fill in the form:**
   - **Business Name:** `GLEENT INC`
   - **First Name:** Your first name
   - **Last Name:** Your last name
   - **Email:** `admin@gleent.com` (or your email)
   - **Password:** Choose a strong password
   - **Confirm Password:** Same password

3. **Click "Create Admin Account"**

4. **You'll be redirected to the dashboard** automatically

---

## STEP 5: Login (If Needed)

If you get logged out, login at:
```
http://localhost:8080/login
```

Use the credentials you created in Step 4.

---

## STEP 6: Add Your First Affiliate Partner

1. **In the dashboard**, click the **"Add Partner"** button

2. **Fill in partner details:**
   - **Email:** `partner@example.com`
   - **First Name:** `John`
   - **Last Name:** `Doe`
   - **Commission Rate:** `10` (this is 10%)

3. **Click "Add Partner"**

4. **You'll see the partner appear in the list**

---

## STEP 7: Generate an Affiliate Link

1. **Find the partner you just added** in the dashboard

2. **Click "View Details"** button next to the partner

3. **Click "Create Link"** button

4. **Fill in the link details:**
   - **Destination URL:** `http://localhost:8080/demo`
   - **Link Title:** `Demo Request Page`
   - **Description:** (optional) `Main demo request form`

5. **Click "Create Link"**

6. **You'll see the link appear with a code** (like `ABC12345`)

7. **Click "Copy Full Link"** - this copies the complete affiliate link
   - Example: `http://localhost:8080/demo?affiliate-id=ABC12345`

---

## STEP 8: Test Affiliate Tracking

### Test Click Tracking:

1. **Open the affiliate link** you just copied in a new browser tab
   - Example: `http://localhost:8080/demo?affiliate-id=ABC12345`

2. **You should see the demo form page**

3. **The click is automatically tracked!** (happens in the background)

### Test Conversion Tracking:

1. **Fill out the demo form:**
   - **Name:** `Test User`
   - **Email:** `test@example.com`
   - **Company:** `Test Company`
   - **Phone:** (optional)
   - **Message:** (optional)

2. **Click "Request Demo"**

3. **You should see:** "Thank you! Your demo request has been submitted successfully."

4. **Go back to the dashboard** and refresh the page

5. **Click "View Details"** on your partner again

6. **Check the stats:**
   - **Total Clicks:** Should be 1 (or more if you clicked multiple times)
   - **Conversions:** Should be 1 (form submission)
   - **Total Earnings:** May show $0.00 (commission calculation not implemented yet)

---

## How the System Works

### Admin Dashboard Features:

1. **View All Partners:**
   - See list of all affiliate partners
   - View their stats (clicks, conversions, earnings)
   - Search partners by name or email

2. **Add New Partners:**
   - Click "Add Partner"
   - Fill in details and commission rate
   - Partner gets a unique account

3. **Generate Links:**
   - Go to partner details
   - Create trackable affiliate links
   - Each link has a unique code

4. **View Statistics:**
   - Total partners
   - Total clicks across all partners
   - Total conversions
   - Total earnings

### Affiliate Link Format:

```
http://localhost:8080/demo?affiliate-id=XXXXX
```

Where `XXXXX` is the unique link code generated for each partner.

### What Gets Tracked:

1. **Click Tracking:**
   - When someone clicks an affiliate link
   - Records: IP address, user agent, referrer, timestamp
   - Updates click count automatically

2. **Conversion Tracking:**
   - When someone fills out the demo form
   - Records: Name, email, company, message
   - Updates conversion count automatically
   - Links the conversion to the affiliate partner

---

## Troubleshooting

### Backend Not Starting:
- Check if MySQL is running
- Verify database `gleen_affiliate` exists
- Check credentials in `backend/config.py`
- Make sure port 5000 is not in use

### Frontend Not Starting:
- Make sure backend is running first
- Check if port 8080 is not in use
- Try `npm install` again if there are errors

### Can't Create Admin:
- Make sure database is set up
- Check backend is running (test: `http://localhost:5000/api/ping`)
- Check browser console for errors

### Links Not Tracking:
- Make sure backend is running
- Check browser console for API errors
- Verify the affiliate-id parameter is in the URL

### Database Connection Error:
- Verify MySQL is running
- Check username/password in `backend/config.py`
- Make sure database `gleen_affiliate` exists

---

## Quick Reference

### URLs:
- **Frontend:** `http://localhost:8080`
- **Backend API:** `http://localhost:5000`
- **Setup Page:** `http://localhost:8080/setup`
- **Login Page:** `http://localhost:8080/login`
- **Dashboard:** `http://localhost:8080/dashboard`
- **Demo Form:** `http://localhost:8080/demo`

### API Test:
- **Ping:** `http://localhost:5000/api/ping` (should return `{"message":"pong"}`)

### Default Credentials:
- Use the credentials you created during setup (Step 4)

---

## Next Steps (Future Enhancements)

- Commission calculation logic
- Affiliate partner login page
- Email notifications
- Advanced reporting
- Export data to CSV
- Payment tracking

---

## Summary

1. ✅ Database created
2. ✅ Backend running on port 5000
3. ✅ Frontend running on port 8080
4. ✅ Admin account created
5. ✅ Partner added
6. ✅ Affiliate link generated
7. ✅ Click and conversion tracking tested

**You're all set!** The system is fully functional and ready to use.
