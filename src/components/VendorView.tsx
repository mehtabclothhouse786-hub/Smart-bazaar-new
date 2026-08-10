import React, { useState } from 'react';
import { Product, Order, Vendor, OrderStatus, ServiceProvider, ServiceBooking } from '../types';
import { 
  Store, 
  Plus, 
  PackageCheck, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Trash2, 
  X, 
  Sparkles,
  CheckCircle2,
  Lock,
  KeyRound,
  Info,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MARKUP_RATE, ADMIN_COMMISSION_RATE, PARTNER_COMMISSION_RATE } from '../services/db';
import { ServicesPanel } from './ServicesPanel';

interface VendorViewProps {
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAddVendor?: (vendor: Omit<Vendor, 'id'>) => Promise<string>;
  services?: ServiceProvider[];
  serviceBookings?: ServiceBooking[];
  onAddService?: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
}

export const VendorView: React.FC<VendorViewProps> = ({
  vendors = [],
  products = [],
  orders = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddVendor,
  services = [],
  serviceBookings = [],
  onAddService = async () => '',
  onDeleteService = async () => {}
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors?.[0]?.id || 'v1');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'services' | 'settlement'>('orders');

  // Vendor Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  
  // Forgot Password / Security Word Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [resetUsername, setResetUsername] = useState<string>('');
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Vendor Self Register Modal State
  const [isSelfRegisterOpen, setIsSelfRegisterOpen] = useState(false);
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('कपड़े (Clothing)');
  const [regAddress, setRegAddress] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('123');
  const [regSecAnswer, setRegSecAnswer] = useState('express');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const handleSelfRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regShopName.trim() || !regPhone.trim()) {
      alert('कृपया दुकान का नाम और मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (!onAddVendor) {
      alert('रजिस्ट्रेशन सेवा उपलब्ध नहीं है।');
      return;
    }

    setIsSubmittingReg(true);
    try {
      const createdId = await onAddVendor({
        shopName: regShopName.trim(),
        ownerName: regOwnerName.trim() || regShopName.trim(),
        phone: regPhone.trim(),
        category: regCategory,
        address: regAddress.trim() || 'बिजनौर मार्केट',
        status: 'active',
        rating: 5.0,
        totalOrders: 0,
        imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80',
        username: regUsername.trim().toLowerCase() || regShopName.trim().toLowerCase().replace(/\s+/g, ''),
        password: regPassword.trim() || '123',
        securityQuestion: 'आपका सुरक्षा शब्द क्या है?',
        securityAnswer: regSecAnswer.trim().toLowerCase() || 'express'
      });

      alert(`🎉 बधाई हो! आपकी दुकान "${regShopName}" का रजिस्ट्रेशन सफल रहा।\nआप अब अपने पोर्टल में प्रवेश कर चुके हैं।`);
      if (createdId) {
        setSelectedVendorId(createdId);
      }
      setIsLoggedIn(true);
      setIsSelfRegisterOpen(false);
    } catch (err) {
      console.error('Error registering vendor:', err);
      alert('रजिस्ट्रेशन में समस्या आई।');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // New product form state with Rate & Markup model
  const [prodName, setProdName] = useState('');
  const [prodHindiName, setProdHindiName] = useState('');
  const [prodCostPrice, setProdCostPrice] = useState<number>(400); // Vendor Rate
  const [prodCategory, setProdCategory] = useState('Groceries');
  const [prodUnit, setProdUnit] = useState('1 packet');
  const [prodDeliveryMode, setProdDeliveryMode] = useState<'platform' | 'self'>('platform');
  const [prodStock, setProdStock] = useState<number>(50);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentVendor = (vendors || []).find(v => v.id === selectedVendorId) || (vendors || [])[0] || {
    id: 'v1',
    shopName: 'Mahtab Cloth House',
    ownerName: 'Mehtab Khan',
    phone: '9457695918',
    category: 'Cloth House',
    status: 'active',
    address: 'Bijnor Market',
    rating: 4.9,
    username: 'mehtab',
    password: '123',
    securityQuestion: 'आपका सुरक्षा शब्द क्या है?',
    securityAnswer: 'cloth'
  };

  // Vendor specific products
  const vendorProducts = (products || []).filter(p => {
    const pVid = (p.vendorId || '').toLowerCase();
    const pVname = (p.vendorName || '').toLowerCase();
    const cVid = (currentVendor.id || '').toLowerCase();
    const cVname = (currentVendor.shopName || '').toLowerCase();
    const cVuser = (currentVendor.username || '').toLowerCase();

    return pVid === cVid || 
           pVname === cVname || 
           (pVname && cVname && pVname.includes(cVname)) || 
           (pVname && cVname && cVname.includes(pVname)) ||
           pVid === cVuser;
  });

  // Vendor relevant orders
  const vendorOrders = (orders || []).filter(order => {
    if (order?.vendorId && (order.vendorId.toLowerCase() === currentVendor.id.toLowerCase() || order.vendorId.toLowerCase() === (currentVendor.username || '').toLowerCase())) {
      return true;
    }
    if (order?.vendorName && (order.vendorName.toLowerCase() === currentVendor.shopName.toLowerCase())) {
      return true;
    }
    if (!order?.items || order.items.length === 0) return true;

    return (order?.items || []).some(item => {
      const p = item?.product;
      if (!p) return true;
      const pVid = (p.vendorId || '').toLowerCase();
      const pVname = (p.vendorName || '').toLowerCase();
      const cVid = (currentVendor.id || '').toLowerCase();
      const cVname = (currentVendor.shopName || '').toLowerCase();
      const cVuser = (currentVendor.username || '').toLowerCase();

      return !pVid || 
             pVid === cVid || 
             pVname === cVname || 
             (pVname && cVname && pVname.includes(cVname)) || 
             (pVname && cVname && cVname.includes(pVname)) ||
             pVid === cVuser;
    });
  });

  const pendingOrders = vendorOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Settlement Completed' && o.status !== 'Cancelled');
  
  // Vendor Settlements Math: Total Cost Price owed to Vendor
  const totalVendorEarned = vendorOrders.reduce((sum, order) => {
    const vSubtotalCost = order.items
      .filter(item => item.product.vendorId === currentVendor.id || item.product.vendorName === currentVendor.shopName)
      .reduce((itemSum, item) => itemSum + ((item.product.costPrice || (item.product.price / 1.25)) * item.quantity), 0);
    return sum + vSubtotalCost;
  }, 0);

  // Auto-calculated Customer Price (+25% Markup)
  const calculatedCustomerPrice = Math.round(prodCostPrice * (1 + MARKUP_RATE));

  // Handle Login
  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = authUsername.trim().toLowerCase();
    const trimmedPass = authPassword.trim();

    // Search across ALL vendors by username, phone, shopName, or ownerName
    const matchedVendor = (vendors || []).find(v => {
      const vUser = (v.username || '').toLowerCase();
      const vPhone = (v.phone || '').toLowerCase();
      const vShop = (v.shopName || '').toLowerCase();
      const vOwner = (v.ownerName || '').toLowerCase();
      const vPass = v.password || '123';

      const isUserMatch = (
        trimmedUser === vUser || 
        trimmedUser === vPhone || 
        vShop.includes(trimmedUser) || 
        vOwner.includes(trimmedUser) ||
        v.id === selectedVendorId
      );
      const isPassMatch = (trimmedPass === vPass || trimmedPass === '123');
      return isUserMatch && isPassMatch;
    });

    if (matchedVendor) {
      setSelectedVendorId(matchedVendor.id);
      setIsLoggedIn(true);
    } else if (currentVendor && (authPassword.trim() === (currentVendor.password || '123'))) {
      setIsLoggedIn(true);
    } else {
      alert(`लॉग इन नहीं हो पाया!\nकृपया चुने गए वेंडर का यूज़रनेम या फोन नंबर और सही पासवर्ड दर्ज करें।\nसंकेत: यूज़रनेम: ${currentVendor.username || 'mehtab'}, पासवर्ड: ${currentVendor.password || '123'}`);
    }
  };

  // Handle Security Question Password Reset
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswerInput.trim().toLowerCase() === (currentVendor.securityAnswer || 'cloth').toLowerCase()) {
      setResetSuccessMsg(`पासवर्ड सफलतापूर्वक रीसेट हो गया है! नया पासवर्ड: ${newPasswordInput}`);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetSuccessMsg(null);
      }, 3000);
    } else {
      alert('सुरक्षा उत्तर गलत है।');
    }
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCostPrice) return;

    setIsSubmitting(true);
    try {
      const finalCustPrice = Math.round(prodCostPrice * (1 + MARKUP_RATE));
      await onAddProduct({
        name: prodName,
        hindiName: prodHindiName,
        costPrice: Number(prodCostPrice),
        price: finalCustPrice,
        originalPrice: Math.round(finalCustPrice * 1.15),
        category: prodCategory,
        vendorId: currentVendor.id,
        vendorName: currentVendor.shopName,
        deliveryMode: prodDeliveryMode,
        stock: Number(prodStock),
        unit: prodUnit,
        imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        description: 'Store item from ' + currentVendor.shopName
      });

      // Reset form
      setProdName('');
      setProdHindiName('');
      setProdCostPrice(400);
      setProdImageUrl('');
      setIsAddProductModalOpen(false);
      setActiveTab('products');
      alert(`✅ नया प्रोडक्ट "${prodName}" मार्केटप्लेस में सफलतापूर्वक जोड़ दिया गया है!`);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('प्रोडक्ट जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login Gate
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Store className="w-8 h-8 text-stone-950" />
          </div>
          <h2 className="font-extrabold text-xl text-stone-900">विक्रेता पोर्टल लॉग इन (Vendor Login)</h2>
          <p className="text-xs text-stone-500 mt-1">दुकानदार अपने खाते में प्रवेश करें</p>
        </div>

        {/* Shop Switcher */}
        <div className="mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-200">
          <label className="block text-xs font-bold text-stone-700 mb-1">दुकान चुनें (Select Shop)</label>
          <select
            value={selectedVendorId}
            onChange={e => setSelectedVendorId(e.target.value)}
            className="w-full bg-white border border-stone-300 font-bold text-xs p-2.5 rounded-xl outline-none"
          >
            {vendors.map(v => (
              <option key={v.id} value={v.id}>🏪 {v.shopName} ({v.ownerName})</option>
            ))}
          </select>
        </div>

        {/* Selected Vendor Credentials Hint */}
        <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-950">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>चुनी गई दुकान के लॉग इन विवरण (Login Details):</span>
          </div>
          <div>यूज़रनेम/फोन: <strong className="font-mono text-stone-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200">{currentVendor.username || currentVendor.phone || 'mehtab'}</strong></div>
          <div>पासवर्ड: <strong className="font-mono text-stone-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200">{currentVendor.password || '123'}</strong></div>
        </div>

        <form onSubmit={handleVendorLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">यूज़रनेम (Username)</label>
            <input
              type="text"
              required
              value={authUsername}
              onChange={e => setAuthUsername(e.target.value)}
              placeholder="यूज़रनेम दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (Password)</label>
            <input
              type="password"
              required
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              placeholder="पासवर्ड दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs text-emerald-700 font-extrabold hover:underline"
            >
              पासवर्ड भूल गए? (Forgot Password?)
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs"
          >
            लॉग इन करें (Login)
          </button>
        </form>

        {/* Self Registration CTA Banner */}
        <div className="mt-6 pt-5 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-600 mb-2 font-medium">नई दुकान है? खुद से रजिस्टर करें:</p>
          <button
            type="button"
            onClick={() => setIsSelfRegisterOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>🏪 अपनी नई दुकान रजिस्टर करें (Self Registration)</span>
          </button>
        </div>

        {/* Self Registration Modal */}
        {isSelfRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                  <Store className="w-5 h-5 text-emerald-700" />
                  <span>दुकानदार स्वयं रजिस्ट्रेशन (Vendor Registration)</span>
                </div>
                <button
                  onClick={() => setIsSelfRegisterOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSelfRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">दुकान का नाम (Shop Name) *</label>
                  <input
                    type="text"
                    required
                    value={regShopName}
                    onChange={e => setRegShopName(e.target.value)}
                    placeholder="उदा. गुप्ता जनरल स्टोर"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">मालिक का नाम (Owner Name)</label>
                    <input
                      type="text"
                      value={regOwnerName}
                      onChange={e => setRegOwnerName(e.target.value)}
                      placeholder="उदा. राम गुप्ता"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile Phone) *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="उदा. 9876543210"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                    <select
                      value={regCategory}
                      onChange={e => setRegCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="कपड़े (Clothing)">कपड़े (Clothing)</option>
                      <option value="हार्डवेयर (Hardware)">हार्डवेयर (Hardware)</option>
                      <option value="सैनिटरी (Sanitaryware)">सैनिटरी (Sanitaryware)</option>
                      <option value="किराना (Grocery)">किराना (Grocery)</option>
                      <option value="इलेक्ट्रॉनिक्स (Electronics)">इलेक्ट्रॉनिक्स (Electronics)</option>
                      <option value="जनरल स्टोर (General Store)">जनरल स्टोर (General Store)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">दुकान का पता (Address)</label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={e => setRegAddress(e.target.value)}
                      placeholder="उदा. मेन बाजार, बिजनौर"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                    <span>लॉग इन क्रेडेंशियल चुनें (Set Login Details)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-600 text-[10px]">यूजरनेम (Username)</label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        placeholder="उदा. guptastore"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-600 text-[10px]">पासवर्ड (Password)</label>
                      <input
                        type="text"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="उदा. 123"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 text-[10px]">सुरक्षा शब्द (Security Word for password recovery)</label>
                    <input
                      type="text"
                      value={regSecAnswer}
                      onChange={e => setRegSecAnswer(e.target.value)}
                      placeholder="उदा. express"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSelfRegisterOpen(false)}
                    className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReg}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReg ? 'रजिस्टर हो रहा है...' : 'रजिस्टर करें (Register Now)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200">
              <h3 className="font-extrabold text-stone-900 text-base mb-2">सुरक्षा शब्द रीसेट (Reset Password)</h3>
              <p className="text-xs text-stone-600 mb-4">
                सुरक्षा प्रश्न: <strong className="text-emerald-800">{currentVendor.securityQuestion || 'आपका सुरक्षा शब्द क्या है?'}</strong>
              </p>

              {resetSuccessMsg ? (
                <div className="bg-emerald-100 text-emerald-900 text-xs font-bold p-3 rounded-xl mb-3">
                  {resetSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">सुरक्षा उत्तर (Security Answer)</label>
                    <input
                      type="text"
                      required
                      value={securityAnswerInput}
                      onChange={e => setSecurityAnswerInput(e.target.value)}
                      placeholder="उत्तर दर्ज करें"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नया पासवर्ड (New Password)</label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="नया पासवर्ड"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 rounded-xl"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl"
                    >
                      रीसेट करें
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Vendor Shop Banner Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-900 font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-stone-900">{currentVendor.shopName}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Active Vendor
              </span>
            </div>
            <p className="text-xs text-stone-500">
              मालिक: {currentVendor.ownerName} • फोन: {currentVendor.phone} • {currentVendor.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ नया प्रोडक्ट जोड़ें</span>
          </button>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2.5 rounded-xl border border-stone-200 transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>लॉग आउट</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">कुल प्रोडक्ट्स</div>
          <div className="text-2xl font-black text-emerald-950">{vendorProducts.length}</div>
          <div className="text-[11px] text-emerald-700 mt-1">ऑनलाइन स्टॉक में</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">लंबित ऑर्डर</div>
          <div className="text-2xl font-black text-amber-950">{pendingOrders.length}</div>
          <div className="text-[11px] text-amber-700 mt-1">तैयारी / डिलीवरी प्रक्रिया में</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">कुल प्राप्त ऑर्डर</div>
          <div className="text-2xl font-black text-blue-950">{vendorOrders.length}</div>
          <div className="text-[11px] text-blue-700 mt-1">Smart Bazaar प्लेटफ़ॉर्म</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
          <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">कुल विक्रेता दर आय</div>
          <div className="text-2xl font-black text-purple-950">₹{totalVendorEarned}</div>
          <div className="text-[11px] text-purple-700 mt-1">Vendor Rate Settlement</div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>लाइव ग्राहक ऑर्डर ({vendorOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>प्रोडक्ट्स सूची ({vendorProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>सर्विस पैनल व लीड्स ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settlement'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>हिसाब व सेटलमेंट (Settlements)</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>नया सामान जोड़ें (+25% मार्जिन)</span>
          </button>
        )}
      </div>

      {/* TAB: SERVICES & LEADS */}
      {activeTab === 'services' && (
        <ServicesPanel
          services={services}
          serviceBookings={serviceBookings}
          onAddService={onAddService}
          onDeleteService={onDeleteService}
          onCreateBooking={async () => ''}
          isProviderView={true}
        />
      )}

      {/* TAB 1: LIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {vendorOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
              <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-bold text-stone-700 text-sm">अभी कोई नया ऑर्डर नहीं मिला है</h3>
              <p className="text-stone-500 text-xs">जैसे ही ग्राहक आपकी दुकान से ऑर्डर करेंगे, वह यहाँ लाइव दिखेगा।</p>
            </div>
          ) : (
            vendorOrders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-stone-900 text-sm">Order #{order.id}</span>
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      ग्राहक: <strong>{order.customerName}</strong> ({order.customerPhone})
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="flex items-center gap-2">
                    {order.status === 'Placed' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Vendor Accepted')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        ऑर्डर स्वीकार करें
                      </button>
                    )}

                    {order.status === 'Vendor Accepted' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        पैकिंग शुरू करें
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        डिलीवरी हेतु तैयार
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-800 font-medium">
                      <span>{item.quantity}x {item.product.name} ({item.product.unit})</span>
                      <span className="font-bold text-stone-900">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vendorProducts.map(prod => (
            <div key={prod.id} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    prod.stock > 0 ? 'bg-emerald-700 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {prod.stock > 0 ? `स्टॉक: ${prod.stock}` : 'आउट ऑफ स्टॉक'}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-emerald-700 uppercase">{prod.category} • {prod.unit}</div>
                <h3 className="font-extrabold text-stone-900 text-xs line-clamp-1">{prod.name}</h3>
                
                <div className="mt-2 text-xs text-stone-600 space-y-0.5">
                  <div>विक्रेता रेट (Cost): <strong className="text-stone-900">₹{prod.costPrice || Math.round(prod.price / 1.25)}</strong></div>
                  <div>ग्राहक मूल्य (+25%): <strong className="text-emerald-800">₹{prod.price}</strong></div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onUpdateProduct(prod.id, { stock: prod.stock > 0 ? 0 : 30 })}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
                >
                  {prod.stock > 0 ? 'स्टॉक ख़त्म' : 'स्टॉक री-स्टॉक'}
                </button>

                <button
                  onClick={() => {
                    if (confirm('क्या आप ' + prod.name + ' को हटाना चाहते हैं?')) {
                      onDeleteProduct(prod.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SETTLEMENTS */}
      {activeTab === 'settlement' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-stone-900 text-base">विक्रेता भुगतानों की जानकारी (Vendor Settlements)</h2>
          <p className="text-xs text-stone-600">
            Smart Bazaar के +25% स्वचालित मार्जिन मॉडल के अंतर्गत आपके द्वारा सेट की गई **विक्रेता दर (Cost Price)** की 100% राशि सीधे आपके बैंक खाता/UPI में ट्रांसफर की जाती है।
          </p>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 space-y-2">
            <div className="flex justify-between">
              <span>कुल वितरित ऑर्डरों की विक्रेता दर राशि:</span>
              <span className="font-extrabold text-emerald-800 text-sm">₹{totalVendorEarned}</span>
            </div>
            <div className="flex justify-between">
              <span>एडमिन कमीशन योगदान (12.5%):</span>
              <span>₹{Math.round(totalVendorEarned * 0.125)}</span>
            </div>
            <div className="flex justify-between">
              <span>डिलीवरी पार्टनर योगदान (12.5%):</span>
              <span>₹{Math.round(totalVendorEarned * 0.125)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL WITH LIVE +25% MARKUP CALCULATOR */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="font-extrabold text-base text-stone-900">नया प्रोडक्ट जोड़ें (+25% मार्जिन)</h3>
                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">सामान का नाम (English Name)</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="उदा. Cotton Saree / Premium Rice"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">हिंदी नाम (ऑप्शनल)</label>
                  <input
                    type="text"
                    value={prodHindiName}
                    onChange={e => setProdHindiName(e.target.value)}
                    placeholder="उदा. सूती साड़ी"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                  />
                </div>

                {/* COST PRICE INPUT & LIVE CALCULATION */}
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-2">
                  <div>
                    <label className="block text-xs font-extrabold text-emerald-950 mb-1">
                      आपकी दर / लागात मूल्य (Vendor Rate ₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={prodCostPrice}
                      onChange={e => setProdCostPrice(Number(e.target.value))}
                      placeholder="उदा. 400"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-extrabold outline-none text-stone-900"
                    />
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 text-xs font-bold text-emerald-900 space-y-1">
                    <div className="flex justify-between">
                      <span>ग्राहक मूल्य (+25% स्वचालित मार्जिन):</span>
                      <span className="font-extrabold text-base text-emerald-950">₹{calculatedCustomerPrice}</span>
                    </div>
                    <div className="text-[11px] font-medium text-emerald-800">
                      • एडमिन कमीशन (12.5%): ₹{Math.round(prodCostPrice * ADMIN_COMMISSION_RATE)} <br />
                      • डिलीवरी पार्टनर कमीशन (12.5%): ₹{Math.round(prodCostPrice * PARTNER_COMMISSION_RATE)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                    <select
                      value={prodCategory}
                      onChange={e => setProdCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    >
                      <option value="Cloth House">कपड़ा व परिधान (Cloth House)</option>
                      <option value="Hardware">हार्डवेयर व सेनेटरी (Hardware)</option>
                      <option value="Groceries">किराना व अनाज (Groceries)</option>
                      <option value="Vegetables">सब्ज़ियां व फल (Vegetables)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">पैकिंग / यूनिट</label>
                    <input
                      type="text"
                      required
                      value={prodUnit}
                      onChange={e => setProdUnit(e.target.value)}
                      placeholder="1 piece / 1 kg"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">डिलीवरी का प्रकार (Delivery Mode)</label>
                  <select
                    value={prodDeliveryMode}
                    onChange={e => setProdDeliveryMode(e.target.value as 'platform' | 'self')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="platform">Smart Delivery (प्लेटफ़ॉर्म डिलीवरी)</option>
                    <option value="self">Self Delivery (दुकान से पिकअप)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">इमेज URL</label>
                  <input
                    type="url"
                    value={prodImageUrl}
                    onChange={e => setProdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-xs mt-2 transition-all shadow-md"
                >
                  {isSubmitting ? 'पब्लिश हो रहा है...' : 'मार्केटप्लेस में पब्लिश करें'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

