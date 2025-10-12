# eStore Backend API

A comprehensive backend API for a wholesale store application built with Node.js, Express, TypeScript, and MongoDB.

## Features

### For Store Owners (Admin)
- **Authentication & Authorization**
  - Secure JWT-based authentication
  - Admin registration and login
  - Protected admin routes

- **Dashboard Analytics**
  - Sales statistics (daily, monthly, yearly)
  - Order counts and revenue tracking
  - Low stock alerts
  - Top-selling products
  - Recent orders overview

- **Product Management**
  - Add, edit, delete products
  - Category management
  - Stock management with low stock alerts
  - Product search and filtering
  - Image management
  - Bulk operations

- **Order Management**
  - View all orders with filtering
  - Order status tracking and updates
  - Detailed order information
  - Track shipments and deliveries
  - Generate tracking numbers

- **Customer Management**
  - View customer profiles
  - Customer order history
  - Customer statistics

### For Customers
- **Product Browsing**
  - Browse products by category
  - Product search functionality
  - Product details with images
  - Related products suggestions

- **Order Placement**
  - Add products to cart
  - Place orders with multiple products
  - Customer information management
  - Multiple address support

- **Order Tracking**
  - Track order status
  - View order history
  - Detailed order information
  - Delivery tracking

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Mongoose validation + custom validators
- **CORS**: Enabled for frontend integration

## Project Structure

```
server/
├── src/
│   ├── index.ts                 # Main server file
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── models/
│   │   └── db.ts               # Database schemas and models
│   ├── routes/
│   │   ├── adminRoutes.ts      # Admin API routes
│   │   └── customerRoutes.ts   # Customer API routes
│   └── utils/
│       └── helpers.ts          # Utility functions
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables
└── .env.example              # Environment variables template
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   APP_PORT=3000
   MONGODB_URI=mongodb://localhost:27017/eStore
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Admin API: `/api/admin`
- Customer API: `/api/customer`

### Authentication
Admin routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Admin API Endpoints

#### Authentication
- `POST /api/admin/signup` - Register admin
- `POST /api/admin/signin` - Admin login

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

#### Product Management
- `GET /api/admin/products` - List products (with pagination, search, filter)
- `POST /api/admin/products` - Add new product
- `GET /api/admin/products/:productID` - Get product details
- `PUT /api/admin/products/:productID` - Update product
- `DELETE /api/admin/products/:productID` - Delete product

#### Order Management
- `GET /api/admin/orders` - List orders (with pagination, search, filter)
- `GET /api/admin/orders/:orderId` - Get order details
- `PUT /api/admin/orders/:orderId/status` - Update order status

#### Customer Management
- `GET /api/admin/customers` - List customers
- `GET /api/admin/customers/:customerID` - Get customer details

#### Category Management
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Add category

### Customer API Endpoints

#### Product Browsing
- `GET /api/customer/products` - List products (with pagination, search, filter)
- `GET /api/customer/products/:productID` - Get product details
- `GET /api/customer/categories` - List categories

#### Order Management
- `POST /api/customer/orders` - Place order
- `GET /api/customer/orders/:orderId/track` - Track order

#### Customer Order History
- `GET /api/customer/customers/:phone/orders` - Get order history by phone
- `GET /api/customer/customers/:phone/orders/:orderId` - Get specific order

#### Search & Store Info
- `GET /api/customer/search` - Search products/categories
- `GET /api/customer/store-info` - Get store information

## Data Models

### Admin Schema
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  storename: String (required),
  storeaddress: String (required),
  storelogo: String (required),
  storeID: String (required, unique),
  isActive: Boolean (default: true)
}
```

### Product Schema
```javascript
{
  productID: String (required, unique),
  name: String (required),
  description: String,
  category: String (required),
  price: Number (required),
  costPrice: Number,
  stock: Number (required),
  images: [String] (required),
  rating: Number (0-5),
  totalPurchases: Number (default: 0),
  outofstock: Boolean,
  isActive: Boolean (default: true)
}
```

### Order Schema
```javascript
{
  orderId: String (required, unique),
  products: [{
    productID: String,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalAmount: Number (required),
  customerName: String (required),
  customerPhone: String (required),
  shippingAddress: String (required),
  orderStatus: String (enum),
  trackingHistory: [Object],
  paymentMethod: String,
  paymentStatus: String
}
```

### Customer Schema
```javascript
{
  customerID: String (required, unique),
  name: String (required),
  email: String,
  phone: String (required, unique),
  addresses: [Object],
  totalOrders: Number (default: 0),
  totalSpent: Number (default: 0),
  isActive: Boolean (default: true)
}
```

## Order Status Flow

1. **pending** - Order received and being processed
2. **confirmed** - Order confirmed and payment verified
3. **processing** - Order is being prepared
4. **shipped** - Order has been shipped
5. **delivered** - Order has been delivered
6. **cancelled** - Order has been cancelled
7. **returned** - Order has been returned

## Error Handling

The API uses consistent error response format:
```javascript
{
  success: false,
  message: "Error message",
  errors: null, // or error details
  timestamp: "2023-10-12T10:30:00.000Z"
}
```

## Security Features

- JWT authentication for admin routes
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting ready (can be added)
- SQL injection prevention with MongoDB
- XSS protection with input validation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| APP_PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/eStore |
| JWT_SECRET | JWT signing secret | - |

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.

---

**Happy Coding! 🚀**