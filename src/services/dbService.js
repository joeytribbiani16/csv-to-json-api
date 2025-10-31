const { Pool } = require('pg');
const csvService = require('./csvService');

class DatabaseService {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }

    /**
     * Initialize database connection and create tables if they don't exist
     */
    async initializeDatabase() {
        try {
            const client = await this.pool.connect();
            
            // Create users table if it doesn't exist
            await client.query(`
                CREATE TABLE IF NOT EXISTS public.users (
                    id serial4 NOT NULL PRIMARY KEY,
                    "name" varchar NOT NULL,
                    age int4 NOT NULL,
                    address jsonb NULL,
                    additional_info jsonb NULL,
                    created_at timestamp DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('Database tables initialized successfully');
            client.release();
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    /**
     * Insert users data into the database
     * @param {Array} jsonData - Array of user objects from CSV
     */
    async insertUsers(jsonData) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            let successCount = 0;
            let errorCount = 0;

            for (const record of jsonData) {
                try {
                    const dbRecord = csvService.extractFieldsForDB(record);
                    
                    await client.query(
                        `INSERT INTO public.users (name, age, address, additional_info) 
                         VALUES ($1, $2, $3, $4)`,
                        [
                            dbRecord.name,
                            dbRecord.age,
                            dbRecord.address ? JSON.stringify(dbRecord.address) : null,
                            dbRecord.additional_info ? JSON.stringify(dbRecord.additional_info) : null
                        ]
                    );
                    successCount++;
                } catch (recordError) {
                    console.error(`Error inserting record:`, recordError.message);
                    errorCount++;
                    // Continue with other records instead of failing completely
                }
            }

            await client.query('COMMIT');
            console.log(`Database insertion completed: ${successCount} successful, ${errorCount} failed`);

            if (errorCount > 0) {
                console.warn(`Warning: ${errorCount} records failed to insert`);
            }

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database insertion error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get all users from the database
     * @returns {Array} Array of user records
     */
    async getAllUsers() {
        try {
            const result = await this.pool.query('SELECT * FROM public.users ORDER BY id');
            return result.rows;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Get age distribution data
     * @returns {Object} Age distribution statistics
     */
    async getAgeDistribution() {
        try {
            const result = await this.pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN age < 20 THEN 1 END) as under_20,
                    COUNT(CASE WHEN age >= 20 AND age < 40 THEN 1 END) as age_20_to_40,
                    COUNT(CASE WHEN age >= 40 AND age < 60 THEN 1 END) as age_40_to_60,
                    COUNT(CASE WHEN age >= 60 THEN 1 END) as over_60
                FROM public.users
            `);

            return result.rows[0];
        } catch (error) {
            console.error('Error fetching age distribution:', error);
            throw error;
        }
    }

    /**
     * Clear all users from the database (for testing purposes)
     */
    async clearUsers() {
        try {
            await this.pool.query('TRUNCATE TABLE public.users RESTART IDENTITY');
            console.log('Users table cleared');
        } catch (error) {
            console.error('Error clearing users:', error);
            throw error;
        }
    }

    /**
     * Close database connection pool
     */
    async close() {
        await this.pool.end();
    }
}

module.exports = new DatabaseService();
