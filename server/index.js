import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/db.js'

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDb();

// Middleware
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/', (req, res) => res.send('SkillLabz API Running'));


//https://chat.deepseek.com/share/1v9w6a1a1f8pnoy0o7

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
