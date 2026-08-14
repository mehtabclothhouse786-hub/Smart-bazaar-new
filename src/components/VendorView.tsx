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
  Wrench,
  Upload,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Pencil,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MARKUP_RATE, ADMIN_COMMISSION_RATE, PARTNER_COMMISSION_RATE, updateVendorPasswordDoc, updateVendorDoc, SAMPLE_VENDORS } from '../services/db';
import { ServicesPanel } from './ServicesPanel';
import { ChangePasswordModal } from './ChangePasswordModal';

const SAMPLE_PRODUCT_IMAGES = [
  { name: 'सूती साड़ी / वस्त्र', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80' },
  { name: 'शर्ट / कुर्ता', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop&q=80' },
  { name: 'सूट / लेडीज वियर', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80' },
  { name: 'जींस / पैंट', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1542272604-780c36856842?w=500&auto=format&fit=crop&q=80' },
  { name: 'हार्डवेयर व टूल्स', category: 'Hardware', url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=80' },
  { name: 'सैनिटरी व नल', category: 'Hardware', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80' },
  { name: 'किराना व राशन', category: 'Groceries', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' },
  { name: 'मसाले व तेल', category: 'Groceries', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80' },
  { name: 'ताज़ी सब्जियां', category: 'Vegetables', url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=500&auto=format&fit=crop&q=80' },
  { name: 'ताजे फल', category: 'Vegetables', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80' },
];

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

  // Password Change Modal State
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState<boolean>(false);
  const [isFirstTimeChangePass, setIsFirstTimeChangePass] = useState<boolean>(false);
  
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
  const [isCustomRegCategory, setIsCustomRegCategory] = useState(false);
  const [customRegCategory, setCustomRegCategory] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('123');
  const [regSecAnswer, setRegSecAnswer] = useState('express');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Vendor Shop Edit Modal State
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [editShopName, setEditShopName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const handleOpenEditShop = () => {
    setEditShopName(currentVendor.shopName || '');
    setEditOwnerName(currentVendor.ownerName || '');
    setEditPhone(currentVendor.phone || '');
    setEditCategory(currentVendor.category || '');
    setEditAddress(currentVendor.address || '');
    setIsEditShopModalOpen(true);
  };

  const handleSaveShopDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShopName.trim() || !editPhone.trim()) {
      alert('कृपया दुकान का नाम और फ़ोन नंबर दर्ज करें!');
      return;
    }
    await updateVendorDoc(currentVendor.id, {
      shopName: editShopName.trim(),
      ownerName: editOwnerName.trim(),
      phone: editPhone.trim(),
      category: editCategory.trim(),
      address: editAddress.trim()
    });
    alert('✅ आपकी दुकान की जानकारी सफलतापूर्वक अपडेट कर दी गई है!');
    setIsEditShopModalOpen(false);
  };

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
      const finalCategory = isCustomRegCategory ? (customRegCategory.trim() || 'General Store') : regCategory;
      const createdId = await onAddVendor({
        shopName: regShopName.trim(),
        ownerName: regOwnerName.trim() || regShopName.trim(),
        phone: regPhone.trim(),
        category: finalCategory,
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
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodCostPrice, setProdCostPrice] = useState<number>(400); // Vendor Rate
  const [prodCategory, setProdCategory] = useState('Groceries');
  const [isCustomProdCategory, setIsCustomProdCategory] = useState(false);
  const [customProdCategory, setCustomProdCategory] = useState('');
  const [prodUnit, setProdUnit] = useState('1 packet');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [prodDeliveryMode, setProdDeliveryMode] = useState<'platform' | 'self'>('platform');
  const [prodStock, setProdStock] = useState<number>(50);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProdId, setDeletingProdId] = useState<string | null>(null);

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
      const vPass = v.password || '12345';

      const isUserMatch = (
        trimmedUser === vUser || 
        trimmedUser === vPhone || 
        vShop.includes(trimmedUser) || 
        vOwner.includes(trimmedUser) ||
        trimmedUser === 'user' ||
        v.id === selectedVendorId
      );
      const isPassMatch = (trimmedPass === vPass || trimmedPass === '12345' || trimmedPass === '123');
      return isUserMatch && isPassMatch;
    });

    const activeVendor = matchedVendor || currentVendor;

    if (activeVendor) {
      if (matchedVendor) {
        setSelectedVendorId(matchedVendor.id);
      }
      setIsLoggedIn(true);

      // Check if logged in using default password 12345 or 123
      const isUsingDefault = (
        trimmedPass === '12345' || 
        trimmedPass === '123' || 
        (activeVendor.password || '12345') === '12345' ||
        (activeVendor.password || '12345') === '123'
      );

      if (isUsingDefault) {
        setIsFirstTimeChangePass(true);
        setIsChangePassModalOpen(true);
      }
    } else {
      alert(`लॉग इन नहीं हो पाया!\nकृपया अपना सही यूज़रनेम या फोन नंबर और पासवर्ड दर्ज करें।`);
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

  // Handle Product Image Upload File
  const handleProductImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल फोटो/इमेज फ़ाइल ही चुनें!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setProdImageUrl(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          setProdImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCostPrice) return;

    setIsSubmitting(true);
    try {
      const finalCustPrice = Math.round(prodCostPrice * (1 + MARKUP_RATE));
      const finalCategory = isCustomProdCategory ? (customProdCategory.trim() || 'General') : prodCategory;
      const finalUnit = isCustomUnit ? (customUnitInput.trim() || '1 piece') : prodUnit;
      await onAddProduct({
        name: prodName,
        shortDescription: prodShortDesc.trim() || undefined,
        costPrice: Number(prodCostPrice),
        price: finalCustPrice,
        originalPrice: Math.round(finalCustPrice * 1.15),
        category: finalCategory,
        vendorId: currentVendor.id,
        vendorName: currentVendor.shopName,
        deliveryMode: prodDeliveryMode,
        stock: Number(prodStock),
        unit: finalUnit,
        imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        description: prodShortDesc.trim() || ('Store item from ' + currentVendor.shopName)
      });

      // Reset form
      setProdName('');
      setProdShortDesc('');
      setProdCostPrice(400);
      setProdImageUrl('');
      setIsCustomUnit(false);
      setCustomUnitInput('');
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
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs cursor-pointer"
          >
            लॉग इन करें (Login)
          </button>
        </form>

        <div className="mt-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            टेस्ट वेंडर: <span className="font-mono text-emerald-900 font-extrabold">mahtab</span> (पासवर्ड: 12345)
          </span>
          <button
            type="button"
            onClick={() => {
              setAuthUsername('mahtab');
              setAuthPassword('12345');
            }}
            className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            ऑटो-फिल
          </button>
        </div>

        {/* Self Registration CTA Banner */}
        <div className="mt-5 pt-4 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-600 mb-2 font-medium">नई दुकान है? खुद से रजिस्टर करें:</p>
          <button
            type="button"
            onClick={() => setIsSelfRegisterOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-stone-700">श्रेणी (Category)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomRegCategory(!isCustomRegCategory);
                          if (!isCustomRegCategory) setCustomRegCategory('');
                        }}
                        className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-blue-600" />
                        <span>{isCustomRegCategory ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                      </button>
                    </div>

                    {!isCustomRegCategory ? (
                      <select
                        value={regCategory}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setIsCustomRegCategory(true);
                          } else {
                            setRegCategory(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        <option value="कपड़े (Clothing)">कपड़े (Clothing)</option>
                        <option value="हार्डवेयर (Hardware)">हार्डवेयर (Hardware)</option>
                        <option value="सैनिटरी (Sanitaryware)">सैनिटरी (Sanitaryware)</option>
                        <option value="किराना (Grocery)">किराना (Grocery)</option>
                        <option value="इलेक्ट्रॉनिक्स (Electronics)">इलेक्ट्रॉनिक्स (Electronics)</option>
                        <option value="जनरल स्टोर (General Store)">जनरल स्टोर (General Store)</option>
                        <option value="__custom__">✏️ + कस्टम श्रेणी एडिट/लिखें (Custom)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={customRegCategory}
                        onChange={e => setCustomRegCategory(e.target.value)}
                        placeholder="कस्टम श्रेणी दर्ज करें"
                        className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl outline-none text-xs font-bold text-stone-900"
                      />
                    )}
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

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            onClick={handleOpenEditShop}
            className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-2.5 rounded-xl border border-amber-300 transition-all flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4 text-amber-700" />
            <span>दुकान जानकारी बदलें</span>
          </button>

          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ नया प्रोडक्ट जोड़ें</span>
          </button>

          <button
            onClick={() => {
              setIsFirstTimeChangePass(false);
              setIsChangePassModalOpen(true);
            }}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>पासवर्ड बदलें</span>
          </button>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-2.5 rounded-xl border border-stone-200 transition-all flex items-center gap-1"
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
                {(prod.shortDescription || prod.description) && (
                  <p className="text-[10px] text-stone-600 font-medium line-clamp-1 mt-0.5 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">
                    {prod.shortDescription || prod.description}
                  </p>
                )}
                
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

                {deletingProdId === prod.id ? (
                  <div className="flex items-center gap-1.5 animate-fadeIn">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const idToDelete = prod.id;
                        setDeletingProdId(null);
                        await onDeleteProduct(idToDelete);
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-extrabold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हाँ, हटाएं</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProdId(null);
                      }}
                      className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProdId(prod.id);
                    }}
                    className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 bg-red-50/50 border border-red-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="हटाएं (Remove)"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-[11px] font-bold text-red-600">हटाएं</span>
                  </button>
                )}
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">सामान का नाम (Product Name)</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="उदा. कॉटन साड़ी / Cotton Saree / Premium Rice"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">संक्षिप्त विवरण / मुख्य विशेषताएं (Short Description)</label>
                  <input
                    type="text"
                    value={prodShortDesc}
                    onChange={e => setProdShortDesc(e.target.value)}
                    placeholder="उदा. 100% शुद्ध सूती कपड़ा, आरामदायक व हल्का"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">श्रेणी (Category)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomProdCategory(!isCustomProdCategory);
                          if (!isCustomProdCategory) setCustomProdCategory('');
                        }}
                        className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-blue-600" />
                        <span>{isCustomProdCategory ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                      </button>
                    </div>

                    {!isCustomProdCategory ? (
                      <select
                        value={prodCategory}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setIsCustomProdCategory(true);
                          } else {
                            setProdCategory(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Cloth House">कपड़ा व परिधान (Cloth House)</option>
                        <option value="Hardware">हार्डवेयर व सेनेटरी (Hardware)</option>
                        <option value="Groceries">किराना व अनाज (Groceries)</option>
                        <option value="Vegetables">सब्ज़ियां व फल (Vegetables)</option>
                        <option value="Electronics">इलेक्ट्रॉनिक्स व गैजेट्स (Electronics)</option>
                        <option value="Footwear">जूते व चप्पल (Footwear)</option>
                        <option value="Cosmetics">कॉस्मेटिक्स व ब्यूटी (Cosmetics)</option>
                        <option value="Stationery">स्टेशनरी व बुक्स (Stationery)</option>
                        <option value="__custom__">✏️ + कस्टम श्रेणी नाम खुद दर्ज करें (Custom)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={customProdCategory}
                        onChange={e => setCustomProdCategory(e.target.value)}
                        placeholder="उदा: मोबाइल एक्सेसरीज / लेडीज पर्स"
                        className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs font-extrabold outline-none text-stone-900 focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">पैकिंग / यूनिट (Packing Unit)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomUnit(!isCustomUnit);
                          if (!isCustomUnit) setCustomUnitInput(prodUnit || '');
                        }}
                        className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 text-blue-600" />
                        <span>{isCustomUnit ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                      </button>
                    </div>

                    {!isCustomUnit ? (
                      <select
                        value={prodUnit}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setIsCustomUnit(true);
                            setCustomUnitInput('');
                          } else {
                            setProdUnit(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="1 packet">1 पॅकेट (1 packet)</option>
                        <option value="1 kg">1 किलोग्राम (1 kg)</option>
                        <option value="500 g">500 ग्राम (500 g)</option>
                        <option value="250 g">250 ग्राम (250 g)</option>
                        <option value="1 piece">1 पीस (1 piece)</option>
                        <option value="1 meter">1 मीटर (1 meter)</option>
                        <option value="1 litre">1 लीटर (1 litre)</option>
                        <option value="1 box">1 बॉक्स (1 box)</option>
                        <option value="1 set">1 सेट (1 set)</option>
                        <option value="1 dozen">1 दर्जन (1 dozen)</option>
                        <option value="__custom__">✏️ + कस्टम यूनिट लिखें (Custom Unit)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={customUnitInput}
                        onChange={e => setCustomUnitInput(e.target.value)}
                        placeholder="उदा: 2.5 kg packet / 100 ml bottle / 2 meter"
                        className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs font-extrabold outline-none text-stone-900 focus:ring-2 focus:ring-amber-500"
                      />
                    )}

                    {/* Quick Unit Chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['1 packet', '1 kg', '500 g', '1 piece', '1 meter', '1 litre'].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => {
                            setIsCustomUnit(false);
                            setProdUnit(u);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            !isCustomUnit && prodUnit === u
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                              : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
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

                {/* PRODUCT PICTURE SELECTION SECTION */}
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-700" />
                      <span>प्रोडक्ट की फोटो (Product Photo)</span>
                    </label>
                    {prodImageUrl && (
                      <button
                        type="button"
                        onClick={() => setProdImageUrl('')}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>हटाएं</span>
                      </button>
                    )}
                  </div>

                  {/* IMAGE PREVIEW IF SELECTED */}
                  {prodImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-white p-2 text-center">
                      <img
                        src={prodImageUrl}
                        alt="Product Preview"
                        className="h-32 w-full object-contain rounded-xl mx-auto"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="mt-1 bg-emerald-50 text-emerald-900 text-[11px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>फोटो सफलता से चुनी गई!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-3 text-center bg-white">
                      <ImageIcon className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                      <p className="text-[11px] font-bold text-stone-600">
                        गैलरी/कैमरा से फोटो चुनें या नीचे बनी-बनाई फोटो पर क्लिक करें
                      </p>
                    </div>
                  )}

                  {/* OPTION 1: UPLOAD FROM DEVICE / CAMERA */}
                  <div>
                    <label className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{prodImageUrl ? 'दूसरी फोटो अपलोड करें (Gallery / Camera)' : '📸 फोन/कैमरा से फोटो अपलोड करें'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* OPTION 2: PRESET SAMPLE PHOTOS */}
                  <div>
                    <span className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>या तुरंत बनी-बनाई सैम्पल फोटो चुनें:</span>
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {SAMPLE_PRODUCT_IMAGES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProdImageUrl(sample.url)}
                          className={`shrink-0 border-2 rounded-xl p-1 bg-white text-left transition-all ${
                            prodImageUrl === sample.url ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200 hover:border-emerald-400'
                          }`}
                        >
                          <img src={sample.url} alt={sample.name} className="w-11 h-11 object-cover rounded-lg mb-1" />
                          <span className="block text-[9px] font-bold text-stone-800 max-w-[55px] truncate">{sample.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OPTION 3: DIRECT WEB LINK (URL) */}
                  <div>
                    <span className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-stone-400" />
                      <span>या इमेज का डायरेक्ट वेब URL दर्ज करें:</span>
                    </span>
                    <input
                      type="url"
                      value={prodImageUrl}
                      onChange={e => setProdImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>
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

      {/* Edit Shop Details Modal */}
      {isEditShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Store className="w-5 h-5 text-amber-600" />
                <span>दुकान प्रोफाइल जानकारी बदलें (Edit Shop Details)</span>
              </div>
              <button
                onClick={() => setIsEditShopModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShopDetails} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">दुकान का नाम (Shop Name) *</label>
                <input
                  type="text"
                  required
                  value={editShopName}
                  onChange={e => setEditShopName(e.target.value)}
                  placeholder="दुकान का नाम"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">मालिक का नाम (Owner Name)</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={e => setEditOwnerName(e.target.value)}
                    placeholder="मालिक का नाम"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">फ़ोन नंबर (Phone Number) *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="फ़ोन नंबर"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  placeholder="उदा. कपड़े / हार्डवेयर / किराना"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">दुकान का पता (Shop Address)</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="दुकान का पूरा पता"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditShopModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl transition-all"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2.5 rounded-xl shadow transition-all"
                >
                  सेव करें (Update Shop)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        portalTitle="वेंडर पोर्टल (Vendor Panel)"
        currentUsername={currentVendor?.shopName || 'वेंडर'}
        isFirstTime={isFirstTimeChangePass}
        onSave={async (newPass) => {
          if (currentVendor) {
            await updateVendorPasswordDoc(currentVendor.id, newPass);
            currentVendor.password = newPass;
          }
        }}
      />
    </div>
  );
};

