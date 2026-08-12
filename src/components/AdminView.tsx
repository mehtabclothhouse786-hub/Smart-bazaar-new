import React, { useState } from 'react';
import { Product, Order, Vendor, DeliveryPartner, OrderStatus, ServiceProvider } from '../types';
import { getServiceCategoryBadge } from './ServicesPanel';
import { 
  ShieldAlert, 
  Store, 
  Truck, 
  ShoppingBag, 
  DollarSign, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Database, 
  UserCheck,
  Search,
  Plus,
  X,
  Phone,
  User,
  Key,
  Lock,
  Wrench,
  KeyRound,
  Pencil
} from 'lucide-react';
import { firebaseConfigData } from '../firebase';
import { updateVendorDoc, updateDeliveryPartnerDoc, updateServiceProviderDoc } from '../services/db';
import { ChangePasswordModal } from './ChangePasswordModal';

interface AdminViewProps {
  products: Product[];
  orders: Order[];
  vendors: Vendor[];
  deliveryPartners: DeliveryPartner[];
  services?: ServiceProvider[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  onAddVendor?: (vendor: Omit<Vendor, 'id'>) => Promise<string>;
  onDeleteVendor?: (vendorId: string) => Promise<void>;
  onAddDeliveryPartner?: (partner: Omit<DeliveryPartner, 'id'>) => Promise<string>;
  onDeleteDeliveryPartner?: (partnerId: string) => Promise<void>;
  onAddService?: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  onSeedDefaults: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products = [],
  orders = [],
  vendors = [],
  deliveryPartners = [],
  services = [],
  onUpdateOrderStatus,
  onDeleteProduct,
  onAddVendor,
  onDeleteVendor,
  onAddDeliveryPartner,
  onDeleteDeliveryPartner,
  onAddService,
  onDeleteService,
  onSeedDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'vendors' | 'delivery' | 'services' | 'database'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingAdminProdId, setDeletingAdminProdId] = useState<string | null>(null);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');
  const [savedAdminPassword, setSavedAdminPassword] = useState<string>(() => {
    return localStorage.getItem('smart_bazaar_admin_password') || '12345';
  });

  // Change Password Modal State
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState<boolean>(false);
  const [isFirstTimeChangePass, setIsFirstTimeChangePass] = useState<boolean>(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUsername.trim().toLowerCase();
    const p = adminPassword.trim();

    const isUserValid = (u === 'admin' || u === 'user' || u === '9457695918' || u === 'mehtab' || u === '');
    const isPassValid = (p === savedAdminPassword || p === '12345' || p === '1234' || p === '123' || p === 'admin');

    if (isUserValid && isPassValid) {
      setIsAdminLoggedIn(true);
      setAdminAuthError('');

      // If using default password 12345, 1234, 123 or admin, prompt for first-time change
      if (p === '12345' || p === '1234' || p === '123' || p === 'admin' || savedAdminPassword === '12345') {
        setIsFirstTimeChangePass(true);
        setIsChangePassModalOpen(true);
      }
    } else {
      setAdminAuthError('गलत एडमिन यूज़रनेम या पासवर्ड! (Default Password: 12345)');
    }
  };

  // Vendor Modal State
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [vShopName, setVShopName] = useState('');
  const [vOwnerName, setVOwnerName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vCategory, setVCategory] = useState('कपड़े (Clothing)');
  const [isCustomVCategory, setIsCustomVCategory] = useState(false);
  const [customVCategoryInput, setCustomVCategoryInput] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [vImageUrl, setVImageUrl] = useState('');
  const [vUsername, setVUsername] = useState('');
  const [vPassword, setVPassword] = useState('12345');
  const [vSecAnswer, setVSecAnswer] = useState('express');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Delivery Partner Modal State
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pVehicle, setPVehicle] = useState('बाइक');
  const [pPassword, setPPassword] = useState('12345');
  const [pSecAnswer, setPSecAnswer] = useState('express');
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  // Service Provider Modal State
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState<any>('प्लंबर (Plumber)');
  const [isCustomSCategory, setIsCustomSCategory] = useState(false);
  const [customSCategoryInput, setCustomSCategoryInput] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sExperienceYears, setSExperienceYears] = useState(3);
  const [sCharge, setSCharge] = useState(250);
  const [sAddress, setSAddress] = useState('बिजनौर शहर');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sPhone.trim()) {
      alert('कृपया सर्विस प्रोवाइडर का नाम और मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (!onAddService) return;

    setIsSubmittingService(true);
    try {
      const finalSCat = isCustomSCategory ? (customSCategoryInput.trim() || 'अन्य') : sCategory;
      await onAddService({
        providerName: sName.trim(),
        serviceName: finalSCat,
        category: finalSCat,
        description: `${finalSCat} सेवा एवं रिपेयरिंग कार्य`,
        primaryPhone: sPhone.trim(),
        whatsappPhone: sPhone.trim(),
        experienceYears: Number(sExperienceYears) || 3,
        address: sAddress.trim() || 'बिजनौर',
        rating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
      });

      alert(`✅ नया सर्विस प्रोवाइडर "${sName}" सफलतापूर्वक जोड़ा गया!`);
      setIsAddServiceOpen(false);
      setSName('');
      setSPhone('');
    } catch (err) {
      console.error('Error adding service provider:', err);
      alert('सर्विस प्रोवाइडर जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleDeleteServiceClick = async (service: ServiceProvider) => {
    if (onDeleteService) {
      try {
        await onDeleteService(service.id);
      } catch (err) {
        console.error('Error deleting service:', err);
      }
    }
  };

  const totalPlatformGMV = (orders || []).reduce((sum, o) => sum + (o?.totalAmount || 0), 0);
  const activeOrdersCount = (orders || []).filter(o => o?.status !== 'Delivered' && o?.status !== 'Cancelled').length;

  const filteredOrders = (orders || []).filter(o => {
    const q = orderSearch.toLowerCase();
    return !q || 
      (o?.id || '').toLowerCase().includes(q) || 
      (o?.customerName || '').toLowerCase().includes(q) ||
      (o?.customerPhone || '').includes(q) ||
      (o?.status || '').toLowerCase().includes(q);
  });

  const handleSeedClick = async () => {
    if (confirm('This will seed/reset initial sample catalog data in Firestore. Continue?')) {
      setIsSeeding(true);
      try {
        await onSeedDefaults();
        alert('Firestore sample data seeded successfully!');
      } catch (err) {
        console.error('Error seeding defaults:', err);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  // Submit New Vendor
  const handleAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vShopName.trim() || !vPhone.trim()) {
      alert('कृपया दुकान का नाम और फोन नंबर दर्ज करें!');
      return;
    }
    if (!onAddVendor) return;

    setIsSubmittingVendor(true);
    try {
      const finalVCat = isCustomVCategory ? (customVCategoryInput.trim() || 'General Store') : vCategory;
      await onAddVendor({
        shopName: vShopName,
        ownerName: vOwnerName || vShopName,
        phone: vPhone,
        category: finalVCat,
        address: vAddress || 'Main Market, Bijnor',
        status: 'active',
        rating: 4.8,
        totalOrders: 0,
        imageUrl: vImageUrl.trim() || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80',
        username: vUsername.trim().toLowerCase() || vShopName.toLowerCase().replace(/\s+/g, ''),
        password: vPassword.trim() || '123',
        securityQuestion: 'आपका सुरक्षा शब्द (Security Word) क्या है?',
        securityAnswer: vSecAnswer.trim().toLowerCase() || 'express'
      });

      alert(`✅ नई दुकान "${vShopName}" सफलतापूर्वक जोड़ दी गई है!`);
      setIsAddVendorOpen(false);
      // Reset form
      setVShopName('');
      setVOwnerName('');
      setVPhone('');
      setVAddress('');
      setVImageUrl('');
      setVUsername('');
      setVPassword('123');
      setVSecAnswer('express');
    } catch (err) {
      console.error('Error adding vendor:', err);
      alert('वेंडर जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  // Delete Vendor
  const handleDeleteVendorClick = async (vendor: Vendor) => {
    if (onDeleteVendor) {
      try {
        await onDeleteVendor(vendor.id);
      } catch (err) {
        console.error('Error deleting vendor:', err);
      }
    }
  };

  // Admin Editing States
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [editingService, setEditingService] = useState<ServiceProvider | null>(null);

  // Save Vendor Edits
  const handleSaveVendorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    try {
      await updateVendorDoc(editingVendor.id, {
        shopName: editingVendor.shopName,
        ownerName: editingVendor.ownerName,
        phone: editingVendor.phone,
        category: editingVendor.category,
        address: editingVendor.address,
        password: editingVendor.password,
        securityAnswer: editingVendor.securityAnswer
      });
      alert(`✅ वेंडर "${editingVendor.shopName}" की जानकारी अपडेट हो गई है!`);
      setEditingVendor(null);
    } catch (err) {
      console.error('Error saving vendor edit:', err);
      alert('अपडेट में त्रुटि हुई।');
    }
  };

  // Save Partner Edits
  const handleSavePartnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    try {
      await updateDeliveryPartnerDoc(editingPartner.id, {
        name: editingPartner.name,
        phone: editingPartner.phone,
        vehicle: editingPartner.vehicle,
        password: editingPartner.password,
        securityAnswer: editingPartner.securityAnswer
      });
      alert(`✅ राइडर "${editingPartner.name}" की जानकारी अपडेट हो गई है!`);
      setEditingPartner(null);
    } catch (err) {
      console.error('Error saving partner edit:', err);
      alert('अपडेट में त्रुटि हुई।');
    }
  };

  // Save Service Edits
  const handleSaveServiceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await updateServiceProviderDoc(editingService.id, {
        providerName: editingService.providerName,
        primaryPhone: editingService.primaryPhone,
        category: editingService.category,
        serviceName: editingService.serviceName,
        address: editingService.address || editingService.location
      });
      alert(`✅ सर्विस प्रोवाइडर "${editingService.providerName}" की जानकारी अपडेट हो गई है!`);
      setEditingService(null);
    } catch (err) {
      console.error('Error saving service edit:', err);
      alert('अपडेट में त्रुटि हुई।');
    }
  };

  // Submit New Delivery Partner
  const handleAddPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPhone.trim()) {
      alert('कृपया राइडर का नाम और फोन नंबर दर्ज करें!');
      return;
    }
    if (!onAddDeliveryPartner) return;

    setIsSubmittingPartner(true);
    try {
      await onAddDeliveryPartner({
        name: pName,
        phone: pPhone,
        vehicle: pVehicle,
        status: 'Online',
        currentLocation: 'Bijnor Market',
        earnings: 0,
        walletBalance: 0,
        completedDeliveries: 0,
        rating: 5.0,
        password: pPassword.trim() || '123',
        securityQuestion: 'आपका सुरक्षा शब्द (Security Word) क्या है?',
        securityAnswer: pSecAnswer.trim().toLowerCase() || 'express'
      });

      alert(`✅ नया डिलीवरी राइडर "${pName}" सफलतापूर्वक जोड़ दिया गया है!`);
      setIsAddPartnerOpen(false);
      // Reset
      setPName('');
      setPPhone('');
      setPVehicle('बाइक');
      setPPassword('123');
      setPSecAnswer('express');
    } catch (err) {
      console.error('Error adding delivery partner:', err);
      alert('राइडर जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  // Delete Delivery Partner
  const handleDeletePartnerClick = async (partner: DeliveryPartner) => {
    if (onDeleteDeliveryPartner) {
      try {
        await onDeleteDeliveryPartner(partner.id);
      } catch (err) {
        console.error('Error deleting partner:', err);
      }
    }
  };

  // Admin Login Gate Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-stone-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold text-xl text-stone-900">एडमिन कंट्रोल पैनल (Admin Login)</h2>
          <p className="text-xs text-stone-500 mt-1">सुरक्षित एडमिन क्रेडेंशियल दर्ज करके प्रवेश करें</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">यूज़रनेम (Username)</label>
            <input
              type="text"
              required
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              placeholder="यूज़रनेम दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (Password)</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="पासवर्ड दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {adminAuthError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
              {adminAuthError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>एडमिन लॉग इन करें (Admin Login)</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Admin Title Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-stone-950 flex items-center justify-center font-black">
              ⚙️
            </div>
            <h1 className="font-extrabold text-xl">Smart Bazaar Admin Console</h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Real-time management for Firestore database: <strong className="text-emerald-400">{firebaseConfigData.projectId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedClick}
            disabled={isSeeding}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Seeding Database...' : 'Seed Catalog'}</span>
          </button>
          <button
            onClick={() => {
              setIsFirstTimeChangePass(false);
              setIsChangePassModalOpen(true);
            }}
            className="bg-stone-800 hover:bg-stone-700 text-emerald-400 font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-stone-700 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>पासवर्ड बदलें</span>
          </button>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-stone-700 transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>लॉग आउट (Logout)</span>
          </button>
        </div>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Total Platform GMV</div>
          <div className="text-2xl font-black text-stone-900">₹{totalPlatformGMV}</div>
          <div className="text-[11px] text-stone-500 mt-1">{orders.length} total orders</div>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Active Live Orders</div>
          <div className="text-2xl font-black text-amber-600">{activeOrdersCount}</div>
          <div className="text-[11px] text-stone-500 mt-1">Pending delivery</div>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Live Products Catalog</div>
          <div className="text-2xl font-black text-emerald-600">{products.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">In Firestore db</div>
        </div>

        <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">On-Boarded Partners</div>
          <div className="text-2xl font-black text-blue-600">{vendors.length + deliveryPartners.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">{vendors.length} Shops • {deliveryPartners.length} Delivery</div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Products Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Registered Vendors ({vendors.length})
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'delivery'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Delivery Partners ({deliveryPartners.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Service Providers ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Firebase Setup Details
        </button>
      </div>

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="Filter orders by customer, phone or ID..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Vendor / Shop</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">OTP</th>
                    <th className="p-3">Assign Delivery Rider</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-stone-500">
                        No orders match filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/80">
                        <td className="p-3 font-mono font-bold text-stone-900">#{order.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-stone-900">{order.customerName}</div>
                          <div className="font-mono text-[11px] text-stone-500">{order.customerPhone}</div>
                        </td>
                        <td className="p-3 font-semibold text-emerald-800">
                          {order.vendorName || 'Smart Bazaar'}
                        </td>
                        <td className="p-3 font-extrabold text-stone-900">₹{order.totalAmount}</td>
                        <td className="p-3 font-mono text-blue-700 font-bold">{order.otp}</td>
                        
                        {/* Delivery Partner Assignment Dropdown */}
                        <td className="p-3">
                          <div className="flex flex-col gap-1 min-w-[150px]">
                            <select
                              value={order.deliveryPartnerId || ''}
                              onChange={e => {
                                const pId = e.target.value;
                                const partner = deliveryPartners.find(p => p.id === pId);
                                if (partner) {
                                  const nextStatus = (order.status === 'Placed' || order.status === 'Vendor Accepted' || order.status === 'Preparing') ? 'Out for Delivery' : order.status;
                                  onUpdateOrderStatus(order.id, nextStatus, {
                                    deliveryPartnerId: partner.id,
                                    deliveryPartnerName: partner.name
                                  });
                                  alert(`✅ ऑर्डर #${order.id} राइडर "${partner.name}" को असाइन किया गया!`);
                                } else {
                                  onUpdateOrderStatus(order.id, order.status, {
                                    deliveryPartnerId: '',
                                    deliveryPartnerName: ''
                                  });
                                }
                              }}
                              className="bg-amber-50 border border-amber-300 text-stone-900 rounded-lg px-2 py-1 text-[11px] font-extrabold outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="">-- राइडर असाइन करें --</option>
                              {deliveryPartners.map(dp => (
                                <option key={dp.id} value={dp.id}>
                                  🚴 {dp.name} ({dp.phone})
                                </option>
                              ))}
                            </select>
                            {order.deliveryPartnerName && (
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                ✓ असाइन किया गया: {order.deliveryPartnerName}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            order.status === 'Delivered' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : order.status === 'Out for Delivery'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={e => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-stone-100 border border-stone-300 rounded px-2 py-1 text-[11px] font-bold outline-none"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Vendor Accepted">Vendor Accepted</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-900 text-white p-4 rounded-2xl">
            <div>
              <h2 className="font-extrabold text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>मार्केटप्लेस प्रोडक्ट कैटलॉग (Products Catalog - {products.length})</span>
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">लाइव प्रोडक्ट्स की लिस्ट एवं डिलीट / रिमूव नियंत्रण</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
              कोई भी प्रोडक्ट मौजूद नहीं है।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(prod => (
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
                    
                    <div className="mt-1 text-xs text-stone-600 space-y-0.5">
                      <div>विक्रेता रेट: <strong className="text-stone-900">₹{prod.costPrice || Math.round(prod.price / 1.25)}</strong></div>
                      <div>ग्राहक मूल्य (+25%): <strong className="text-emerald-800">₹{prod.price}</strong></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">ID: {prod.id}</span>
                    {onDeleteProduct && (
                      deletingAdminProdId === prod.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              const id = prod.id;
                              setDeletingAdminProdId(null);
                              await onDeleteProduct(id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>हाँ, हटाएं</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAdminProdId(null)}
                            className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] px-2 py-1 rounded-xl cursor-pointer"
                          >
                            रद्द
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingAdminProdId(prod.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                          title="हटाएं (Remove)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>हटाएं</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
            <div>
              <h2 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-700" />
                <span>पंजीकृत दुकानें/विक्रेता (Registered Vendors - {vendors.length})</span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                नया वेंडर जोड़ें या अवांछित वेंडर हटाएं।
              </p>
            </div>
            <button
              onClick={() => setIsAddVendorOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नया वेंडर जोड़ें (Add Vendor)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map(v => (
              <div key={v.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3 relative group hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3">
                  <img
                    src={v.imageUrl}
                    alt={v.shopName}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-stone-900 text-sm truncate">{v.shopName}</h3>
                    <div className="text-xs text-emerald-700 font-bold">{v.category}</div>
                  </div>
                </div>

                <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 space-y-1">
                  <div>मालिक: <strong className="text-stone-900">{v.ownerName}</strong></div>
                  <div>फोन: <span className="font-mono font-bold text-stone-800">{v.phone}</span></div>
                  <div>पता: {v.address}</div>
                  <div>पासवर्ड: <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-blue-800">{v.password || '123'}</span></div>
                  <div>सुरक्षा शब्द: <span className="font-mono font-bold text-stone-700">{v.securityAnswer || 'express'}</span></div>
                </div>

                {/* Edit & Delete Vendor Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingVendor({ ...v })}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>एडिट करें</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVendorClick(v)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DELIVERY PARTNERS */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <div>
              <h2 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-700" />
                <span>डिलीवरी पार्टनर लिस्ट (Delivery Partners - {deliveryPartners.length})</span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                नया डिलीवरी बॉय जोड़ें या हटाएं।
              </p>
            </div>
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नया राइडर जोड़ें (Add Delivery Partner)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryPartners.map(dp => (
              <div key={dp.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3 relative hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                      🛵
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-sm">{dp.name}</h3>
                      <div className="text-[11px] text-stone-500">वाहन: {dp.vehicle}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    dp.status === 'Online' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {dp.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 space-y-1">
                  <div>फोन नंबर: <span className="font-mono font-bold text-stone-800">{dp.phone}</span></div>
                  <div>पासवर्ड: <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-blue-800">{dp.password || '123'}</span></div>
                  <div>सुरक्षा शब्द: <span className="font-mono font-bold text-stone-700">{dp.securityAnswer || 'express'}</span></div>
                  <div>कमीशन कमाई: <strong className="text-emerald-700">₹{dp.earnings}</strong></div>
                  <div>पूरी की गई डिलीवरी: {dp.completedDeliveries}</div>
                </div>

                {/* Edit & Delete Partner Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingPartner({ ...dp })}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>एडिट करें</span>
                  </button>
                  <button
                    onClick={() => handleDeletePartnerClick(dp)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SERVICE PROVIDERS */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-purple-50 border border-purple-200 p-4 rounded-2xl">
            <div>
              <h2 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-700" />
                <span>सर्विस प्रोवाइडर / मिस्त्री एवं तकनीशियन ({services.length})</span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                प्लंबर, इलेक्ट्रिशियन, ब्यूटीशियन, डॉक्टर या अन्य तकनीशियन जोड़ें या हटाएं।
              </p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नया सर्विस प्रोवाइडर जोड़ें (Add Service)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.length === 0 ? (
              <div className="col-span-full p-8 text-center text-stone-500 bg-white border border-stone-200 rounded-2xl">
                कोई सर्विस प्रोवाइडर लिस्टेड नहीं है। ऊपर बटन से नया जोड़ें।
              </div>
            ) : (
              services.map(s => (
                <div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const { icon: ServiceIcon, bg } = getServiceCategoryBadge(s.category);
                      return (
                        <div className={`w-12 h-12 rounded-xl ${bg} border flex items-center justify-center shrink-0`}>
                          <ServiceIcon className="w-6 h-6" />
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-stone-900 text-sm truncate">{s.providerName}</h3>
                      <div className="text-xs text-purple-700 font-bold">{s.serviceName || s.category}</div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 space-y-1">
                    <div>कॉल नंबर: <span className="font-mono font-bold text-stone-800">{s.primaryPhone}</span></div>
                    {s.whatsappPhone && <div>WhatsApp: <span className="font-mono font-bold text-emerald-700">{s.whatsappPhone}</span></div>}
                    <div>अनुभव: <span className="font-bold text-stone-800">{s.experienceYears || 3} वर्ष</span></div>
                    <div>पता: {s.address || 'बिजनौर'}</div>
                    {s.description && <div className="text-[11px] text-stone-500 italic">{s.description}</div>}
                  </div>

                  {/* Edit & Delete Service Provider Buttons */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setEditingService({ ...s })}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-purple-200 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>एडिट करें</span>
                    </button>
                    <button
                      onClick={() => handleDeleteServiceClick(s)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएं</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: FIREBASE DETAILS */}
      {activeTab === 'database' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
            <Database className="w-5 h-5" />
            <span>Active Firebase Firestore Cloud Setup</span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl font-mono text-xs text-stone-800 space-y-2 border border-stone-200">
            <div><strong>Firebase Project ID:</strong> {firebaseConfigData.projectId}</div>
            <div><strong>Custom Firestore Database ID:</strong> {firebaseConfigData.firestoreDatabaseId}</div>
            <div><strong>Auth Domain:</strong> {firebaseConfigData.authDomain}</div>
            <div><strong>Storage Bucket:</strong> {firebaseConfigData.storageBucket}</div>
            <div><strong>Realtime Collections:</strong> products, orders, vendors, deliveryPartners</div>
          </div>

          <p className="text-xs text-stone-500">
            This Smart Bazaar app is fully connected to Google Cloud Firestore with real-time snapshot listeners. Any product added or order placed in one tab or device updates live on all connected devices instantly!
          </p>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Store className="w-5 h-5 text-emerald-700" />
                <span>नया वेंडर/दुकान जोड़ें (Add New Vendor)</span>
              </div>
              <button
                onClick={() => setIsAddVendorOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">दुकान का नाम (Shop Name) *</label>
                <input
                  type="text"
                  required
                  value={vShopName}
                  onChange={e => setVShopName(e.target.value)}
                  placeholder="उदा. महताब क्लॉथ हाउस"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">मालिक का नाम (Owner Name)</label>
                  <input
                    type="text"
                    value={vOwnerName}
                    onChange={e => setVOwnerName(e.target.value)}
                    placeholder="उदा. महताब खान"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">मोबाइल नंबर (Phone Number) *</label>
                  <input
                    type="tel"
                    required
                    value={vPhone}
                    onChange={e => setVPhone(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-stone-700">श्रेणी (Category)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomVCategory(!isCustomVCategory);
                        if (!isCustomVCategory) setCustomVCategoryInput('');
                      }}
                      className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3 text-blue-600" />
                      <span>{isCustomVCategory ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                    </button>
                  </div>

                  {!isCustomVCategory ? (
                    <select
                      value={vCategory}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setIsCustomVCategory(true);
                        } else {
                          setVCategory(e.target.value);
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
                      value={customVCategoryInput}
                      onChange={e => setCustomVCategoryInput(e.target.value)}
                      placeholder="कस्टम दुकान श्रेणी नाम लिखें"
                      className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl outline-none text-xs font-bold text-stone-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">दुकान का पता (Address)</label>
                  <input
                    type="text"
                    value={vAddress}
                    onChange={e => setVAddress(e.target.value)}
                    placeholder="उदा. मेन बाजार, बिजनौर"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">दुकान फोटो URL (Image URL)</label>
                <input
                  type="url"
                  value={vImageUrl}
                  onChange={e => setVImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  <span>वेंडर लॉग इन क्रेडेंशियल (Vendor Login Credentials)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-stone-600 text-[10px]">यूजरनेम (Username)</label>
                    <input
                      type="text"
                      value={vUsername}
                      onChange={e => setVUsername(e.target.value)}
                      placeholder="उदा. mahtab"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-600 text-[10px]">पासवर्ड (Password)</label>
                    <input
                      type="text"
                      value={vPassword}
                      onChange={e => setVPassword(e.target.value)}
                      placeholder="उदा. 123"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 text-[10px]">सुरक्षा शब्द (Security Answer for password reset)</label>
                  <input
                    type="text"
                    value={vSecAnswer}
                    onChange={e => setVSecAnswer(e.target.value)}
                    placeholder="उदा. express"
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVendor}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmittingVendor ? 'जोड़ा जा रहा है...' : 'वेंडर सुरक्षित करें (Save Vendor)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DELIVERY PARTNER MODAL */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Truck className="w-5 h-5 text-blue-700" />
                <span>नया डिलीवरी पार्टनर जोड़ें (Add Delivery Partner)</span>
              </div>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartnerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">राइडर का नाम (Rider Name) *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  placeholder="उदा. राजेश कुमार"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile Phone) *</label>
                <input
                  type="tel"
                  required
                  value={pPhone}
                  onChange={e => setPPhone(e.target.value)}
                  placeholder="उदा. 9898989898"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">वाहन प्रकार (Vehicle Type)</label>
                <select
                  value={pVehicle}
                  onChange={e => setPVehicle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="बाइक">बाइक (Bike)</option>
                  <option value="स्कूटी">स्कूटी (Scooty)</option>
                  <option value="साइकिल">साइकिल (Bicycle)</option>
                  <option value="ई-रिक्शा">ई-रिक्शा (E-Rickshaw)</option>
                </select>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  <span>राइडर लॉग इन क्रेडेंशियल (Rider Login Credentials)</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 text-[10px]">पासवर्ड (Password)</label>
                  <input
                    type="text"
                    value={pPassword}
                    onChange={e => setPPassword(e.target.value)}
                    placeholder="उदा. 123"
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 text-[10px]">सुरक्षा शब्द (Security Answer for password reset)</label>
                  <input
                    type="text"
                    value={pSecAnswer}
                    onChange={e => setPSecAnswer(e.target.value)}
                    placeholder="उदा. express"
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPartner}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmittingPartner ? 'जोड़ा जा रहा है...' : 'राइडर सुरक्षित करें (Save Rider)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE PROVIDER MODAL */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                <Wrench className="w-5 h-5 text-purple-700" />
                <span>नया सर्विस प्रोवाइडर जोड़ें (Add Service Provider)</span>
              </div>
              <button
                onClick={() => setIsAddServiceOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">नाम (Provider Name) *</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={e => setSName(e.target.value)}
                  placeholder="उदा. अमित प्लंबर / डॉ. शर्मा"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-stone-700">सर्विस श्रेणी (Category)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSCategory(!isCustomSCategory);
                      if (!isCustomSCategory) setCustomSCategoryInput('');
                    }}
                    className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-blue-600" />
                    <span>{isCustomSCategory ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                  </button>
                </div>

                {!isCustomSCategory ? (
                  <select
                    value={sCategory}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setIsCustomSCategory(true);
                      } else {
                        setSCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="प्लंबर (Plumber)">प्लंबर (Plumber)</option>
                    <option value="इलेक्ट्रिशियन (Electrician)">इलेक्ट्रिशियन (Electrician)</option>
                    <option value="ब्यूटीशियन / ब्यूटी पार्लर (Beautician)">ब्यूटीशियन / ब्यूटी पार्लर (Beautician)</option>
                    <option value="डॉक्टर / क्लीनिक (Doctor)">डॉक्टर / क्लीनिक (Doctor)</option>
                    <option value="एसी / टीवी तकनीशियन (AC/TV Repair)">एसी / टीवी तकनीशियन (AC/TV Repair)</option>
                    <option value="बढ़ई / कारपेंटर (Carpenter)">बढ़ई / कारपेंटर (Carpenter)</option>
                    <option value="कार / बाइक मैकेनिक (Mechanic)">कार / बाइक मैकेनिक (Mechanic)</option>
                    <option value="__custom__">✏️ + कस्टम सर्विस श्रेणी एडिट/दर्ज करें (Custom)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customSCategoryInput}
                    onChange={e => setCustomSCategoryInput(e.target.value)}
                    placeholder="कस्टम सर्विस श्रेणी नाम लिखें"
                    className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl outline-none text-xs font-bold text-stone-900"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile) *</label>
                  <input
                    type="tel"
                    required
                    value={sPhone}
                    onChange={e => setSPhone(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">अनुभव (Years Exp.)</label>
                  <input
                    type="number"
                    value={sExperienceYears}
                    onChange={e => setSExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">विजिट चार्ज (₹)</label>
                  <input
                    type="number"
                    value={sCharge}
                    onChange={e => setSCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">पता / लोकेशन</label>
                  <input
                    type="text"
                    value={sAddress}
                    onChange={e => setSAddress(e.target.value)}
                    placeholder="बिजनौर"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingService}
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmittingService ? 'जोड़ा जा रहा है...' : 'सर्विस सुरक्षित करें (Save Service)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>वेंडर विवरण एडिट करें ({editingVendor.shopName})</span>
              </h3>
              <button onClick={() => setEditingVendor(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendorEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">दुकान का नाम (Shop Name) *</label>
                <input
                  type="text"
                  required
                  value={editingVendor.shopName}
                  onChange={e => setEditingVendor({ ...editingVendor, shopName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">मालिक का नाम</label>
                  <input
                    type="text"
                    value={editingVendor.ownerName}
                    onChange={e => setEditingVendor({ ...editingVendor, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">फ़ोन नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={editingVendor.phone}
                    onChange={e => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                  <input
                    type="text"
                    value={editingVendor.category}
                    onChange={e => setEditingVendor({ ...editingVendor, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">पासवर्ड</label>
                  <input
                    type="text"
                    value={editingVendor.password || ''}
                    onChange={e => setEditingVendor({ ...editingVendor, password: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">पता (Address)</label>
                <textarea
                  rows={2}
                  value={editingVendor.address}
                  onChange={e => setEditingVendor({ ...editingVendor, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow"
                >
                  सेव करें (Save Vendor)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Delivery Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>राइडर विवरण एडिट करें ({editingPartner.name})</span>
              </h3>
              <button onClick={() => setEditingPartner(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartnerEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">राइडर नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={editingPartner.name}
                  onChange={e => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">फ़ोन नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={editingPartner.phone}
                    onChange={e => setEditingPartner({ ...editingPartner, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">वाहन (Vehicle)</label>
                  <input
                    type="text"
                    value={editingPartner.vehicle}
                    onChange={e => setEditingPartner({ ...editingPartner, vehicle: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">पासवर्ड</label>
                <input
                  type="text"
                  value={editingPartner.password || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, password: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-extrabold py-2.5 rounded-xl text-xs shadow"
                >
                  सेव करें (Save Rider)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Service Provider Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-600" />
                <span>सर्विस प्रोवाइडर एडिट करें ({editingService.providerName})</span>
              </h3>
              <button onClick={() => setEditingService(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">प्रदाता नाम (Provider Name) *</label>
                <input
                  type="text"
                  required
                  value={editingService.providerName}
                  onChange={e => setEditingService({ ...editingService, providerName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">फ़ोन नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={editingService.primaryPhone}
                    onChange={e => setEditingService({ ...editingService, primaryPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">सर्विस नाम</label>
                  <input
                    type="text"
                    value={editingService.serviceName || ''}
                    onChange={e => setEditingService({ ...editingService, serviceName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">विजिट चार्ज (₹)</label>
                  <input
                    type="number"
                    value={editingService.visitCharge || 0}
                    onChange={e => setEditingService({ ...editingService, visitCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">लोकेशन / स्थान</label>
                  <input
                    type="text"
                    value={editingService.location || ''}
                    onChange={e => setEditingService({ ...editingService, location: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">पासवर्ड</label>
                <input
                  type="text"
                  value={editingService.password || ''}
                  onChange={e => setEditingService({ ...editingService, password: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow"
                >
                  सेव करें (Save Service)
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
        portalTitle="एडमिन पोर्टल (Admin Console)"
        currentUsername={adminUsername || 'admin'}
        isFirstTime={isFirstTimeChangePass}
        onSave={(newPass) => {
          localStorage.setItem('smart_bazaar_admin_password', newPass);
          setSavedAdminPassword(newPass);
        }}
      />
    </div>
  );
};
