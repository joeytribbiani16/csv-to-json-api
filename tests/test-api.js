const fs = require('fs');
const path = require('path');

// Simple API testing script (works without external dependencies)
async function testAPI() {
    console.log('Testing CSV to JSON API...\n');

    const baseURL = 'http://localhost:3000';

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server health...');
        const healthResponse = await fetch(baseURL);
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('✓ Server is running');
            console.log('Available endpoints:', data.endpoints);
        } else {
            throw new Error('Server is not responding');
        }

        // Test 2: Upload CSV file
        console.log('\n2. Testing CSV upload...');
        const csvPath = path.join(__dirname, '../sample-data/users.csv');
        
        if (!fs.existsSync(csvPath)) {
            throw new Error('Sample CSV file not found');
        }

        const formData = new FormData();
        const csvContent = fs.readFileSync(csvPath);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        formData.append('csvFile', blob, 'users.csv');

        const uploadResponse = await fetch(`${baseURL}/api/upload-csv`, {
            method: 'POST',
            body: formData
        });

        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('✓ CSV uploaded successfully');
            console.log(`Records processed: ${result.recordsProcessed}`);
            console.log('Age distribution:', result.ageDistribution);
        } else {
            const error = await uploadResponse.text();
            throw new Error(`Upload failed: ${error}`);
        }

        // Test 3: Get age report
        console.log('\n3. Testing age report endpoint...');
        const reportResponse = await fetch(`${baseURL}/api/age-report`);
        
        if (reportResponse.ok) {
            const report = await reportResponse.json();
            console.log('✓ Age report retrieved successfully');
            console.log(`Total users: ${report.ageDistribution.totalUsers}`);
            console.log('Distribution:', report.ageDistribution.distribution);
        } else {
            throw new Error('Failed to get age report');
        }

        console.log('\n✅ All API tests passed successfully!');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('\nMake sure the server is running: npm run dev');
        process.exit(1);
    }
}

// Simple fetch polyfill for Node.js (for environments without native fetch)
if (typeof fetch === 'undefined') {
    console.log('Note: Using manual HTTP requests (fetch not available)');
    console.log('For complete testing, please use a browser or install node-fetch');
    console.log('Manual test: curl -X POST -F "csvFile=@sample-data/users.csv" http://localhost:3000/api/upload-csv');
    process.exit(0);
}

if (require.main === module) {
    testAPI();
}

module.exports = testAPI;
