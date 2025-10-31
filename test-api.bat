@echo off
echo CSV to JSON API Test Script
echo ================================

set BASE_URL=http://localhost:3000

echo.
echo 1. Testing server health...
curl -s %BASE_URL% >nul
if %errorlevel% neq 0 (
    echo ❌ Server is not running. Please start with: npm run dev
    pause
    exit /b 1
)
echo ✓ Server is running

echo.
echo 2. Testing CSV upload...
if not exist "sample-data\users.csv" (
    echo ❌ Sample CSV file not found
    pause
    exit /b 1
)

curl -X POST -F "csvFile=@sample-data/users.csv" %BASE_URL%/api/upload-csv
if %errorlevel% neq 0 (
    echo ❌ Upload failed
    pause
    exit /b 1
)
echo ✓ CSV uploaded successfully

echo.
echo 3. Testing age report endpoint...
curl -X GET %BASE_URL%/api/age-report
if %errorlevel% neq 0 (
    echo ❌ Failed to get age report
    pause
    exit /b 1
)

echo.
echo ✅ All API tests completed!
pause
