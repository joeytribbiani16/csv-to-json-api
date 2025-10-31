# PowerShell script to test the CSV to JSON API

Write-Host "CSV to JSON API Test Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$baseUrl = "http://localhost:3000"
$csvFile = "sample-data\users.csv"

# Test 1: Check server health
Write-Host "`n1. Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "✓ Server is running" -ForegroundColor Green
    Write-Host "Available endpoints:" -ForegroundColor Cyan
    $response.endpoints | Format-Table
} catch {
    Write-Host "❌ Server is not running. Please start with: npm run dev" -ForegroundColor Red
    exit 1
}

# Test 2: Upload CSV file
Write-Host "`n2. Testing CSV upload..." -ForegroundColor Yellow
if (Test-Path $csvFile) {
    try {
        $uploadUrl = "$baseUrl/api/upload-csv"
        $form = @{
            csvFile = Get-Item -Path $csvFile
        }
        
        $response = Invoke-RestMethod -Uri $uploadUrl -Method Post -Form $form
        Write-Host "✓ CSV uploaded successfully" -ForegroundColor Green
        Write-Host "Records processed: $($response.recordsProcessed)" -ForegroundColor Cyan
        Write-Host "Age distribution:" -ForegroundColor Cyan
        $response.ageDistribution.distribution | Format-Table
    } catch {
        Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Sample CSV file not found: $csvFile" -ForegroundColor Red
    exit 1
}

# Test 3: Get age report
Write-Host "`n3. Testing age report endpoint..." -ForegroundColor Yellow
try {
    $reportResponse = Invoke-RestMethod -Uri "$baseUrl/api/age-report" -Method Get
    Write-Host "✓ Age report retrieved successfully" -ForegroundColor Green
    Write-Host "Total users: $($reportResponse.ageDistribution.totalUsers)" -ForegroundColor Cyan
    Write-Host "Distribution:" -ForegroundColor Cyan
    $reportResponse.ageDistribution.distribution | Format-Table
} catch {
    Write-Host "❌ Failed to get age report: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All API tests passed successfully!" -ForegroundColor Green
