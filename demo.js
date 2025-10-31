const csvService = require('./src/services/csvService');
const path = require('path');

async function demoWithoutDatabase() {
    console.log('CSV to JSON Converter - Demo Mode (No Database Required)');
    console.log('='.repeat(60));
    
    try {
        // Test with simple CSV
        console.log('\n1. Processing simple CSV file...');
        const simplePath = path.join(__dirname, 'sample-data/users.csv');
        const simpleData = await csvService.parseCSVToJSON(simplePath);
        
        console.log(`Successfully parsed ${simpleData.length} records`);
        console.log('\nSample parsed record:');
        console.log(JSON.stringify(simpleData[0], null, 2));
        
        // Show database format
        console.log('\nDatabase format for this record:');
        const dbRecord = csvService.extractFieldsForDB(simpleData[0]);
        console.log(JSON.stringify(dbRecord, null, 2));
        
        // Generate age distribution from parsed data
        console.log('\n2. Generating age distribution report...');
        const ageReport = generateAgeDistribution(simpleData);
        
        // Test with complex CSV
        console.log('\n3. Processing complex CSV file...');
        const complexPath = path.join(__dirname, 'sample-data/complex-users.csv');
        const complexData = await csvService.parseCSVToJSON(complexPath);
        
        console.log(`Successfully parsed ${complexData.length} records`);
        console.log('\nSample complex record:');
        console.log(JSON.stringify(complexData[0], null, 2));
        
        console.log('\nDatabase format for complex record:');
        const complexDbRecord = csvService.extractFieldsForDB(complexData[0]);
        console.log(JSON.stringify(complexDbRecord, null, 2));
        
        console.log('\n4. Age distribution for complex data:');
        generateAgeDistribution(complexData);
        
        console.log('\nDemo completed successfully!');
        console.log('\nTo run with full database features:');
        console.log('1. Install PostgreSQL');
        console.log('2. Update .env with your database credentials');
        console.log('3. Run: npm run setup-db');
        console.log('4. Start server: npm run dev');
        
    } catch (error) {
        console.error('Demo failed:', error.message);
    }
}

function generateAgeDistribution(data) {
    const totalUsers = data.length;
    
    if (totalUsers === 0) {
        console.log('No data to analyze');
        return;
    }
    
    const ageGroups = {
        under_20: 0,
        age_20_to_40: 0,
        age_40_to_60: 0,
        over_60: 0
    };
    
    data.forEach(record => {
        const age = record.age;
        if (age < 20) {
            ageGroups.under_20++;
        } else if (age >= 20 && age < 40) {
            ageGroups.age_20_to_40++;
        } else if (age >= 40 && age < 60) {
            ageGroups.age_40_to_60++;
        } else {
            ageGroups.over_60++;
        }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('AGE DISTRIBUTION REPORT');
    console.log('='.repeat(50));
    console.log(`Total Users: ${totalUsers}`);
    console.log('-'.repeat(50));
    console.log('Age-Group'.padEnd(15) + '% Distribution'.padEnd(15) + 'Count');
    console.log('-'.repeat(50));
    
    const groups = [
        ['< 20', ageGroups.under_20],
        ['20 to 40', ageGroups.age_20_to_40],
        ['40 to 60', ageGroups.age_40_to_60],
        ['> 60', ageGroups.over_60]
    ];
    
    groups.forEach(([ageGroup, count]) => {
        const percentage = Math.round((count / totalUsers) * 100 * 10) / 10;
        console.log(
            ageGroup.padEnd(15) + 
            `${percentage}%`.padEnd(15) + 
            count
        );
    });
    
    console.log('='.repeat(50));
}

if (require.main === module) {
    demoWithoutDatabase();
}

module.exports = demoWithoutDatabase;
