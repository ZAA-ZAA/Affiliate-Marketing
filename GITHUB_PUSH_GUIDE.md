# GitHub Push Guide - Complete Workflow

## PART 1: REPOSITORY SETUP

### 1. Initial Setup - Connect to GitHub

#### Check Current Connection
```bash
git remote -v
```
- **What it does:** Shows where your code will be pushed
- **When to use:** First time setup (shows if connection exists)
- **Expected output (empty at first):** Nothing, or shows existing remote

---

#### Add Your GitHub Repository Link
```bash
git remote add origin https://github.com/ZAA-ZAA/Affiliate-Marketing.git
```
- **What it does:** Tells git "this is where my code goes on GitHub"
- **When to use:** First time setup only
- **Replace with:** Your actual GitHub repo URL
- **Note:** `origin` is the default name for your main repository

---

#### Verify Connection
```bash
git remote -v
```
- **What it does:** Double-checks the connection was added
- **Expected output:**
```
origin  https://github.com/ZAA-ZAA/Affiliate-Marketing.git (fetch)
origin  https://github.com/ZAA-ZAA/Affiliate-Marketing.git (push)
```

---

### 2. Changing Remote Repository (Already Set Up)

#### Scenario: You Already Set Remote But Want to Change It

If you've already run `git remote add origin` but want to push to a **different repository** instead:

##### Option 1: Change the Remote URL (Recommended)
```bash
git remote set-url origin https://github.com/YOUR-USERNAME/NEW-REPO.git
```
- **What it does:** Updates the existing remote to point to a new GitHub repository
- **When to use:** You already have `origin` set and want to change where it points
- **Replace with:** Your new GitHub repository URL

##### Verify the Change
```bash
git remote -v
```
Should show your new repository URL.

---

##### Option 2: Remove Old Remote and Add New One
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/NEW-REPO.git
```
- **What it does:** Deletes the old connection and creates a new one
- **When to use:** If you want a completely fresh start
- **Note:** Same result as Option 1, but with extra steps

---

##### Example: Switching Repositories

**Old repository:** `https://github.com/old-username/old-repo.git`  
**New repository:** `https://github.com/new-username/new-repo.git`

```bash
# Check current remote
git remote -v

# Change to new repository
git remote set-url origin https://github.com/new-username/new-repo.git

# Verify change
git remote -v

# Push to new repository
git push -u origin main
```

---

##### Important Note About `git remote add`
⚠️ **You CANNOT run `git remote add origin` twice**

- First time: `git remote add origin https://github.com/ZAA-ZAA/Affiliate-Marketing.git` ✅ Works
- Second time: `git remote add origin https://github.com/NEW-USERNAME/NEW-REPO.git` ❌ Error!

**Error message:** `fatal: remote origin already exists.`

**Solution:** Use `git remote set-url` instead (Option 1 above)

---

## PART 2: IDENTITY & AUTHENTICATION

### 3. Set Your Identity (First Time Only)

#### Set Your Email
```bash
git config --global user.email "zoenaldueza@gmail.com"
```
- **What it does:** Tells git who you are (appears in commit history)
- **When to use:** First time using git on this computer
- **Replace with:** Your actual email
- **Scope:** `--global` means all projects on this computer use this email

---

#### Set Your Name
```bash
git config --global user.name "ZAA-ZAA"
```
- **What it does:** Tells git your name (appears in commit history)
- **When to use:** First time using git on this computer
- **Replace with:** Your GitHub username or name
- **Scope:** `--global` means all projects on this computer use this name

---

### 4. Changing Existing Git Identity

#### Scenario: You Already Set Name/Email But Want to Change Them

If you've already configured `git config --global user.name` or `git config --global user.email` and want to change them:

##### Change Your Email
```bash
git config --global user.email "newemail@gmail.com"
```
- **What it does:** Replaces your old email with a new one
- **When to use:** When you want to use a different email for commits
- **Note:** Uses the same command as initial setup (it overwrites)

---

##### Change Your Name
```bash
git config --global user.name "NEW-USERNAME"
```
- **What it does:** Replaces your old name with a new one
- **When to use:** When you want to change how your name appears in commits
- **Note:** Uses the same command as initial setup (it overwrites)

---

##### View Your Current Identity
```bash
git config --global user.email
git config --global user.name
```
- **What it does:** Shows what email and name are currently set
- **When to use:** Before changing, to verify current settings

---

### 5. Difference: Git Identity vs. GitHub Credentials

⚠️ **These are TWO DIFFERENT THINGS:**

| | Git Identity | GitHub Credentials |
|---|---|---|
| **What it is** | Your name & email in commit history | Your login info for GitHub |
| **Command** | `git config --global user.name/email` | Windows Credential Manager |
| **What it does** | Shows who made the commit | Authenticates you to GitHub |
| **Example** | "ZAA-ZAA" appears in commit | Lets you push/pull code |
| **When to change** | When you want different name in commits | When you switch GitHub accounts |

---

#### Git Identity (`git config`)
- **Purpose:** Records who created the commit (visible to everyone)
- **Change when:** You want your name/email to appear differently in commit history
- **Example:**
  ```bash
  git config --global user.name "ZAA-ZAA"
  git config --global user.email "zoenaldueza@gmail.com"
  ```

---

#### GitHub Credentials (Credential Manager)
- **Purpose:** Proves you have access to push code to GitHub
- **Change when:** You're getting "Permission denied" or changing GitHub accounts
- **Where:** Windows Credential Manager → Edit `github.com` entry
- **Related command:** `git credential reject https://github.com` (clears cached credentials)

---

##### When to Use `git credential reject https://github.com`
```bash
git credential reject https://github.com
```
- **What it does:** Forgets your saved GitHub password/token
- **When to use:** 
  - You're getting authentication errors
  - You switched GitHub accounts
  - You need to enter credentials again
- **Next step:** Next `git push` will ask you to log in again

---

##### Why They're Separate

**Scenario:** You have two GitHub accounts
- **Account 1:** username="john-dev", email="john@example.com"
- **Account 2:** username="jane-dev", email="jane@example.com"

```bash
# Switch to Account 1
git config --global user.name "john-dev"
git config --global user.email "john@example.com"
# Commits show "john-dev" as author

# Later, switch to Account 2
git config --global user.name "jane-dev"
git config --global user.email "jane@example.com"
# Commits show "jane-dev" as author

# When pushing, use Credential Manager to switch GitHub login
# (not git config commands)
```

---

## PART 3: CODE & PUSHING

### 6. The Complete Flow for Empty Repository

**When you have a brand new empty GitHub repository, run these commands IN ORDER:**

```bash
# Step 1: Connect to GitHub
git remote add origin https://github.com/ZAA-ZAA/Affiliate-Marketing.git

# Step 2: Prepare your code
git add .
git commit -m "Initial commit"

# Step 3: Set branch name and push
git branch -M main
git push -u origin main
```

**That's it!** Your code is now on GitHub.

---

### 7. Prepare Your Code

#### Stage All Files
```bash
git add .
```
- **What it does:** Tells git "these files are ready to be saved"
- **When to use:** Before every commit
- **Local only** = Not on GitHub yet
- **Alternative:**
  - `git add filename.txt` - Add specific file
  - `git add folder/` - Add specific folder

---

#### Create a Snapshot (Commit)
```bash
git commit -m "Initial commit"
```
- **What it does:** Creates a checkpoint of your code **locally** (saves on your computer, NOT on GitHub yet)
- **When to use:** After staging files
- **Message examples:**
  - `"Initial commit"` - First time setup
  - `"Add login feature"` - New feature
  - `"Fix bug in authentication"` - Bug fix
- **Note:** The `-m` flag lets you add a message directly
- **Status:** Still only on your computer, GitHub doesn't have it yet

---

### 8. Set Branch Name & Push to GitHub

#### Rename Branch to "main"
```bash
git branch -M main
```
- **What it does:** Renames your current branch to "main"
- **When to use:** First time, to match GitHub standards
- **Why:** GitHub defaults to "main" (old default was "master")
- **Current branch** = The branch you're working on right now

---

#### Push to GitHub
```bash
git push -u origin main
```
- **What it does:** **Uploads** all your commits to GitHub (NOW it appears on GitHub!)
- **When to use:** First push to set tracking, then just use `git push`
- **Flags explained:**
  - `-u` = "remember this connection for next time"
  - `origin` = your GitHub repository
  - `main` = the branch name to push to
- **Expected output:** Shows files being compressed and uploaded
- **Result:** Your code is now on GitHub ✓

---

## PART 4: VERSION CONTROL WITH BRANCHES

### 9. What is a Branch?

A **branch** is a separate line of development. Think of it like:
- `main` branch = Final, production-ready code
- `feature` branch = Working on a new feature without affecting `main`
- `bugfix` branch = Fixing a bug separately

**Why use branches?**
- Keep main code stable
- Work on multiple features without interfering
- Test changes before merging to main
- Easy to review changes (Pull Request)

---

### 10. Create a New Branch

#### Create and Switch to New Branch
```bash
git checkout -b feature/login-page
```
- **What it does:** Creates a new branch called "feature/login-page" AND switches to it
- **When to use:** Before starting a new feature
- **Naming convention:**
  - `feature/feature-name` - New features
  - `bugfix/bug-name` - Bug fixes
  - `hotfix/issue-name` - Urgent fixes
- **Example names:**
  - `feature/add-dark-mode`
  - `bugfix/fix-login-error`
  - `feature/payment-system`

---

#### Check Which Branch You're On
```bash
git branch
```
- **What it does:** Shows all local branches
- **Current branch:** Shows with an asterisk `*`
- **Example output:**
```
* feature/login-page
  main
```
(You're currently on `feature/login-page`)

---

#### See All Branches (Local + Remote)
```bash
git branch -a
```
- **What it does:** Shows all branches on your computer AND on GitHub
- **Example output:**
```
* feature/login-page
  main
  remotes/origin/main
  remotes/origin/feature/old-branch
```

---

### 11. Push New Branch to GitHub

#### Check Before Pushing
```bash
git status
```
- **What it does:** Shows what files changed and which branch you're on
- **Example output:**
```
On branch feature/login-page
Changes not staged for commit:
  modified:   client/pages/Login.tsx
```
(You're on `feature/login-page` branch)

---

#### Push New Branch
```bash
git add .
git commit -m "Add login form UI"
git push -u origin feature/login-page
```
- **What it does:** Creates the branch on GitHub for the first time
- **When to use:** When pushing a new branch for the first time
- **Note:** The `-u` remembers this branch for next time

---

#### Verify Branch Was Pushed
```bash
git branch -a
```
Should now show:
```
* feature/login-page
  main
  remotes/origin/main
  remotes/origin/feature/login-page  ← Your new branch on GitHub
```

---

### 12. Work on Different Branches

#### Switch to Another Branch
```bash
git checkout main
```
- **What it does:** Switches from current branch to "main"
- **When to use:** To switch between branches
- **Your files change** to match that branch's code

---

#### Scenario: Multiple Features

**You're working on feature A, but need to switch to feature B:**

```bash
# Currently on: feature/login-page
# You made changes to Login.tsx

# Step 1: Save your work (commit it)
git add .
git commit -m "Complete login form"

# Step 2: Push to GitHub
git push

# Step 3: Switch to another branch
git checkout feature/checkout-page

# Now you're on: feature/checkout-page
# Login.tsx changes are saved in feature/login-page
# Checkout.tsx is ready for editing
```

---

#### Future Pushes on Same Branch
After creating a branch with `-u`, future pushes are simple:
```bash
git add .
git commit -m "Your message"
git push
```
Git remembers which branch to push to.

---

### 13. Merge Branch Back to Main

#### Merge Feature Branch to Main
```bash
# Step 1: Switch to main
git checkout main

# Step 2: Merge feature branch
git merge feature/login-page
```
- **What it does:** Combines `feature/login-page` code into `main`
- **When to use:** When feature is complete and tested
- **Result:** `main` now has login page code

---

#### Push Merged Code to GitHub
```bash
git push
```
- **What it does:** Uploads merged code to GitHub main branch
- **When to use:** After merging feature

---

### 14. Delete Branch (After Merging)

#### Delete Local Branch
```bash
git branch -d feature/login-page
```
- **What it does:** Deletes the branch on your computer
- **When to use:** After merging, to keep clean
- **Note:** `-d` is safe (prevents accidental deletion if not merged)

---

#### Delete Remote Branch (on GitHub)
```bash
git push origin --delete feature/login-page
```
- **What it does:** Deletes the branch on GitHub
- **When to use:** After merging, to clean up GitHub
- **Result:** Branch no longer appears on GitHub

---

### 15. Common Branching Workflow

**Full example:**

```bash
# 1. Create feature branch
git checkout -b feature/dark-mode

# 2. Make changes
# (edit files...)

# 3. Stage and commit
git add .
git commit -m "Add dark mode toggle"

# 4. Push new branch to GitHub (first time)
git push -u origin feature/dark-mode

# 5. Work on the feature (more commits)
# (edit files again...)
git add .
git commit -m "Fix dark mode on mobile"
git push  # Simple push now

# 6. Merge to main when done
git checkout main
git merge feature/dark-mode

# 7. Push merged code
git push

# 8. Clean up
git branch -d feature/dark-mode
git push origin --delete feature/dark-mode
```

---

### Future Pushes (After Initial Setup)

```bash
git add .
git commit -m "Your message"
git push
```

That's it! No need for `-u origin main` again.

---

### Common Scenarios

#### Push New Changes
```bash
git add .
git commit -m "Describe what you changed"
git push
```

#### Check What Changed
```bash
git status
```
Shows files that are modified or new.

#### View Your Commits
```bash
git log
```
Shows all commits with messages.

#### Check Current Remote
```bash
git remote -v
```
Shows where your code goes.

---

## TROUBLESHOOTING

### Authentication Denied?
```bash
# Check if using correct credentials
git remote -v

# Clear saved credentials
git credential reject https://github.com

# Update Windows Credential Manager
# Search "Credential Manager" → Windows Credentials → Edit github.com entry
```

### Wrong Repository?
```bash
git remote -v
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
```

### Need to Undo Last Commit?
```bash
git reset --soft HEAD~1
```
Keeps changes but undoes the commit.

---

## SUMMARY TABLE

| Section | Command | Purpose |
|---------|---------|---------|
| **Repository Setup** | `git remote add origin <URL>` | Connect to GitHub |
| | `git remote set-url origin <URL>` | Change repository |
| **Identity** | `git config --global user.email` | Set/change email |
| | `git config --global user.name` | Set/change name |
| **Code** | `git add .` | Stage all files |
| | `git commit -m "message"` | Create snapshot locally |
| **Push** | `git push` | Upload to GitHub |
| **Branches** | `git checkout -b feature/name` | Create new branch |
| | `git branch` | Show current branch |
| | `git branch -a` | Show all branches |
| | `git checkout main` | Switch to main branch |
| | `git merge feature/name` | Combine branch to current |
| | `git branch -d feature/name` | Delete local branch |
| | `git push origin --delete feature/name` | Delete remote branch |
| **Check Status** | `git status` | Show changes & branch |
| | `git log` | Show commit history |

