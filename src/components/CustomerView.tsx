import React, { useState } from 'react';
import { Product, CartItem, Order, Vendor, ServiceProvider, ServiceBooking, CustomerUser } from '../types';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  Sparkles, 
  Tag, 
  X, 
  ShieldCheck,
  AlertCircle,
  Store,
  ChevronRight,
  ArrowLeft,
  Upload,
  MessageCircle,
  ExternalLink,
  Wrench,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SMART_DELIVERY_UPI } from '../services/db';
import { ServicesPanel } from './ServicesPanel';

interface CustomerViewProps {
  products: Product[];
  vendors: Vendor[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onClearCart: () => void;
  orders: Order[];
  onPlaceOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: CartItem[];
    totalAmount: number;
    subtotal: number;
    deliveryCharge: number;
    paymentMode: 'online' | 'cod' | 'shop';
    deliveryMode: 'platform' | 'self';
    paymentScreenshot?: string | null;
    notes?: string;
  }) => Promise<string>;
  searchQuery: string;
  activeTab: 'shop' | 'services' | 'orders';
  onTabChange: (tab: 'shop' | 'services' | 'orders') => void;
  services?: ServiceProvider[];
  serviceBookings?: ServiceBooking[];
  onAddService?: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  onCreateBooking?: (booking: Omit<ServiceBooking, 'id'>) => Promise<string>;
  isCartOpen?: boolean;
  onCloseCart?: () => void;
  onOpenCart?: () => void;
  customerUser?: CustomerUser | null;
  onRequireLogin?: (actionCallback: () => void, promptText?: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  products = [],
  vendors = [],
  cart = [],
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  orders = [],
  onPlaceOrder,
  searchQuery,
  activeTab,
  onTabChange,
  services = [],
  serviceBookings = [],
  onAddService = async () => '',
  onDeleteService = async () => {},
  onCreateBooking = async () => '',
  isCartOpen = false,
  onCloseCart,
  onOpenCart,
  customerUser,
  onRequireLogin
}) => {
  const [customerShopView, setCustomerShopView] = useState<'list' | 'catalog'>('list');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  // Checkout Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [placedOrderSuccessId, setPlacedOrderSuccessId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'online' | 'cod'>('cod');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to ensure customer is logged in before executing an action
  const guardAction = (action: () => void, promptText?: string) => {
    if (customerUser?.isLoggedIn) {
      action();
    } else if (onRequireLogin) {
      onRequireLogin(action, promptText);
    } else {
      action();
    }
  };

  // Sync customer details when customerUser becomes available
  React.useEffect(() => {
    if (customerUser?.isLoggedIn) {
      if (customerUser.name) setCustomerName(customerUser.name);
      if (customerUser.phone) setCustomerPhone(customerUser.phone);
    }
  }, [customerUser]);

  // Sync external isCartOpen with local modal state
  React.useEffect(() => {
    if (isCartOpen) {
      if (!customerUser?.isLoggedIn && onRequireLogin) {
        onRequireLogin(() => setIsCheckoutModalOpen(true), 'कार्ट देखने और ऑर्डर पूरा करने के लिए लॉगिन करें');
      } else {
        setIsCheckoutModalOpen(true);
      }
    }
  }, [isCartOpen]);

  // Cart math
  const cartSubtotal = (cart || []).reduce((sum, item) => sum + ((item?.product?.price || 0) * (item?.quantity || 1)), 0);
  const hasPlatformItems = (cart || []).some(item => item?.product?.deliveryMode === 'platform');
  const hasSelfOnlyItems = (cart || []).length > 0 && (cart || []).every(item => item?.product?.deliveryMode === 'self');
  const deliveryFee = hasPlatformItems ? (cartSubtotal >= 999 ? 0 : 40) : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const selectedVendor = (vendors || []).find(v => v.id === selectedVendorId);

  // Handle Screenshot File Upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setScreenshotDataUrl(null);
      setScreenshotPreview(null);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('स्क्रीनशॉट फ़ाइल साइज़ 3MB से कम रखें।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setScreenshotDataUrl(res);
      setScreenshotPreview(res);
    };
    reader.readAsDataURL(file);
  };

  // Handle Checkout Submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, '');
    if (!customerName || !cleanPhone) {
      alert('कृपया नाम और मोबाइल नंबर भरें।');
      return;
    }
    if (cleanPhone.length < 10) {
      alert('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें। (उदा: 9876543210)');
      return;
    }
    if (!hasSelfOnlyItems && !deliveryAddress) {
      alert('कृपया पूरा पता भरें।');
      return;
    }
    if (paymentMode === 'online' && !screenshotDataUrl && !hasSelfOnlyItems) {
      alert('ऑनलाइन भुगतान के लिए स्क्रीनशॉट अपलोड करना आवश्यक है।');
      return;
    }
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const finalDeliveryMode = hasSelfOnlyItems ? 'self' : 'platform';
      const finalPayMode = hasSelfOnlyItems ? 'shop' : paymentMode;

      const newOrderId = await onPlaceOrder({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: hasSelfOnlyItems ? 'दुकान से पिकअप (Self Delivery)' : deliveryAddress.trim(),
        items: [...cart],
        subtotal: cartSubtotal,
        deliveryCharge: deliveryFee,
        totalAmount: grandTotal,
        paymentMode: finalPayMode,
        deliveryMode: finalDeliveryMode,
        paymentScreenshot: screenshotDataUrl
      });

      if (hasSelfOnlyItems && selectedVendor) {
        const text = `नमस्ते, मैंने आपके स्टोर "${selectedVendor.shopName}" से ऑर्डर #${newOrderId} किया है — ${customerName}, मोबाइल: ${cleanPhone}। पिकअप की जानकारी दें।`;
        try {
          window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
        } catch (e) {
          console.error(e);
        }
      }

      setIsCheckoutModalOpen(false);
      onCloseCart?.();
      onClearCart();
      setScreenshotDataUrl(null);
      setScreenshotPreview(null);
      setPlacedOrderSuccessId(newOrderId);
    } catch (err) {
      console.error('Order error:', err);
      alert('ऑर्डर प्लेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-16">
      
      {/* Customer Header Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 mb-6 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => onTabChange('shop')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>शॉप (Browse Shops)</span>
          </button>

          <button
            onClick={() => onTabChange('services')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>🛠️ सेवाएं (Services)</span>
          </button>
          
          <button
            onClick={() => onTabChange('orders')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>मेरे ऑर्डर (My Orders)</span>
            {orders.length > 0 && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'orders' ? 'bg-white text-emerald-800' : 'bg-emerald-700 text-white'
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>


      </div>

      {activeTab === 'services' ? (
        <ServicesPanel
          services={services}
          serviceBookings={serviceBookings}
          onAddService={onAddService}
          onDeleteService={onDeleteService}
          onCreateBooking={onCreateBooking}
          isProviderView={false}
          customerUser={customerUser}
          onRequireLogin={onRequireLogin}
        />
      ) : activeTab === 'shop' ? (
        <>
          {customerShopView === 'list' ? (
            /* ALL SHOPS LIST VIEW */
            <div>
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-950/70 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>हर दुकान आपके पास — Smart Express Delivery</span>
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                    अपने शहर की प्रसिद्ध दुकानों से खरीदारी करें
                  </h1>
                  <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
                    दुकान चुनें, प्रोडक्ट कैटलॉग देखें और सीधा ऑर्डर करें!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-600 rounded-full inline-block" />
                  <span>उपलब्ध दुकानें ({vendors.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map(v => {
                  const vProducts = products.filter(p => p.vendorId === v.id || p.vendorName === v.shopName);
                  const categories = Array.from(new Set(vProducts.map(p => p.category)));

                  return (
                    <motion.div
                      key={v.id}
                      whileHover={{ y: -2 }}
                      className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 cursor-pointer"
                      onClick={() => {
                        setSelectedVendorId(v.id);
                        setCustomerShopView('catalog');
                      }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-emerald-700 shrink-0 overflow-hidden">
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt={v.shopName} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-stone-900 text-base leading-snug truncate">
                          {v.shopName}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                          {categories.length > 0 ? categories.join(', ') : v.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            {vProducts.length} प्रोडक्ट उपलब्ध
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500">
                            {v.address}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVendorId(v.id);
                          setCustomerShopView('catalog');
                        }}
                        className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>कैटलॉग →</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SINGLE VENDOR CATALOG VIEW */
            <div>
              <div className="flex items-center justify-between gap-2 mb-6 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCustomerShopView('list');
                      setSelectedVendorId(null);
                    }}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>सभी दुकानें</span>
                  </button>
                  <div>
                    <h2 className="font-black text-stone-900 text-lg leading-tight">
                      {selectedVendor ? selectedVendor.shopName : 'दुकान कैटलॉग'}
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      {products.filter(p => p.vendorId === selectedVendorId || p.vendorName === selectedVendor?.shopName).length} प्रोडक्ट उपलब्ध
                    </p>
                  </div>
                </div>
              </div>

              {/* Products in this vendor's catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter(p => p.vendorId === selectedVendorId || p.vendorName === selectedVendor?.shopName)
                  .map(product => {
                    const cartItem = (cart || []).find(ci => ci?.product?.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm flex gap-3.5 hover:shadow-md transition-all"
                      >
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                          alt={product.name}
                          className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0"
                        />

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-stone-500 line-clamp-1 font-medium mt-0.5">
                              विक्रेता: {product.vendorName}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-extrabold text-emerald-800 text-base">
                                ₹{product.price}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs text-stone-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>

                            <div className="mt-1">
                              {product.deliveryMode === 'platform' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Truck className="w-3 h-3" /> Smart Delivery
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  <Store className="w-3 h-3" /> Self Delivery (दुकान से पिकअप)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Add to cart / Qty button */}
                          <div className="mt-3">
                            {cartItem ? (
                              <div className="inline-flex items-center bg-emerald-50 border border-emerald-300 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => guardAction(() => onUpdateCartQty(product.id, -1), 'कार्ट में बदलाव करने के लिए लॉगिन करें')}
                                  className="px-2.5 py-1 text-emerald-800 font-extrabold hover:bg-emerald-200"
                                >
                                  −
                                </button>
                                <span className="px-2.5 font-extrabold text-xs text-emerald-950">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  onClick={() => guardAction(() => onUpdateCartQty(product.id, 1), 'कार्ट में बदलाव करने के लिए लॉगिन करें')}
                                  className="px-2.5 py-1 text-emerald-800 font-extrabold hover:bg-emerald-200"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => guardAction(() => onAddToCart(product), 'कार्ट में प्रोडक्ट जोड़ने के लिए लॉगिन करें')}
                                  className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
                                >
                                  कार्ट में जोड़ें
                                </button>
                                <button
                                  onClick={() => {
                                    guardAction(() => {
                                      onAddToCart(product);
                                      setIsCheckoutModalOpen(true);
                                    }, 'प्रोडक्ट ऑर्डर करने के लिए लॉगिन करें');
                                  }}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
                                >
                                  अभी बुक करें
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* MY LIVE ORDERS VIEW */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">लाइव ऑर्डर स्टेटस एवं डिलीवरी OTP</h3>
              <p className="text-amber-800 text-xs mt-0.5 font-medium">
                ऑर्डर डिलीवर होते ही अपने 4-अंकों का OTP डिलीवरी पार्टनर को दें।
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-6">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-stone-800 text-base mb-1">अभी तक कोई ऑर्डर नहीं</h3>
              <p className="text-stone-500 text-xs mb-4">शॉप कैटलॉग से अपने पसंदीदा प्रोडक्ट्स जोड़कर ऑर्डर करें!</p>
              <button
                onClick={() => onTabChange('shop')}
                className="bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm"
              >
                शॉपिंग शुरू करें
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-stone-900 text-sm">
                          Order #{order.id}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'Delivered' || order.status === 'Settlement Completed'
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        मोड: {order.deliveryMode === 'platform' ? 'Smart Delivery' : 'Self Delivery (दुकान से पिकअप)'}
                      </div>
                    </div>

                    {order.otp && order.status !== 'Delivered' && order.status !== 'Settlement Completed' && (
                      <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-2xl text-center">
                        <span className="text-[10px] font-bold uppercase text-blue-600 block">डिलीवरी OTP</span>
                        <span className="font-mono font-black text-lg text-blue-900 tracking-widest">{order.otp}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-stone-700 font-medium">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-bold text-stone-900">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 pt-2 flex justify-between font-extrabold text-stone-900 text-sm mt-2">
                      <span>कुल राशि</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {order.paymentScreenshot && (
                    <div className="pt-1">
                      <div className="text-[11px] font-bold text-stone-500 mb-1">पेमेंट स्क्रीनशॉट:</div>
                      <img
                        src={order.paymentScreenshot}
                        alt="Payment Proof"
                        className="w-24 h-24 object-cover rounded-xl border border-stone-300 shadow-xs cursor-pointer"
                        onClick={() => {
                          const w = window.open('');
                          if (w) w.document.write(`<img src="${order.paymentScreenshot}" style="max-width:100%;">`);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <h2 className="font-extrabold text-lg text-stone-900">कार्ट एवं चेकआउट</h2>
                </div>
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-stone-500">
                  आपकी कार्ट खाली है।
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Cart Items list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-10 h-10 object-cover rounded-xl"
                          />
                          <div>
                            <div className="font-bold text-xs text-stone-900 line-clamp-1">{item.product.name}</div>
                            <div className="text-[11px] text-stone-500">₹{item.product.price} / {item.product.unit}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.product.id, -1)}
                            className="w-6 h-6 bg-white border border-stone-300 rounded-lg flex items-center justify-center font-bold text-stone-700"
                          >
                            −
                          </button>
                          <span className="font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQty(item.product.id, 1)}
                            className="w-6 h-6 bg-white border border-stone-300 rounded-lg flex items-center justify-center font-bold text-stone-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Inputs */}
                  <div className="space-y-3 pt-2 border-t border-stone-200">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">ग्राहक की जानकारी</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">पूरा नाम</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="आपका नाम"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="10 अंकों का मोबाइल नंबर"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {!hasSelfOnlyItems && (
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">पूरा पता</label>
                        <textarea
                          required
                          rows={2}
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder="घर नं, गली, कॉलोनी, पिन कोड"
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    )}

                    {!hasSelfOnlyItems && (
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">भुगतान का तरीका</label>
                        <select
                          value={paymentMode}
                          onChange={e => setPaymentMode(e.target.value as 'online' | 'cod')}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="online">Online Payment (UPI)</option>
                          <option value="cod">Cash on Delivery (COD)</option>
                        </select>
                      </div>
                    )}

                    {/* Online Payment Screen Block with Screenshot Upload */}
                    {!hasSelfOnlyItems && paymentMode === 'online' && (
                      <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl space-y-2">
                        <div className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>Smart Delivery UPI ID: <strong className="font-mono text-blue-950">{SMART_DELIVERY_UPI}</strong></span>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-blue-900 mb-1">
                            पेमेंट स्क्रीनशॉट अपलोड करें
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                          />
                        </div>

                        {screenshotPreview && (
                          <div className="mt-2">
                            <img
                              src={screenshotPreview}
                              alt="Preview"
                              className="w-28 h-28 object-cover rounded-xl border border-blue-300 shadow-xs"
                            />
                          </div>
                        )}
                        <p className="text-[11px] text-blue-800 font-medium">
                          UPI ID पर भुगतान करने के बाद उसका स्क्रीनशॉट यहाँ अपलोड करें।
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-stone-100 p-3 rounded-2xl text-xs space-y-1.5 font-semibold text-stone-700">
                    <div className="flex justify-between">
                      <span>सबटोटल</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>डिलीवरी चार्ज</span>
                      <span>{deliveryFee === 0 ? <strong className="text-emerald-700">फ्री (FREE)</strong> : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="border-t border-stone-300 pt-1.5 flex justify-between text-stone-900 font-extrabold text-sm">
                      <span>कुल देय राशि</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>ऑर्डर सहेज रहा है...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ऑर्डर प्लेस करें (₹{grandTotal})</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STICKY FLOATING CART & CHECKOUT BAR */}
      {cart.length > 0 && !isCheckoutModalOpen && !placedOrderSuccessId && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40"
        >
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 text-white rounded-3xl p-3 sm:p-4 px-4 sm:px-6 shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                {(cart || []).reduce((sum, item) => sum + (item?.quantity || 1), 0)}
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm leading-tight text-white">
                  {(cart || []).reduce((sum, item) => sum + (item?.quantity || 1), 0)} आइटम्स कार्ट में
                </div>
                <div className="text-xs text-amber-300 font-black">
                  कुल राशि: ₹{grandTotal}
                </div>
              </div>
            </div>

            <button
              onClick={() => guardAction(() => setIsCheckoutModalOpen(true), 'ऑर्डर पूरा करने के लिए लॉगिन करें')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>ऑर्डर / बुक करें</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* PLACED ORDER SUCCESS MODAL */}
      <AnimatePresence>
        {placedOrderSuccessId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 mb-2">
                  ऑर्डर सफलतापूर्वक दर्ज हो गया!
                </span>
                <h2 className="text-xl font-black text-stone-900">
                  ऑर्डर आईडी: #{placedOrderSuccessId}
                </h2>
                <p className="text-stone-600 text-xs mt-1 font-medium">
                  आपका बुकिंग / ऑर्डर स्मार्ट बाजार सिस्टम में सेव हो चुका है।
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-left space-y-1 text-xs font-semibold text-stone-700">
                <div className="flex justify-between">
                  <span>ग्राहक का नाम:</span>
                  <span className="font-extrabold text-stone-900">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>मोबाइल नंबर:</span>
                  <span className="font-extrabold text-stone-900">+91 {customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>भुगतान का प्रकार:</span>
                  <span className="font-extrabold text-emerald-800 uppercase">{paymentMode}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setPlacedOrderSuccessId(null);
                    onTabChange('orders');
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-xs"
                >
                  मेरे हालिया ऑर्डर देखें (My Orders)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

