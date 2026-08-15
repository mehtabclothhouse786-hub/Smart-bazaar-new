import React, { useState } from 'react';
import { Product, CartItem, Order, Vendor, ServiceProvider, ServiceBooking, CustomerUser, OldItem, CommissionSettings, DEFAULT_COMMISSION_SETTINGS } from '../types';
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
  LogIn,
  Search,
  UserCheck,
  Package,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SMART_DELIVERY_UPI } from '../services/db';
import { ServicesPanel } from './ServicesPanel';
import { OldItemsPanel } from './OldItemsPanel';
import { shareProductToWhatsApp } from '../utils/whatsappShare';
import { Product3DIcon } from './Product3DIcon';
import { ALL_SHOP_CATEGORIES, getCategoryPhoto } from '../utils/categoryData';
import { PredictiveSearchBar } from './PredictiveSearchBar';
import { HighlightMatch } from './HighlightMatch';

interface CustomerViewProps {
  products: Product[];
  vendors: Vendor[];
  cart: CartItem[];
  commissionSettings?: CommissionSettings;
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
  activeTab: 'shop' | 'services' | 'old_items' | 'orders';
  onTabChange: (tab: 'shop' | 'services' | 'old_items' | 'orders') => void;
  services?: ServiceProvider[];
  serviceBookings?: ServiceBooking[];
  onAddService?: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  onCreateBooking?: (booking: Omit<ServiceBooking, 'id'>) => Promise<string>;
  oldItems?: OldItem[];
  onAddOldItem?: (item: Omit<OldItem, 'id'>) => Promise<string>;
  onUpdateOldItem?: (id: string, updates: Partial<OldItem>) => Promise<void>;
  onDeleteOldItem?: (id: string) => Promise<void>;
  isCartOpen?: boolean;
  onCloseCart?: () => void;
  onOpenCart?: () => void;
  customerUser?: CustomerUser | null;
  onRequireLogin?: (actionCallback: () => void, promptText?: string) => void;
  onOpenCustomerPanel?: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  products = [],
  vendors = [],
  cart = [],
  commissionSettings = DEFAULT_COMMISSION_SETTINGS,
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
  oldItems = [],
  onAddOldItem = async () => '',
  onUpdateOldItem = async () => {},
  onDeleteOldItem = async () => {},
  isCartOpen = false,
  onCloseCart,
  onOpenCart,
  customerUser,
  onRequireLogin,
  onOpenCustomerPanel
}) => {
  const [customerShopView, setCustomerShopView] = useState<'list' | 'catalog'>('list');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [selectedShopCategory, setSelectedShopCategory] = useState<string>('सभी');
  
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

  // Sync external searchQuery if passed from parent
  React.useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== shopSearchQuery) {
      setShopSearchQuery(searchQuery);
    }
  }, [searchQuery]);

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

  // Cart math with dynamic CommissionSettings
  const cartSubtotal = (cart || []).reduce((sum, item) => sum + ((item?.product?.price || 0) * (item?.quantity || 1)), 0);
  const hasPlatformItems = (cart || []).some(item => item?.product?.deliveryMode === 'platform');
  const hasSelfOnlyItems = (cart || []).length > 0 && (cart || []).every(item => item?.product?.deliveryMode === 'self');
  const baseDeliveryCharge = commissionSettings?.customerDeliveryFee ?? 40;
  const freeDeliveryThreshold = commissionSettings?.freeDeliveryThreshold ?? 500;
  const deliveryFee = hasPlatformItems ? (cartSubtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge) : 0;
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
      
      {/* Customer Header Navigation Tabs - Unified 3-in-1 Full Width Bar */}
      <div className="mb-6">
        <div className="w-full grid grid-cols-3 bg-stone-100 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-inner gap-1 sm:gap-1.5">
          
          {/* Tab 1: Shops */}
          <button
            onClick={() => onTabChange('shop')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl sm:rounded-2xl text-center transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-emerald-700 text-white shadow-md font-black scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-stone-700 font-bold hover:shadow-xs'
            }`}
          >
            <Product3DIcon size="xs" />
            <span className="text-[11px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
              दुकान <span className="hidden xs:inline">(Shop)</span>
            </span>
          </button>

          {/* Tab 2: Services */}
          <button
            onClick={() => onTabChange('services')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl sm:rounded-2xl text-center transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-blue-700 text-white shadow-md font-black scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-stone-700 font-bold hover:shadow-xs'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
              सेवाएं <span className="hidden xs:inline">(Services)</span>
            </span>
          </button>

          {/* Tab 3: Old Items */}
          <button
            onClick={() => onTabChange('old_items')}
            className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl sm:rounded-2xl text-center transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'old_items'
                ? 'bg-amber-600 text-white shadow-md font-black scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-stone-700 font-bold hover:shadow-xs'
            }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
              पुराने सामान <span className="hidden xs:inline">(Old)</span>
            </span>
          </button>

        </div>
      </div>

      {activeTab === 'old_items' ? (
        <OldItemsPanel
          oldItems={oldItems}
          onAddOldItem={onAddOldItem}
          onUpdateOldItem={onUpdateOldItem}
          onDeleteOldItem={onDeleteOldItem}
          customerUser={customerUser}
          onRequireLogin={onRequireLogin}
          isAdmin={false}
        />
      ) : activeTab === 'services' ? (
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
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-md relative overflow-hidden flex items-center justify-between gap-4">
                <div className="relative z-10 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-950/70 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>हर दुकान आपके पास — Smart Express Delivery</span>
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                    अपने शहर की प्रसिद्ध दुकानों से खरीदारी करें
                  </h1>
                  <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
                    दुकान चुनें, 3D प्रोडक्ट कैटलॉग देखें और सीधा ऑर्डर करें!
                  </p>
                </div>
                <div className="hidden sm:block shrink-0">
                  <Product3DIcon size="xl" animate withBadge badgeText="3D" />
                </div>
              </div>

              {/* Predictive Search Bar with Auto-complete & Real-time Suggestions */}
              <div className="mb-5">
                <PredictiveSearchBar
                  value={shopSearchQuery}
                  onChange={setShopSearchQuery}
                  products={products}
                  vendors={vendors}
                  onSelectProduct={(product) => {
                    const vendor = vendors.find(v => v.id === product.vendorId || v.shopName === product.vendorName);
                    if (vendor) {
                      setSelectedVendorId(vendor.id);
                      setCustomerShopView('catalog');
                    }
                  }}
                  onSelectCategory={(category) => {
                    setSelectedShopCategory(category);
                  }}
                  onSelectVendor={(vendor) => {
                    setSelectedVendorId(vendor.id);
                    setCustomerShopView('catalog');
                  }}
                  onAddToCart={(product) => {
                    guardAction(() => onAddToCart(product), 'कार्ट में प्रोडक्ट जोड़ने के लिए लॉगिन करें');
                  }}
                  placeholder="सामान, दुकान का नाम, राशन, कपड़ा, इलेक्ट्रॉनिक्स या कैटेगरी खोजें..."
                />
              </div>

              {/* Active Search Filter Badge */}
              {shopSearchQuery.trim() && (
                <div className="mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>सर्च परिणाम:</span>
                    <span className="bg-emerald-800 text-white px-2 py-0.5 rounded-lg font-black">
                      "{shopSearchQuery}"
                    </span>
                    {selectedShopCategory !== 'सभी' && (
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        (श्रेणी: {selectedShopCategory})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShopSearchQuery('');
                      setSelectedShopCategory('सभी');
                    }}
                    className="text-xs font-extrabold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>सर्च हटाएं</span>
                  </button>
                </div>
              )}

              {/* Visual Category Showcase Cards */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏪 सभी श्रेणियां (Categories)</span>
                  </h2>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    {ALL_SHOP_CATEGORIES.length} श्रेणियां
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  <button
                    onClick={() => setSelectedShopCategory('सभी')}
                    className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedShopCategory === 'सभी'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-stone-50 shadow-2xs'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm">
                      ALL
                    </div>
                    <span className="text-[11px] font-extrabold leading-tight">सभी दुकानें</span>
                  </button>

                  {ALL_SHOP_CATEGORIES.map((cat) => {
                    const isSelected = selectedShopCategory === cat.hindiName || selectedShopCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedShopCategory(cat.hindiName)}
                        className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-stone-50 shadow-2xs'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-200 relative shrink-0">
                          <img
                            src={cat.imageUrl}
                            alt={cat.hindiName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-[11px] font-extrabold leading-tight line-clamp-1">
                          {cat.hindiName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE MATCHED PRODUCTS WHEN SEARCHING */}
              {(() => {
                const q = shopSearchQuery.trim().toLowerCase();
                if (!q) return null;

                const liveMatchedProducts = products.filter(p => {
                  // Category filter if active
                  if (selectedShopCategory !== 'सभी') {
                    const selCat = selectedShopCategory.toLowerCase();
                    const pCat = (p.category || '').toLowerCase();
                    const vendor = vendors.find(v => v.id === p.vendorId || v.shopName === p.vendorName);
                    const vCat = (vendor?.category || '').toLowerCase();
                    if (!pCat.includes(selCat) && !vCat.includes(selCat)) return false;
                  }

                  const nameMatch = p.name.toLowerCase().includes(q);
                  const catMatch = (p.category || '').toLowerCase().includes(q);
                  const descMatch = (p.description || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q);
                  const vNameMatch = (p.vendorName || '').toLowerCase().includes(q);
                  const vendor = vendors.find(v => v.id === p.vendorId || v.shopName === p.vendorName);
                  const vCatMatch = (vendor?.category || '').toLowerCase().includes(q);
                  return nameMatch || catMatch || descMatch || vNameMatch || vCatMatch;
                });

                if (liveMatchedProducts.length === 0) return null;

                return (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3.5">
                      <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                        <span className="w-2 h-5 bg-amber-500 rounded-full inline-block" />
                        <span>🎯 खोजे गए प्रोडक्ट्स ({liveMatchedProducts.length} उपलब्ध)</span>
                      </h2>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        सीधा ऑर्डर करें
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {liveMatchedProducts.map(product => {
                        const cartItem = (cart || []).find(ci => ci?.product?.id === product.id);
                        const vendor = vendors.find(v => v.id === product.vendorId || v.shopName === product.vendorName);
                        const vendorCategory = vendor?.category || product.category || 'General';

                        return (
                          <div
                            key={product.id}
                            className="bg-white border-2 border-emerald-300 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="flex gap-3.5">
                              <img
                                src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                                alt={product.name}
                                className="w-20 h-20 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                              />

                              <div className="flex-1 min-w-0">
                                <h3 className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-2">
                                  <HighlightMatch text={product.name} query={shopSearchQuery} />
                                </h3>

                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <HighlightMatch text={vendorCategory} query={shopSearchQuery} />
                                  </span>
                                  <span className="text-[11px] text-stone-500 truncate font-medium">
                                    🏪 <HighlightMatch text={product.vendorName} query={shopSearchQuery} />
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="font-extrabold text-emerald-800 text-base">
                                    ₹{product.price}
                                  </span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-stone-400 line-through">
                                      ₹{product.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
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
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => guardAction(() => onAddToCart(product), 'कार्ट में प्रोडक्ट जोड़ने के लिए लॉगिन करें')}
                                    className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
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
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                                  >
                                    अभी बुक करें
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => shareProductToWhatsApp(product)}
                                className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[11px] rounded-xl border border-[#25D366]/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                title="व्हाट्सएप स्टेटस पर शेयर करें"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-600 rounded-full inline-block" />
                  <span>उपलब्ध दुकानें ({vendors.filter(v => {
                    const vProducts = products.filter(p => p.vendorId === v.id || p.vendorName === v.shopName);
                    
                    // Category Chip Filter
                    if (selectedShopCategory !== 'सभी') {
                      const selCat = selectedShopCategory.toLowerCase();
                      const vCat = (v.category || '').toLowerCase();
                      const hasProdCat = vProducts.some(p => (p.category || '').toLowerCase().includes(selCat));
                      if (!vCat.includes(selCat) && !hasProdCat) return false;
                    }

                    // Search Query Filter
                    if (!shopSearchQuery.trim()) return true;
                    const q = shopSearchQuery.toLowerCase().trim();
                    return v.shopName.toLowerCase().includes(q) ||
                           (v.address && v.address.toLowerCase().includes(q)) ||
                           (v.category && v.category.toLowerCase().includes(q)) ||
                           vProducts.some(p => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
                  }).length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.filter(v => {
                  const vProducts = products.filter(p => p.vendorId === v.id || p.vendorName === v.shopName);
                  
                  // Category Chip Filter
                  if (selectedShopCategory !== 'सभी') {
                    const selCat = selectedShopCategory.toLowerCase();
                    const vCat = (v.category || '').toLowerCase();
                    const hasProdCat = vProducts.some(p => (p.category || '').toLowerCase().includes(selCat));
                    if (!vCat.includes(selCat) && !hasProdCat) return false;
                  }

                  // Search Query Filter
                  if (!shopSearchQuery.trim()) return true;
                  const q = shopSearchQuery.toLowerCase().trim();
                  return v.shopName.toLowerCase().includes(q) ||
                         (v.address && v.address.toLowerCase().includes(q)) ||
                         (v.category && v.category.toLowerCase().includes(q)) ||
                         vProducts.some(p => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)));
                }).map(v => {
                  const vProducts = products.filter(p => p.vendorId === v.id || p.vendorName === v.shopName);
                  const categories = Array.from(new Set(vProducts.map(p => p.category)));
                  const shopPhoto = getCategoryPhoto(v.category, v.shopName, v.id, v.imageUrl);

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
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-emerald-700 shrink-0 overflow-hidden shadow-xs">
                        {shopPhoto ? (
                          <img src={shopPhoto} alt={v.shopName} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-stone-900 text-base leading-snug truncate">
                          <HighlightMatch text={v.shopName} query={shopSearchQuery} />
                        </h3>
                        <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                          <HighlightMatch text={categories.length > 0 ? categories.join(', ') : v.category} query={shopSearchQuery} />
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            {vProducts.length} प्रोडक्ट उपलब्ध
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500 truncate max-w-[140px]">
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
                        className="shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
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
              {/* SINGLE VENDOR CATALOG HEADER */}
              <div className="flex items-center justify-between gap-3 mb-6 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCustomerShopView('list');
                      setSelectedVendorId(null);
                    }}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-2xl text-stone-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>सभी दुकानें</span>
                  </button>

                  <div className="w-12 h-12 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                    <img
                      src={selectedVendor ? getCategoryPhoto(selectedVendor.category, selectedVendor.shopName, selectedVendor.id, selectedVendor.imageUrl) : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                      alt={selectedVendor?.shopName || 'Store'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="font-black text-stone-900 text-base sm:text-lg leading-tight flex items-center gap-2">
                      <span>{selectedVendor ? selectedVendor.shopName : 'दुकान कैटलॉग'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        <HighlightMatch text={selectedVendor?.category || 'General'} query={shopSearchQuery} />
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {selectedVendor?.address && <span>{selectedVendor.address} • </span>}
                      {products.filter(p => p.vendorId === selectedVendorId || p.vendorName === selectedVendor?.shopName).length} 3D प्रोडक्ट उपलब्ध
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <Product3DIcon size="md" animate withBadge badgeText="3D" />
                </div>
              </div>

              {/* Single Vendor Catalog Search Bar */}
              <div className="mb-5">
                <PredictiveSearchBar
                  value={shopSearchQuery}
                  onChange={setShopSearchQuery}
                  products={products.filter(p => p.vendorId === selectedVendorId || p.vendorName === selectedVendor?.shopName)}
                  vendors={selectedVendor ? [selectedVendor] : []}
                  onSelectProduct={(product) => {
                    // product is in current vendor
                  }}
                  onAddToCart={(product) => {
                    guardAction(() => onAddToCart(product), 'कार्ट में प्रोडक्ट जोड़ने के लिए लॉगिन करें');
                  }}
                  placeholder={`इस दुकान में सामान या कैटेगरी खोजें (${selectedVendor?.shopName || ''})...`}
                />
              </div>

              {/* Products in this vendor's catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter(p => p.vendorId === selectedVendorId || p.vendorName === selectedVendor?.shopName)
                  .filter(p => {
                    if (!shopSearchQuery.trim()) return true;
                    const q = shopSearchQuery.toLowerCase().trim();
                    return p.name.toLowerCase().includes(q) ||
                           (p.category && p.category.toLowerCase().includes(q)) ||
                           (p.description && p.description.toLowerCase().includes(q)) ||
                           (p.shortDescription && p.shortDescription.toLowerCase().includes(q));
                  })
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
                              <HighlightMatch text={product.name} query={shopSearchQuery} />
                            </h3>
                            {(product.shortDescription || product.description) && (
                              <p className="text-[11px] text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold inline-block mt-0.5 line-clamp-1 border border-emerald-100">
                                {product.shortDescription || product.description}
                              </p>
                            )}
                            <p className="text-xs text-stone-500 line-clamp-1 font-medium mt-0.5">
                              श्रेणी: <HighlightMatch text={product.category || 'General'} query={shopSearchQuery} />
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

                          {/* Add to cart / Qty button & WhatsApp Status Share */}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => guardAction(() => onAddToCart(product), 'कार्ट में प्रोडक्ट जोड़ने के लिए लॉगिन करें')}
                                  className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
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
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                  अभी बुक करें
                                </button>
                              </div>
                            )}

                            {/* WhatsApp Status Share Button */}
                            <button
                              type="button"
                              onClick={() => shareProductToWhatsApp(product)}
                              className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[11px] rounded-xl border border-[#25D366]/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                              title="व्हाट्सएप स्टेटस पर शेयर करें"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp स्टेटस</span>
                            </button>
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
          {(() => {
            const myOrders = orders.filter(o => {
              if (!customerUser) return false;
              const cleanCustomerPhone = (customerUser.phone || '').replace(/\D/g, '').slice(-10);
              const cleanOrderPhone = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
              const phoneMatch = Boolean(cleanCustomerPhone && cleanOrderPhone && cleanCustomerPhone === cleanOrderPhone);
              const nameMatch = Boolean(o.customerName && customerUser.name && o.customerName.trim().toLowerCase() === customerUser.name.trim().toLowerCase());
              return phoneMatch || nameMatch;
            });

            if (!customerUser?.isLoggedIn) {
              return (
                <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 my-4 space-y-3">
                  <UserCheck className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="font-extrabold text-stone-800 text-base">अपने खाते के ऑर्डर देखें</h3>
                  <p className="text-stone-500 text-xs">अपने मोबाइल नंबर से लॉगिन करें और अपने सभी ऑर्डर का लाइव स्टेटस देखें!</p>
                  <button
                    onClick={() => onRequireLogin ? onRequireLogin(() => {}, 'अपने ऑर्डर देखने के लिए लॉगिन करें') : null}
                    className="bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-emerald-800 transition-colors"
                  >
                    लॉगिन करें (Login Now)
                  </button>
                </div>
              );
            }

            if (myOrders.length === 0) {
              return (
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
              );
            }

            return (
              <div className="space-y-4">
                {myOrders.map(order => {
                  const isDelivered = order.status === 'Delivered' || order.status === 'Settlement Completed';
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-stone-900 text-sm">
                              Order #{order.id}
                            </span>
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : isCancelled
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-800 text-white shadow-2xs'
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                              {order.deliveryMode === 'platform' ? '🚚 स्मार्ट डिलीवरी' : '🏪 दुकान से पिकअप'}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
                            <span>तारीख: {new Date(order.createdAt || Date.now()).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {order.vendorName && <span className="text-stone-700 font-bold">• दुकान: {order.vendorName}</span>}
                          </div>
                        </div>

                        {order.otp && !isDelivered && !isCancelled && (
                          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white border border-emerald-700 px-4 py-2 rounded-2xl text-center shadow-xs">
                            <span className="text-[9px] font-black uppercase text-amber-300 block tracking-wider">डिलीवरी OTP</span>
                            <span className="font-mono font-black text-xl text-white tracking-widest">{order.otp}</span>
                          </div>
                        )}
                      </div>

                      {/* Estimated Delivery Time Banner */}
                      {!isDelivered && !isCancelled && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs font-extrabold text-emerald-950">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>संभावित डिलीवरी: {order.deliveryMode === 'platform' ? '25-40 मिनट में आपके पते पर' : '30 मिनट में दुकान पर तैयार'}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-black">लाइव स्टेटस</span>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-2 bg-stone-50 rounded-2xl p-3 border border-stone-200">
                        <div className="text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1">
                          ऑर्डर किए गए प्रोडक्ट्स (Purchased Items)
                        </div>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-2xs">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.product.imageUrl ? (
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 font-bold text-xs shrink-0">
                                  📦
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-stone-900 text-xs truncate">
                                  {item.product.name}
                                </h5>
                                <div className="text-[11px] font-medium text-stone-500">
                                  ₹{item.product.price} × {item.quantity} {item.product.unit || 'इकाई'}
                                </div>
                              </div>
                            </div>
                            <span className="font-black text-stone-900 text-xs shrink-0">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        ))}

                        {/* Bill Total Breakdown */}
                        <div className="border-t border-stone-200 pt-2 space-y-1 text-xs font-semibold text-stone-700">
                          {order.deliveryCharge !== undefined && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span>डिलीवरी शुल्क (Delivery Charge)</span>
                              <span>{order.deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">मुफ्त (Free)</span> : `₹${order.deliveryCharge}`}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center font-black text-stone-900 text-sm pt-1 border-t border-stone-200">
                            <span>कुल भुगतान राशि</span>
                            <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        <div>
                          <span className="font-bold text-stone-800">डिलिवरी पता: </span>
                          <span>{order.deliveryAddress || customerUser?.address || 'स्टोर पिकअप / डिफ़ॉल्ट पता'}</span>
                        </div>
                        {order.paymentScreenshot && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-500">पेमेंट रसीद:</span>
                            <img
                              src={order.paymentScreenshot}
                              alt="Payment Proof"
                              className="w-8 h-8 object-cover rounded-lg border border-stone-300 shadow-2xs cursor-pointer"
                              onClick={() => {
                                const w = window.open('');
                                if (w) w.document.write(`<img src="${order.paymentScreenshot}" style="max-width:100%;">`);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
                    if (onOpenCustomerPanel) {
                      onOpenCustomerPanel();
                    } else {
                      onTabChange('orders');
                    }
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-xs cursor-pointer"
                >
                  कस्टमर पैनल में ऑर्डर देखें (View Order in Customer Panel)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

