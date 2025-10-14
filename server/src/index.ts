import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import { formatErrorResponse } from './utils/helpers.js';

dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eStore';
const APP_PORT = process.env.APP_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// ============= MIDDLEWARE =============

// CORS configuration
const corsOptions = {
    origin: function (origin: string | undefined, callback: Function) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = NODE_ENV === 'production' 
            ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your frontend domains
            : [
                'http://localhost:3000', 
                'http://localhost:3001', 
                'http://localhost:5173',
                'http://localhost:8081', // Expo development server
                'http://10.0.2.2:3000',  // Android emulator localhost
                'http://192.168.1.100:3000', // Replace with your local IP for physical device testing
            ];
        
        // For React Native/Expo apps, allow any localhost or development origins
        if (NODE_ENV === 'development') {
            if (origin.includes('localhost') || 
                origin.includes('127.0.0.1') || 
                origin.includes('192.168.') || 
                origin.includes('10.0.') ||
                origin.includes('expo')) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============= ROUTES =============

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'eStore API is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send("server started!");
});


// ============= ERROR HANDLING =============

// 404 handler - catch all undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json(formatErrorResponse(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', error);
    
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    } else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (error.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
    } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    res.status(statusCode).json(formatErrorResponse(message, NODE_ENV === 'development' ? error.stack : null));
});

// ============= DATABASE CONNECTION =============

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// ============= SERVER STARTUP =============

const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(APP_PORT, () => {
            console.log(`🚀 Server is running on port ${APP_PORT}`);
            console.log(`🌍 Environment: ${NODE_ENV}`);
            console.log(`📡 API Base URL: http://localhost:${APP_PORT}`);
            console.log(`🏥 Health Check: http://localhost:${APP_PORT}/health`);
            console.log(`👨‍💼 Admin API: http://localhost:${APP_PORT}/api/admin`);
            console.log(`👥 Customer API: http://localhost:${APP_PORT}/api/customer`);
        });

        // Handle server errors
        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${APP_PORT} is already in use`);
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();