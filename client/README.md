# eStore Frontend

React + TypeScript + Vite frontend for the eStore wholesale application.

## Features

### Admin Interface
- **Authentication**: Secure JWT-based admin login
- **Dashboard**: Sales stats, revenue tracking, recent orders
- **Product Management**: Add, edit, delete products with categories
- **Order Management**: View and update order status with tracking
- **Customer Management**: View customer profiles and order history

### Customer Interface
- **Product Browsing**: Search and filter products by category
- **Shopping Cart**: Add/remove items with quantity management
- **Order Placement**: Complete checkout with customer information
- **Order Tracking**: Real-time order status updates
- **Order History**: View past orders by phone number

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Context API** - State management
- **Lucide React** - Icons

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend server running on port 3000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Routes

### Admin Routes (Protected)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management

### Customer Routes (Public)
- `/store` - Product browsing homepage
- `/store/product/:id` - Product details
- `/store/cart` - Shopping cart
- `/store/checkout` - Checkout process
- `/store/track/:orderId` - Order tracking
- `/store/orders/:phone` - Order history

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Status

✅ **Core Structure Complete:**
- Authentication system with JWT
- Responsive layouts for admin and customer
- Context providers for state management
- API service layers
- Basic UI components
- Routing with protected routes

🚧 **In Development:**
- Complete admin interfaces
- Full customer shopping experience
- Order management system
- Product catalog management

## Deployment

1. Build: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update environment variables for production
