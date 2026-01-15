# Python Installation Guide for Windows

## Option 1: Install Python from python.org (Recommended)

1. **Download Python:**
   - Go to: https://www.python.org/downloads/
   - Download Python 3.11 or 3.12 (latest stable version)
   - Choose "Windows installer (64-bit)"

2. **Install Python:**
   - Run the downloaded installer
   - **IMPORTANT:** Check the box "Add Python to PATH" at the bottom of the installer
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify Installation:**
   - Open a NEW PowerShell/Command Prompt window
   - Run: `python --version`
   - You should see something like: `Python 3.11.x`

## Option 2: Install Python from Microsoft Store

1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Click "Install"
4. Wait for installation
5. Open a NEW terminal and verify: `python --version`

## After Installing Python

1. **Close and reopen your terminal** (important!)

2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\anj\Downloads\affiliate-management-main\affiliate-management-main\backend
   ```

3. **Create virtual environment:**
   ```powershell
   python -m venv venv
   ```

4. **Activate virtual environment:**
   ```powershell
   venv\Scripts\activate
   ```
   You should see `(venv)` at the start of your prompt

5. **Install dependencies:**
   ```powershell
   pip install -r ..\requirements.txt
   ```

6. **Start the backend:**
   ```powershell
   python app.py
   ```

## Troubleshooting

### "python is not recognized"
- Make sure you checked "Add Python to PATH" during installation
- Restart your terminal/computer
- Try using `py` instead of `python`:
  ```powershell
  py -m venv venv
  py app.py
  ```

### "pip is not recognized"
- Python should include pip automatically
- Try: `python -m pip install -r ..\requirements.txt`

### Still having issues?
- Make sure you installed Python (not just opened the Microsoft Store page)
- Close and reopen your terminal after installation
- Check if Python is in PATH: `where python` (should show a path)
