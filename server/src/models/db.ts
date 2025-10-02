import mongoose from "mongoose";
const Schema = mongoose.Schema;
import dotenv from "dotenv";
dotenv.config();

const admin = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    storename:{ type: String, required: true},
    language:{ type: String, default: 'english'},
    storeaddress:{ type: String, required: true},
    storelogo:{ type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    storeID: { type: String, required: true, unique: true }
});

const products = new Schema({
    productID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    totalPurchases: {type: Number, default: 0 },
    outofstock: { type: Boolean, default: false }
}); 

const orders = new Schema({
    orderId: { type: String, required: true, unique: true },
    products: [
        {
            productID: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: 'COD' }, // Cash on delivery / card / UPI
    paymentStatus: { type: String, default: 'pending' }, // pending / completed / failed
    orderStatus: { type: Number, default: 1 }, // e.g., 1: Pending, 2: Shipped, 3: Delivered
    orderDate: { type: Date, default: Date.now },
    deliveredDate: { type: Date }
});

const customers = new Schema({
    name: String,
    email: String,
    phone: String,
    addresses: [String],
    totalOrders: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});


