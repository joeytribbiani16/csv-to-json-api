# Quick Start Guide

## Prerequisites Setup

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- Remember your username and password during installation
- Default settings: Host=localhost, Port=5432

### 2. Update Environment Configuration
Edit the `.env` file with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=csv_converter
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

## Running the Application

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
npm run setup-db
```

### Step 3: Start the Server
```bash
npm run dev
```
The server will start on http://localhost:3000

### Step 4: Test the Application

#### Option A: Using PowerShell (Recommended for Windows)
```powershell
.\test-api.ps1
```

#### Option B: Using Command Line
```cmd
test-api.bat
```

#### Option C: Manual Testing with curl
```bash
# Upload CSV file
curl -X POST -F "csvFile=@sample-data/users.csv" http://localhost:3000/api/upload-csv

# Get age report
curl http://localhost:3000/api/age-report
```

#### Option D: Using Postman or Thunder Client
1. POST to `http://localhost:3000/api/upload-csv`
2. Body: form-data, key: `csvFile`, value: select `sample-data/users.csv`
3. GET `http://localhost:3000/api/age-report`

## Expected Output

After uploading the CSV, you should see console output like:
```
==================================================
AGE DISTRIBUTION REPORT
==================================================
Total Users: 10
--------------------------------------------------
Age-Group      % Distribution Count
--------------------------------------------------
< 20           10.0%          1
20 to 40       40.0%          4
40 to 60       30.0%          3
> 60           20.0%          2
==================================================
```

## Troubleshooting

### Database Connection Issues
1. Make sure PostgreSQL is running
2. Check credentials in `.env` file
3. Ensure database exists: `npm run setup-db`

### Server Not Starting
1. Check if port 3000 is available
2. Run `npm install` to ensure dependencies are installed
3. Check for any error messages in the console

### CSV Upload Issues
1. Ensure CSV file has required fields: `name.firstName`, `name.lastName`, `age`
2. File size must be under 50MB
3. File must have `.csv` extension

## Production Deployment

For production deployment:

1. Set environment variables:
```bash
NODE_ENV=production
PORT=8080  # or your preferred port
```

2. Use process manager like PM2:
```bash
npm install -g pm2
pm2 start src/app.js --name "csv-api"
```

3. Configure reverse proxy (nginx) for SSL and load balancing
4. Set up database backups and monitoring
