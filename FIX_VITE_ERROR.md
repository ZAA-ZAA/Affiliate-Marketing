# Fix: Vite 403 Restricted Error

## The Problem
Vite is blocking access to `index.html` because it's outside the allowed file serving list.

## The Solution
I've updated `vite.config.ts` to allow serving files from the project root.

## What Changed
- Added `root: __dirname` to explicitly set the project root
- Updated `fs.allow` to include `"."` (current directory) so `index.html` can be served

## Next Steps

1. **Stop the current dev server** (Ctrl+C in the terminal)

2. **Restart the dev server:**
   ```powershell
   npm run dev
   ```

3. **Access the app:**
   - If port 8080 is free: `http://localhost:8080`
   - If port 8080 is busy (like in your case): `http://localhost:8081`

## Note About Ports

If you see "Port 8080 is in use, trying another one..." and it uses 8081:
- That's fine! Just use `http://localhost:8081` instead
- Or stop whatever is using port 8080 and restart

## Verify It's Working

After restarting, you should:
- ✅ See the Vite dev server start without errors
- ✅ Be able to access `http://localhost:8080` (or 8081)
- ✅ See the homepage load correctly
- ✅ No more 403 Restricted errors
