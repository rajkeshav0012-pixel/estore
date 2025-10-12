# eStore API Documentation

## Overview

The eStore API provides a complete backend solution for e-commerce operations, supporting both admin management and customer shopping experiences. Built with Express.js, MongoDB, and JWT authentication.

**Base URL**: `http://localhost:5000/api`

## Authentication

All admin endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Customer endpoints are public except for order placement which requires customer authentication.

---

## Admin Authentication

### Register Admin
```http
POST /api/admin/signup
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "name": "John Doe",
  "email": "admin@store.com",
  "phone": "9876543210",
  "storename": "My Wholesale Store",
  "storeaddress": "123 Main St, City, State",
  "storelogo": "https://example.com/logo.png"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully registered",
  "data": {
    "storeID": "STR001",
    "token": "jwt-token-here",
    "admin": {
      "name": "John Doe",
      "email": "admin@store.com",
      "storename": "My Wholesale Store",
      "storelogo": "https://example.com/logo.png"
    }
  }
}
```

### Admin Login
```http
POST /api/admin/signin
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "storeID": "STR001",
    "token": "jwt-token-here",
    "admin": {
      "name": "John Doe",
      "email": "admin@store.com",
      "storename": "My Wholesale Store"
    }
  }
}
```

---

## Customer Authentication

### Customer Register
```http
POST /api/customer/signup
Content-Type: application/json

{
  "name": "John Customer",
  "phone": "9876543210",
  "email": "customer@example.com",
  "password": "password123"
}
```

### Customer Login
```http
POST /api/customer/signin
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Customer signed in successfully",
  "data": {
    "customerID": "CUST001",
    "token": "jwt-token-here",
    "customer": {
      "name": "John Customer",
      "email": "customer@example.com",
      "phone": "9876543210"
    }
  }
}
```

---

## Product Management

### Add Product
```http
POST /api/admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "category": "Electronics",
  "price": 299.99,
  "costPrice": 199.99,
  "stock": 100,
  "images": ["image1.jpg", "image2.jpg"],
  "weight": 500,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 3
  },
  "tags": ["tag1", "tag2"]
}
```

### Get Products (Admin)
```http
GET /api/admin/products?page=1&limit=10&search=phone&category=Electronics&sortBy=price&sortOrder=asc
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search in product name/description
- `category`: Filter by category
- `sortBy`: Sort field (name, price, stock, createdAt)
- `sortOrder`: asc or desc
- `inStock`: true/false - filter by stock availability

### Get Single Product (Admin)
```http
GET /api/admin/products/PRD123456
Authorization: Bearer <token>
```

### Update Product
```http
PUT /api/admin/products/PRD123456
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 349.99,
  "stock": 150,
  "isActive": true
}
```

### Delete Product
```http
DELETE /api/admin/products/PRD123456
Authorization: Bearer <token>
```

### Update Product Stock
```http
PUT /api/admin/products/PRD123456/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 200,
  "operation": "set"
}
```

**Operations**: `set`, `add`, `subtract`

---

## Category Management

### Get Categories (Admin)
```http
GET /api/admin/categories
Authorization: Bearer <token>
```

### Add Category
```http
POST /api/admin/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "image": "https://example.com/electronics.jpg"
}
```

### Update Category
```http
PUT /api/admin/categories/CAT123456
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Category",
  "isActive": true
}
```

### Delete Category
```http
DELETE /api/admin/categories/CAT123456
Authorization: Bearer <token>
```

---

## Order Management (Admin)

### Get All Orders
```http
GET /api/admin/orders?page=1&limit=10&status=pending&customerPhone=1234567890&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, processing, shipped, delivered, cancelled)
- `customerPhone`: Filter by customer phone number
- `startDate`: Filter orders from date (ISO format)
- `endDate`: Filter orders to date (ISO format)
- `sortBy`: Sort field (createdAt, total, status)
- `sortOrder`: asc or desc

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "ORD123456789",
        "customerInfo": {
          "name": "John Doe",
          "phone": "1234567890",
          "email": "john@example.com"
        },
        "items": [
          {
            "productId": "PRD123456",
            "name": "iPhone 15",
            "price": 999.99,
            "quantity": 1,
            "total": 999.99
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "paymentMethod": "credit_card",
        "total": 999.99,
        "status": "pending",
        "trackingNumber": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Order
```http
GET /api/admin/orders/ORD123456789
Authorization: Bearer <token>
```

### Update Order Status
```http
PUT /api/admin/orders/ORD123456789/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "location": "Distribution Center",
  "description": "Package shipped via FedEx"
}
```

**Valid Status Values**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Cancel Order
```http
PUT /api/admin/orders/ORD123456789/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Customer requested cancellation",
  "refundAmount": 999.99
}
```

---

## Dashboard Analytics

### Get Dashboard Stats
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 125000.50,
    "totalProducts": 456,
    "totalCustomers": 890,
    "recentOrders": [
      {
        "orderId": "ORD123456789",
        "customerName": "John Doe",
        "total": 999.99,
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lowStockProducts": [
      {
        "productId": "PRD123456",
        "name": "iPhone 15",
        "stock": 3,
        "threshold": 10
      }
    ],
    "salesTrend": {
      "daily": [
        { "date": "2024-01-15", "revenue": 2500.50, "orders": 15 }
      ],
      "monthly": [
        { "month": "2024-01", "revenue": 45000.75, "orders": 320 }
      ]
    }
  }
}
```

---

## Customer API Endpoints

### Customer Authentication

#### Customer Registration
```http
POST /api/customer/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "password": "securePassword123",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "customerId": "CUST123456",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customer": {
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com"
    }
  }
}
```

#### Customer Login
```http
POST /api/customer/signin
Content-Type: application/json

{
  "phone": "1234567890",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Customer signed in successfully",
  "data": {
    "customerID": "CUST123456",
    "token": "jwt-token-here",
    "customer": {
      "name": "John Customer",
      "email": "customer@example.com",
      "phone": "1234567890",
      "addresses": [
        {
          "id": "ADDR123",
          "type": "home",
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA",
          "isDefault": true
        }
      ]
    }
  }
}
```

### Customer Profile Management

#### Get Customer Profile
```http
GET /api/customer/profile
Authorization: Bearer <customer_token>
```

#### Update Customer Profile
```http
PUT /api/customer/profile
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Add Customer Address
```http
POST /api/customer/addresses
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "type": "work",
  "street": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "country": "USA",
  "isDefault": false
}
```

#### Update Customer Address
```http
PUT /api/customer/addresses/ADDR123
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "street": "789 Updated St",
  "isDefault": true
}
```

#### Delete Customer Address
```http
DELETE /api/customer/addresses/ADDR123
Authorization: Bearer <customer_token>
```

### Product Browsing

#### Browse Products (Public)
```http
GET /api/customer/products?page=1&limit=12&search=laptop&category=Electronics&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)
- `search`: Search in product name/description
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `sortBy`: Sort field (name, price, rating, createdAt)
- `sortOrder`: asc or desc
- `inStock`: true/false - only show available products

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": "PRD123456",
        "name": "MacBook Pro",
        "description": "Powerful laptop for professionals",
        "category": "Electronics",
        "price": 1999.99,
        "originalPrice": 2299.99,
        "discount": 13,
        "images": ["image1.jpg", "image2.jpg"],
        "stock": 25,
        "rating": 4.8,
        "reviewCount": 156,
        "isActive": true,
        "tags": ["laptop", "apple", "professional"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalProducts": 96,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["Electronics", "Clothing", "Books"],
      "priceRange": { "min": 10.99, "max": 2999.99 }
    }
  }
}
```

#### Get Product Details (Public)
```http
GET /api/customer/products/PRD123456
```

**Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "productId": "PRD123456",
      "name": "MacBook Pro",
      "description": "Powerful laptop for professionals with M3 chip",
      "category": "Electronics",
      "price": 1999.99,
      "originalPrice": 2299.99,
      "discount": 13,
      "images": ["image1.jpg", "image2.jpg", "image3.jpg"],
      "stock": 25,
      "weight": 1500,
      "dimensions": {
        "length": 35.57,
        "width": 24.59,
        "height": 1.55
      },
      "specifications": {
        "processor": "Apple M3",
        "memory": "16GB",
        "storage": "512GB SSD"
      },
      "rating": 4.8,
      "reviewCount": 156,
      "reviews": [
        {
          "customerName": "John D.",
          "rating": 5,
          "comment": "Excellent laptop!",
          "date": "2024-01-10T10:00:00Z"
        }
      ],
      "relatedProducts": ["PRD123457", "PRD123458"],
      "isActive": true,
      "tags": ["laptop", "apple", "professional"]
    }
  }
}
```

### Order Management (Customer)

#### Place Order
```http
POST /api/customer/orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "customerInfo": {
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "items": [
    {
      "productId": "PRD123456",
      "quantity": 2,
      "price": 999.99
    }
  ],
  "notes": "Please handle with care"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "ORD123456789",
    "total": 1999.98,
    "status": "pending",
    "estimatedDelivery": "2024-01-20T00:00:00Z"
  }
}
```

#### Get Customer Orders
```http
GET /api/customer/customers/1234567890/orders?page=1&limit=10&status=all
Authorization: Bearer <customer_token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (all, pending, processing, shipped, delivered, cancelled)
- `startDate`: Filter orders from date
- `endDate`: Filter orders to date

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "ORD123456789",
        "customerInfo": {
          "name": "John Doe",
          "phone": "1234567890",
          "email": "john@example.com"
        },
        "items": [
          {
            "productId": "PRD123456",
            "name": "MacBook Pro",
            "price": 999.99,
            "quantity": 2,
            "total": 1999.98
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "paymentMethod": "credit_card",
        "total": 1999.98,
        "status": "shipped",
        "trackingNumber": "TRK123456789",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-18T14:20:00Z",
        "estimatedDelivery": "2024-01-20T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Single Order Details
```http
GET /api/customer/orders/ORD123456789
Authorization: Bearer <customer_token>
```

#### Track Order
```http
GET /api/customer/orders/ORD123456789/track
Authorization: Bearer <customer_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "ORD123456789",
    "status": "shipped",
    "trackingNumber": "TRK123456789",
    "trackingUrl": "https://track.courier.com/TRK123456789",
    "estimatedDelivery": "2024-01-20T00:00:00Z",
    "trackingHistory": [
      {
        "status": "pending",
        "location": "Order Center",
        "description": "Order received and being processed",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "processing",
        "location": "Fulfillment Center",
        "description": "Order is being prepared for shipment",
        "timestamp": "2024-01-16T09:15:00Z"
      },
      {
        "status": "shipped",
        "location": "Distribution Center",
        "description": "Package shipped via FedEx",
        "timestamp": "2024-01-18T14:20:00Z"
      }
    ]
  }
}
```

---

## Dashboard

### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProducts": 150,
      "totalOrders": 1200,
      "totalCustomers": 500,
      "todayOrders": 25,
      "monthlyOrders": 300,
      "yearlyOrders": 1200,
      "pendingOrders": 45,
      "lowStockProducts": 12,
      "totalRevenue": 125000,
      "monthlyRevenue": 25000
    },
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": null,
  "timestamp": "2023-10-12T10:30:00.000Z"
}
```

## Success Responses

All success responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2023-10-12T10:30:00.000Z"
}
```

## Order Status Values

- `pending` - Order received and being processed
- `confirmed` - Order confirmed and payment verified  
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled
- `returned` - Order has been returned

## Pagination Response

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```