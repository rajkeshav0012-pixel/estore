# eStore API Quick Reference

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

### Admin Login
```http
POST /api/admin/signin
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

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

### Get Products (with pagination)
```http
GET /api/admin/products?page=1&limit=10&search=phone&category=Electronics&sortBy=price&sortOrder=asc
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
  "stock": 150
}
```

## Order Management

### Get Orders
```http
GET /api/admin/orders?page=1&limit=10&status=pending&search=customer_name
Authorization: Bearer <token>
```

### Update Order Status
```http
PUT /api/admin/orders/ORD123456/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "location": "Distribution Center",
  "description": "Package shipped via courier"
}
```

## Customer API

### Browse Products
```http
GET /api/customer/products?page=1&limit=12&search=laptop&category=Electronics&minPrice=100&maxPrice=1000
```

### Get Product Details
```http
GET /api/customer/products/PRD123456
```

### Place Order
```http
POST /api/customer/orders
Content-Type: application/json

{
  "products": [
    {
      "productID": "PRD123456",
      "quantity": 2
    }
  ],
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "9876543210",
  "shippingAddress": "456 Oak St, City, State",
  "paymentMethod": "COD",
  "notes": "Please call before delivery"
}
```

### Track Order
```http
GET /api/customer/orders/ORD123456/track
```

### Get Order History
```http
GET /api/customer/customers/9876543210/orders?page=1&limit=10&status=delivered
```

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