# eStore - Complete E-commerce Platform

A modern, full-stack e-commerce solution built with React, TypeScript, Express.js, and MongoDB. Features separate admin management and customer shopping experiences with real-time order tracking, inventory management, and comprehensive analytics.

![eStore Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=eStore+-+Complete+E-commerce+Platform)

## 🚀 Features

### Admin Features
- **📊 Analytics Dashboard** - Real-time stats, sales trends, and business insights
- **📦 Product Management** - CRUD operations, stock management, image uploads
- **📋 Order Management** - Order tracking, status updates, customer details
- **👥 Customer Management** - Customer profiles, order history, analytics
- **🏷️ Category Management** - Product categorization and organization
- **📈 Inventory Tracking** - Low stock alerts, bulk stock updates

### Customer Features
- **🛍️ Product Browsing** - Advanced search, filtering, and sorting
- **🛒 Shopping Cart** - Persistent cart, quantity management
- **💳 Secure Checkout** - Multi-step checkout with multiple payment options
- **📱 Order Tracking** - Real-time order status and delivery tracking
- **👤 Account Management** - Profile management, address book
- **📜 Order History** - Complete purchase history with reorder functionality

### Technical Features
- **🔐 JWT Authentication** - Secure admin and customer authentication
- **📱 Responsive Design** - Mobile-first design with Tailwind CSS
- **🚀 Performance Optimized** - Code splitting, lazy loading, caching
- **🔄 Real-time Updates** - Live inventory and order status updates
- **📊 RESTful API** - Complete API with comprehensive documentation
- **🗄️ MongoDB Integration** - Scalable NoSQL database solution

## 🛠️ Tech Stack

### Frontend (Client)
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form validation and management
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Infrastructure
- **Firebase Storage** - Image storage and CDN
- **Vercel** - Deployment platform (configured)
- **MongoDB Atlas** - Cloud database (production ready)

## 📁 Project Structure

```
eStore/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── layout/   # Layout components (AdminLayout, CustomerLayout)
│   │   │   └── ui/       # UI components (Button, Input, Modal, etc.)
│   │   ├── contexts/     # React contexts (Auth, Cart)
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin dashboard pages
│   │   │   └── customer/ # Customer shopping pages
│   │   ├── services/     # API service functions
│   │   ├── types/        # TypeScript type definitions
│   │   └── lib/          # Utility functions and API config
│   └── public/           # Static assets
├── server/                # Express.js backend
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Authentication middleware
│   │   └── utils/        # Utility functions
│   └── dist/             # Compiled JavaScript (production)
└── android/              # React Native mobile app (future)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Firebase project (for image storage)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/SAYAN02-DEV/eStore.git
cd eStore
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your MongoDB URI, JWT secret, Firebase config
```

**Environment Variables** (server/.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/estore
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure API endpoint
# Edit .env.local with your API URL
```

**Environment Variables** (client/.env.local):
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application
- **Customer Interface**: http://localhost:5173
- **Admin Interface**: http://localhost:5173/admin/login
- **API Documentation**: http://localhost:5000/api-docs (if configured)

## 📊 Default Admin Credentials

For initial setup, create an admin account via the signup endpoint or use:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@estore.com

## 🗄️ Database Setup

### MongoDB Collections
The application automatically creates the following collections:
- `admins` - Admin user accounts
- `customers` - Customer accounts
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order records
- `reviews` - Product reviews (if implemented)

### Sample Data
```bash
# Import sample data (if available)
cd server
npm run seed
```

## 🔧 Configuration

### Firebase Storage Setup
1. Create a Firebase project
2. Enable Firebase Storage
3. Configure storage rules (see `FIREBASE_SETUP.md`)
4. Generate service account credentials
5. Add credentials to environment variables

### Payment Integration (Future)
The checkout system is designed to integrate with:
- Stripe
- PayPal
- Razorpay
- Other payment gateways

## 📱 Mobile App (React Native)

The project structure includes an `android/` directory for the future React Native mobile application. The web client serves as the reference implementation for mobile features.

**Planned Features:**
- Native Android and iOS apps
- Shared API endpoints
- Feature parity with web client
- Push notifications
- Offline support

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### API Testing
Use the provided API documentation (`server/API_DOCS.md`) with tools like:
- Postman
- Insomnia
- curl
- REST Client extensions

## 🚀 Deployment

### Backend Deployment (Vercel)
```bash
cd server
npm run build
vercel --prod
```

### Frontend Deployment (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Environment Variables for Production
Ensure all production environment variables are set:
- Database connection strings
- JWT secrets
- Firebase credentials
- API URLs
- CORS origins

## 📚 API Documentation

Comprehensive API documentation is available in `server/API_DOCS.md` including:
- Authentication endpoints
- Product management
- Order processing
- Customer management
- Error handling
- Request/response examples

**Key API Endpoints:**
- `POST /api/admin/signin` - Admin authentication
- `POST /api/customer/signin` - Customer authentication
- `GET /api/customer/products` - Browse products
- `POST /api/customer/orders` - Place order
- `GET /api/admin/dashboard` - Admin analytics

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Known Issues

1. **Firebase Storage Authentication** - See `FIREBASE_SETUP.md` for configuration
2. **CORS Issues** - Configure CORS origins for production
3. **Image Upload Size** - Default limit is 5MB per image

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Basic e-commerce functionality
- [x] Admin dashboard
- [x] Customer shopping experience
- [x] Order management
- [x] Authentication system

### Phase 2 (In Progress)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Inventory alerts
- [ ] Multi-vendor support

### Phase 3 (Planned)
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Advanced search with filters
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Advanced reporting

### Phase 4 (Future)
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time chat support
- [ ] AI-powered features
- [ ] Progressive Web App (PWA)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Firebase](https://firebase.google.com/) - Storage and hosting
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/SAYAN02-DEV/eStore/issues)
- **Email**: support@estore.com
- **Documentation**: Check the `docs/` folder for detailed guides

---

**Built with ❤️ by [SAYAN02-DEV](https://github.com/SAYAN02-DEV)**

*⭐ Star this repository if you find it helpful!*



















































































