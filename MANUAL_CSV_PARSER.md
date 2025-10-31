# Manual CSV Parser Implementation

## Overview

This project implements a **manual CSV parser** instead of using the `csv-parser` NPM package. The manual implementation provides better control over parsing logic and handles edge cases like quoted fields, escaped quotes, and commas within quoted values.

## Key Features of Manual Parser

### 1. Custom CSV Row Parsing
- Handles quoted fields containing commas
- Processes escaped quotes (double quotes within quoted fields)
- Maintains field integrity with special characters
- Robust error handling for malformed rows

### 2. No External Dependencies
- Zero dependency on CSV parsing libraries
- Pure Node.js implementation using only built-in modules
- Better security and reduced package vulnerabilities
- Smaller bundle size

### 3. Advanced Edge Case Handling
- Empty fields and rows
- Mixed quoted and unquoted fields
- Special characters in field values
- Variable column counts with validation

## Implementation Details

### Core Parser Method: `parseCSVRow(row)`

```javascript
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
```

### Full CSV Content Parsing: `parseCSVContent(csvContent)`

```javascript
parseCSVContent(csvContent) {
    const lines = csvContent.split(/\r?\n/);
    const result = [];
    
    // Parse header row
    const headers = this.parseCSVRow(lines[0]);
    
    // Parse data rows with validation
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') continue; // Skip empty lines
        
        const values = this.parseCSVRow(line);
        
        // Validate column count
        if (values.length !== headers.length) {
            console.warn(`Row ${i + 1}: Column count mismatch`);
            continue;
        }

        // Create object from headers and values
        const rowObject = {};
        for (let j = 0; j < headers.length; j++) {
            rowObject[headers[j]] = values[j];
        }
        
        result.push(rowObject);
    }
    
    return result;
}
```

## Supported CSV Formats

### 1. Basic CSV
```csv
name.firstName,name.lastName,age
John,Doe,25
Jane,Smith,30
```

### 2. CSV with Quoted Fields
```csv
name.firstName,name.lastName,age,description
John,Doe,25,"Software engineer"
Jane,"Smith-Jones",30,"Marketing specialist, very creative"
```

### 3. CSV with Escaped Quotes
```csv
name.firstName,name.lastName,age,description
John,Doe,25,"He said ""Hello World"""
Jane,Smith,30,"Expert in ""data analysis"" and reporting"
```

### 4. CSV with Special Characters
```csv
name.firstName,name.lastName,age,address
Michael,"O'Connor",45,"123 Main St, Apt ""A"""
José,García,32,"Calle de la Paz, #15"
```

## Testing the Manual Parser

### 1. Run Basic Tests
```bash
npm run test-csv
npm run test-manual-parser
```

### 2. Test with Demo Data
```bash
npm run demo
```

### 3. Test API Integration
```bash
# Start server
npm run dev

# Test with PowerShell
Invoke-RestMethod -Uri "http://localhost:3001"
```

## Comparison: Manual vs NPM Package

| Feature | Manual Parser | csv-parser NPM |
|---------|---------------|----------------|
| Dependencies | 0 | 1+ packages |
| Bundle Size | Minimal | Larger |
| Security | No external vulnerabilities | Depends on package security |
| Customization | Full control | Limited |
| Performance | Optimized for our use case | General purpose |
| Error Handling | Custom logic | Package-dependent |

## Performance Characteristics

### Memory Usage
- Reads entire file into memory (suitable for files up to 50MB)
- No streaming for simplicity and better error handling
- Efficient string parsing with minimal object creation

### Speed
- Single-pass parsing algorithm
- Optimized for dot-notation field conversion
- Fast validation of required fields

### Error Recovery
- Continues parsing after encountering malformed rows
- Detailed error reporting with row numbers
- Graceful handling of inconsistent column counts

## Example Usage

```javascript
const csvService = require('./src/services/csvService');

// Parse CSV file
const jsonData = await csvService.parseCSVToJSON('data.csv');

// Transform for database storage
const dbRecords = jsonData.map(record => 
    csvService.extractFieldsForDB(record)
);

// Handle nested properties
const nestedObject = csvService.transformFlatToNested({
    'name.firstName': 'John',
    'name.lastName': 'Doe',
    'address.city': 'New York'
});
// Result: { name: { firstName: 'John', lastName: 'Doe' }, address: { city: 'New York' } }
```

## Error Handling

### 1. File-Level Errors
- File not found
- Permission denied
- Invalid file format

### 2. Row-Level Errors
- Missing required fields
- Malformed CSV structure
- Column count mismatches

### 3. Field-Level Errors
- Invalid data types
- Empty required fields
- Encoding issues

## Production Considerations

### 1. File Size Limits
- Current limit: 50MB
- Configurable via environment variables
- Consider streaming for larger files

### 2. Memory Management
- Synchronous file reading for reliability
- Garbage collection friendly implementation
- No memory leaks in parsing loop

### 3. Scalability
- Single-threaded parsing (Node.js standard)
- Can be extended with worker threads for very large files
- Database insertion uses connection pooling

## Future Enhancements

1. **Streaming Support**: For files larger than 50MB
2. **Custom Delimiters**: Support for semicolon, tab-separated values
3. **Encoding Detection**: Automatic UTF-8, UTF-16 detection
4. **Schema Validation**: JSON Schema validation for parsed data
5. **Performance Metrics**: Parsing time and memory usage tracking
