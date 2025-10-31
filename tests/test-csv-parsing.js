const csvService = require('../src/services/csvService');
const path = require('path');

async function testCSVParsing() {
    console.log('Testing CSV parsing functionality...\n');

    try {
        // Test with simple CSV
        const simplePath = path.join(__dirname, '../sample-data/users.csv');
        console.log('1. Testing simple CSV parsing...');
        const simpleData = await csvService.parseCSVToJSON(simplePath);
        console.log(`Parsed ${simpleData.length} records from simple CSV`);
        console.log('Sample record:', JSON.stringify(simpleData[0], null, 2));

        // Test field extraction for database
        console.log('\n2. Testing field extraction for database...');
        const dbRecord = csvService.extractFieldsForDB(simpleData[0]);
        console.log('Extracted DB record:', JSON.stringify(dbRecord, null, 2));

        // Test with complex CSV
        const complexPath = path.join(__dirname, '../sample-data/complex-users.csv');
        console.log('\n3. Testing complex CSV parsing...');
        const complexData = await csvService.parseCSVToJSON(complexPath);
        console.log(`Parsed ${complexData.length} records from complex CSV`);
        console.log('Sample complex record:', JSON.stringify(complexData[0], null, 2));

        // Test field extraction for complex data
        console.log('\n4. Testing field extraction for complex data...');
        const complexDbRecord = csvService.extractFieldsForDB(complexData[0]);
        console.log('Extracted complex DB record:', JSON.stringify(complexDbRecord, null, 2));

        console.log('\nAll tests passed successfully!');

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    testCSVParsing();
}

module.exports = testCSVParsing;
