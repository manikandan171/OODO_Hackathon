const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSeed() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3307,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '1234',
      multipleStatements: true
    });

    // Create DB if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'transitops'}\``);
    await connection.query(`USE \`${process.env.MYSQL_DATABASE || 'transitops'}\``);

    const schemaPath = path.join(__dirname, 'server', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Seeding database...");
    await connection.query(sql);
    console.log("Database seeded successfully!");
    
    await connection.end();
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}

runSeed();
