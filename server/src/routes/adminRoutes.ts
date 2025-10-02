import express, { Router } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';
import db from '../models/db.js';
const { adminModel,
    productModel,
    orderModel,
    customerModel }  = db;
import mongoose from 'mongoose';
dotenv.config(); 
const router = express.Router();
router.use(express.json());
const APP_PORT = process.env.APP_PORT || 3000;

router.post('/signup', async(req: Request, res: Response) => {
    const { username, password, name, email, phone, storename, storeaddress, storelogo } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const storeID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await adminModel.create({
        username,
        password: hashedPassword,
        name,
        email,
        phone,
        storename,
        storeaddress,
        storelogo,
        storeID
    });
    res.status(201).send({ message: 'Admin registered successfully', storeID });
});
router.post('/signin', async(req: Request, res: Response) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await adminModel.findOne({ username });
    if (!admin) {
        return res.status(400).send({ message: 'Invalid username or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid username or password' });
    }
    res.status(200).send({ message: 'Admin signed in successfully', storeID: admin.storeID });
});




export default router;