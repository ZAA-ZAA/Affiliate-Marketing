# GitHub Setup Guide for Visual Studio Code

## Step 1: Configure Git User Information

1. **Open Terminal in VS Code:**
   - Press `Ctrl + `` (backtick) or go to `Terminal > New Terminal`

2. **Set your Git username and email:**
   ```powershell
   git config --global user.name "YourGitHubUsername"
   git config --global user.email "your.email@example.com"
   ```
   
   Replace:
   - `YourGitHubUsername` with your actual GitHub username
   - `your.email@example.com` with the email associated with your GitHub account

## Step 2: Check Your GitHub Account

1. **Open GitHub in your browser:** https://github.com
2. **Check the top-right corner** - you'll see your profile picture/username
3. **If you need to switch accounts:**
   - Click your profile picture → Settings
   - Or sign out and sign in with the correct account

## Step 3: Create a New Repository on GitHub

1. **Go to:** https://github.com/new
2. **Repository name:** Choose a name (e.g., `affiliate-management`)
3. **Description:** (Optional) Add a description
4. **Visibility:** Choose Public or Private
5. **IMPORTANT:** Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   
   (We already have these files in the project)
6. **Click "Create repository"**

## Step 4: Use VS Code Source Control Panel

### Option A: Using VS Code UI (Recommended)

1. **Open Source Control:**
   - Click the Source Control icon in the left sidebar (looks like a branch)
   - Or press `Ctrl + Shift + G`

2. **Stage All Files:**
   - Click the "+" icon next to "Changes" to stage all files
   - Or type a commit message first, then click "Commit"

3. **Make Your First Commit:**
   - Type a commit message in the text box (e.g., "Initial commit")
   - Press `Ctrl + Enter` or click the checkmark icon

4. **Publish to GitHub:**
   - After committing, you'll see a "Publish Branch" button
   - Click it
   - VS Code will ask you to sign in to GitHub (if not already signed in)
   - Choose your account
   - Select "Publish to GitHub public repository" or "Publish to GitHub private repository"
   - VS Code will create the repo and push your code automatically!

### Option B: Using Terminal Commands

If you prefer using the terminal:

1. **Stage all files:**
   ```powershell
   git add .
   ```

2. **Make your first commit:**
   ```powershell
   git commit -m "Initial commit"
   ```

3. **Add GitHub remote:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values

4. **Push to GitHub:**
   ```powershell
   git branch -M main
   git push -u origin main
   ```
   
   You'll be prompted to sign in to GitHub if not already authenticated.

## Step 5: Verify Upload

1. **Go to your GitHub repository:** https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
2. **You should see all your files there!**

## Troubleshooting

### If VS Code asks for GitHub authentication:
- It will open a browser window
- Sign in to GitHub
- Authorize VS Code
- Return to VS Code and try again

### If you get authentication errors:
- Go to: `File > Preferences > Settings` (or `Ctrl + ,`)
- Search for "git authentication"
- Make sure "Git: Enabled" is checked
- You may need to use a Personal Access Token instead of password

### To switch GitHub accounts:
1. Sign out: `Ctrl + Shift + P` → "Git: Sign Out"
2. Sign in again: `Ctrl + Shift + P` → "Git: Sign In"
3. Choose the correct account

## Quick Reference Commands

```powershell
# Check current Git config
git config --global user.name
git config --global user.email

# Check which account you're connected to (if using GitHub CLI)
gh auth status

# View remote repositories
git remote -v

# Check status
git status
```
