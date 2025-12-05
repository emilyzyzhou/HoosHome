import mysql from "mysql2/promise";

console.log('DB CONFIG AT RUNTIME:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  passLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
  passPreview: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.slice(0, 3) : null,
});

export const pool = mysql.createPool({
  host: process.env.DB_HOST,                      // Cloud SQL IP in Cloud Run
  port: Number(process.env.DB_PORT || 3306),
  host: process.env.DB_HOST,                      // Cloud SQL IP in Cloud Run
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  namedPlaceholders: true,
  namedPlaceholders: true,
});

async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection(); 
    console.log("Successfully connected to the database.");
    connection.release(); 
  } catch (e) {
    console.error("Error connecting to database: ", e);
  }
}

checkDatabaseConnection();
