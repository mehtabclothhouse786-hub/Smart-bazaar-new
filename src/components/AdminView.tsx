import React, { useState } from 'react';
import { Product, Order, Vendor, DeliveryPartner, OrderStatus, ServiceProvider } from '../types';
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
  Wrench
} from 'lucide-react';
import { firebaseConfigData } from '../firebase';

interface AdminViewProps {
  products: Product[];
  orders: Order[];
  vendors: Vendor[];
  deliveryPartners: DeliveryPartner[];
  services?: ServiceProvider[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
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
  onAddVendor,
  onDeleteVendor,
  onAddDeliveryPartner,
  onDeleteDeliveryPartner,
  onAddService,
  onDeleteService,
  onSeedDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'vendors' | 'delivery' | 'services' | 'database'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUsername.trim().toLowerCase();
    const p = adminPassword.trim();

    if ((u === 'admin' || u === '9457695918' || u === 'mehtab' || u === '') && (p === '1234' || p === '123' || p === 'admin')) {
      setIsAdminLoggedIn(true);
      setAdminAuthError('');
    } else {
      setAdminAuthError('गलत एडमिन यूज़रनेम या पासवर्ड! (Default: admin / 1234)');
    }
  };

  // Vendor Modal State
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [vShopName, setVShopName] = useState('');
  const [vOwnerName, setVOwnerName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vCategory, setVCategory] = useState('कपड़े (Clothing)');
  const [vAddress, setVAddress] = useState('');
  const [vImageUrl, setVImageUrl] = useState('');
  const [vUsername, setVUsername] = useState('');
  const [vPassword, setVPassword] = useState('123');
  const [vSecAnswer, setVSecAnswer] = useState('express');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Delivery Partner Modal State
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pVehicle, setPVehicle] = useState('बाइक');
  const [pPassword, setPPassword] = useState('123');
  const [pSecAnswer, setPSecAnswer] = useState('express');
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  // Service Provider Modal State
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState<any>('प्लंबर (Plumber)');
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
      await onAddService({
        providerName: sName.trim(),
        serviceName: sCategory,
        category: sCategory,
        description: `${sCategory} सेवा एवं रिपेयरिंग कार्य`,
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
    if (confirm(`क्या आप वाकई सर्विस प्रोवाइडर "${service.providerName}" को हटाना चाहते हैं?`)) {
      if (onDeleteService) {
        try {
          await onDeleteService(service.id);
          alert(`सर्विस प्रोवाइडर "${service.providerName}" को हटा दिया गया है।`);
        } catch (err) {
          console.error('Error deleting service:', err);
          alert('हटाने में समस्या आई।');
        }
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
      await onAddVendor({
        shopName: vShopName,
        ownerName: vOwnerName || vShopName,
        phone: vPhone,
        category: vCategory,
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
    if (confirm(`क्या आप वाकई दुकान "${vendor.shopName}" को प्लेटफॉर्म से हटाना चाहते हैं?`)) {
      if (onDeleteVendor) {
        try {
          await onDeleteVendor(vendor.id);
          alert(`दुकान "${vendor.shopName}" को हटा दिया गया है।`);
        } catch (err) {
          console.error('Error deleting vendor:', err);
          alert('हटाने में समस्या आई।');
        }
      }
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
    if (confirm(`क्या आप वाकई डिलीवरी राइडर "${partner.name}" को हटाना चाहते हैं?`)) {
      if (onDeleteDeliveryPartner) {
        try {
          await onDeleteDeliveryPartner(partner.id);
          alert(`राइडर "${partner.name}" को हटा दिया गया है।`);
        } catch (err) {
          console.error('Error deleting partner:', err);
          alert('हटाने में समस्या आई।');
        }
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

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-4 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-stone-900">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <span>डिफ़ॉल्ट एडमिन क्रेडेंशियल (Admin Login Details):</span>
          </div>
          <div>यूज़रनेम (Username): <strong className="font-mono text-stone-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">admin</strong></div>
          <div>पासवर्ड (Password): <strong className="font-mono text-stone-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">1234</strong> (या 123)</div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">यूज़रनेम (Username)</label>
            <input
              type="text"
              required
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              placeholder="admin"
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
              placeholder="1234"
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

                {/* Delete Vendor Button */}
                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteVendorClick(v)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>वेंडर हटाएं (Remove Vendor)</span>
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

                {/* Delete Partner Button */}
                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => handleDeletePartnerClick(dp)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>राइडर हटाएं (Remove Partner)</span>
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
                    <img
                      src={s.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'}
                      alt={s.providerName}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-100"
                    />
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

                  {/* Delete Service Provider Button */}
                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteServiceClick(s)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>सर्विस हटाएं (Remove Provider)</span>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                  <select
                    value={vCategory}
                    onChange={e => setVCategory(e.target.value)}
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
                <label className="block font-bold text-stone-700 mb-1">सर्विस श्रेणी (Category)</label>
                <select
                  value={sCategory}
                  onChange={e => setSCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                >
                  <option value="प्लंबर (Plumber)">प्लंबर (Plumber)</option>
                  <option value="इलेक्ट्रिशियन (Electrician)">इलेक्ट्रिशियन (Electrician)</option>
                  <option value="ब्यूटीशियन / ब्यूटी पार्लर (Beautician)">ब्यूटीशियन / ब्यूटी पार्लर (Beautician)</option>
                  <option value="डॉक्टर / क्लीनिक (Doctor)">डॉक्टर / क्लीनिक (Doctor)</option>
                  <option value="एसी / टीवी तकनीशियन (AC/TV Repair)">एसी / टीवी तकनीशियन (AC/TV Repair)</option>
                  <option value="बढ़ई / कारपेंटर (Carpenter)">बढ़ई / कारपेंटर (Carpenter)</option>
                  <option value="कार / बाइक मैकेनिक (Mechanic)">कार / बाइक मैकेनिक (Mechanic)</option>
                </select>
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

    </div>
  );
};
