import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Lock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { customerOrders } from '../../services/customerApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import { formatCurrency } from '../../lib/utils';

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: 'COD' | 'Card' | 'UPI' | 'NetBanking' | 'Wallet';
  notes: string;
}

export default function Checkout() {
  const { state: cartState, clearCart } = useCart();
  const { customerName, customerPhone } = useAuth();
  const { items, totalAmount, totalItems } = cartState;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: customerName || '',
    customerEmail: '',
    customerPhone: customerPhone || '',
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'COD',
    notes: ''
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Customer Info, 2: Shipping, 3: Payment, 4: Review

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/store/cart');
    }
  }, [items.length, navigate]);

  // Calculate totals
  const subtotal = totalAmount;
  const shippingCost = 0; // Free shipping
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.customerName || !formData.customerPhone || !formData.shippingAddress) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare order data
      const orderData = {
        products: items.map(item => ({
          productID: item.productID,
          quantity: item.quantity
        })),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        billingAddress: sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined
      };

      // Place order
      const response = await customerOrders.create(orderData);

      if (response.success) {
        // Clear cart and redirect to success page
        clearCart();
        navigate(`/store/track/${response.data.orderId}`, {
          state: { 
            orderPlaced: true,
            orderTotal: response.data.totalAmount,
            estimatedDelivery: response.data.estimatedDelivery
          }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.customerName && formData.customerPhone);
      case 2:
        return !!formData.shippingAddress;
      case 3:
        return !!formData.paymentMethod;
      default:
        return true;
    }
  };

  if (items.length === 0) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link to="/store/cart" className="mr-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= stepNumber
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              <div
                className={`text-sm font-medium ml-2 ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {stepNumber === 1 && 'Customer Info'}
                {stepNumber === 2 && 'Shipping'}
                {stepNumber === 3 && 'Payment'}
                {stepNumber === 4 && 'Review'}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Step 1: Customer Information */}
              {step === 1 && (
                <div className="px-6 py-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name *"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Phone Number *"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Email Address"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="Enter your email (optional)"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(1)}
                    >
                      Continue to Shipping
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {step === 2 && (
                <div className="px-6 py-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address *
                      </label>
                      <textarea
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your complete shipping address including street, city, state, and postal code"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sameAsBilling"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sameAsBilling" className="ml-2 text-sm text-gray-700">
                        Billing address is the same as shipping address
                      </label>
                    </div>

                    {!sameAsBilling && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Billing Address
                        </label>
                        <textarea
                          name="billingAddress"
                          value={formData.billingAddress}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your billing address"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(2)}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div className="px-6 py-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                      { value: 'Card', label: 'Credit/Debit Card', desc: 'Visa, MasterCard, RuPay accepted' },
                      { value: 'UPI', label: 'UPI Payment', desc: 'Pay using Google Pay, PhonePe, Paytm' },
                      { value: 'NetBanking', label: 'Net Banking', desc: 'Pay directly from your bank account' },
                      { value: 'Wallet', label: 'Digital Wallet', desc: 'Paytm, Mobikwik, Amazon Pay' }
                    ].map((method) => (
                      <div key={method.value} className="relative">
                        <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={handleInputChange}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{method.label}</div>
                            <div className="text-sm text-gray-500">{method.desc}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special instructions for your order"
                    />
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Place Order */}
              {step === 4 && (
                <div className="px-6 py-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Review Your Order</h2>
                  
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.productID} className="flex items-center space-x-4 py-3 border-b border-gray-200">
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{formData.customerName}</p>
                        <p>{formData.customerPhone}</p>
                        {formData.customerEmail && <p>{formData.customerEmail}</p>}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                      <p className="text-sm text-gray-600">{formData.shippingAddress}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600">{formData.paymentMethod}</p>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden sticky top-8">
            <div className="px-6 py-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-900">Secure Checkout</h3>
                    <p className="text-sm text-green-700">Your payment info is protected</p>
                  </div>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Free Shipping</h3>
                    <p className="text-sm text-blue-700">Delivered within 3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}