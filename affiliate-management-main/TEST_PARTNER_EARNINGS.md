# How to Use Partner Earnings API

## What is "curl"?
**curl** is a command-line tool to send HTTP requests (like calling a website API). On Windows, you can use **PowerShell** instead, which is easier!

---

## Your API Key
**Default API Key:** `aff_live_key_2026_xK9mP2vL8nQ4wR7j`

This is already in your database. You can check it by running:
```sql
SELECT key_value, name, is_active FROM api_keys;
```

---

## Step 1: Get a Partner ID

You need a `partner_id` from your database. Get it by:

**Option A: From Database (MySQL)**
```sql
SELECT id, u.email, u.first_name, u.last_name 
FROM partners p 
JOIN users u ON p.user_id = u.id 
WHERE p.status = 'active';
```

**Option B: From API (if backend is running)**
Open browser: `http://localhost:5000/api/partners`
Look for the `"id"` field of any partner.

---

## Step 2: Call the API

### Method 1: PowerShell (Windows - EASIEST!)

Open **PowerShell** and run:

```powershell
# Replace YOUR_PARTNER_ID with actual partner ID from Step 1
$partnerId = "YOUR_PARTNER_ID"
$apiKey = "aff_live_key_2026_xK9mP2vL8nQ4wR7j"

$body = @{
    partner_id = $partnerId
    amount = 150.50
    date = "2025-01-15"
    client_name = "Acme Corporation"
    status = "pending"
} | ConvertTo-Json

$headers = @{
    "X-API-Key" = $apiKey
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/partner/earnings" -Method POST -Headers $headers -Body $body
```

**Example with real values:**
```powershell
$body = '{"partner_id":"abc123-def456-ghi789","amount":250.75,"date":"2025-01-20","client_name":"Test Client","status":"pending"}'
$headers = @{"X-API-Key"="aff_live_key_2026_xK9mP2vL8nQ4wR7j"; "Content-Type"="application/json"}
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/partner/earnings" -Method POST -Headers $headers -Body $body
```

---

### Method 2: Using curl (if installed)

If you have curl installed (or install it from https://curl.se):

```bash
curl -X POST "http://localhost:5000/api/v1/partner/earnings" ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: aff_live_key_2026_xK9mP2vL8nQ4wR7j" ^
  -d "{\"partner_id\":\"YOUR_PARTNER_ID\",\"amount\":150.50,\"date\":\"2025-01-15\",\"client_name\":\"Acme Corp\",\"status\":\"pending\"}"
```

---

### Method 3: Using Postman (GUI Tool - EASIEST FOR BEGINNERS!)

1. Download **Postman** from https://www.postman.com/downloads/
2. Open Postman
3. Create new request:
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/v1/partner/earnings`
   - **Headers:**
     - `X-API-Key`: `aff_live_key_2026_xK9mP2vL8nQ4wR7j`
     - `Content-Type`: `application/json`
   - **Body** (select "raw" and "JSON"):
     ```json
     {
       "partner_id": "YOUR_PARTNER_ID",
       "amount": 150.50,
       "date": "2025-01-15",
       "client_name": "Acme Corporation",
       "status": "pending"
     }
     ```
4. Click **Send**

---

### Method 4: Using Python Script

Create a file `test_earnings.py`:

```python
import requests

url = "http://localhost:5000/api/v1/partner/earnings"
headers = {
    "X-API-Key": "aff_live_key_2026_xK9mP2vL8nQ4wR7j",
    "Content-Type": "application/json"
}
data = {
    "partner_id": "YOUR_PARTNER_ID",  # Replace with actual partner ID
    "amount": 150.50,
    "date": "2025-01-15",
    "client_name": "Acme Corporation",
    "status": "pending"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

Run: `python test_earnings.py`

---

## Parameters Explained

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `partner_id` | ✅ Yes | Partner UUID from database | `"abc123-def456-ghi789"` |
| `amount` | ✅ Yes | Earnings amount (number) | `150.50` |
| `date` | ❌ No | Date in YYYY-MM-DD format (defaults to now) | `"2025-01-15"` |
| `client_name` | ❌ No | Client/customer name | `"Acme Corp"` |
| `status` | ❌ No | Status (defaults to "pending") | `"pending"` or `"paid"` |

**Note:** You can also use `partner-id` instead of `partner_id`, and `client-name` instead of `client_name`.

---

## Expected Response

**Success (201):**
```json
{
  "success": true,
  "message": "Earnings added",
  "id": "new-uuid-here",
  "partner_id": "abc123-def456-ghi789",
  "amount": 150.50,
  "earned_at": "2025-01-15T00:00:00",
  "client_name": "Acme Corporation",
  "status": "pending"
}
```

**Error (400/404):**
```json
{
  "error": "Partner not found"
}
```

---

## Troubleshooting

1. **"API key is required"** → Make sure you're sending `X-API-Key` header
2. **"Partner not found"** → Check that the `partner_id` exists and is active
3. **"amount must be a number"** → Make sure amount is a number, not a string
4. **Connection refused** → Make sure backend is running on port 5000

---

## Quick Test Script (PowerShell)

Save this as `test-earnings.ps1`:

```powershell
# Configuration
$API_KEY = "aff_live_key_2026_xK9mP2vL8nQ4wR7j"
$BASE_URL = "http://localhost:5000"
$PARTNER_ID = Read-Host "Enter Partner ID"

# Get input
$amount = Read-Host "Enter amount (e.g., 150.50)"
$date = Read-Host "Enter date (YYYY-MM-DD) or press Enter for today"
$clientName = Read-Host "Enter client name (optional)"
$status = Read-Host "Enter status (default: pending)"

if ([string]::IsNullOrWhiteSpace($date)) {
    $date = Get-Date -Format "yyyy-MM-dd"
}
if ([string]::IsNullOrWhiteSpace($status)) {
    $status = "pending"
}

# Build request
$body = @{
    partner_id = $PARTNER_ID
    amount = [decimal]$amount
    date = $date
    client_name = $clientName
    status = $status
} | ConvertTo-Json

$headers = @{
    "X-API-Key" = $API_KEY
    "Content-Type" = "application/json"
}

# Send request
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/partner/earnings" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
```

Run it: `.\test-earnings.ps1`
