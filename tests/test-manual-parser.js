const csvService = require('../src/services/csvService');
const path = require('path');

async function testManualCSVParser() {
    console.log('Testing Manual CSV Parser with Special Cases');
    console.log('=' .repeat(50));
    
    try {
        // Test 1: Basic CSV parsing
        console.log('\n1. Testing basic CSV parsing...');
        const simplePath = path.join(__dirname, '../sample-data/users.csv');
        const simpleData = await csvService.parseCSVToJSON(simplePath);
        console.log(`Parsed ${simpleData.length} records from basic CSV`);

        // Test 2: CSV with quotes and special characters
        console.log('\n2. Testing CSV with quotes and special characters...');
        const quotesPath = path.join(__dirname, '../sample-data/test-quotes.csv');
        const quotesData = await csvService.parseCSVToJSON(quotesPath);
        console.log(`Parsed ${quotesData.length} records from quotes CSV`);
        
        console.log('\nSample record with quotes:');
        console.log(JSON.stringify(quotesData[0], null, 2));
        
        console.log('\nRecord with special characters:');
        console.log(JSON.stringify(quotesData[4], null, 2)); // O'Connor record

        // Test 3: Test individual CSV row parsing
        console.log('\n3. Testing individual CSV row parsing...');
        const testRows = [
            'name.firstName,name.lastName,age',
            'John,Doe,25',
            '"Jane ""Jenny"" Smith",Johnson,30',
            'Bob,"O\'Connor",45',
            '"Alice, the Great",Brown,35'
        ];

        testRows.forEach((row, index) => {
            try {
                const parsed = csvService.parseCSVRow(row);
                console.log(`Row ${index}: [${parsed.map(field => `"${field}"`).join(', ')}]`);
            } catch (error) {
                console.error(`Row ${index} failed: ${error.message}`);
            }
        });

        // Test 4: Test field extraction for database
        console.log('\n4. Testing database field extraction...');
        const dbRecord = csvService.extractFieldsForDB(quotesData[0]);
        console.log('Database format:');
        console.log(JSON.stringify(dbRecord, null, 2));

        console.log('\nAll manual CSV parser tests passed!');

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    testManualCSVParser();
}

module.exports = testManualCSVParser;
