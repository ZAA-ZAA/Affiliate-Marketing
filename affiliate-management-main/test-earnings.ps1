# Quick Test Script for Partner Earnings API
# Run this in PowerShell: .\test-earnings.ps1

# Configuration
$API_KEY = "aff_live_key_2026_xK9mP2vL8nQ4wR7j"
$BASE_URL = "http://localhost:5000"

Write-Host "=== Partner Earnings API Test ===" -ForegroundColor Cyan
Write-Host ""

# Get Affiliate ID (Link Code)
$AFFILIATE_ID = Read-Host "Enter Affiliate ID (link_code, e.g., LINK123 or GENERAL123-P-abc456)"

# Get amount
$amountInput = Read-Host "Enter amount (e.g., 150.50)"
try {
    $amount = [decimal]$amountInput
} catch {
    Write-Host "❌ Invalid amount. Must be a number." -ForegroundColor Red
    exit
}

# Get date (optional)
$dateInput = Read-Host "Enter date (YYYY-MM-DD) or press Enter for today"
if ([string]::IsNullOrWhiteSpace($dateInput)) {
    $date = Get-Date -Format "yyyy-MM-dd"
} else {
    $date = $dateInput
}

# Get client name (optional)
$clientName = Read-Host "Enter client name (optional)"

# Get status (optional)
$statusInput = Read-Host "Enter status (default: pending)"
if ([string]::IsNullOrWhiteSpace($statusInput)) {
    $status = "pending"
} else {
    $status = $statusInput
}

# Build request body
$body = @{
    affiliate_id = $AFFILIATE_ID
    amount = $amount
    date = $date
    client_name = $clientName
    status = $status
} | ConvertTo-Json

$headers = @{
    "X-API-Key" = $API_KEY
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Sending request..." -ForegroundColor Yellow
Write-Host "URL: $BASE_URL/api/v1/partner/earnings" -ForegroundColor Gray
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

# Send request
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/partner/earnings" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Message:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message
    }
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
