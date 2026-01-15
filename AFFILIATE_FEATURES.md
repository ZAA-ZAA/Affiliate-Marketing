# New Affiliate Features - Complete Guide

## What's New

### 1. Affiliate Partner Signup & Login
- **Signup Page**: `/affiliate/signup`
- **Login Page**: `/affiliate/login`
- **Dashboard**: `/affiliate/dashboard`

### 2. Predefined Destination URLs
When creating affiliate links, you can now:
- Select from predefined pages (Demo Form, Homepage)
- Or use a custom URL
- Prevents errors from typos

### 3. Improved Partner Management
- Search functionality (already working)
- Better partner list display
- Easy partner creation

---

## How to Use

### For Admin:

#### 1. Add Affiliate Partner (Two Ways)

**Option A: Admin Creates Partner**
1. Go to Dashboard
2. Click "Add Partner"
3. Fill in: Email, First Name, Last Name, Commission Rate
4. Partner gets created (they can login later)

**Option B: Partner Self-Signup**
1. Partner goes to `/affiliate/signup`
2. Fills in their details
3. Creates account automatically
4. Gets default 10% commission rate

#### 2. Generate Affiliate Link with Predefined URLs

1. Go to Partner Details
2. Click "Create Link"
3. **Select from dropdown:**
   - "Demo Request Form" - Links to `/demo` page
   - "Homepage" - Links to main page
   - "Custom URL" - Enter your own URL
4. Fill in Title and Description
5. Click "Create Link"

#### 3. View All Partners with Search

- Search box at top of partners list
- Search by: First Name, Last Name, or Email
- Real-time filtering as you type

---

### For Affiliate Partners:

#### 1. Sign Up

1. Go to: `http://localhost:8081/affiliate/signup`
2. Fill in:
   - First Name
   - Last Name
   - Email
   - Password
   - Confirm Password
3. Click "Sign Up as Partner"
4. Automatically logged in and redirected to dashboard

#### 2. Login

1. Go to: `http://localhost:8081/affiliate/login`
2. Enter email and password
3. Click "Sign In"
4. View your dashboard

#### 3. View Your Dashboard

- See your stats: Clicks, Conversions, Earnings
- View all your affiliate links
- Copy links to share
- See performance metrics

---

## Predefined URLs

Currently available:
1. **Demo Request Form**: `${window.location.origin}/demo`
   - Main demo form page
   - Tracks conversions when form is submitted

2. **Homepage**: `${window.location.origin}/`
   - Main landing page

3. **Custom URL**: Enter any URL you want
   - Full validation
   - Must be a valid URL format

---

## Routes Added

- `/affiliate/signup` - Partner signup page
- `/affiliate/login` - Partner login page
- `/affiliate/dashboard` - Partner dashboard

---

## Features Summary

✅ **Admin Side:**
- Add partners manually
- View all partners with search
- Generate links with predefined URLs
- Custom URL option
- View partner performance

✅ **Affiliate Partner Side:**
- Self-signup
- Login
- View own dashboard
- See own links and stats
- Copy affiliate links

✅ **Link Creation:**
- Predefined URLs (prevents errors)
- Custom URL option
- Auto-fills title/description for predefined
- Full validation

---

## Testing

### Test Affiliate Signup:
1. Go to `/affiliate/signup`
2. Create an account
3. Should redirect to `/affiliate/dashboard`
4. See your stats (will be 0 initially)

### Test Admin Adding Partner:
1. Login as admin
2. Go to Dashboard
3. Click "Add Partner"
4. Fill form and submit
5. Partner appears in list

### Test Predefined URLs:
1. Go to Partner Details
2. Click "Create Link"
3. Select "Demo Request Form" from dropdown
4. Title and description auto-fill
5. Create link
6. Link should work correctly

---

## Notes

- Partners created by admin get a temporary password (they should reset it)
- Partners who sign up themselves set their own password
- All partners can login at `/affiliate/login`
- Search works in real-time as you type
- Predefined URLs use current domain automatically
