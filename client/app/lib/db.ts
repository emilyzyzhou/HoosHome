import mysql from 'mysql2/promise'
// server here
// I'm making it work with my local one bc I can't access our shared one
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'roommateApp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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

export default pool;