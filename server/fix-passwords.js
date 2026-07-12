import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1234",
    database: process.env.MYSQL_DATABASE || "transitops"
  });

  const hash = bcrypt.hashSync("password123", 10);
  console.log("Updating all users to have password 'password123'");

  await connection.query("UPDATE users SET passwordHash = ?", [hash]);

  console.log("Passwords updated successfully.");
  await connection.end();
}

fixPasswords().catch(console.error);
