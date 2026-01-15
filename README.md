# Affiliate Management System

A full-stack affiliate marketing management system built with React + Vite (frontend) and Python Flask (backend) with MySQL database.

## Features

- **Admin Dashboard**: Manage affiliate partners, generate links, track performance
- **Partner Management**: Add partners, set commission rates, view statistics
- **Link Generation**: Create trackable affiliate links with unique codes
- **Click Tracking**: Automatically track clicks on affiliate links
- **Conversion Tracking**: Track form submissions and conversions
- **Demo Form**: Customer-facing demo request form with affiliate tracking

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Python Flask + MySQL
- **Database**: MySQL (Port 3306)

## Quick Start

### 1. Database Setup

```bash
mysql -u root -p330122 < database_schema.sql
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r ../requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
pnpm install
pnpm dev
```

Frontend runs on `http://localhost:8080`

### 4. Initial Setup

1. Visit `http://localhost:8080/setup`
2. Create your admin account
3. Login and start adding partners!

## Default Credentials

After setup, use the credentials you created during the initial admin setup.

## Sample Affiliate Link

```
http://localhost:8080/demo?affiliate-id=ABC12345
```

When users click this link and fill out the form, it automatically tracks:
- Click count
- Conversion count (when form is submitted)

## Project Structure

```
├── backend/              # Python Flask backend
│   ├── app.py           # Main Flask application
│   ├── config.py        # Database configuration
│   ├── database.py      # Database utilities
│   └── routes/          # API route handlers
│       ├── auth.py      # Authentication routes
│       ├── partners.py  # Partner management
│       ├── links.py     # Link management
│       ├── tracking.py  # Click tracking
│       └── demo.py      # Demo form submission
├── client/              # React frontend
│   ├── pages/           # Page components
│   ├── components/      # UI components
│   └── App.tsx          # Main app with routing
├── database_schema.sql   # MySQL database schema
└── requirements.txt     # Python dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/setup-admin` - Create admin account
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/affiliate-signup` - Affiliate signup
- `POST /api/auth/affiliate-login` - Affiliate login

### Partners
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Add new partner
- `GET /api/stats` - Get overall statistics

### Links
- `POST /api/links` - Create affiliate link
- `GET /api/links/:partnerId` - Get partner's links

### Tracking
- `POST /api/track` - Track click
- `POST /api/demo-request` - Submit demo request (conversion)

## Database Schema

- `users` - Admin and affiliate user accounts
- `partners` - Affiliate partner records
- `affiliate_links` - Generated affiliate links
- `link_clicks` - Click tracking data
- `demo_requests` - Form submissions/conversions

## Development

See `SETUP_INSTRUCTIONS.md` for detailed setup instructions.

## License

Internal use only.
