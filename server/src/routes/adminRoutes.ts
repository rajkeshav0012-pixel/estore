import express, { Router } from 'express';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
dotenv.config(); 
const router = express.Router();
router.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eStore';
const APP_PORT = process.env.APP_PORT || 3000;

router.get('/signup', (req: Request, res: Response) => {
    res.send('Admin Signup Page');
})




export default router;