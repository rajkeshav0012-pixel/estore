// Generate unique IDs
export const generateID = (prefix: string = ''): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${prefix}${timestamp}${randomStr}`.toUpperCase();
};

export const generateOrderID = (): string => {
    return generateID('ORD');
};

export const generateProductID = (): string => {
    return generateID('PRD');
};

export const generateCustomerID = (): string => {
    return generateID('CUS');
};

export const generateCategoryID = (): string => {
    return generateID('CAT');
};

export const generateStoreID = (): string => {
    return generateID('STR');
};

// Format currency
export const formatCurrency = (amount: number, currency: string = '₹'): string => {
    return `${currency}${amount.toFixed(2)}`;
};

// Calculate order totals
export const calculateOrderTotal = (products: any[], discount: number = 0, tax: number = 0, shippingCost: number = 0): number => {
    const subtotal = products.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
    
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    
    return subtotal - discountAmount + taxAmount + shippingCost;
};

// Format date
export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Generate tracking number
export const generateTrackingNumber = (): string => {
    const prefix = 'TRK';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
};

// Validate phone number
export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate slug from name
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Paginate results
export const paginate = (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit };
};

// Search query builder
export const buildSearchQuery = (searchTerm: string, fields: string[]) => {
    if (!searchTerm) return {};
    
    const regex = new RegExp(searchTerm, 'i');
    return {
        $or: fields.map(field => ({ [field]: regex }))
    };
};

// Order status descriptions
export const getOrderStatusDescription = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Order received and being processed',
        'confirmed': 'Order confirmed and payment verified',
        'processing': 'Order is being prepared',
        'shipped': 'Order has been shipped',
        'delivered': 'Order has been delivered',
        'cancelled': 'Order has been cancelled',
        'returned': 'Order has been returned'
    };
    return statusMap[status] || 'Unknown status';
};

// Calculate estimated delivery date
export const calculateEstimatedDelivery = (orderDate: Date, shippingDays: number = 7): Date => {
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + shippingDays);
    return estimatedDate;
};

// Error response formatter
export const formatErrorResponse = (message: string, errors?: any) => {
    return {
        success: false,
        message,
        errors: errors || null,
        timestamp: new Date().toISOString()
    };
};

// Success response formatter
export const formatSuccessResponse = (message: string, data?: any) => {
    return {
        success: true,
        message,
        data: data || null,
        timestamp: new Date().toISOString()
    };
};