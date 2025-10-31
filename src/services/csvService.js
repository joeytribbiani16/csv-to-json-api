const fs = require('fs');

class CSVService {
    /**
     * Manual CSV parser that handles quotes, escapes, and edge cases
     * @param {string} csvContent - Raw CSV content as string
     * @returns {Array} Array of objects representing CSV rows
     */
    parseCSVContent(csvContent) {
        const lines = csvContent.split(/\r?\n/);
        const result = [];
        
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse header row
        const headers = this.parseCSVRow(lines[0]);
        
        if (headers.length === 0) {
            throw new Error('CSV file has no headers');
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') {
                continue;
            }

            try {
                const values = this.parseCSVRow(line);
                
                // Skip rows that don't have the expected number of columns
                if (values.length !== headers.length) {
                    console.warn(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}. Skipping row.`);
                    continue;
                }

                // Create object from headers and values
                const rowObject = {};
                for (let j = 0; j < headers.length; j++) {
                    rowObject[headers[j]] = values[j];
                }

                result.push(rowObject);
            } catch (error) {
                console.warn(`Row ${i + 1}: ${error.message}. Skipping row.`);
            }
        }

        return result;
    }

    /**
     * Parse a single CSV row handling quotes and commas within quoted fields
     * @param {string} row - Single CSV row as string
     * @returns {Array} Array of field values
     */
    parseCSVRow(row) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < row.length) {
            const char = row[i];
            const nextChar = row[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote (double quote within quoted field)
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // Field separator outside of quotes
                result.push(current.trim());
                current = '';
                i++;
            } else {
                // Regular character
                current += char;
                i++;
            }
        }

        // Add the last field
        result.push(current.trim());

        return result;
    }

    /**
     * Parse CSV file to JSON with nested object structure
     * @param {string} filePath - Path to the CSV file
     * @returns {Promise<Array>} Array of parsed objects
     */
    async parseCSVToJSON(filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Read file content
                const csvContent = fs.readFileSync(filePath, 'utf8');
                
                // Parse CSV content manually
                const parsedData = this.parseCSVContent(csvContent);
                
                if (parsedData.length === 0) {
                    reject(new Error('No valid data rows found in CSV file'));
                    return;
                }

                // Validate required fields
                const requiredFields = ['name.firstName', 'name.lastName', 'age'];
                const results = [];

                for (let i = 0; i < parsedData.length; i++) {
                    const row = parsedData[i];
                    
                    try {
                        // Check for required fields
                        const missingFields = requiredFields.filter(field => !row.hasOwnProperty(field) || row[field] === '');
                        if (missingFields.length > 0) {
                            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                        }

                        // Transform flat object to nested structure
                        const transformedObject = this.transformFlatToNested(row);
                        results.push(transformedObject);
                        
                    } catch (error) {
                        console.warn(`Row ${i + 2}: ${error.message}. Skipping row.`);
                    }
                }

                if (results.length === 0) {
                    reject(new Error('No valid data found in CSV file after validation'));
                } else {
                    console.log(`Successfully parsed ${results.length} records from CSV`);
                    resolve(results);
                }

            } catch (error) {
                if (error.code === 'ENOENT') {
                    reject(new Error(`CSV file not found: ${filePath}`));
                } else {
                    reject(new Error(`Error reading CSV file: ${error.message}`));
                }
            }
        });
    }

    /**
     * Transform flat object with dot notation to nested object
     * @param {Object} flatObject - Flat object with dot notation keys
     * @returns {Object} Nested object
     */
    transformFlatToNested(flatObject) {
        const nested = {};

        for (const [key, value] of Object.entries(flatObject)) {
            this.setNestedProperty(nested, key, value);
        }

        return nested;
    }

    /**
     * Set nested property using dot notation
     * @param {Object} obj - Target object
     * @param {string} path - Dot notation path
     * @param {any} value - Value to set
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
                current[key] = {};
            }
            current = current[key];
        }

        const finalKey = keys[keys.length - 1];
        // Convert numeric strings to numbers for age and similar fields
        if (finalKey === 'age' || (!isNaN(value) && value.trim() !== '')) {
            current[finalKey] = Number(value);
        } else {
            current[finalKey] = value;
        }
    }

    /**
     * Extract mandatory fields and additional info from nested object
     * @param {Object} nestedObject - Nested object from CSV
     * @returns {Object} Object with separated mandatory and additional fields
     */
    extractFieldsForDB(nestedObject) {
        const { name, age, address, ...additionalInfo } = nestedObject;

        if (!name || !name.firstName || !name.lastName || age === undefined) {
            throw new Error('Missing required fields: name.firstName, name.lastName, or age');
        }

        return {
            name: `${name.firstName} ${name.lastName}`,
            age: age,
            address: address || null,
            additional_info: Object.keys(additionalInfo).length > 0 ? additionalInfo : null
        };
    }
}

module.exports = new CSVService();
