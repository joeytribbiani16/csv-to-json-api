*CSV to JSON Converter (Node.js + PostgreSQL)*

This project is a simple backend app made with Node.js and Express.
It converts CSV files into JSON, saves the data into a PostgreSQL database, and prints an age-wise report.

*What this project does*

1.Reads a CSV file and converts it to JSON (without using any CSV packages)

2.Handles commas, quotes, and nested fields like address.city

3.Saves data into a PostgreSQL table

4.Calculates and displays an age distribution report

5.Can run even without a database (demo mode)

*Steps to Run the Project*

1. Install Requirements

Make sure these are installed on your system:

Node.js (version 14 or above)

PostgreSQL (installed and running)

2. Clone this repository

Open a terminal and run:

git clone <repository-url>
cd csv-to-json-api

3. Install dependencies
npm install

4. Set up environment variables

There is a file named .env.example in this project.
Copy it and create your own .env file:

cp .env.example .env


Then open the .env file and update this line with your PostgreSQL password:

DB_PASSWORD=your_postgres_password

5. Create the database

Open PostgreSQL or pgAdmin and create a new database:

CREATE DATABASE csv_converter;

6. Set up the database table

Run this command to create the required table:

npm run setup-db

7. Start the server

To start the project in development mode:

npm run dev


If it runs successfully, the server will start at:

http://localhost:3001

*How to Use*

Upload a CSV file

You can test the API using Postman, Thunder Client, or curl.

Example using curl:

curl -X POST -F "csvFile=@sample-data/users.csv" http://localhost:3001/api/upload-csv


This will:

Convert the CSV to JSON

Save it into the PostgreSQL database

Show an age distribution report in the console

Get the Age Report

To fetch the report again later:

curl http://localhost:3001/api/age-report

*Example Output*
==================================================
AGE DISTRIBUTION REPORT
==================================================
Total Users: 10
--------------------------------------------------
Age-Group      % Distribution Count
--------------------------------------------------
< 20           10.0%          1
20 to 40       40.0%          4
40 to 60       30.0%          3
> 60           20.0%          2
==================================================

*Demo Mode (without Database)*

If you just want to test CSV → JSON conversion (no PostgreSQL needed):

npm run demo



*Useful Commands to run the project*

npm run setup-db	Creates the database table
npm run dev	Starts the server
npm run demo	Runs without a database
npm run test-csv	Tests the CSV parsing logic


*Notes*

Make sure PostgreSQL is running before you start the server.

Keep your .env file private — it should not be uploaded to GitHub.

Use .env.example as a reference for environment setup.

This project has no GUI — it works through API calls.

The CSV parsing is done manually using a custom parser (no external CSV libraries).



Made with ❤️ using Node.js and a lot of debugging :)