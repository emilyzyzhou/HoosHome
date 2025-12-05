import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  socketPath: "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock", // <- XAMPP default on Mac
  //host: process.env.DB_HOST,
  //port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // waitForConnections: true,
  connectionLimit: 10,
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
