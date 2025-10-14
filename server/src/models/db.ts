import mongoose from "mongoose";
import validator from "validator";
const Schema = mongoose.Schema;
import dotenv from "dotenv";
dotenv.config();

const admin = new Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: { 
        type: String, 
        required: [true, 'Phone is required'],
        validate: {
            validator: function(v: string) {
                return /\d{10}/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    storename: { 
        type: String, 
        required: [true, 'Store name is required'],
        trim: true
    },
    language: { 
        type: String, 
        default: 'english',
        enum: ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi']
    },
    storeaddress: { 
        type: String, 
        required: [true, 'Store address is required']
    },
    storelogo: { 
        type: String, 
        required: [true, 'Store logo is required']
    },
    createdAt: { type: Date, default: Date.now },
    storeID: { 
        type: String, 
        required: true, 
        unique: true 
    },
    isActive: { type: Boolean, default: true }
});

const products = new Schema({
    productID: { 
        type: String, 
        required: [true, 'Product ID is required'], 
        unique: true 
    },
    name: { 
        type: String, 
        required: [true, 'Product name is required'],
        trim: true
    },
    description: { 
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    price: { 
        type: Number, 
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    costPrice: {
        type: Number,
        min: [0, 'Cost price must be positive']
    },
    rating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5
    },
    images: [{ 
        type: String, 
        required: true 
    }],
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    minStockLevel: {
        type: Number,
        default: 10
    },
    totalPurchases: { type: Number, default: 0 },
    outofstock: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    weight: { type: Number }, // in grams
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}); 

const orders = new Schema({
    orderId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    products: [
        {
            productID: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
            subtotal: { type: Number, required: true }
        }
    ],
    totalAmount: { 
        type: Number, 
        required: true,
        min: [0, 'Total amount must be positive']
    },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    customerName: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerEmail: { 
        type: String,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    customerPhone: { 
        type: String, 
        required: [true, 'Customer phone is required'],
        validate: {
            validator: function(v: string) {
                return /\d{10}/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    shippingAddress: { 
        type: String, 
        required: [true, 'Shipping address is required']
    },
    billingAddress: { type: String },
    paymentMethod: { 
        type: String, 
        default: 'COD',
        enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet']
    },
    paymentStatus: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'completed', 'failed', 'refunded']
    },
    orderStatus: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
    },
    trackingNumber: { type: String },
    trackingHistory: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String
    }],
    orderDate: { type: Date, default: Date.now },
    confirmedDate: { type: Date },
    shippedDate: { type: Date },
    deliveredDate: { type: Date },
    estimatedDeliveryDate: { type: Date },
    notes: { type: String }
});

const customers = new Schema({
    customerID: { 
        type: String, 
        unique: true, 
        required: true 
    },
    name: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true
    },
    email: { 
        type: String,
        unique: true,
        sparse: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: { 
        type: String, 
        required: [true, 'Phone is required'],
        unique: true,
        validate: {
            validator: function(v: string) {
                return /\d{10}/.test(v);
            },
            message: 'Phone number must be 10 digits'
        }
    },
    password: { 
        type: String,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    addresses: [{
        type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
        address: { type: String, required: true },
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false }
    }],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const categories = new Schema({
    categoryID: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: [true, 'Category name is required'],
        trim: true
    },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const adminModel = mongoose.model('admin', admin);
const productModel = mongoose.model('products', products);
const orderModel = mongoose.model('orders', orders);
const customerModel = mongoose.model('customers', customers);
const categoryModel = mongoose.model('categories', categories);

export default { adminModel, productModel, orderModel, customerModel, categoryModel };

