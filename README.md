# OJT - Affiliate Marketing System

A full-stack affiliate marketing management system with a separate demo form application. Built with React + Vite (frontend), Python Flask (backend), and MySQL database.

## Projects in This Repository

| Project | Description | Port |
|---------|-------------|------|
| `affiliate-management-main/` | Admin dashboard & affiliate management system | 8080 |
| `demo-form-app/` | Customer-facing demo request form (separate app) | 3001 |

## Features

### Affiliate Management System

#### Admin Dashboard
- **Quick Overview**: View total clicks, conversions, and recent affiliate activity
- **Sidebar Navigation**: Easy access to all admin features
- **Partner Management**: Approve/reject affiliate signups, view partner details
- **Link Management**: Create and manage affiliate links with source tracking
- **Analytics**: Full-page click and conversion details with source breakdown

#### Partner Management
- **Pending Approval**: Dedicated page for reviewing affiliate applications
- **Email Verification Required**: Partners must verify email before admin approval
- **Mobile Number Capture**: Collect partner contact information
- **Partner Details**: View individual partner performance and links

#### Link Management
- **General Links**: Create links that automatically apply to ALL partners
- **Partner-Specific Links**: Create links for individual partners
- **Source Tracking**: Predefined sources (Facebook, Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Email, Website, Blog, Forum, Direct)
- **Custom Source**: Add custom sources if not in predefined list
- **Enable/Disable Links**: Soft delete - disabled links are visible but marked as disabled
- **Per-Partner Tracking**: General links track clicks/conversions per partner separately

#### Analytics & Tracking
- **Click Details**: Full-page view with source breakdown and recent clicks
- **Conversion Details**: Full-page view with lead information and form data
- **Partner Attribution**: Track which partner generated each click/conversion
- **Source Attribution**: Know exactly where traffic comes from (Facebook, TikTok, etc.)

### Affiliate Portal
- **Signup with Email Verification**: 6-digit code sent to email for verification
- **Mobile Number Required**: Contact information collected during signup
- **Dashboard**: View assigned links, click counts, and conversion stats
- **General Links Access**: All partners automatically see general links
- **Link Status Visibility**: See which links are enabled or disabled

### Demo Form App
- **Lead Capture Form**: Customer-facing form for demo requests
- **Affiliate Tracking**: Automatically captures affiliate ID from URL
- **Referrer Tracking**: Records where user came from (Facebook, TikTok, etc.)
- **API Integration**: Sends data to affiliate management system via secure API

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Python Flask + MySQL
- **Database**: MySQL 8.0
- **Email**: SMTP (Gmail) for verification emails
- **Containerization**: Docker & Docker Compose

## Quick Start with Docker

Run everything from this folder:

```bash
docker-compose up --build
```

This starts:
| Service | URL | Description |
|---------|-----|-------------|
| MySQL Database | localhost:3307 | Database server |
| Flask Backend | http://localhost:5000 | API server |
| React Frontend | http://localhost:8080 | Admin dashboard |
| Demo Form App | http://localhost:3001 | Customer form |

### Initial Setup

1. Visit http://localhost:8080/setup
2. Create your admin account
3. Login at http://localhost:8080/login
4. Start managing affiliates!

### Testing the Complete Flow

#### Admin Flow
1. **Login** at http://localhost:8080/login
2. **Go to Links** → Create a general link (e.g., source: Facebook)
3. **Go to Pending Approval** → Wait for affiliate signups

#### Affiliate Flow
1. **Sign up** at http://localhost:8080/affiliate/signup
2. **Verify email** with the 6-digit code sent to your email
3. **Wait for admin approval**
4. **Login** at http://localhost:8080/affiliate/login
5. **View dashboard** → See your links (including general links)

#### Testing Clicks & Conversions
1. **Copy an affiliate link** from the dashboard
2. **Open the link** - it goes to http://localhost:3001 (demo form)
3. **Fill out and submit** the form
4. **Check the admin dashboard** - click count and conversion should increase!
5. **View Click Details** → See the source (Facebook, etc.) and partner attribution

## Project Structure

```
OJT/
├── docker-compose.yml              # Master Docker config (run from here)
├── .gitignore
├── README.md                       # This file
│
├── affiliate-management-main/      # Affiliate Management System
│   ├── backend/                    # Python Flask API
│   │   ├── app.py                 # Main Flask application
│   │   ├── config.py              # Database configuration
│   │   ├── database.py            # Database utilities
│   │   ├── email_utils.py         # Email sending (verification codes)
│   │   └── routes/                # API route handlers
│   │       ├── auth.py            # Authentication (login, signup, email verify)
│   │       ├── partners.py        # Partner management
│   │       ├── links.py           # Link generation & management
│   │       ├── tracking.py        # Click tracking
│   │       ├── demo.py            # Demo form submission
│   │       └── external.py        # External API (for demo-form-app)
│   │
│   ├── client/                     # React Frontend
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.tsx      # Admin dashboard (quick view)
│   │   │   ├── PartnerDetail.tsx  # Partner details & link generation
│   │   │   ├── AffiliateSignup.tsx # Affiliate registration
│   │   │   ├── AffiliateLogin.tsx # Affiliate login
│   │   │   ├── AffiliateDashboard.tsx # Affiliate portal
│   │   │   ├── EmailVerification.tsx # Email verification page
│   │   │   └── admin/             # Admin pages
│   │   │       ├── Partners.tsx   # Partner management
│   │   │       ├── PendingApproval.tsx # Pending approvals
│   │   │       ├── Links.tsx      # Link management
│   │   │       ├── ClickDetails.tsx # Click analytics
│   │   │       └── ConversionDetails.tsx # Conversion analytics
│   │   ├── components/
│   │   │   ├── AdminLayout.tsx    # Sidebar navigation layout
│   │   │   └── ui/                # UI components (shadcn/ui)
│   │   └── types/api.ts           # TypeScript types
│   │
│   ├── docker-init.sql            # Database schema
│   ├── Dockerfile.backend         # Backend Docker image
│   ├── Dockerfile.frontend        # Frontend Docker image
│   └── requirements.txt           # Python dependencies
│
└── demo-form-app/                  # Demo Form App (separate project)
    ├── src/
    │   ├── App.tsx                # Main form component
    │   └── config.ts              # API configuration & key
    ├── Dockerfile.dev             # Docker image
    └── package.json
```

## Admin Sidebar Navigation

| Menu Item | Path | Description |
|-----------|------|-------------|
| Dashboard | `/dashboard` | Quick overview with stats |
| Partners | `/admin/partners` | Manage active partners |
| Pending Approval | `/admin/pending` | Review pending applications |
| Links | `/admin/links` | Create and manage all links |
| Clicks | `/admin/clicks` | Detailed click analytics |
| Conversions | `/admin/conversions` | Detailed conversion analytics |

## How the Two Projects Communicate

### API Key Authentication

1. **API Key Location**: `affiliate-management-main/docker-init.sql` (stored in database)
2. **Default Key**: `aff_live_key_2026_xK9mP2vL8nQ4wR7j`
3. **Used in**: `demo-form-app/src/config.ts`

### Communication Flow

```
User clicks affiliate link
         ↓
Demo Form App (port 3001)
         ↓
Extracts affiliate-id from URL
         ↓
Sends click data to API ──→ POST /api/external/track-click
         ↓                   (with X-API-Key header)
User submits form
         ↓
Sends form data to API ──→ POST /api/external/addlead
         ↓                   (with X-API-Key header)
Affiliate Management Backend
         ↓
Saves to MySQL database
         ↓
Dashboard shows updated stats
```

### General Link Tracking

For general links, the affiliate ID format is: `{LINK_CODE}-P-{PARTNER_ID}`

This allows tracking clicks and conversions per partner even for shared general links.

## API Endpoints

### Authentication
- `POST /api/auth/setup-admin` - Create admin account (first time only)
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/affiliate-signup` - Affiliate signup (sends verification email)
- `POST /api/auth/affiliate-login` - Affiliate login
- `POST /api/auth/verify-email` - Verify email with 6-digit code
- `POST /api/auth/resend-verification` - Resend verification code

### Partners
- `GET /api/partners` - Get all active partners
- `GET /api/partners/pending` - Get pending partner applications
- `POST /api/partners` - Add/approve partner
- `PUT /api/partners/:id/status` - Update partner status (approve/reject)

### Links
- `POST /api/links` - Create affiliate link (general or partner-specific)
- `GET /api/links/:partnerId` - Get partner's links (includes general links)
- `GET /api/links/all` - Get all links (admin)
- `GET /api/links/sources` - Get predefined source options
- `POST /api/links/:id/toggle` - Enable/disable a link

### Analytics
- `GET /api/clicks/details` - Get click details by source
- `GET /api/conversions/details` - Get conversion details with form data
- `GET /api/partner/:id/clicks` - Get partner-specific clicks
- `GET /api/partner/:id/conversions` - Get partner-specific conversions

### External API (used by demo-form-app)
- `POST /api/external/track-click` - Track click (requires API key)
- `POST /api/external/addlead` - Submit lead/conversion (requires API key)

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Admin and affiliate user accounts (with email verification) |
| `partners` | Affiliate partner records with status |
| `affiliate_links` | Generated affiliate links (general & partner-specific) |
| `link_clicks` | Click tracking with source and partner attribution |
| `demo_requests` | Form submissions with full form data |
| `api_keys` | API keys for external integrations |

### Key Database Fields

#### users table
- `email_verified` - Boolean flag for email verification status
- `verification_code` - 6-digit verification code
- `verification_code_expires` - Code expiration timestamp
- `mobile_number` - Partner contact number

#### affiliate_links table
- `source` - Traffic source (Facebook, TikTok, etc.)
- `is_general` - Boolean flag for general links
- `is_enabled` - Boolean flag for enable/disable status

## Environment Variables (docker-compose.yml)

### Backend
```yaml
DB_HOST: mysql
DB_USER: root
DB_PASSWORD: root123
DB_NAME: gleen_affiliate
FLASK_ENV: development
SMTP_EMAIL: your-email@gmail.com
SMTP_PASSWORD: your-app-password
SMTP_SENDER_NAME: Your Affiliate Program
```

### Email Setup (Gmail)
1. Enable 2-Factor Authentication on your Gmail
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the 16-character app password in `SMTP_PASSWORD`

## Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and delete database data (full reset)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend
```

## Git Commands

```bash
# Check status
git status

# Add and commit changes
git add -A
git commit -m "Your message"

# Add GitHub remote (first time)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Troubleshooting

### Email verification not working
- Check SMTP credentials in `docker-compose.yml`
- Make sure you're using an App Password (not regular Gmail password)
- Check backend logs: `docker-compose logs -f backend`

### Links not showing for affiliates
- Make sure the affiliate is approved by admin
- Check if general links are enabled
- Verify the partner status is "active"

### Clicks/conversions not counting
- Verify the affiliate link format is correct
- Check if the link is enabled (not disabled)
- Look at backend logs for tracking errors

### Database reset
```bash
docker-compose down -v
docker-compose up --build
```

## License

Internal use only.
