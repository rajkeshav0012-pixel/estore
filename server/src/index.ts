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

// CORS configuration - Allow all origins with proper credential handling
const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow any origin for maximum compatibility
        callback(null, origin);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false
};

app.use(cors(corsOptions));

// Additional CORS headers - Fix for browser CORS with credentials
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Always allow the requesting origin when credentials are involved
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // For requests without origin (like Postman), allow all
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with CORS debugging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    // Log CORS-related headers for debugging
    if (req.headers.origin) {
        console.log(`Origin: ${req.headers.origin}`);
    }
    if (req.method === 'OPTIONS') {
        console.log('Preflight request detected');
    }
    
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
        process.exit(1);
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