import { useState, useEffect } from 'react';
import { products as productsApi } from '../../services/adminApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';

import type { Product } from '../../types';

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  images: string[];
  weight?: number;
  dimensions?: string;
  tags: string[];
  minStockLevel: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    images: [''],
    weight: 0,
    dimensions: '',
    tags: [],
    minStockLevel: 10
  });

  const [categories] = useState([
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Food'
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        sortBy,
        sortOrder
      });
      
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.totalPages);
        setTotalProducts(response.data.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleAddProduct = async () => {
    try {
      const productData = {
        ...productForm,
        dimensions: productForm.dimensions ? { length: 0, width: 0, height: 0 } : undefined
      };
      const response = await productsApi.create(productData);
      if (response.success) {
        setShowAddModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const productData = {
        ...productForm,
        dimensions: productForm.dimensions ? { length: 0, width: 0, height: 0 } : undefined
      };
      const response = await productsApi.update(selectedProduct.productID, productData);
      if (response.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await productsApi.delete(selectedProduct.productID);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: '',
      price: 0,
      costPrice: 0,
      stock: 0,
      images: [''],
      weight: 0,
      dimensions: '',
      tags: [],
      minStockLevel: 10
    });
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      images: product.images,
      weight: product.weight,
      dimensions: product.dimensions ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}` : '',
      tags: product.tags,
      minStockLevel: product.minStockLevel
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.outofstock) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (product.stock <= product.minStockLevel) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const calculateProfit = (price: number, costPrice: number) => {
    return price - costPrice;
  };

  const calculateProfitMargin = (price: number, costPrice: number) => {
    return ((price - costPrice) / price * 100).toFixed(1);
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your store products</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add New Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {products.filter(p => p.stock <= p.minStockLevel && !p.outofstock).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.outofstock).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold text-green-600">
            ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="totalPurchases">Purchases</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const profit = calculateProfit(product.price, product.costPrice || 0);
                const profitMargin = calculateProfitMargin(product.price, product.costPrice || 0);
                
                return (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images[0] ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={product.images[0]} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.productID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>${product.price}</div>
                      <div className="text-xs text-gray-500">Cost: ${product.costPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.totalPurchases || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>${profit.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{profitMargin}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Product"
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Image URL"
                value={productForm.images[0] || ''}
                onChange={(e) => setProductForm({...productForm, images: [e.target.value]})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing & Inventory</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                required
              />
              <Input
                label="Cost Price ($)"
                type="number"
                step="0.01"
                value={productForm.costPrice}
                onChange={(e) => setProductForm({...productForm, costPrice: parseFloat(e.target.value) || 0})}
                required
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                required
              />
              <Input
                label="Min Stock Level"
                type="number"
                value={productForm.minStockLevel}
                onChange={(e) => setProductForm({...productForm, minStockLevel: parseInt(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          {/* Physical Attributes */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Physical Attributes (Optional)</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                value={productForm.weight || ''}
                onChange={(e) => setProductForm({...productForm, weight: parseFloat(e.target.value) || undefined})}
                placeholder="0.00"
              />
              <Input
                label="Dimensions"
                value={productForm.dimensions || ''}
                onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})}
                placeholder="L x W x H (e.g., 10 x 5 x 3 cm)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              Add Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
          resetForm();
        }}
        title="Edit Product"
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={productForm.description}  
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Enter product description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Image URL"
                value={productForm.images[0] || ''}
                onChange={(e) => setProductForm({...productForm, images: [e.target.value]})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing & Inventory</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                required
              />
              <Input
                label="Cost Price ($)"
                type="number"
                step="0.01"
                value={productForm.costPrice}
                onChange={(e) => setProductForm({...productForm, costPrice: parseFloat(e.target.value) || 0})}
                required
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                required
              />
              <Input
                label="Min Stock Level"
                type="number"
                value={productForm.minStockLevel}
                onChange={(e) => setProductForm({...productForm, minStockLevel: parseInt(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          {/* Physical Attributes */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Physical Attributes (Optional)</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                value={productForm.weight || ''}
                onChange={(e) => setProductForm({...productForm, weight: parseFloat(e.target.value) || undefined})}
                placeholder="0.00"
              />
              <Input
                label="Dimensions"
                value={productForm.dimensions || ''}
                onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})}
                placeholder="L x W x H (e.g., 10 x 5 x 3 cm)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>
              Update Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}