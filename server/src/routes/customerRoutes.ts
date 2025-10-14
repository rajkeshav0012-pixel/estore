import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import db from '../models/db.js';
import { generateToken } from '../middleware/auth.js';
import { 
    generateOrderID, 
    generateCustomerID,
    formatSuccessResponse, 
    formatErrorResponse,
    paginate,
    buildSearchQuery,
    calculateOrderTotal,
    calculateEstimatedDelivery,
    isValidPhoneNumber,
    isValidEmail
} from '../utils/helpers.js';

const { productModel, orderModel, customerModel, categoryModel } = db;

const router = express.Router();
router.use(express.json());

// ============= AUTHENTICATION ROUTES =============

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, address } = req.body;
        
        // Validation
        if (!name || !phone || !password) {
            return res.status(400).json(formatErrorResponse('Name, phone, and password are required'));
        }

        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json(formatErrorResponse('Invalid phone number'));
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json(formatErrorResponse('Invalid email address'));
        }

        // Check if customer already exists
        const existingCustomer = await customerModel.findOne({ 
            $or: [{ phone }, ...(email ? [{ email }] : [])]
        });
        
        if (existingCustomer) {
            return res.status(400).json(formatErrorResponse('Customer with this phone or email already exists'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const customerID = generateCustomerID();
        
        const customerData: any = {
            customerID,
            name,
            phone,
            password: hashedPassword,
            totalOrders: 0,
            totalSpent: 0
        };

        if (email) customerData.email = email;
        if (address) {
            customerData.addresses = [{
                type: 'home',
                address,
                isDefault: true
            }];
        }

        const customer = await customerModel.create(customerData);

        const token = generateToken({ 
            id: customer._id, 
            customerID: customer.customerID, 
            phone: customer.phone 
        });

        res.status(201).json(formatSuccessResponse('Customer registered successfully', { 
            customerID: customer.customerID, 
            token,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            }
        }));
    } catch (error: any) {
        console.error('Customer signup error:', error);
        res.status(500).json(formatErrorResponse('Registration failed', error.message));
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;
        
        if (!phone || !password) {
            return res.status(400).json(formatErrorResponse('Phone and password are required'));
        }

        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json(formatErrorResponse('Invalid phone number'));
        }

        const customer = await customerModel.findOne({ phone, isActive: true });
        if (!customer || !customer.password) {
            return res.status(400).json(formatErrorResponse('Invalid phone or password'));
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(400).json(formatErrorResponse('Invalid phone or password'));
        }

        const token = generateToken({ 
            id: customer._id, 
            customerID: customer.customerID, 
            phone: customer.phone 
        });

        res.status(200).json(formatSuccessResponse('Sign in successful', { 
            customerID: customer.customerID, 
            token,
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                totalOrders: customer.totalOrders,
                totalSpent: customer.totalSpent
            }
        }));
    } catch (error: any) {
        console.error('Customer signin error:', error);
        res.status(500).json(formatErrorResponse('Sign in failed', error.message));
    }
});

// ============= PRODUCT BROWSING ROUTES =============

router.get('/products', async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 12, search, category, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice } = req.query;
        
        const { skip, limit: limitNum } = paginate(Number(page), Number(limit));
        
        let query: any = { isActive: true, outofstock: false };
        
        if (search) {
            query = { ...query, ...buildSearchQuery(search as string, ['name', 'description', 'category', 'tags']) };
        }
        
        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sortOptions: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [products, total] = await Promise.all([
            productModel.find(query)
                .select('productID name description category price images rating totalPurchases stock tags')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            productModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json(formatSuccessResponse('Products retrieved successfully', {
            products,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts: total,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        }));
    } catch (error: any) {
        console.error('Get products error:', error);
        res.status(500).json(formatErrorResponse('Failed to get products', error.message));
    }
});

router.get('/products/:productID', async (req: Request, res: Response) => {
    try {
        const { productID } = req.params;
        
        const product = await productModel.findOne({ 
            productID, 
            isActive: true 
        }).select('-costPrice'); // Hide cost price from customers

        if (!product) {
            return res.status(404).json(formatErrorResponse('Product not found'));
        }

        // Get related products from same category
        const relatedProducts = await productModel.find({
            category: product.category,
            productID: { $ne: productID },
            isActive: true,
            outofstock: false
        })
        .select('productID name price images rating')
        .limit(4);

        res.json(formatSuccessResponse('Product retrieved successfully', {
            product,
            relatedProducts
        }));
    } catch (error: any) {
        console.error('Get product error:', error);
        res.status(500).json(formatErrorResponse('Failed to get product', error.message));
    }
});

router.get('/categories', async (req: Request, res: Response) => {
    try {
        const categories = await categoryModel.find({ isActive: true })
            .select('categoryID name description image')
            .sort({ name: 1 });

        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await productModel.countDocuments({
                    category: category.name,
                    isActive: true,
                    outofstock: false
                });
                return {
                    ...category.toObject(),
                    productCount
                };
            })
        );

        res.json(formatSuccessResponse('Categories retrieved successfully', categoriesWithCount));
    } catch (error: any) {
        console.error('Get categories error:', error);
        res.status(500).json(formatErrorResponse('Failed to get categories', error.message));
    }
});

// ============= ORDER PLACEMENT ROUTES =============

router.post('/orders', async (req: Request, res: Response) => {
    try {
        const { 
            products, 
            customerName, 
            customerEmail, 
            customerPhone, 
            shippingAddress,
            billingAddress,
            paymentMethod = 'COD',
            notes
        } = req.body;

        // Validation
        if (!customerName || !customerPhone || !shippingAddress || !products || products.length === 0) {
            return res.status(400).json(formatErrorResponse('Missing required fields'));
        }

        if (!isValidPhoneNumber(customerPhone)) {
            return res.status(400).json(formatErrorResponse('Invalid phone number'));
        }

        if (customerEmail && !isValidEmail(customerEmail)) {
            return res.status(400).json(formatErrorResponse('Invalid email address'));
        }

        // Validate products and calculate totals
        const orderProducts = [];
        let totalAmount = 0;

        for (const item of products) {
            const product = await productModel.findOne({ 
                productID: item.productID, 
                isActive: true 
            });

            if (!product) {
                return res.status(400).json(formatErrorResponse(`Product ${item.productID} not found`));
            }

            if (product.outofstock || product.stock < item.quantity) {
                return res.status(400).json(formatErrorResponse(`Insufficient stock for ${product.name}`));
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderProducts.push({
                productID: product.productID,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal
            });

            // Update product stock and purchases
            await productModel.findOneAndUpdate(
                { productID: product.productID },
                {
                    $inc: { 
                        stock: -item.quantity,
                        totalPurchases: item.quantity
                    },
                    $set: {
                        outofstock: product.stock - item.quantity <= 0
                    }
                }
            );
        }

        const orderId = generateOrderID();
        
        // Create or update customer
        let customer = await customerModel.findOne({ phone: customerPhone });
        if (!customer) {
            const customerID = generateCustomerID();
            customer = await customerModel.create({
                customerID,
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                addresses: [{
                    type: 'home',
                    address: shippingAddress,
                    isDefault: true
                }],
                totalOrders: 1,
                totalSpent: totalAmount,
                lastOrderDate: new Date()
            });
        } else {
            await customerModel.findOneAndUpdate(
                { phone: customerPhone },
                {
                    $inc: { totalOrders: 1, totalSpent: totalAmount },
                    $set: { lastOrderDate: new Date() }
                }
            );
        }

        // Create order
        const order = await orderModel.create({
            orderId,
            products: orderProducts,
            totalAmount,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            notes,
            estimatedDeliveryDate: calculateEstimatedDelivery(new Date()),
            trackingHistory: [{
                status: 'pending',
                description: 'Order received and being processed',
                timestamp: new Date()
            }]
        });

        res.status(201).json(formatSuccessResponse('Order placed successfully', {
            orderId: order.orderId,
            totalAmount: order.totalAmount,
            estimatedDelivery: order.estimatedDeliveryDate
        }));
    } catch (error: any) {
        console.error('Place order error:', error);
        res.status(500).json(formatErrorResponse('Failed to place order', error.message));
    }
});

// ============= ORDER TRACKING ROUTES =============

router.get('/orders/:orderId/track', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderModel.findOne({ orderId })
            .select('orderId orderStatus trackingNumber trackingHistory estimatedDeliveryDate orderDate shippedDate deliveredDate customerName totalAmount');

        if (!order) {
            return res.status(404).json(formatErrorResponse('Order not found'));
        }

        res.json(formatSuccessResponse('Order tracking retrieved successfully', order));
    } catch (error: any) {
        console.error('Track order error:', error);
        res.status(500).json(formatErrorResponse('Failed to track order', error.message));
    }
});

// ============= CUSTOMER ORDER HISTORY ROUTES =============

router.get('/customers/:phone/orders', async (req: Request, res: Response) => {
    try {
        const { phone } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        if (!phone || !isValidPhoneNumber(phone)) {
            return res.status(400).json(formatErrorResponse('Invalid phone number'));
        }

        const { skip, limit: limitNum } = paginate(Number(page), Number(limit));
        
        let query: any = { customerPhone: phone };
        
        if (status) {
            query.orderStatus = status;
        }

        const [orders, total, customer] = await Promise.all([
            orderModel.find(query)
                .sort({ orderDate: -1 })
                .skip(skip)
                .limit(limitNum),
            orderModel.countDocuments(query),
            customerModel.findOne({ phone })
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json(formatSuccessResponse('Order history retrieved successfully', {
            customer: customer ? {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                totalOrders: customer.totalOrders,
                totalSpent: customer.totalSpent
            } : null,
            orders,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalOrders: total,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        }));
    } catch (error: any) {
        console.error('Get order history error:', error);
        res.status(500).json(formatErrorResponse('Failed to get order history', error.message));
    }
});

router.get('/customers/:phone/orders/:orderId', async (req: Request, res: Response) => {
    try {
        const { phone, orderId } = req.params;

        if (!phone || !isValidPhoneNumber(phone)) {
            return res.status(400).json(formatErrorResponse('Invalid phone number'));
        }

        const order = await orderModel.findOne({ 
            orderId, 
            customerPhone: phone 
        });

        if (!order) {
            return res.status(404).json(formatErrorResponse('Order not found'));
        }

        res.json(formatSuccessResponse('Order details retrieved successfully', order));
    } catch (error: any) {
        console.error('Get order details error:', error);
        res.status(500).json(formatErrorResponse('Failed to get order details', error.message));
    }
});

// ============= SEARCH AND FILTER ROUTES =============

router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, type = 'products' } = req.query;

        if (!q) {
            return res.status(400).json(formatErrorResponse('Search query is required'));
        }

        let results = [];

        if (type === 'products' || type === 'all') {
            const products = await productModel.find({
                ...buildSearchQuery(q as string, ['name', 'description', 'category', 'tags']),
                isActive: true,
                outofstock: false
            })
            .select('productID name description category price images rating')
            .limit(10);

            results.push({
                type: 'products',
                items: products
            });
        }

        if (type === 'categories' || type === 'all') {
            const categories = await categoryModel.find({
                ...buildSearchQuery(q as string, ['name', 'description']),
                isActive: true
            })
            .select('categoryID name description image')
            .limit(5);

            results.push({
                type: 'categories',
                items: categories
            });
        }

        res.json(formatSuccessResponse('Search results retrieved successfully', results));
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json(formatErrorResponse('Search failed', error.message));
    }
});

// ============= STORE INFO ROUTE =============

router.get('/store-info', async (req: Request, res: Response) => {
    try {
        // Get store info from admin collection (assuming single store)
        const admin = await db.adminModel.findOne({ isActive: true })
            .select('storename storeaddress storelogo language createdAt');

        if (!admin) {
            return res.status(404).json(formatErrorResponse('Store information not found'));
        }

        // Get additional store stats
        const [totalProducts, totalCategories] = await Promise.all([
            productModel.countDocuments({ isActive: true, outofstock: false }),
            categoryModel.countDocuments({ isActive: true })
        ]);

        const storeInfo = {
            name: admin.storename,
            address: admin.storeaddress,
            logo: admin.storelogo,
            language: admin.language,
            establishedDate: admin.createdAt,
            totalProducts,
            totalCategories
        };

        res.json(formatSuccessResponse('Store information retrieved successfully', storeInfo));
    } catch (error: any) {
        console.error('Get store info error:', error);
        res.status(500).json(formatErrorResponse('Failed to get store information', error.message));
    }
});

export default router;