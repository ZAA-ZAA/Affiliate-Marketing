# Fix PowerShell Execution Policy for pnpm

## Quick Fix (Run in PowerShell as Administrator)

Open PowerShell **as Administrator** and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then type `Y` and press Enter when prompted.

## Alternative: Use npm instead of pnpm

If you can't change the execution policy, you can use npm instead:

```powershell
npm install
npm run dev
```

## Why This Happens

Windows PowerShell blocks unsigned scripts by default for security. pnpm uses PowerShell scripts that need to be allowed.

## After Fixing

1. Close and reopen your terminal
2. Navigate to project folder
3. Run: `pnpm dev`
