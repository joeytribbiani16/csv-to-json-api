const csvService = require('../src/services/csvService');
const fs = require('fs');
const path = require('path');

async function comprehensiveTest() {
    console.log('Comprehensive Manual CSV Parser Test');
    console.log('=' .repeat(60));
    
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0
    };

    function runTest(testName, testFn) {
        testResults.total++;
        try {
            testFn();
            console.log(`PASS: ${testName}`);
            testResults.passed++;
        } catch (error) {
            console.log(`FAIL: ${testName}: ${error.message}`);
            testResults.failed++;
        }
    }

    function runAsyncTest(testName, testFn) {
        testResults.total++;
        return testFn()
            .then(() => {
                console.log(`PASS: ${testName}`);
                testResults.passed++;
            })
            .catch((error) => {
                console.log(`FAIL: ${testName}: ${error.message}`);
                testResults.failed++;
            });
    }

    // Test 1: Basic row parsing
    runTest('Basic CSV row parsing', () => {
        const row = 'name.firstName,name.lastName,age';
        const result = csvService.parseCSVRow(row);
        if (result.length !== 3 || result[0] !== 'name.firstName') {
            throw new Error('Basic row parsing failed');
        }
    });

    // Test 2: Quoted field parsing
    runTest('Quoted field parsing', () => {
        const row = '"John Doe","Software Engineer","Age: 25"';
        const result = csvService.parseCSVRow(row);
        if (result[0] !== 'John Doe' || result[1] !== 'Software Engineer') {
            throw new Error('Quoted field parsing failed');
        }
    });

    // Test 3: Escaped quotes parsing
    runTest('Escaped quotes parsing', () => {
        const row = '"He said ""Hello""","She replied ""Hi"""';
        const result = csvService.parseCSVRow(row);
        if (result[0] !== 'He said "Hello"' || result[1] !== 'She replied "Hi"') {
            throw new Error('Escaped quotes parsing failed');
        }
    });

    // Test 4: Comma in quoted field
    runTest('Comma in quoted field', () => {
        const row = '"Smith, John","Software Engineer, Senior"';
        const result = csvService.parseCSVRow(row);
        if (result[0] !== 'Smith, John' || result[1] !== 'Software Engineer, Senior') {
            throw new Error('Comma in quoted field parsing failed');
        }
    });

    // Test 5: Mixed quoted and unquoted
    runTest('Mixed quoted and unquoted fields', () => {
        const row = 'John,"Doe, Jr",25,"Software Engineer"';
        const result = csvService.parseCSVRow(row);
        if (result.length !== 4 || result[1] !== 'Doe, Jr') {
            throw new Error('Mixed field parsing failed');
        }
    });

    // Test 6: File parsing with sample data
    await runAsyncTest('Sample CSV file parsing', async () => {
        const filePath = path.join(__dirname, '../sample-data/users.csv');
        const result = await csvService.parseCSVToJSON(filePath);
        if (result.length !== 10) {
            throw new Error(`Expected 10 records, got ${result.length}`);
        }
    });

    // Test 7: Complex nested transformation
    runTest('Nested object transformation', () => {
        const flat = {
            'name.firstName': 'John',
            'name.lastName': 'Doe',
            'address.line1': '123 Main St',
            'address.city': 'New York',
            'contact.email': 'john@example.com',
            'age': '25'
        };
        const nested = csvService.transformFlatToNested(flat);
        if (!nested.name || nested.name.firstName !== 'John' || nested.age !== 25) {
            throw new Error('Nested transformation failed');
        }
    });

    // Test 8: Database field extraction
    runTest('Database field extraction', () => {
        const nested = {
            name: { firstName: 'John', lastName: 'Doe' },
            age: 25,
            address: { city: 'New York' },
            extra: 'data'
        };
        const dbRecord = csvService.extractFieldsForDB(nested);
        if (dbRecord.name !== 'John Doe' || dbRecord.age !== 25) {
            throw new Error('DB field extraction failed');
        }
    });

    // Test 9: Error handling for missing required fields
    runTest('Missing required fields error handling', () => {
        const nested = { name: { firstName: 'John' }, age: 25 };
        try {
            csvService.extractFieldsForDB(nested);
            throw new Error('Should have thrown error for missing lastName');
        } catch (error) {
            if (!error.message.includes('Missing required fields')) {
                throw error;
            }
        }
    });

    // Test 10: Quotes CSV file
    await runAsyncTest('Quotes CSV file parsing', async () => {
        const filePath = path.join(__dirname, '../sample-data/test-quotes.csv');
        const result = await csvService.parseCSVToJSON(filePath);
        if (result.length !== 5) {
            throw new Error(`Expected 5 records, got ${result.length}`);
        }
        // Check if quotes were properly handled
        const firstRecord = result[0];
        if (!firstRecord.description || !firstRecord.description.includes('"coding"')) {
            throw new Error('Quotes not properly parsed');
        }
    });

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\nAll tests passed! Manual CSV parser is working perfectly.');
    } else {
        console.log('\nSome tests failed. Please check the implementation.');
        process.exit(1);
    }
}

if (require.main === module) {
    comprehensiveTest();
}

module.exports = comprehensiveTest;
