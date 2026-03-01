import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/db.js'
import globalErrorHandler from './middleware/globalErrorHandler.js'
import AuthRouter from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDb();

// Middleware
app.use(cors());
app.use(express.json());

// =======================
// Routes
// =======================

app.use('/api/auth',AuthRouter);
// test route

app.get('/', (req, res) => res.send('SkillLabz API Running'));


// global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

// handle user kis type rental ya lister- no need as it will limit user
// handle verfication process- email done, 
// now handle admin verfication , plus  restrict to funct as well then auth done
// then add reviews
