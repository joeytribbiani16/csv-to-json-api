const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const csvService = require('./services/csvService');
const dbService = require('./services/dbService');
const ageReportService = require('./services/ageReportService');

// Helper function to generate age report from parsed data (when database is not available)
function generateAgeReportFromData(jsonData) {
    const totalUsers = jsonData.length;
    
    if (totalUsers === 0) {
        return { totalUsers: 0, distribution: {} };
    }
    
    const ageGroups = {
        under_20: 0,
        age_20_to_40: 0,
        age_40_to_60: 0,
        over_60: 0
    };
    
    jsonData.forEach(record => {
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
    
    const distribution = {
        '< 20': {
            count: ageGroups.under_20,
            percentage: Math.round((ageGroups.under_20 / totalUsers) * 100 * 10) / 10
        },
        '20 to 40': {
            count: ageGroups.age_20_to_40,
            percentage: Math.round((ageGroups.age_20_to_40 / totalUsers) * 100 * 10) / 10
        },
        '40 to 60': {
            count: ageGroups.age_40_to_60,
            percentage: Math.round((ageGroups.age_40_to_60 / totalUsers) * 100 * 10) / 10
        },
        '> 60': {
            count: ageGroups.over_60,
            percentage: Math.round((ageGroups.over_60 / totalUsers) * 100 * 10) / 10
        }
    };
    
    // Print report to console
    console.log('\n' + '='.repeat(50));
    console.log('AGE DISTRIBUTION REPORT (From Parsed Data)');
    console.log('='.repeat(50));
    console.log(`Total Users: ${totalUsers}`);
    console.log('-'.repeat(50));
    console.log('Age-Group'.padEnd(15) + '% Distribution'.padEnd(15) + 'Count');
    console.log('-'.repeat(50));
    
    Object.entries(distribution).forEach(([ageGroup, data]) => {
        console.log(
            ageGroup.padEnd(15) + 
            `${data.percentage}%`.padEnd(15) + 
            data.count
        );
    });
    
    console.log('='.repeat(50) + '\n');
    
    return { totalUsers, distribution };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = process.env.CSV_UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'CSV to JSON Converter API',
        endpoints: {
            upload: 'POST /api/upload-csv',
            report: 'GET /api/age-report'
        }
    });
});

app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        const filePath = req.file.path;
        
        // Parse CSV to JSON
        console.log('Parsing CSV file...');
        const jsonData = await csvService.parseCSVToJSON(filePath);
        console.log(`Successfully parsed ${jsonData.length} records`);
        
        let ageReport = null;
        let recordsInserted = 0;
        
        try {
            // Try to insert data into database
            console.log(`Inserting ${jsonData.length} records into database...`);
            await dbService.insertUsers(jsonData);
            recordsInserted = jsonData.length;
            console.log('Records inserted successfully');
            
            // Generate age report
            console.log('Generating age distribution report...');
            ageReport = await ageReportService.generateAgeReport();
            
        } catch (dbError) {
            console.warn('WARNING: Database operation failed:', dbError.message);
            console.log('Continuing with CSV parsing results only...');
            
            // Generate age report from parsed data without database
            ageReport = generateAgeReportFromData(jsonData);
        }
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        const response = {
            message: 'CSV file processed successfully',
            recordsProcessed: jsonData.length,
            recordsInserted: recordsInserted,
            sampleData: jsonData.slice(0, 2), // Show first 2 records as sample
            ageDistribution: ageReport
        };
        
        if (recordsInserted === 0) {
            response.warning = 'Database not available - data was parsed but not stored';
        }
        
        res.json(response);

    } catch (error) {
        console.error('Error processing CSV:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Failed to process CSV file',
            details: error.message 
        });
    }
});

app.get('/api/age-report', async (req, res) => {
    try {
        const ageReport = await ageReportService.generateAgeReport();
        res.json({
            message: 'Age distribution report',
            ageDistribution: ageReport
        });
    } catch (error) {
        console.error('Error generating age report:', error);
        res.status(500).json({ 
            error: 'Failed to generate age report - database not available',
            details: error.message,
            suggestion: 'Upload a CSV file to see age distribution from parsed data'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at:`);
    console.log(`  - GET  ${`http://localhost:${PORT}`}`);
    console.log(`  - POST ${`http://localhost:${PORT}/api/upload-csv`}`);
    console.log(`  - GET  ${`http://localhost:${PORT}/api/age-report`}`);
    
    // Initialize database connection
    try {
        await dbService.initializeDatabase();
        console.log('Database connection established');
        console.log('Ready to process CSV files');
    } catch (error) {
        console.error('Failed to initialize database:', error.message);
        console.log('\n' + '='.repeat(60));
        console.log('DATABASE SETUP REQUIRED');
        console.log('='.repeat(60));
        console.log('To fix this issue:');
        console.log('1. Install PostgreSQL: https://www.postgresql.org/download/');
        console.log('2. Start PostgreSQL service');
        console.log('3. Update .env file with your database credentials');
        console.log('4. Run: npm run setup-db');
        console.log('5. Restart the server: npm run dev');
        console.log('='.repeat(60));
        console.log('\nServer is running but database features are disabled.');
        console.log('You can still test CSV parsing without database storage.');
    }
});

module.exports = app;
