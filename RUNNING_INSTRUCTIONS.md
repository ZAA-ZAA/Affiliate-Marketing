# How to Run the Application

## Current Status

✅ **Python Backend**: Running on `http://localhost:5000` (Flask API server)
✅ **Frontend**: Should be starting on `http://localhost:8080`

## About the Flask 404 Errors

The 404 errors you see in Flask are **NORMAL** and **EXPECTED**:
- Flask only serves API endpoints (like `/api/auth/login`, `/api/partners`, etc.)
- It does NOT serve the frontend pages
- When you visit `http://localhost:5000/` directly, you get 404 because there's no route for `/`
- The frontend (Vite) runs on port 8080 and proxies API requests to Flask

## How It Works

1. **Frontend (Port 8080)**: Serves React app at `http://localhost:8080`
2. **Backend (Port 5000)**: Serves API at `http://localhost:5000/api/*`
3. **Proxy**: Frontend automatically forwards `/api/*` requests to backend

## Access the Application

**Open your browser and go to:**
```
http://localhost:8080
```

NOT `http://localhost:5000` (that's just the API)

## If Frontend Doesn't Start

### Option 1: Use npm instead of pnpm

```powershell
npm install
npm run dev
```

### Option 2: Use npx pnpm

```powershell
npx pnpm dev
```

### Option 3: Fix pnpm PowerShell Issue

If pnpm still doesn't work, try:

1. **Uninstall and reinstall pnpm:**
   ```powershell
   npm uninstall -g pnpm
   npm install -g pnpm
   ```

2. **Or use npm directly** (works the same):
   ```powershell
   npm install
   npm run dev
   ```

## Verify Everything is Running

1. **Backend**: Check terminal - should see Flask running on port 5000
2. **Frontend**: Check browser - go to `http://localhost:8080`
3. **Test API**: Visit `http://localhost:5000/api/ping` - should return `{"message":"pong"}`

## Next Steps

1. Open browser: `http://localhost:8080`
2. Go to `/setup` to create admin account
3. Login and start using the app!
