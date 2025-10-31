const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'postgres', // Connect to default database first
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        console.log('Setting up database...');

        // Create database if it doesn't exist
        const client = await pool.connect();
        
        try {
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database '${process.env.DB_NAME}' created successfully`);
        } catch (error) {
            if (error.code === '42P04') {
                console.log(`Database '${process.env.DB_NAME}' already exists`);
            } else {
                throw error;
            }
        } finally {
            client.release();
        }

        await pool.end();

        // Connect to the actual database and create tables
        const appPool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        const appClient = await appPool.connect();

        try {
            await appClient.query(`
                CREATE TABLE IF NOT EXISTS public.users (
                    id serial4 NOT NULL PRIMARY KEY,
                    "name" varchar NOT NULL,
                    age int4 NOT NULL,
                    address jsonb NULL,
                    additional_info jsonb NULL,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            console.log('Users table created successfully');

            // Create indexes for better performance
            await appClient.query(`
                CREATE INDEX IF NOT EXISTS idx_users_age ON public.users(age);
            `);
            
            console.log('Database indexes created successfully');

        } finally {
            appClient.release();
            await appPool.end();
        }

        console.log('Database setup completed successfully!');

    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
