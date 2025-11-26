const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log('Database connection failed: ' + err.message);
        console.log('Make sure MySQL is running and credentials are correct');
    } else {
        console.log('Connected to MySQL database: ' + process.env.DB_NAME);
    }
});

//Test database route
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json({ 
            message: 'Database connection successful!',
            result: results[0].solution 
        });
    });
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'EDU Track Server is running!',
        database: process.env.DB_NAME
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
});