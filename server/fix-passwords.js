import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3307"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1234",
    database: process.env.MYSQL_DATABASE || "transitops"
  });

  const hash = bcrypt.hashSync("password123", 10);
  console.log("Updating all users to have password 'password123'");

  await connection.query("UPDATE users SET password = ?", [hash]);

  console.log("Passwords fixed successfully.");
  await connection.end();
}

fixPasswords();
