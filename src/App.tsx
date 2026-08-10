import React, { useState, useEffect } from 'react';
import { UserRole, Product, CartItem, Order, Vendor, DeliveryPartner, OrderStatus, ServiceProvider, ServiceBooking, CustomerUser } from './types';
import { 
  subscribeProducts, 
  subscribeOrders, 
  subscribeVendors, 
  subscribeDeliveryPartners,
  subscribeServices,
  subscribeServiceBookings,
  addProductDoc,
  updateProductDoc,
  deleteProductDoc,
  createOrderDoc,
  updateOrderStatusDoc,
  updateDeliveryPartnerStatus,
  addVendorDoc,
  deleteVendorDoc,
  addDeliveryPartnerDoc,
  deleteDeliveryPartnerDoc,
  addServiceProviderDoc,
  deleteServiceProviderDoc,
  createServiceBookingDoc,
  seedProducts,
  seedVendors,
  seedDeliveryPartners,
  seedServices,
  saveCustomerAccountDoc
} from './services/db';
import { Header } from './components/Header';
import { CustomerView } from './components/CustomerView';
import { VendorView } from './components/VendorView';
import { DeliveryView } from './components/DeliveryView';
import { AdminView } from './components/AdminView';
import { ServicesPanel } from './components/ServicesPanel';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerPanelModal } from './components/CustomerPanelModal';
import { MadeInIndiaFooter } from './components/MadeInIndiaFooter';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);

  // Customer authentication state
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('smart_bazaar_customer_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);
  const [pendingAuthPrompt, setPendingAuthPrompt] = useState<string>('');

  const handleCustomerLoginSuccess = (user: CustomerUser) => {
    setCustomerUser(user);
    saveCustomerAccountDoc(user);
    try {
      localStorage.setItem('smart_bazaar_customer_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving customer user:', e);
    }
    
    if (pendingAuthAction) {
      const action = pendingAuthAction;
      setPendingAuthAction(null);
      action();
    } else {
      setIsCustomerPanelOpen(true);
    }
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    try {
      localStorage.removeItem('smart_bazaar_customer_user');
    } catch (e) {
      console.error('Error logging out customer:', e);
    }
  };

  const handleUpdateCustomerProfile = (updates: Partial<CustomerUser>) => {
    if (!customerUser) return;
    const updatedUser: CustomerUser = { ...customerUser, ...updates };
    setCustomerUser(updatedUser);
    saveCustomerAccountDoc(updatedUser);
    try {
      localStorage.setItem('smart_bazaar_customer_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error updating customer profile:', e);
    }
  };

  const triggerCustomerLogin = (actionCallback?: () => void, promptText?: string) => {
    if (actionCallback) {
      setPendingAuthAction(() => actionCallback);
    } else {
      setPendingAuthAction(null);
    }
    setPendingAuthPrompt(promptText || 'ऑर्डर करने या सर्विस बुक करने के लिए लॉगिन आवश्यक है।');
    setIsCustomerAuthOpen(true);
  };
  
  // Customer view state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_bazaar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [customerTab, setCustomerTab] = useState<'shop' | 'services' | 'orders'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);

  const handleOpenCustomerPanel = () => {
    if (!customerUser?.isLoggedIn) {
      triggerCustomerLogin(() => {
        setIsCustomerPanelOpen(true);
      }, 'कस्टमर पैनल व ऑर्डर स्टेटस देखने के लिए लॉगिन करें।');
    } else {
      setIsCustomerPanelOpen(true);
    }
  };

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('smart_bazaar_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubOrders = subscribeOrders((data) => setOrders(data));
    const unsubVendors = subscribeVendors((data) => setVendors(data));
    const unsubPartners = subscribeDeliveryPartners((data) => setDeliveryPartners(data));
    const unsubServices = subscribeServices((data) => setServices(data));
    const unsubBookings = subscribeServiceBookings((data) => setServiceBookings(data));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubVendors();
      unsubPartners();
      unsubServices();
      unsubBookings();
    };
  }, []);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Placement
  const handlePlaceOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: CartItem[];
    subtotal?: number;
    deliveryCharge?: number;
    totalAmount: number;
    paymentMode?: 'online' | 'cod' | 'shop';
    deliveryMode?: 'platform' | 'self';
    paymentScreenshot?: string | null;
    notes?: string;
  }) => {
    // Determine vendor tag if available
    const primaryVendorId = orderData.items[0]?.product?.vendorId || '';
    const primaryVendorName = orderData.items[0]?.product?.vendorName || '';

    const newOrderData: Omit<Order, 'id'> = {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items,
      subtotal: orderData.subtotal || orderData.totalAmount,
      deliveryCharge: orderData.deliveryCharge || 0,
      totalAmount: orderData.totalAmount,
      paymentMode: orderData.paymentMode || 'cod',
      deliveryMode: orderData.deliveryMode || 'platform',
      paymentScreenshot: orderData.paymentScreenshot || null,
      vendorId: primaryVendorId,
      vendorName: primaryVendorName,
      status: 'Placed',
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notes: orderData.notes || ''
    };

    const orderId = await createOrderDoc(newOrderData);

    // Optimistic local state update
    const createdOrder: Order = { ...newOrderData, id: orderId };
    setOrders(prev => [createdOrder, ...prev.filter(o => o.id !== orderId)]);

    return orderId;
  };

  // Product CRUD
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newId = await addProductDoc(productData);
    const createdProduct: Product = { ...productData, id: newId };
    setProducts(prev => [...prev.filter(p => p.id !== newId), createdProduct]);
    return newId;
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updateProductDoc(id, updates);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProductDoc(id);
  };

  // Order status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, extra: Partial<Order> = {}) => {
    await updateOrderStatusDoc(orderId, status, extra);
  };

  // Delivery partner status
  const handleUpdatePartnerStatus = async (partnerId: string, status: 'Online' | 'Offline' | 'Busy') => {
    await updateDeliveryPartnerStatus(partnerId, status);
  };

  // Vendor CRUD
  const handleAddVendor = async (vendorData: Omit<Vendor, 'id'>) => {
    return await addVendorDoc(vendorData);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    await deleteVendorDoc(vendorId);
  };

  // Delivery Partner CRUD
  const handleAddDeliveryPartner = async (partnerData: Omit<DeliveryPartner, 'id'>) => {
    return await addDeliveryPartnerDoc(partnerData);
  };

  const handleDeleteDeliveryPartner = async (partnerId: string) => {
    await deleteDeliveryPartnerDoc(partnerId);
  };

  // Service CRUD & Booking Handlers
  const handleAddService = async (serviceData: Omit<ServiceProvider, 'id'>) => {
    const newId = await addServiceProviderDoc(serviceData);
    const createdService: ServiceProvider = { ...serviceData, id: newId };
    setServices(prev => [...prev.filter(s => s.id !== newId), createdService]);
    return newId;
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteServiceProviderDoc(serviceId);
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleCreateBooking = async (bookingData: Omit<ServiceBooking, 'id'>) => {
    const newId = await createServiceBookingDoc(bookingData);
    const createdBooking: ServiceBooking = { ...bookingData, id: newId };
    setServiceBookings(prev => [createdBooking, ...prev.filter(b => b.id !== newId)]);
    return newId;
  };

  // Seed sample database defaults
  const handleSeedDefaults = async () => {
    await seedProducts();
    await seedVendors();
    await seedDeliveryPartners();
    await seedServices();
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeCustomerOrdersCount = orders.filter(
    o => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased flex flex-col">
      
      {/* Main App Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        cartCount={totalCartCount}
        onOpenCart={() => {
          setCurrentRole('customer');
          setCustomerTab('shop');
          if (!customerUser?.isLoggedIn) {
            triggerCustomerLogin(() => setIsCartOpen(true), 'कार्ट देखने और ऑर्डर पूरा करने के लिए लॉगिन करें');
          } else {
            setIsCartOpen(true);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeOrdersCount={activeCustomerOrdersCount}
        onOpenOrdersTab={handleOpenCustomerPanel}
        onOpenCustomerPanel={handleOpenCustomerPanel}
        customerUser={customerUser}
        onOpenLoginModal={() => triggerCustomerLogin()}
        onCustomerLogout={handleCustomerLogout}
        onUpdateCustomerProfile={handleUpdateCustomerProfile}
      />

      {/* Role View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top Warning Banner for all panels */}
        <div className="mb-5 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-md flex items-center gap-3 relative overflow-hidden border border-red-400">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-extrabold leading-relaxed tracking-wide">
              <span className="text-amber-300 font-black text-sm sm:text-base mr-1">🚨 सावधान:</span>
              किसी भी प्रकार की धोखाधड़ी पाए जाने पर अकाउंट तुरंत बंद किया जा सकता है तथा कानूनी कार्रवाई की जा सकती है।
            </p>
          </div>
        </div>

        {currentRole === 'customer' && (
          <CustomerView
            products={products}
            vendors={vendors}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onClearCart={handleClearCart}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            searchQuery={searchQuery}
            activeTab={customerTab}
            onTabChange={setCustomerTab}
            services={services}
            serviceBookings={serviceBookings}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onCreateBooking={handleCreateBooking}
            isCartOpen={isCartOpen}
            onCloseCart={() => setIsCartOpen(false)}
            onOpenCart={() => setIsCartOpen(true)}
            customerUser={customerUser}
            onRequireLogin={triggerCustomerLogin}
            onOpenCustomerPanel={handleOpenCustomerPanel}
          />
        )}

        {currentRole === 'vendor' && (
          <VendorView
            vendors={vendors}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddVendor={handleAddVendor}
            services={services}
            serviceBookings={serviceBookings}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
          />
        )}

        {currentRole === 'delivery' && (
          <DeliveryView
            deliveryPartners={deliveryPartners}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePartnerStatus={handleUpdatePartnerStatus}
            onAddDeliveryPartner={handleAddDeliveryPartner}
          />
        )}

        {currentRole === 'service' && (
          <ServicesPanel
            services={services}
            serviceBookings={serviceBookings}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onCreateBooking={handleCreateBooking}
            isProviderView={true}
            customerUser={customerUser}
            onRequireLogin={triggerCustomerLogin}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            products={products}
            orders={orders}
            vendors={vendors}
            deliveryPartners={deliveryPartners}
            services={services}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteProduct={handleDeleteProduct}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
            onAddDeliveryPartner={handleAddDeliveryPartner}
            onDeleteDeliveryPartner={handleDeleteDeliveryPartner}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onSeedDefaults={handleSeedDefaults}
          />
        )}
      </main>

      <MadeInIndiaFooter />

      {/* Customer Login Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onLoginSuccess={handleCustomerLoginSuccess}
        pendingActionText={pendingAuthPrompt}
      />

      {/* Customer Panel Modal (Live Orders & Profile) */}
      <CustomerPanelModal
        isOpen={isCustomerPanelOpen}
        onClose={() => setIsCustomerPanelOpen(false)}
        customerUser={customerUser}
        orders={orders}
        serviceBookings={serviceBookings}
        onCustomerLogout={handleCustomerLogout}
        onUpdateCustomerProfile={handleUpdateCustomerProfile}
      />
    </div>
  );
}
