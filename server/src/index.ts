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

// CORS - Allow frontend URL
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Allow your frontend URL and localhost for development
    if (origin === 'https://e-store-gpsg.vercel.app' || 
        origin === 'http://localhost:5173' || 
        origin === 'http://localhost:3000' ||
        !origin) { // Allow requests with no origin (Postman, mobile apps)
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
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

// CORS test route
app.get('/cors-test', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'CORS is working correctly',
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']
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
        console.warn('⚠️ Server is running without a database connection.');
        // process.exit(1); // Commented out to allow the app to run without MongoDB
    }
};

// ============= DATABASE CONNECTION & EXPORT =============

// Initialize database connection
connectDB().catch(console.error);

// Export the Express app for Vercel serverless deployment
export default app;

// For local development, start the server if not in production
if (NODE_ENV !== 'production') {
    const startServer = async () => {
        try {
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

    // Start the server for local development
    startServer();
}