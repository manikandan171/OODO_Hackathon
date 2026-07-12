import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function initDB() {
  console.log("Connecting to MySQL server to create database...");

  // Connect without a specific database to create it first
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3307"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  });

  try {
    const dbName = process.env.MYSQL_DATABASE || "transitops";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' verified/created successfully.`);

    // Switch to the newly created database
    await connection.changeUser({ database: dbName });

    console.log("Reading schema.sql...");
    const schemaPath = path.join(process.cwd(), "server", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf-8");

    // Split the schema into individual statements (since mysql2 doesn't support multiple statements in a single query by default without multipleStatements: true, but it's safer to run them sequentially)
    const statements = schemaSQL.split(";").filter(stmt => stmt.trim().length > 0);

    console.log(`Executing ${statements.length} SQL statements to create tables and seed data...`);
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log("Database initialized and seeded successfully! You can now use the application.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  } finally {
    await connection.end();
  }
}

initDB();
