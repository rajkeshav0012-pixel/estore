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

router.post('/addproduct', async(req: Request, res: Response) => {
    const { productID, name, description, price, image } = req.body;
    await productModel.create({
        productID,
        name,
        description,
        price,
        image
    });
    res.status(201).send({ message: 'Product added successfully' });
});

router.post('/placeorder', async(req: Request, res: Response) => {
    const { products, customerName, customerEmail, customerPhone, shippingAddress } = req.body;
    const orderId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let totalAmount = 0;
    async function calculateTotal() {
        for (const item of products) {
            const product = await productModel.findOne({ productID: item.productID });
            if (product) {
                totalAmount += product.price * item.quantity;
                // Increment totalPurchases
                product.totalPurchases += item.quantity;
                await product.save();
            }
        }
    }
    await calculateTotal();
    await orderModel.create({
        orderId,
        products,
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress
    });
    console.log('Order placed:', orderId, 'Total Amount:', totalAmount);
    res.status(201).send({ message: 'Order placed successfully', orderId, totalAmount });
});

router.put('/updateorder', async (req: Request, res: Response) => {
    try {
        const { orderID, status } = req.body;
        if (!orderID || !status) {
            return res.status(400).json({ message: "orderID and status are required" });
        }
        const updatedOrder = await orderModel.findOneAndUpdate(
            { orderId: orderID }, 
            { $set: { orderStatus: status } }, 
            { new: true } // return updated document
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({
            message: "Order updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});
router.put('/updateproduct', async (req: Request, res: Response) => {
    try {
        const { productID, ...updateFields } = req.body;
        if (!productID) {
            return res.status(400).json({ message: "productID is required" });
        }
        const updatedProduct = await productModel.findOneAndUpdate(
            { productID: productID },
            { $set: updateFields },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (err) {
        console.error("Server Error", err);
        res.status(500).json({ message: "Server Error", err });
    }
});



export default router;