import React, { useState, useEffect } from 'react';
import { ServiceProvider, ServiceBooking, CustomerUser, CommissionSettings, DEFAULT_COMMISSION_SETTINGS } from '../types';
import { updateServiceBookingBill } from '../services/db';
import { shareServiceToWhatsApp } from '../utils/whatsappShare';
import { 
  Phone, 
  MessageCircle, 
  Wrench, 
  Stethoscope, 
  Zap, 
  Sparkles, 
  Plus, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  X, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Trash2,
  PhoneCall,
  LogIn,
  LogOut,
  Lock,
  KeyRound,
  UserPlus,
  Receipt,
  Calculator,
  Percent,
  Share2,
  Send,
  DollarSign,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesPanelProps {
  services: ServiceProvider[];
  serviceBookings: ServiceBooking[];
  commissionSettings?: CommissionSettings;
  onAddService: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  onCreateBooking: (booking: Omit<ServiceBooking, 'id'>) => Promise<string>;
  isProviderView?: boolean;
  customerUser?: CustomerUser | null;
  onRequireLogin?: (actionCallback: () => void, promptText?: string) => void;
}

const CATEGORIES = [
  { name: 'सभी', icon: Wrench },
  { name: 'प्लंबर', icon: Wrench },
  { name: 'इलेक्ट्रिशियन', icon: Zap },
  { name: 'डॉक्टर', icon: Stethoscope },
  { name: 'ब्यूटी पार्लर', icon: Sparkles },
  { name: 'तकनीशियन', icon: Wrench },
  { name: 'कारपेंटर', icon: Building2 },
  { name: 'पेंटर', icon: Sparkles },
  { name: 'अन्य', icon: UserCheck }
];

export const getServiceCategoryBadge = (category: string = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('इलेक्ट्रिशियन') || cat.includes('electrician') || cat.includes('बिजली') || cat.includes('ac')) {
    return { icon: Zap, bg: 'bg-amber-100 border-amber-300 text-amber-800' };
  }
  if (cat.includes('डॉक्टर') || cat.includes('doctor') || cat.includes('क्लीनिक') || cat.includes('चिकित्सा')) {
    return { icon: Stethoscope, bg: 'bg-rose-100 border-rose-300 text-rose-800' };
  }
  if (cat.includes('ब्यूटी') || cat.includes('beauty') || cat.includes('पार्लर') || cat.includes('ब्यूटीशियन')) {
    return { icon: Sparkles, bg: 'bg-pink-100 border-pink-300 text-pink-800' };
  }
  if (cat.includes('कारपेंटर') || cat.includes('carpenter') || cat.includes('बढ़ई')) {
    return { icon: Building2, bg: 'bg-orange-100 border-orange-300 text-orange-800' };
  }
  if (cat.includes('प्लंबर') || cat.includes('plumber') || cat.includes('नल')) {
    return { icon: Wrench, bg: 'bg-blue-100 border-blue-300 text-blue-800' };
  }
  if (cat.includes('पेंटर') || cat.includes('painter') || cat.includes('पेंटिंग') || cat.includes('रंग')) {
    return { icon: Sparkles, bg: 'bg-purple-100 border-purple-300 text-purple-800' };
  }
  if (cat.includes('तकनीशियन') || cat.includes('technician') || cat.includes('रिपेयर')) {
    return { icon: Wrench, bg: 'bg-indigo-100 border-indigo-300 text-indigo-800' };
  }
  return { icon: Wrench, bg: 'bg-teal-100 border-teal-300 text-teal-800' };
};

export const ServicesPanel: React.FC<ServicesPanelProps> = ({
  services = [],
  serviceBookings = [],
  commissionSettings = DEFAULT_COMMISSION_SETTINGS,
  onAddService,
  onDeleteService,
  onCreateBooking,
  isProviderView = false,
  customerUser,
  onRequireLogin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'browse' | 'my_bookings' | 'add_service' | 'received_leads'>(
    isProviderView ? 'add_service' : 'browse'
  );

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);
  const [bookingMode, setBookingMode] = useState<'call' | 'whatsapp'>('call');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [createdBookingSuccess, setCreatedBookingSuccess] = useState<{
    id: string;
    providerPhone: string;
    whatsappPhone: string;
    serviceName: string;
    providerName: string;
  } | null>(null);

  // Auto pre-fill customer name and phone when customerUser is available
  useEffect(() => {
    if (customerUser?.isLoggedIn) {
      if (customerUser.name) setCustomerName(customerUser.name);
      if (customerUser.phone) setCustomerPhone(customerUser.phone);
    }
  }, [customerUser]);

  // Add Service Form State
  const [newProviderName, setNewProviderName] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('प्लंबर');
  const [isCustomServiceCategory, setIsCustomServiceCategory] = useState<boolean>(false);
  const [customServiceCategoryInput, setCustomServiceCategoryInput] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPrimaryPhone, setNewPrimaryPhone] = useState<string>('');
  const [newWhatsappPhone, setNewWhatsappPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newExperience, setNewExperience] = useState<number>(3);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isSubmittingService, setIsSubmittingService] = useState<boolean>(false);

  // Billing State for Service Providers
  const [billingLeadId, setBillingLeadId] = useState<string | null>(null);
  const [materialCostInput, setMaterialCostInput] = useState<string>('');
  const [isSavingBill, setIsSavingBill] = useState<boolean>(false);

  // Bill Handlers
  const handleOpenBillForm = (lead: ServiceBooking) => {
    setBillingLeadId(lead.id);
    setMaterialCostInput(lead.materialCost !== undefined ? String(lead.materialCost) : '');
  };

  const handleSaveServiceBill = async (bookingId: string) => {
    setIsSavingBill(true);
    try {
      const numMat = Math.max(0, Number(materialCostInput) || 0);
      const serviceMargin = commissionSettings?.servicePlatformFeePercent ?? 10;
      await updateServiceBookingBill(bookingId, numMat, 100, commissionSettings);
      setBillingLeadId(null);
      setMaterialCostInput('');
      alert(`✅ ग्राहक का सर्विस बिल (₹100 Per Call + सामान + ${serviceMargin}% मार्जिन) सफलतापूर्वक जनरेट हो गया!`);
    } catch (err) {
      console.error('Error saving service bill:', err);
      alert('बिल सहेजने में त्रुटि हुई।');
    } finally {
      setIsSavingBill(false);
    }
  };

  const handleShareBillWhatsApp = (lead: ServiceBooking) => {
    const serviceMargin = commissionSettings?.servicePlatformFeePercent ?? 10;
    const visit = lead.visitFee || 100;
    const mat = lead.materialCost || 0;
    const sub = lead.subtotal || (visit + mat);
    const fee = lead.platformFee || Math.round(sub * (serviceMargin / 100));
    const total = lead.finalBillAmount || (sub + fee);

    const text = `🧾 *स्मार्ट बाजार - सर्विस बिल रसीद*
------------------------------
📌 *बुकिंग ID:* #${lead.id}
🔧 *सर्विस:* ${lead.serviceName}
👨‍🔧 *सर्विस प्रदाता:* ${lead.providerName}
📱 *ग्राहक नंबर:* +91 ${lead.customerPhone}
------------------------------
1️⃣ कॉल/विजिट चार्ज (Per Call): ₹${visit}
2️⃣ सामान/पार्ट्स खर्च: ₹${mat}
------------------------------
*सबटोटल (Subtotal):* ₹${sub}
3️⃣ स्मार्ट बाजार 10% सर्विस चार्ज (+10%): ₹${fee}
==============================
💰 *कुल ग्राहक देय बिल (Final Bill): ₹${total}*
==============================
धन्यवाद! स्मार्ट बाजार सर्विसेज (Made in India)`;

    const cleanPhone = lead.customerPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filter Services
  const filteredServices = services.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'सभी' || s.category === selectedCategory;

    if (!query) return matchesCategory;

    const catLower = (s.category || '').toLowerCase();
    const nameLower = (s.serviceName || '').toLowerCase();
    const provLower = (s.providerName || '').toLowerCase();
    const addrLower = (s.address || '').toLowerCase();
    const descLower = (s.description || '').toLowerCase();

    const matchesSearch = 
      provLower.includes(query) ||
      nameLower.includes(query) ||
      catLower.includes(query) ||
      addrLower.includes(query) ||
      descLower.includes(query) ||
      ((query.includes('plumber') || query.includes('नल') || query.includes('पाइप')) && catLower.includes('प्लंबर')) ||
      ((query.includes('electric') || query.includes('बिजली') || query.includes('लाइट')) && catLower.includes('इलेक्ट्रिशियन')) ||
      ((query.includes('doctor') || query.includes('डॉक्टर') || query.includes('चिकित्सा')) && catLower.includes('डॉक्टर')) ||
      ((query.includes('beauty') || query.includes('पार्लर') || query.includes('मेकअप')) && catLower.includes('ब्यूटी')) ||
      ((query.includes('tech') || query.includes('तकनीशियन') || query.includes('मोबाइल')) && catLower.includes('तकनीशियन')) ||
      ((query.includes('carpenter') || query.includes('कारपेंटर') || query.includes('बढ़ई')) && catLower.includes('कारपेंटर')) ||
      ((query.includes('paint') || query.includes('पेंटर') || query.includes('रंग')) && catLower.includes('पेंटर'));

    if (selectedCategory === 'सभी') {
      return matchesSearch;
    }
    return matchesCategory && matchesSearch;
  });

  // Handle Booking Trigger (Call or WhatsApp)
  const handleOpenBookingModal = (service: ServiceProvider, mode: 'call' | 'whatsapp') => {
    if (!customerUser?.isLoggedIn && onRequireLogin) {
      onRequireLogin(() => {
        setSelectedService(service);
        setBookingMode(mode);
      }, 'सर्विस बुक करने या तकनीशियन से संपर्क करने के लिए लॉगिन करें');
      return;
    }
    setSelectedService(service);
    setBookingMode(mode);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Validate 10-digit mobile number
    const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      alert('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें। (उदा: 9876543210)');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      // Save booking in Firestore / LocalStorage for history & leads
      const newBookingId = await onCreateBooking({
        serviceId: selectedService.id,
        serviceName: selectedService.serviceName,
        providerName: selectedService.providerName,
        providerPhone: selectedService.primaryPhone,
        customerPhone: cleanPhone,
        customerName: customerName.trim() || 'ग्राहक',
        address: customerAddress.trim() || undefined,
        status: 'Booked / Contacted',
        createdAt: Date.now()
      });

      const providerPhone = selectedService.primaryPhone.trim().replace(/[^0-9]/g, '');
      const whatsappPhone = (selectedService.whatsappPhone || selectedService.primaryPhone).trim().replace(/[^0-9]/g, '');

      setCreatedBookingSuccess({
        id: newBookingId || 'SBK' + Math.floor(100000 + Math.random() * 900000),
        providerPhone,
        whatsappPhone,
        serviceName: selectedService.serviceName,
        providerName: selectedService.providerName
      });

      if (bookingMode === 'call') {
        try {
          window.location.href = `tel:+91${providerPhone}`;
        } catch (e) {
          console.error(e);
        }
      } else {
        const msg = `नमस्ते ${selectedService.providerName} जी! मैंने स्मार्ट बाजार ऐप से आपकी सर्विस "${selectedService.serviceName}" देखी है। कृपया मुझसे संपर्क करें। (मेरा नंबर: ${cleanPhone}${customerName ? ', नाम: ' + customerName : ''})`;
        try {
          window.open(`https://wa.me/91${whatsappPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        } catch (e) {
          console.error(e);
        }
      }

      // Close Form Modal
      setSelectedService(null);
      setCustomerPhone('');
      setCustomerName('');
      setCustomerAddress('');
    } catch (err) {
      console.error('Error recording service booking:', err);
      const providerPhone = selectedService.primaryPhone.trim().replace(/[^0-9]/g, '');
      try {
        window.location.href = `tel:+91${providerPhone}`;
      } catch (e) {
        console.error(e);
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Add Service Form Submit
  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newPrimaryPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      alert('कृपया 10 अंकों का वैध प्राथमिक मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSubmittingService(true);
    try {
      const finalCategory = isCustomServiceCategory ? (customServiceCategoryInput.trim() || 'अन्य') : newCategory;
      await onAddService({
        providerName: newProviderName.trim(),
        serviceName: newServiceName.trim(),
        category: finalCategory,
        description: newDescription.trim(),
        primaryPhone: cleanPhone,
        whatsappPhone: newWhatsappPhone.trim() ? newWhatsappPhone.trim().replace(/[^0-9]/g, '') : cleanPhone,
        address: newAddress.trim() || 'बिजनौर / चांदपुर',
        experienceYears: Number(newExperience) || 1,
        rating: 5.0,
        imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        createdAt: Date.now()
      });

      alert('आपकी सर्विस सफलतापूर्वक स्मार्ट बाजार में जोड़ दी गई है!');
      // Reset form
      setNewProviderName('');
      setNewServiceName('');
      setNewDescription('');
      setNewPrimaryPhone('');
      setNewWhatsappPhone('');
      setNewAddress('');
      setActiveTab('browse');
    } catch (err) {
      console.error('Error adding service:', err);
      alert('सर्विस जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSubmittingService(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Service Provider Portal Header Badge (When in Provider View) */}
      {isProviderView && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-xs shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-stone-900 text-base sm:text-lg">सर्विस प्रदाता पोर्टल (Service Provider View)</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    सक्रिय (Active)
                  </span>
                </div>
                <p className="text-stone-500 text-xs mt-0.5">तकनीशियन, प्लंबर, इलेक्ट्रिशियन व सर्विस लीड्स मैनेजमेंट</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('add_service')}
                className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ नई सर्विस जोड़ें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black mb-3 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>लोकल सर्विस डायरेक्टरी (Made in India)</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            तकनीशियन, डॉक्टर, प्लंबर व इलेक्ट्रिशियन खोजें
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
            अपना नंबर दर्ज करें और एक क्लिक में सीधे सर्विस प्रोवाइडर से कॉल या WhatsApp पर बात करें!
          </p>
        </div>
      </div>

      {/* Top Navigation Bar Tabs (Only shown in Service Provider View) */}
      {isProviderView && (
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'browse'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>सभी सेवाएं ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add_service')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'add_service'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ नई सेवा जोड़ें</span>
            </button>

            <button
              onClick={() => setActiveTab('received_leads')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'received_leads'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>कस्टमर कॉल्स / लीाड्स ({serviceBookings.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: BROWSE SERVICES */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खोजें (प्लंबर, इलेक्ट्रिशियन, डॉक्टर, एसी रिपेयर, चांदपुर)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-full text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Service Cards Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-4">
              <Wrench className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-stone-800 text-base mb-1">कोई सेवा नहीं मिली</h3>
              <p className="text-stone-500 text-xs">कृपया अन्य कैटेगरी चुनें या अपनी सर्विस लिस्ट में जोड़ें।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -2 }}
                  className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    {(() => {
                      const { icon: ServiceIcon, bg } = getServiceCategoryBadge(service.category);
                      return (
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${bg} border flex items-center justify-center shrink-0 shadow-2xs`}>
                          <ServiceIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                      );
                    })()}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        {service.rating && (
                          <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{service.rating}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-stone-900 text-base leading-tight mt-1 line-clamp-1">
                        {service.serviceName}
                      </h3>
                      
                      <p className="text-xs font-bold text-stone-700 leading-snug">
                        प्रोवाइडर: {service.providerName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-150">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 pt-1 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{service.address || 'स्थान: बिजनौर / चांदपुर'}</span>
                    </span>

                    {service.experienceYears && (
                      <span className="font-bold text-stone-700">
                        अनुभव: {service.experienceYears} वर्ष
                      </span>
                    )}
                  </div>

                  {/* Primary Call & WhatsApp Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Call Button */}
                    <button
                      onClick={() => handleOpenBookingModal(service, 'call')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      <span>कॉल करें</span>
                    </button>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleOpenBookingModal(service, 'whatsapp')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* WhatsApp Status Share Button */}
                  <button
                    type="button"
                    onClick={() => shareServiceToWhatsApp(service)}
                    className="w-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/40 font-bold text-xs py-2 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                    title="व्हाट्सएप स्टेटस पर शेयर करें"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp स्टेटस पर शेयर करें</span>
                  </button>

                  {isProviderView && onDeleteService && (
                    <button
                      onClick={() => onDeleteService(service.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SERVICE BOOKINGS */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-amber-950 text-sm">मेरी हालिया सर्विस कॉल्स</h3>
              <p className="text-amber-800 text-xs mt-0.5 font-medium">
                आपकी हर बुकिंग आपके खाते में सुरक्षित है। सर्विस प्रोवाइडर से पुनः संपर्क करने के लिए कॉल करें।
              </p>
            </div>
          </div>

          {!customerUser?.isLoggedIn ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 my-4 space-y-3">
              <UserCheck className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-extrabold text-stone-800 text-base">अपनी सर्विस बुकिंग्स देखें</h3>
              <p className="text-stone-500 text-xs">अपने मोबाइल नंबर और पासवर्ड से लॉगिन करें और अपनी सभी सेवाओं का रिकॉर्ड देखें!</p>
              <button
                onClick={() => onRequireLogin ? onRequireLogin(() => {}, 'अपनी बुकिंग्स देखने के लिए लॉगिन करें') : null}
                className="bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                लॉगिन करें (Login Now)
              </button>
            </div>
          ) : (() => {
            const myBookings = serviceBookings.filter(b => {
              if (!customerUser?.phone) return false;
              const cleanCustomerPhone = customerUser.phone.replace(/\D/g, '');
              const cleanBookingPhone = (b.customerPhone || '').replace(/\D/g, '');
              return cleanCustomerPhone && cleanBookingPhone && (cleanBookingPhone.includes(cleanCustomerPhone) || cleanCustomerPhone.includes(cleanBookingPhone));
            });

            if (myBookings.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-4">
                  <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-extrabold text-stone-800 text-base mb-1">कोई बुकिंग इतिहास नहीं</h3>
                  <p className="text-stone-500 text-xs">सर्विस कैटलॉग से तकनीशियन या डॉक्टर को कॉल या WhatsApp संदेश भेजें।</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {myBookings.map((bk) => (
                  <div key={bk.id} className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-stone-900">
                            #{bk.id}
                          </span>
                          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            {bk.status}
                          </span>
                          {bk.finalBillAmount && (
                            <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              कुल बिल: ₹{bk.finalBillAmount}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-stone-900 text-sm mt-1">{bk.serviceName}</h4>
                        <div className="text-xs text-stone-600 font-medium">
                          प्रोवाइडर: {bk.providerName} ({bk.providerPhone})
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          तारीख: {new Date(bk.createdAt).toLocaleString('hi-IN')}
                        </div>
                      </div>

                      <a
                        href={`tel:+91${bk.providerPhone.replace(/[^0-9]/g, '')}`}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>कॉल करें</span>
                      </a>
                    </div>

                    {bk.finalBillAmount && (
                      <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-black text-emerald-950 border-b border-emerald-200 pb-1">
                          <span className="flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                            <span>सर्विस बिल रसीद (Per Call ₹100 + सामान + 10% शुल्क)</span>
                          </span>
                          <span className="text-emerald-800 font-extrabold text-sm">₹{bk.finalBillAmount}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-stone-700 font-semibold text-[11px] pt-1">
                          <div>• कॉल/विजिट: ₹{bk.visitFee || 100}</div>
                          <div>• सामान/पार्ट्स: ₹{bk.materialCost || 0}</div>
                          <div>• 10% सेवा शुल्क: ₹{bk.platformFee || Math.round(((bk.visitFee || 100) + (bk.materialCost || 0)) * 0.10)}</div>
                          <div className="font-black text-emerald-900">• कुल देय: ₹{bk.finalBillAmount}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: ADD SERVICE FORM (अपनी सेवा जोड़ें) */}
      {activeTab === 'add_service' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm max-w-xl mx-auto">
          <div className="border-b border-stone-200 pb-3 mb-4">
            <h2 className="font-black text-stone-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-700" />
              <span>स्मार्ट बाजार में अपनी सेवा दर्ज करें (List Service)</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              तकनीशियन, डॉक्टर, ब्यूटी पार्लर, इलेक्ट्रिशियन अपना 10 अंकों का मोबाइल नंबर व जानकारी सेव करें।
            </p>
          </div>

          <form onSubmit={handleAddServiceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                आपका नाम / दुकान का नाम <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newProviderName}
                onChange={e => setNewProviderName(e.target.value)}
                placeholder="उदा: राजेश वर्मा / शर्मा इलेक्ट्रॉनिक्स"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                कार्य / सर्विस का नाम <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                placeholder="उदा: नल एवं सैनिटरी रिपेयर, होम विजिट डॉक्टर"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-stone-800">
                    कैटेगरी चुनें <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomServiceCategory(!isCustomServiceCategory);
                      if (!isCustomServiceCategory) setCustomServiceCategoryInput('');
                    }}
                    className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-blue-600" />
                    <span>{isCustomServiceCategory ? 'सूची से चुनें' : '✏️ एडिट/कस्टम'}</span>
                  </button>
                </div>

                {!isCustomServiceCategory ? (
                  <select
                    value={newCategory}
                    onChange={e => {
                      if (e.target.value === 'अन्य' || e.target.value === '__custom__') {
                        setIsCustomServiceCategory(true);
                      } else {
                        setNewCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="प्लंबर">प्लंबर (Plumber)</option>
                    <option value="इलेक्ट्रिशियन">इलेक्ट्रिशियन (Electrician)</option>
                    <option value="डॉक्टर">डॉक्टर (Doctor)</option>
                    <option value="ब्यूटी पार्लर">ब्यूटी पार्लर (Beauty Parlor)</option>
                    <option value="तकनीशियन">तकनीशियन (Technician)</option>
                    <option value="कारपेंटर">कारपेंटर (Carpenter)</option>
                    <option value="पेंटर">पेंटर (Painter)</option>
                    <option value="अन्य">✏️ + अन्य / न्यू कस्टम श्रेणी दर्ज करें (Custom)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customServiceCategoryInput}
                    onChange={e => setCustomServiceCategoryInput(e.target.value)}
                    placeholder="उदा: टेलर / सिक्योरिटी गॉर्ड / कुक"
                    className="w-full px-3.5 py-2.5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-xs font-extrabold outline-none text-stone-900 focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  अनुभव (वर्षों में)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={newExperience}
                  onChange={e => setNewExperience(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Primary Call Number and WhatsApp Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
              <div>
                <label className="block text-xs font-black text-emerald-950 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Primary Call Number <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newPrimaryPhone}
                  onChange={e => setNewPrimaryPhone(e.target.value)}
                  placeholder="9876543210 (10 अंक)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  जिस पर ग्राहक की कॉल जाएगी (tel:+91...)
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-emerald-950 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Number (ऐच्छिक)</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newWhatsappPhone}
                  onChange={e => setNewWhatsappPhone(e.target.value)}
                  placeholder="9876543210 (चैट हेतु)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  चैट व फोटो/लोकेशन प्राप्त करने हेतु
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                शॉर्ट विवरण (आप क्या काम करते हैं) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="उदा: बाथरूम, किचन नल फिटिंग, वाटर टैंक सफाई व लीकेज रिपेयरिंग।"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                शहर / क्षेत्र / एड्रेस
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="उदा: चांदपुर, बिजनौर"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingService}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmittingService ? 'सेवा सेव हो रही है...' : 'सर्विस सेव करें (Save Service)'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: RECEIVED LEADS (For Providers) */}
      {activeTab === 'received_leads' && isProviderView && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-blue-950 text-sm">कस्टमर बुकिंग व कॉल्स इतिहास</h3>
              <p className="text-blue-800 text-xs mt-0.5 font-medium">
                ग्राहकों ने आपकी सर्विस पर कॉल / बुकिंग बटन दबाया था। आप यहाँ से उन्हें वापस कॉल कर सकते हैं।
              </p>
            </div>
          </div>

          {serviceBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-4">
              <PhoneCall className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-stone-800 text-base mb-1">अभी तक कोई कॉल या लीड नहीं</h3>
              <p className="text-stone-500 text-xs">ग्राहकों के कॉल करते ही उनकी जानकारी यहाँ दिखाई देगी।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceBookings.map((lead) => {
                const serviceMargin = commissionSettings?.servicePlatformFeePercent ?? 10;
                const isFormOpen = billingLeadId === lead.id;
                const numMat = Math.max(0, Number(materialCostInput) || 0);
                const visit = 100;
                const calcSub = visit + numMat;
                const calcFee = Math.round(calcSub * (serviceMargin / 100));
                const calcTotal = calcSub + calcFee;

                return (
                  <div key={lead.id} className="bg-white border border-stone-200 rounded-3xl p-4.5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                            ग्राहक लीड #{lead.id}
                          </span>
                          {lead.finalBillAmount && (
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              ✅ कुल बिल: ₹{lead.finalBillAmount}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-stone-900 text-sm mt-1">
                          ग्राहक नाम: {lead.customerName || 'अज्ञात ग्राहक'}
                        </h4>
                        <div className="text-xs font-mono font-bold text-emerald-800">
                          मोबाइल नंबर: +91 {lead.customerPhone}
                        </div>
                        {lead.address && (
                          <div className="text-xs text-stone-600 mt-0.5 font-medium">
                            पता / टिप्पणी: {lead.address}
                          </div>
                        )}
                        <div className="text-xs text-stone-500 mt-0.5">
                          सर्विस: {lead.serviceName}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          समय: {new Date(lead.createdAt).toLocaleString('hi-IN')}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:+91${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-4 h-4 fill-white" />
                          <span>कॉल करें</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenBillForm(lead)}
                          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>{lead.finalBillAmount ? 'बिल संशोधित करें' : `🧾 बिल जनरेट करें (+${serviceMargin}%)`}</span>
                        </button>
                      </div>
                    </div>

                    {/* GENERATED BILL SUMMARY INVOICE (when bill exists) */}
                    {lead.finalBillAmount && !isFormOpen && (
                      <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <span className="font-black text-emerald-950 flex items-center gap-1 text-xs sm:text-sm">
                            <Receipt className="w-4 h-4 text-emerald-700" />
                            <span>स्मार्ट बाजार - फाइनल ग्राहक बिल रसीद</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleShareBillWhatsApp(lead)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp रसीद भेजें</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700 font-semibold pt-1">
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 shadow-2xs">
                            <span className="text-[10px] text-stone-500 block">1. कॉल/विजिट शुल्क</span>
                            <span className="font-extrabold text-stone-900 text-xs">₹{lead.visitFee || 100}</span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 shadow-2xs">
                            <span className="text-[10px] text-stone-500 block">2. सामान/पार्ट्स खर्च</span>
                            <span className="font-extrabold text-stone-900 text-xs">₹{lead.materialCost || 0}</span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 shadow-2xs">
                            <span className="text-[10px] text-stone-500 block">3. {serviceMargin}% मार्जिन शुल्क</span>
                            <span className="font-extrabold text-emerald-800 text-xs">₹{lead.platformFee || Math.round(((lead.visitFee || 100) + (lead.materialCost || 0)) * (serviceMargin / 100))}</span>
                          </div>
                          <div className="bg-emerald-700 text-white p-2 rounded-xl shadow-xs">
                            <span className="text-[10px] text-emerald-100 block font-bold">कुल देय ग्राहक बिल</span>
                            <span className="font-black text-sm sm:text-base">₹{lead.finalBillAmount}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BILL GENERATION FORM SECTION */}
                    {isFormOpen && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-amber-700" />
                            <h4 className="font-black text-amber-950 text-sm">
                              सर्विस बिल सेक्शन (Per Call ₹100 + सामान का बिल + {serviceMargin}%)
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBillingLeadId(null)}
                            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                            <label className="block text-[11px] font-black text-stone-700 mb-1">
                              1. कॉल / विजिट शुल्क (Fixed)
                            </label>
                            <div className="text-base font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              ₹100 <span className="text-[10px] font-medium text-stone-500">(प्रति कॉल विजिट)</span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                            <label className="block text-[11px] font-black text-amber-950 mb-1">
                              2. सामान / स्पेयर पार्ट्स का बिल (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={materialCostInput}
                              onChange={e => setMaterialCostInput(e.target.value)}
                              placeholder="उदा: 350 (सामान का कुल खर्च भरें)"
                              className="w-full px-3 py-1.5 bg-amber-50/50 border border-amber-300 rounded-lg text-sm font-extrabold outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="text-[10px] text-stone-500 font-semibold block mt-1">
                              केवल सामान/सामग्री का बिल भरें, {serviceMargin}% शुल्क ऑटोमैटिक जुड़ेगा।
                            </span>
                          </div>
                        </div>

                        {/* LIVE AUTOMATIC BILL CALCULATOR PREVIEW */}
                        <div className="bg-stone-900 text-white rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between border-b border-stone-800 pb-1.5">
                            <span>ऑटोमैटिक बिल कैलकुलेशन (Auto Invoice Preview):</span>
                            <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md font-black text-[10px]">
                              {serviceMargin}% Margin Added
                            </span>
                          </div>

                          <div className="space-y-1 font-mono text-stone-300">
                            <div className="flex justify-between">
                              <span>• विजिट कॉल शुल्क (Visit Fee):</span>
                              <span>₹{visit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>• सामान / पार्ट्स खर्च (Material):</span>
                              <span>₹{numMat}</span>
                            </div>
                            <div className="flex justify-between text-stone-400 border-t border-stone-800 pt-1">
                              <span>• सबटोटल (Subtotal):</span>
                              <span>₹{calcSub}</span>
                            </div>
                            <div className="flex justify-between text-emerald-400 font-bold">
                              <span>• स्मार्ट बाजार {serviceMargin}% सेवा शुल्क (+{serviceMargin}%):</span>
                              <span>+ ₹{calcFee}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t-2 border-amber-400/50 pt-2 text-amber-300 text-sm font-black">
                            <span>कुल ग्राहक देय बिल (Final Customer Bill):</span>
                            <span className="text-lg text-amber-400 font-black">₹{calcTotal}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setBillingLeadId(null)}
                            className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            रद्द करें
                          </button>
                          <button
                            type="button"
                            disabled={isSavingBill}
                            onClick={() => handleSaveServiceBill(lead.id)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSavingBill ? 'सहेजा जा रहा है...' : '✅ बिल जनरेट व सेव करें'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CUSTOMER PHONE ENTRY MODAL */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 relative"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 border-b border-stone-200 pb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 font-extrabold">
                  {bookingMode === 'call' ? <Phone className="w-6 h-6 fill-emerald-800" /> : <MessageCircle className="w-6 h-6 fill-emerald-800" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                    {selectedService.serviceName}
                  </h3>
                  <p className="text-xs text-stone-600 font-bold">
                    प्रोवाइडर: {selectedService.providerName}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 font-medium">
                  {bookingMode === 'call'
                    ? 'कॉल करने के लिए अपना 10 अंकों का मोबाइल नंबर दर्ज करें। बुकिंग रिकॉर्ड सहेजकर तुरंत डायल किया जाएगा।'
                    : 'WhatsApp पर बात करने हेतु अपना 10 अंकों का मोबाइल नंबर दर्ज करें।'}
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-800 mb-1">
                    आपका मोबाइल नंबर <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="9876543210 (10 अंक)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-stone-500 font-semibold block mt-1">
                    यह नंबर बुकिंग रिकॉर्ड व फॉलो-अप हेतु सेव होगा।
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-800 mb-1">
                    आपका नाम (ऐच्छिक)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="उदा: रमेश शर्मा"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-800 mb-1">
                    आपका पता / रिमार्क (ऐच्छिक)
                  </label>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="उदा: मेन बाज़ार, चांदपुर (नल लीक की समस्या है)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {bookingMode === 'call' ? (
                    <>
                      <Phone className="w-4 h-4 fill-white" />
                      <span>कॉल कनेक्ट करें (tel:+91...)</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp पर बात करें</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SERVICE BOOKING SUCCESS MODAL */}
      <AnimatePresence>
        {createdBookingSuccess && (
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
                  बुकिंग रिकॉर्ड सहेजा गया!
                </span>
                <h2 className="text-xl font-black text-stone-900">
                  बुकिंग ID: #{createdBookingSuccess.id}
                </h2>
                <p className="text-stone-600 text-xs mt-1 font-medium">
                  {createdBookingSuccess.serviceName} - {createdBookingSuccess.providerName}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={`tel:+91${createdBookingSuccess.providerPhone}`}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>डायरेक्ट कॉल करें (+91 {createdBookingSuccess.providerPhone})</span>
                </a>

                <a
                  href={`https://wa.me/91${createdBookingSuccess.whatsappPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp पर चैट खोलें</span>
                </a>

                <button
                  onClick={() => {
                    setCreatedBookingSuccess(null);
                    setActiveTab('my_bookings');
                  }}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold py-2.5 rounded-2xl text-xs mt-2 border border-stone-300"
                >
                  मेरी बुकिंग्स देखें (My Bookings)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
