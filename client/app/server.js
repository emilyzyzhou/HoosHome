import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';


const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'roommateApp'
});


db.connect(e => {
   if (e) {
       console.error('Error: ', e);
       return;
   }
   console.log('Connected');
})