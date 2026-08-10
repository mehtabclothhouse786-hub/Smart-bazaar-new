import React, { useState } from 'react';
import { ServiceProvider, ServiceBooking } from '../types';
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
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesPanelProps {
  services: ServiceProvider[];
  serviceBookings: ServiceBooking[];
  onAddService: (service: Omit<ServiceProvider, 'id'>) => Promise<string>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  onCreateBooking: (booking: Omit<ServiceBooking, 'id'>) => Promise<string>;
  isProviderView?: boolean;
}

const CATEGORIES = [
  { name: 'सभी', icon: Wrench },
  { name: 'प्लंबर', icon: Wrench },
  { name: 'इलेक्ट्रिशियन', icon: Zap },
  { name: 'डॉक्टर', icon: Stethoscope },
  { name: 'ब्यूटी पार्लर', icon: Sparkles },
  { name: 'तकनीशियन', icon: Wrench },
  { name: 'कारपेंटर', icon: Building2 },
  { name: 'अन्य', icon: UserCheck }
];

export const ServicesPanel: React.FC<ServicesPanelProps> = ({
  services = [],
  serviceBookings = [],
  onAddService,
  onDeleteService,
  onCreateBooking,
  isProviderView = false
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

  // Add Service Form State
  const [newProviderName, setNewProviderName] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('प्लंबर');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPrimaryPhone, setNewPrimaryPhone] = useState<string>('');
  const [newWhatsappPhone, setNewWhatsappPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newExperience, setNewExperience] = useState<number>(3);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isSubmittingService, setIsSubmittingService] = useState<boolean>(false);

  // Filter Services
  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'सभी' || s.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      s.providerName.toLowerCase().includes(query) ||
      s.serviceName.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      (s.address && s.address.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  // Handle Booking Trigger (Call or WhatsApp)
  const handleOpenBookingModal = (service: ServiceProvider, mode: 'call' | 'whatsapp') => {
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
      await onAddService({
        providerName: newProviderName.trim(),
        serviceName: newServiceName.trim(),
        category: newCategory,
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

      {/* Top Navigation Bar Tabs */}
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
            onClick={() => setActiveTab('my_bookings')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'my_bookings'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>मेरी बुकिंग्स ({serviceBookings.length})</span>
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
            <span>अपनी सेवा जोड़ें (List Service)</span>
          </button>

          {isProviderView && (
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
          )}
        </div>
      </div>

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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
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
                    <img
                      src={service.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'}
                      alt={service.providerName}
                      className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                    />

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
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      <span>कॉल करें</span>
                    </button>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleOpenBookingModal(service, 'whatsapp')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

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
                आपकी हर बुकिंग आपके सिस्टम में सुरक्षित है। सर्विस प्रोवाइडर से पुनः संपर्क करने के लिए कॉल करें।
              </p>
            </div>
          </div>

          {serviceBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-4">
              <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-stone-800 text-base mb-1">कोई बुकिंग इतिहास नहीं</h3>
              <p className="text-stone-500 text-xs">सर्विस कैटलॉग से तकनीशियन या डॉक्टर को कॉल करें।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceBookings.map((bk) => (
                <div key={bk.id} className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-stone-900">
                        #{bk.id}
                      </span>
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {bk.status}
                      </span>
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
              ))}
            </div>
          )}
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
                <label className="block text-xs font-extrabold text-stone-800 mb-1">
                  कैटेगरी चुनें <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="प्लंबर">प्लंबर (Plumber)</option>
                  <option value="इलेक्ट्रिशियन">इलेक्ट्रिशियन (Electrician)</option>
                  <option value="डॉक्टर">डॉक्टर (Doctor)</option>
                  <option value="ब्यूटी पार्लर">ब्यूटी पार्लर (Beauty Parlor)</option>
                  <option value="तकनीशियन">तकनीशियन (Technician)</option>
                  <option value="कारपेंटर">कारपेंटर (Carpenter)</option>
                  <option value="पेंटर">पेंटर (Painter)</option>
                  <option value="अन्य">अन्य (Other)</option>
                </select>
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

            <div>
              <label className="block text-xs font-extrabold text-stone-800 mb-1">
                फोटो URL (Image Link optional)
              </label>
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
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
            <div className="space-y-3">
              {serviceBookings.map((lead) => (
                <div key={lead.id} className="bg-white border border-stone-200 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      ग्राहक लीड
                    </span>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-1">
                      ग्राहक का नाम: {lead.customerName || 'अज्ञात ग्राहक'}
                    </h4>
                    <div className="text-xs font-mono font-bold text-emerald-800">
                      मोबाइल नंबर: +91 {lead.customerPhone}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      सर्विस: {lead.serviceName}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      समय: {new Date(lead.createdAt).toLocaleString('hi-IN')}
                    </div>
                  </div>

                  <a
                    href={`tel:+91${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>ग्राहक को कॉल करें</span>
                  </a>
                </div>
              ))}
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
