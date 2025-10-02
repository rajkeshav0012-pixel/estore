import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eStore';
const APP_PORT = process.env.APP_PORT || 3000;

const app = express();

app.use('/admin', adminRoutes);
mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to mongoDB');
    app.listen(APP_PORT, () => {
        console.log(`Server is running on port ${APP_PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to mongoDB', err);
}).finally(() => {
    console.log('MongoDB connection attempt finished');
});