import express, { Router } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import db from '../models/db.js';
import { authenticateAdmin, generateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { 
    generateStoreID, 
    generateProductID, 
    generateOrderID, 
    generateCategoryID,
    formatSuccessResponse, 
    formatErrorResponse,
    paginate,
    buildSearchQuery,
    calculateEstimatedDelivery,
    generateTrackingNumber,
    getOrderStatusDescription
} from '../utils/helpers.js';

const { adminModel, productModel, orderModel, customerModel, categoryModel } = db;
dotenv.config(); 

const router = express.Router();
router.use(express.json());

// ============= AUTHENTICATION ROUTES =============

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, password, name, email, phone, storename, storeaddress, storelogo } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingAdmin) {
            return res.status(400).json(formatErrorResponse('Admin with this username or email already exists'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const storeID = generateStoreID();
        
        const admin = await adminModel.create({
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

        const token = generateToken({ 
            id: admin._id, 
            storeID: admin.storeID, 
            username: admin.username 
        });

        res.status(201).json(formatSuccessResponse('Admin registered successfully', { 
            storeID: admin.storeID, 
            token,
            admin: {
                name: admin.name,
                email: admin.email,
                storename: admin.storename
            }
        }));
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json(formatErrorResponse('Registration failed', error.message));
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        const admin = await adminModel.findOne({ username, isActive: true });
        if (!admin) {
            return res.status(400).json(formatErrorResponse('Invalid username or password'));
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json(formatErrorResponse('Invalid username or password'));
        }

        const token = generateToken({ 
            id: admin._id, 
            storeID: admin.storeID, 
            username: admin.username 
        });

        res.status(200).json(formatSuccessResponse('Sign in successful', { 
            storeID: admin.storeID, 
            token,
            admin: {
                name: admin.name,
                email: admin.email,
                storename: admin.storename,
                storelogo: admin.storelogo
            }
        }));
    } catch (error: any) {
        console.error('Signin error:', error);
        res.status(500).json(formatErrorResponse('Sign in failed', error.message));
    }
});

// ============= DASHBOARD ROUTES =============

router.get('/dashboard', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Get stats
        const [
            totalProducts,
            totalOrders,
            totalCustomers,
            todayOrders,
            monthlyOrders,
            yearlyOrders,
            pendingOrders,
            lowStockProducts,
            totalRevenue,
            monthlyRevenue
        ] = await Promise.all([
            productModel.countDocuments({ isActive: true }),
            orderModel.countDocuments(),
            customerModel.countDocuments({ isActive: true }),
            orderModel.countDocuments({ orderDate: { $gte: startOfDay } }),
            orderModel.countDocuments({ orderDate: { $gte: startOfMonth } }),
            orderModel.countDocuments({ orderDate: { $gte: startOfYear } }),
            orderModel.countDocuments({ orderStatus: 'pending' }),
            productModel.countDocuments({ stock: { $lte: 10 }, isActive: true }),
            orderModel.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            orderModel.aggregate([
                { $match: { orderDate: { $gte: startOfMonth }, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        // Recent orders
        const recentOrders = await orderModel.find()
            .sort({ orderDate: -1 })
            .limit(5)
            .select('orderId customerName totalAmount orderStatus orderDate');

        // Top selling products
        const topProducts = await productModel.find({ isActive: true })
            .sort({ totalPurchases: -1 })
            .limit(5)
            .select('name totalPurchases price images');

        const dashboardData = {
            stats: {
                totalProducts,
                totalOrders,
                totalCustomers,
                todayOrders,
                monthlyOrders,
                yearlyOrders,
                pendingOrders,
                lowStockProducts,
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0
            },
            recentOrders,
            topProducts
        };

        res.json(formatSuccessResponse('Dashboard data retrieved successfully', dashboardData));
    } catch (error: any) {
        console.error('Dashboard error:', error);
        res.status(500).json(formatErrorResponse('Failed to get dashboard data', error.message));
    }
});

// ============= PRODUCT MANAGEMENT ROUTES =============

router.post('/products', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, category, price, costPrice, stock, images, weight, dimensions, tags, minStockLevel } = req.body;
        
        const productID = generateProductID();
        
        const product = await productModel.create({
            productID,
            name,
            description,
            category,
            price,
            costPrice,
            stock,
            images,
            weight,
            dimensions,
            tags,
            minStockLevel: minStockLevel || 10,
            outofstock: stock === 0
        });

        res.status(201).json(formatSuccessResponse('Product added successfully', product));
    } catch (error: any) {
        console.error('Add product error:', error);
        res.status(500).json(formatErrorResponse('Failed to add product', error.message));
    }
});

router.get('/products', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const { skip, limit: limitNum } = paginate(Number(page), Number(limit));
        
        let query: any = { isActive: true };
        
        if (search) {
            query = { ...query, ...buildSearchQuery(search as string, ['name', 'description', 'category']) };
        }
        
        if (category) {
            query.category = category;
        }

        const sortOptions: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [products, total] = await Promise.all([
            productModel.find(query)
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

router.get('/products/:productID', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { productID } = req.params;
        
        const product = await productModel.findOne({ productID, isActive: true });
        if (!product) {
            return res.status(404).json(formatErrorResponse('Product not found'));
        }

        res.json(formatSuccessResponse('Product retrieved successfully', product));
    } catch (error: any) {
        console.error('Get product error:', error);
        res.status(500).json(formatErrorResponse('Failed to get product', error.message));
    }
});

router.put('/products/:productID', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { productID } = req.params;
        const updateFields = { ...req.body, updatedAt: new Date() };
        
        // Update outofstock status if stock is being updated
        if ('stock' in updateFields) {
            updateFields.outofstock = updateFields.stock === 0;
        }

        const updatedProduct = await productModel.findOneAndUpdate(
            { productID, isActive: true },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json(formatErrorResponse('Product not found'));
        }

        res.json(formatSuccessResponse('Product updated successfully', updatedProduct));
    } catch (error: any) {
        console.error('Update product error:', error);
        res.status(500).json(formatErrorResponse('Failed to update product', error.message));
    }
});

router.delete('/products/:productID', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { productID } = req.params;
        
        const product = await productModel.findOneAndUpdate(
            { productID, isActive: true },
            { $set: { isActive: false } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json(formatErrorResponse('Product not found'));
        }

        res.json(formatSuccessResponse('Product deleted successfully'));
    } catch (error: any) {
        console.error('Delete product error:', error);
        res.status(500).json(formatErrorResponse('Failed to delete product', error.message));
    }
});

// ============= ORDER MANAGEMENT ROUTES =============

router.get('/orders', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10, status, search, sortBy = 'orderDate', sortOrder = 'desc' } = req.query;
        
        const { skip, limit: limitNum } = paginate(Number(page), Number(limit));
        
        let query: any = {};
        
        if (status) {
            query.orderStatus = status;
        }
        
        if (search) {
            query = { ...query, ...buildSearchQuery(search as string, ['orderId', 'customerName', 'customerPhone']) };
        }

        const sortOptions: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [orders, total] = await Promise.all([
            orderModel.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            orderModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json(formatSuccessResponse('Orders retrieved successfully', {
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
        console.error('Get orders error:', error);
        res.status(500).json(formatErrorResponse('Failed to get orders', error.message));
    }
});

router.get('/orders/:orderId', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderModel.findOne({ orderId });
        if (!order) {
            return res.status(404).json(formatErrorResponse('Order not found'));
        }

        res.json(formatSuccessResponse('Order retrieved successfully', order));
    } catch (error: any) {
        console.error('Get order error:', error);
        res.status(500).json(formatErrorResponse('Failed to get order', error.message));
    }
});

router.put('/orders/:orderId/status', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status, location, description } = req.body;
        
        if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
            return res.status(400).json(formatErrorResponse('Invalid order status'));
        }

        const updateFields: any = { 
            orderStatus: status,
            $push: {
                trackingHistory: {
                    status,
                    location: location || '',
                    description: description || getOrderStatusDescription(status),
                    timestamp: new Date()
                }
            }
        };

        // Set appropriate date fields based on status
        if (status === 'confirmed') updateFields.confirmedDate = new Date();
        if (status === 'shipped') {
            updateFields.shippedDate = new Date();
            updateFields.trackingNumber = generateTrackingNumber();
            updateFields.estimatedDeliveryDate = calculateEstimatedDelivery(new Date());
        }
        if (status === 'delivered') updateFields.deliveredDate = new Date();

        const updatedOrder = await orderModel.findOneAndUpdate(
            { orderId },
            updateFields,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json(formatErrorResponse('Order not found'));
        }

        res.json(formatSuccessResponse('Order status updated successfully', updatedOrder));
    } catch (error: any) {
        console.error('Update order status error:', error);
        res.status(500).json(formatErrorResponse('Failed to update order status', error.message));
    }
});

// ============= CUSTOMER MANAGEMENT ROUTES =============

router.get('/customers', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const { skip, limit: limitNum } = paginate(Number(page), Number(limit));
        
        let query: any = { isActive: true };
        
        if (search) {
            query = { ...query, ...buildSearchQuery(search as string, ['name', 'email', 'phone']) };
        }

        const sortOptions: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [customers, total] = await Promise.all([
            customerModel.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            customerModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json(formatSuccessResponse('Customers retrieved successfully', {
            customers,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalCustomers: total,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        }));
    } catch (error: any) {
        console.error('Get customers error:', error);
        res.status(500).json(formatErrorResponse('Failed to get customers', error.message));
    }
});

router.get('/customers/:customerID', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { customerID } = req.params;
        
        const [customer, customerOrders] = await Promise.all([
            customerModel.findOne({ customerID, isActive: true }),
            orderModel.find({ customerPhone: { $exists: true } })
                .sort({ orderDate: -1 })
                .limit(10)
        ]);

        if (!customer) {
            return res.status(404).json(formatErrorResponse('Customer not found'));
        }

        // Filter orders for this customer
        const orders = customerOrders.filter(order => 
            order.customerPhone === customer.phone || 
            order.customerEmail === customer.email
        );

        res.json(formatSuccessResponse('Customer retrieved successfully', {
            customer,
            recentOrders: orders
        }));
    } catch (error: any) {
        console.error('Get customer error:', error);
        res.status(500).json(formatErrorResponse('Failed to get customer', error.message));
    }
});

// ============= CATEGORY MANAGEMENT ROUTES =============

router.post('/categories', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, image } = req.body;
        
        const categoryID = generateCategoryID();
        
        const category = await categoryModel.create({
            categoryID,
            name,
            description,
            image
        });

        res.status(201).json(formatSuccessResponse('Category added successfully', category));
    } catch (error: any) {
        console.error('Add category error:', error);
        res.status(500).json(formatErrorResponse('Failed to add category', error.message));
    }
});

router.get('/categories', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const categories = await categoryModel.find({ isActive: true }).sort({ name: 1 });
        res.json(formatSuccessResponse('Categories retrieved successfully', categories));
    } catch (error: any) {
        console.error('Get categories error:', error);
        res.status(500).json(formatErrorResponse('Failed to get categories', error.message));
    }
});

// ============= STATISTICS ROUTES =============

router.get('/stats/financial', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Get comprehensive financial statistics
        const [
            totalRevenue,
            monthlyRevenue,
            yearlyRevenue,
            dailyRevenue,
            totalOrders,
            monthlyOrders,
            dailyOrders,
            topProductsByRevenue,
            revenueByMonth
        ] = await Promise.all([
            // Total revenue (all time)
            orderModel.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            // Monthly revenue
            orderModel.aggregate([
                { $match: { orderDate: { $gte: startOfMonth }, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            // Yearly revenue
            orderModel.aggregate([
                { $match: { orderDate: { $gte: startOfYear }, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            // Daily revenue
            orderModel.aggregate([
                { $match: { orderDate: { $gte: startOfToday }, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            // Order counts
            orderModel.countDocuments(),
            orderModel.countDocuments({ orderDate: { $gte: startOfMonth } }),
            orderModel.countDocuments({ orderDate: { $gte: startOfToday } }),
            // Top products by revenue
            orderModel.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $unwind: '$products' },
                { $group: {
                    _id: '$products.name',
                    revenue: { $sum: '$products.subtotal' },
                    quantity: { $sum: '$products.quantity' }
                }},
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ]),
            // Revenue by month (last 12 months)
            orderModel.aggregate([
                {
                    $match: {
                        orderDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) },
                        paymentStatus: 'completed'
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$orderDate' },
                            month: { $month: '$orderDate' }
                        },
                        revenue: { $sum: '$totalAmount' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        const stats = {
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            yearlyRevenue: yearlyRevenue[0]?.total || 0,
            dailyRevenue: dailyRevenue[0]?.total || 0,
            averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0,
            totalOrders,
            monthlyOrders,
            dailyOrders,
            topProducts: topProductsByRevenue.map(p => ({
                name: p._id,
                revenue: p.revenue,
                quantity: p.quantity
            })),
            revenueByMonth: revenueByMonth.map(r => ({
                month: `${r._id.month}/${r._id.year}`,
                revenue: r.revenue,
                orders: r.orders
            }))
        };

        res.json(formatSuccessResponse('Financial statistics retrieved successfully', stats));
    } catch (error: any) {
        console.error('Financial stats error:', error);
        res.status(500).json(formatErrorResponse('Failed to get financial statistics', error.message));
    }
});

router.get('/stats/overview', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Get business overview statistics
        const [
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalCustomers,
            activeCustomers,
            newCustomersToday,
            newCustomersMonth,
            totalCategories,
            avgOrderProcessingTime,
            customerRetentionRate,
            inventoryValue
        ] = await Promise.all([
            productModel.countDocuments(),
            productModel.countDocuments({ isActive: true }),
            productModel.countDocuments({ stock: { $lte: 10, $gt: 0 }, isActive: true }),
            productModel.countDocuments({ outofstock: true, isActive: true }),
            customerModel.countDocuments({ isActive: true }),
            customerModel.countDocuments({ 
                isActive: true, 
                lastOrderDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
            }),
            customerModel.countDocuments({ 
                createdAt: { $gte: startOfDay },
                isActive: true 
            }),
            customerModel.countDocuments({ 
                createdAt: { $gte: startOfMonth },
                isActive: true 
            }),
            categoryModel.countDocuments({ isActive: true }),
            // Calculate average order processing time
            orderModel.aggregate([
                {
                    $match: {
                        orderStatus: 'delivered',
                        confirmedDate: { $exists: true },
                        deliveredDate: { $exists: true }
                    }
                },
                {
                    $project: {
                        processingTime: {
                            $divide: [
                                { $subtract: ['$deliveredDate', '$confirmedDate'] },
                                1000 * 60 * 60 * 24 // Convert to days
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgTime: { $avg: '$processingTime' }
                    }
                }
            ]),
            // Calculate customer retention rate (customers with more than 1 order)
            customerModel.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'phone',
                        foreignField: 'customerPhone',
                        as: 'orders'
                    }
                },
                {
                    $project: {
                        orderCount: { $size: '$orders' },
                        isRetained: { $gt: [{ $size: '$orders' }, 1] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCustomers: { $sum: 1 },
                        retainedCustomers: { $sum: { $cond: ['$isRetained', 1, 0] } }
                    }
                },
                {
                    $project: {
                        retentionRate: {
                            $multiply: [
                                { $divide: ['$retainedCustomers', '$totalCustomers'] },
                                100
                            ]
                        }
                    }
                }
            ]),
            // Calculate total inventory value
            productModel.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $project: {
                        value: { $multiply: ['$price', '$stock'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$value' }
                    }
                }
            ])
        ]);

        const overviewStats = {
            products: {
                total: totalProducts,
                active: activeProducts,
                lowStock: lowStockProducts,
                outOfStock: outOfStockProducts,
                categories: totalCategories,
                inventoryValue: inventoryValue[0]?.totalValue || 0
            },
            customers: {
                total: totalCustomers,
                active: activeCustomers,
                newToday: newCustomersToday,
                newThisMonth: newCustomersMonth,
                retentionRate: customerRetentionRate[0]?.retentionRate || 0
            },
            operations: {
                avgProcessingTime: avgOrderProcessingTime[0]?.avgTime || 0,
                fulfillmentRate: totalProducts > 0 ? ((totalProducts - outOfStockProducts) / totalProducts) * 100 : 100
            }
        };

        res.json(formatSuccessResponse('Overview statistics retrieved successfully', overviewStats));
    } catch (error: any) {
        console.error('Overview stats error:', error);
        res.status(500).json(formatErrorResponse('Failed to get overview statistics', error.message));
    }
});

export default router;