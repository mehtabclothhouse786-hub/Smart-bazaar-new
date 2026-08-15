import React, { useState, useEffect } from 'react';
import { OldItem, CustomerUser, CommissionSettings, DEFAULT_COMMISSION_SETTINGS } from '../types';
import { shareOldItemToWhatsApp } from '../utils/whatsappShare';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Share2, 
  Camera, 
  Smartphone, 
  Tv, 
  Bike, 
  Armchair, 
  Fan, 
  Shirt, 
  BookOpen, 
  Package, 
  UserCheck, 
  Clock, 
  Filter,
  Check,
  Eye,
  ArrowUpDown,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OldItemsPanelProps {
  oldItems: OldItem[];
  commissionSettings?: CommissionSettings;
  onAddOldItem: (item: Omit<OldItem, 'id'>) => Promise<string>;
  onUpdateOldItem: (id: string, updates: Partial<OldItem>) => Promise<void>;
  onDeleteOldItem: (id: string) => Promise<void>;
  customerUser?: CustomerUser | null;
  onRequireLogin?: (actionCallback: () => void, promptText?: string) => void;
  isAdmin?: boolean;
}

const OLD_ITEM_CATEGORIES = [
  { name: 'सभी', icon: Package },
  { name: 'मोबाइल एवं इलेक्ट्रॉनिक्स', icon: Tv },
  { name: 'वाहन / बाइक', icon: Bike },
  { name: 'फर्नीचर', icon: Armchair },
  { name: 'घरेलू उपकरण', icon: Fan },
  { name: 'कपड़े एवं परिधान', icon: Shirt },
  { name: 'किताबें व शिक्षा', icon: BookOpen },
  { name: 'अन्य', icon: Package }
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'मोबाइल एवं इलेक्ट्रॉनिक्स': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=80',
  'वाहन / बाइक': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80',
  'फर्नीचर': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
  'घरेलू उपकरण': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80',
  'कपड़े एवं परिधान': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80',
  'किताबें व शिक्षा': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
  'अन्य': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80'
};

export const OldItemsPanel: React.FC<OldItemsPanelProps> = ({
  oldItems = [],
  commissionSettings = DEFAULT_COMMISSION_SETTINGS,
  onAddOldItem,
  onUpdateOldItem,
  onDeleteOldItem,
  customerUser,
  onRequireLogin,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'my_items'>('browse');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'Like New' | 'Good' | 'Fair'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  // Modal State for Viewing Item Details
  const [selectedDetailItem, setSelectedDetailItem] = useState<OldItem | null>(null);

  // Sell Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('मोबाइल एवं इलेक्ट्रॉनिक्स');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [itemAge, setItemAge] = useState<string>('1 वर्ष');
  const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair'>('Good');
  const [description, setDescription] = useState<string>('');
  const [sellerName, setSellerName] = useState<string>('');
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('बिजनौर');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successItemPosted, setSuccessItemPosted] = useState<OldItem | null>(null);

  // Pre-fill user information if available
  useEffect(() => {
    if (customerUser?.isLoggedIn) {
      if (customerUser.name && !sellerName) setSellerName(customerUser.name);
      if (customerUser.phone && !sellerPhone) {
        setSellerPhone(customerUser.phone);
        setWhatsappPhone(customerUser.phone);
      }
      if (customerUser.address && !location) {
        setLocation(customerUser.address);
      }
    }
  }, [customerUser]);

  // Handle Photo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('फोटो का साइज़ 4MB से कम होना चाहिए।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Sell Item Form
  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = sellerPhone.trim().replace(/\D/g, '');
    if (!title.trim()) {
      alert('कृपया सामान का नाम दर्ज करें।');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert('कृपया सही कीमत दर्ज करें।');
      return;
    }
    if (cleanPhone.length < 10) {
      alert('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!sellerName.trim()) {
      alert('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!location.trim()) {
      alert('कृपया अपना स्थान/शहर/गांव दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const fallbackImg = DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['अन्य'];
      const finalImg = imagePreview || fallbackImg;

      const numSellerPrice = Number(price);
      const marginPct = commissionSettings?.oldItemAdminMarginPercent ?? 10;
      const adminMarginAmount = Math.round(numSellerPrice * (marginPct / 100)); // dynamic admin margin
      const finalCustomerPrice = numSellerPrice + adminMarginAmount; // Total price shown to customers

      const newItemData: Omit<OldItem, 'id'> = {
        title: title.trim(),
        category,
        sellerPrice: numSellerPrice,
        adminMargin: adminMarginAmount,
        price: finalCustomerPrice, // Automatically includes 10% admin margin
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        itemAge: itemAge.trim() || 'ज्ञात नहीं',
        condition,
        description: description.trim() || 'कोई अतिरिक्त विवरण नहीं दिया गया।',
        sellerName: sellerName.trim(),
        sellerPhone: cleanPhone,
        whatsappPhone: whatsappPhone ? whatsappPhone.trim().replace(/\D/g, '') : cleanPhone,
        location: location.trim(),
        imageUrl: finalImg,
        status: 'available',
        createdAt: Date.now(),
        sellerUserId: customerUser?.id || `user_${cleanPhone}`
      };

      const newId = await onAddOldItem(newItemData);
      const createdItem: OldItem = { ...newItemData, id: newId };
      setSuccessItemPosted(createdItem);

      // Reset form
      setTitle('');
      setPrice('');
      setOriginalPrice('');
      setItemAge('1 वर्ष');
      setDescription('');
      setImagePreview(null);
      setActiveTab('browse');
    } catch (err) {
      console.error('Error posting old item:', err);
      alert('सामान पोस्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Items
  const filteredItems = oldItems.filter(item => {
    // Category match
    if (selectedCategory !== 'सभी' && item.category !== selectedCategory) {
      return false;
    }
    // Condition filter
    if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
      return false;
    }
    // Search query
    if ((searchQuery || '').trim()) {
      const q = (searchQuery || '').toLowerCase().trim();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      const matchSeller = item.sellerName?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchSeller && !matchCat) {
        return false;
      }
    }
    return true;
  });

  // Sort Items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price_low') {
      return a.price - b.price;
    }
    if (sortBy === 'price_high') {
      return b.price - a.price;
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // My Posted Items
  const myItems = oldItems.filter(item => {
    if (!customerUser?.phone) return false;
    const userClean = customerUser.phone.replace(/\D/g, '');
    const sellerClean = item.sellerPhone?.replace(/\D/g, '') || '';
    return sellerClean === userClean || item.sellerUserId === customerUser.id;
  });

  // Helpers
  const getConditionBadge = (cond: 'Like New' | 'Good' | 'Fair') => {
    switch (cond) {
      case 'Like New':
        return { label: '✨ लगभग नया (Like New)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'Good':
        return { label: '👍 अच्छी स्थिति (Good)', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'Fair':
        return { label: '👌 सामान्य स्थिति (Fair)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: cond, bg: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const handleCallSeller = (phone: string, itemTitle: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsAppSeller = (phone: string, itemTitle: string, price: number) => {
    const text = `नमस्ते! मैंने Smart Bazaar पर आपका पुराना सामान देखा: "${itemTitle}" (कीमत: ₹${price.toLocaleString('en-IN')})। क्या यह अभी उपलब्ध है?`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareItem = (item: OldItem) => {
    shareOldItemToWhatsApp(item);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>सेकंड हैंड / पुराना सामान बाजार</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              पुराने सामान खरीदें व सीधे बेचें
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              बिना किसी बिचौलिए या कमीशन के — मोबाइल, बाइक, फर्नीचर, टीवी, कूलर व घरेलू पुराने सामान सीधे स्थानीय ग्राहकों व विक्रेताओं से खरीदें व बेचें।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!customerUser?.isLoggedIn && onRequireLogin) {
                  onRequireLogin(() => setActiveTab('sell'), 'पुराना सामान बेचने के लिए लॉगिन आवश्यक है');
                } else {
                  setActiveTab('sell');
                }
              }}
              className="px-5 py-3 rounded-2xl bg-white text-orange-700 hover:bg-amber-50 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ पुराना सामान बेचें (Post Ad)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 text-amber-900 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="font-bold text-amber-950">सुरक्षा सलाह:</strong> पुराना सामान व्यक्तिगत रूप से देखकर व जांचकर ही खरीदें। किसी भी अनजान व्यक्ति को फोन पर अग्रिम (Advance Token) ऑनलाइन पैसे न भेजें।
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'browse'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>पुराने सामान देखें ({oldItems.length})</span>
          </button>

          <button
            onClick={() => {
              if (!customerUser?.isLoggedIn && onRequireLogin) {
                onRequireLogin(() => setActiveTab('sell'), 'पुराना सामान लिस्ट करने के लिए लॉगिन करें');
              } else {
                setActiveTab('sell');
              }
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sell'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>विज्ञापन लगाएं (Sell Old Item)</span>
          </button>

          {customerUser?.isLoggedIn && (
            <button
              onClick={() => setActiveTab('my_items')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'my_items'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>मेरे विज्ञापन ({myItems.length})</span>
            </button>
          )}
        </div>

        {activeTab === 'browse' && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-600">
            <span>क्रमबद्ध (Sort):</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="newest">नया पहले (Newest)</option>
              <option value="price_low">कीमत: कम से ज्यादा</option>
              <option value="price_high">कीमत: ज्यादा से कम</option>
            </select>
          </div>
        )}
      </div>

      {/* SUCCESS POSTED MODAL / NOTIFICATION */}
      {successItemPosted && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">बधाई हो! आपका पुराना सामान सफलतापूर्वक पोस्ट हो गया है 🎉</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                "{successItemPosted.title}" अब सभी ग्राहकों को दिखाई दे रहा है। इच्छुक ग्राहक आपसे सीधे कॉल या WhatsApp करेंगे।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleShareItem(successItemPosted)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-800 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp पर शेयर करें</span>
            </button>
            <button
              onClick={() => setSuccessItemPosted(null)}
              className="p-2 text-emerald-800 hover:bg-emerald-100 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: BROWSE OLD ITEMS */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          
          {/* Search & Category Filter Section */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="पुराना सामान खोजें... (उदा. Splendor बाइक, Samsung TV, सोफा, कूलर, मोबाइल)"
                className="w-full pl-12 pr-10 py-3 bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200 focus:border-amber-500 rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {OLD_ITEM_CATEGORIES.map(cat => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.name;
                const count = cat.name === 'सभी' 
                  ? oldItems.length 
                  : oldItems.filter(it => it.category === cat.name).length;

                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Filters: Condition & Mobile Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                <span className="text-stone-500 mr-1 text-[11px]">स्थिति (Condition):</span>
                <button
                  onClick={() => setConditionFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                    conditionFilter === 'all' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  सभी
                </button>
                <button
                  onClick={() => setConditionFilter('Like New')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                    conditionFilter === 'Like New' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ✨ लगभग नया
                </button>
                <button
                  onClick={() => setConditionFilter('Good')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                    conditionFilter === 'Good' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  👍 अच्छी स्थिति
                </button>
                <button
                  onClick={() => setConditionFilter('Fair')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                    conditionFilter === 'Fair' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  👌 सामान्य
                </button>
              </div>

              {/* Mobile sorting dropdown */}
              <div className="sm:hidden flex items-center gap-1.5 w-full justify-between">
                <span className="text-xs font-bold text-stone-500">सॉर्ट:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-1 text-xs font-bold"
                >
                  <option value="newest">नया पहले</option>
                  <option value="price_low">कीमत: कम से ज्यादा</option>
                  <option value="price_high">कीमत: ज्यादा से कम</option>
                </select>
              </div>
            </div>

          </div>

          {/* Old Items Grid */}
          {sortedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">कोई पुराना सामान नहीं मिला</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                {searchQuery || selectedCategory !== 'सभी'
                  ? 'खोज फिल्टर बदलें या अन्य श्रेणी देखें।'
                  : 'अभी कोई पुराना सामान सूचीबद्ध नहीं है। आप अपना पहला सामान लिस्ट करें!'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('सभी');
                  setConditionFilter('all');
                  setActiveTab('sell');
                }}
                className="mt-5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ पुराना सामान बेचें</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedItems.map(item => {
                const condBadge = getConditionBadge(item.condition);
                const isSold = item.status === 'sold';
                const savings = item.originalPrice && item.originalPrice > item.price
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : null;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl border ${
                      isSold ? 'border-stone-200 opacity-75' : 'border-stone-200 hover:border-amber-400'
                    } shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden group`}
                  >
                    
                    {/* Item Image with Badges */}
                    <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedDetailItem(item)}>
                      <img
                        src={item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES['अन्य']}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale' : ''}`}
                        loading="lazy"
                      />
                      
                      {/* Sold Overlay */}
                      {isSold && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-600 text-white font-black text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
                            बिक गया (SOLD)
                          </span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${condBadge.bg}`}>
                          {condBadge.label}
                        </span>

                        {item.itemAge && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-white shadow-sm flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{item.itemAge} पुराना</span>
                          </span>
                        )}
                      </div>

                      {/* Category Pill at bottom left of image */}
                      <div className="absolute bottom-2.5 left-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                          {item.category}
                        </span>
                      </div>

                      {/* Savings Pill */}
                      {savings && !isSold && (
                        <div className="absolute bottom-2.5 right-3">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow">
                            {savings}% छूट
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      
                      <div>
                        {/* Title */}
                        <h3 
                          onClick={() => setSelectedDetailItem(item)}
                          className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h3>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-xl font-black text-amber-700 tracking-tight">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-stone-400 line-through font-semibold">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Description snippet */}
                        <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      </div>

                      {/* Seller & Location Info */}
                      <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-stone-800 truncate">
                            <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{item.sellerName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-stone-500 text-[11px] font-medium shrink-0">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => handleCallSeller(item.sellerPhone, item.title)}
                          disabled={isSold}
                          className={`flex-1 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSold 
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>कॉल करें</span>
                        </button>

                        <button
                          onClick={() => handleWhatsAppSeller(item.whatsappPhone || item.sellerPhone, item.title, item.price)}
                          disabled={isSold}
                          className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isSold
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95'
                          }`}
                          title="WhatsApp पर मैसेज करें"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedDetailItem(item)}
                          className="p-2.5 rounded-2xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold text-xs transition-all cursor-pointer"
                          title="पूरा विवरण देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* WhatsApp Status Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShareItem(item)}
                        className="w-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/40 font-bold text-xs py-2 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                        title="व्हाट्सएप स्टेटस पर शेयर करें"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp स्टेटस पर शेयर करें</span>
                      </button>

                      {/* Admin / Seller Manage controls */}
                      {(isAdmin || (customerUser?.phone && item.sellerPhone?.includes(customerUser.phone.slice(-10)))) && (
                        <div className="pt-2 border-t border-dashed border-stone-200 flex items-center justify-between gap-2 text-[11px]">
                          <button
                            onClick={() => onUpdateOldItem(item.id, { status: isSold ? 'available' : 'sold' })}
                            className={`font-bold px-2 py-0.5 rounded cursor-pointer ${
                              isSold ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isSold ? '✓ पुनः उपलब्ध करें' : '✓ बिक गया मार्क करें'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`क्या आप "${item.title}" विज्ञापन को हटाना चाहते हैं?`)) {
                                onDeleteOldItem(item.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>हटाएं</span>
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: SELL / POST OLD ITEM FORM */}
      {activeTab === 'sell' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 max-w-3xl mx-auto">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-600" />
                <span>पुराना सामान बेचें (Post Your Old Item)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                सामान की सही जानकारी भरें ताकि ग्राहक आपसे तुरंत संपर्क कर सकें।
              </p>
            </div>
            <button
              onClick={() => setActiveTab('browse')}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSellSubmit} className="space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                सामान का नाम व मॉडल (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="उदा. Hero Splendor Plus (2021 Model) / Samsung 32 inch LED TV / सागवान सोफा"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  श्रेणी (Category) <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {OLD_ITEM_CATEGORIES.filter(c => c.name !== 'सभी').map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  सामान की स्थिति (Condition) <span className="text-red-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as any)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Like New">✨ लगभग नया (Like New - बहुत कम इस्तेमाल)</option>
                  <option value="Good">👍 अच्छी स्थिति (Good - चालू व साफ-सुथरा)</option>
                  <option value="Fair">👌 सामान्य स्थिति (Fair - इस्तेमाल किया हुआ)</option>
                </select>
              </div>
            </div>

            {/* Price & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  आपकी मांगी गई कीमत (Seller Price ₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="उदा. 5000"
                    className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-extrabold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  (जो राशि आपको अपने सामान के लिए चाहिए)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  मूल नई कीमत (Original MRP ₹) <span className="text-stone-400">(वैकल्पिक)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="उदा. 9990"
                    className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  (नया खरीदने पर कितने का था)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  कितना पुराना है (Item Age) <span className="text-stone-400">(उदा: 6 माह)</span>
                </label>
                <input
                  type="text"
                  value={itemAge}
                  onChange={e => setItemAge(e.target.value)}
                  placeholder="उदा. 6 माह / 1 साल / 2 वर्ष"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  (सामान की अनुमानित आयु)
                </span>
              </div>
            </div>

            {/* Live Admin Margin Auto-Calculation Card */}
            {Number(price) > 0 && (() => {
              const marginPct = commissionSettings?.oldItemAdminMarginPercent ?? 10;
              const marginAmt = Math.round(Number(price) * (marginPct / 100));
              const totalDisplayPrice = Number(price) + marginAmt;
              return (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-black text-amber-950 text-xs sm:text-sm">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">₹</span>
                      <span>{marginPct}% एडमिन मार्जिन ऑटोमैटिक जोड़ा गया (Price Breakdown)</span>
                    </div>
                    <span className="text-[11px] font-black bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      +{marginPct}% Admin Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Step 1 */}
                    <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-tight">1. आपकी शुद्ध राशि (Seller Payout)</div>
                      <div className="text-base font-black text-emerald-700 mt-1">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5 font-medium">बिकने पर आपको मिलेगी</div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">2. +{marginPct}% एडमिन मार्जिन (Platform Fee)</div>
                      <div className="text-base font-black text-amber-700 mt-1">
                        +₹{marginAmt.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-amber-800/80 mt-0.5 font-medium">स्मार्ट डिलीवरी कमीशन ({marginPct}%)</div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-amber-600 text-white p-3 rounded-xl shadow-sm">
                      <div className="text-[10px] font-bold text-amber-100 uppercase tracking-tight">3. = ग्राहकों को दिखने वाली कुल कीमत</div>
                      <div className="text-lg font-black text-white mt-1">
                        ₹{totalDisplayPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-amber-100 mt-0.5 font-medium">पोर्टल पर यह कीमत दिखेगी</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-900 bg-white/70 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                    <span className="font-bold shrink-0">💡 ध्यान दें:</span>
                    <span>
                      आपको अपने सामान की पूरी मांगी गई राशि <strong>₹{Number(price).toLocaleString('en-IN')}</strong> मिलेगी। पोर्टल पर {marginPct}% एडमिन मार्जिन (+₹{marginAmt.toLocaleString('en-IN')}) जुड़कर ग्राहकों को कुल <strong>₹{totalDisplayPrice.toLocaleString('en-IN')}</strong> दिखाई देगा।
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                सामान की फोटो (Photo Upload) <span className="text-stone-400">(फोटो से सामान तेजी से बिकता है)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl bg-stone-50 hover:bg-amber-50/50 cursor-pointer transition-colors">
                  <Camera className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs font-bold text-stone-700">गैलरी से फोटो चुनें या कैमरा खोलें</span>
                  <span className="text-[10px] text-stone-400">JPG, PNG (Max 4MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500 shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                सामान का पूरा विवरण व खासियत (Description)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="सामान की स्थिति, क्या-क्या साथ में मिलेगा (उदा. रिमोट, चार्जर, बिल, बॉक्स, वारंटी), कोई कमी या खासियत बताएं..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Seller Contact Details */}
            <div className="pt-2 border-t border-stone-100">
              <h4 className="font-extrabold text-stone-800 text-xs sm:text-sm mb-3">
                विक्रेता का संपर्क विवरण (Seller Details)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    आपका नाम <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    placeholder="उदा. अमित कुमार"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    कॉल नंबर <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={sellerPhone}
                    onChange={e => setSellerPhone(e.target.value)}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    स्थान / शहर / गांव <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="उदा. बिजनौर / चांदपुर / नजीबाबाद"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>कृपया प्रतीक्षा करें...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>विज्ञापन प्रकाशित करें (Publish Now)</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* VIEW 3: MY POSTED ITEMS */}
      {activeTab === 'my_items' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-stone-900">
              मेरे द्वारा पोस्ट किए गए पुराने सामान ({myItems.length})
            </h2>
            <button
              onClick={() => setActiveTab('sell')}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>नया सामान जोड़ें</span>
            </button>
          </div>

          {myItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-600 font-bold">आपने अभी तक कोई पुराना सामान लिस्ट नहीं किया है।</p>
              <button
                onClick={() => setActiveTab('sell')}
                className="mt-4 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
              >
                + अभी पुराना सामान लिस्ट करें
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myItems.map(item => {
                const isSold = item.status === 'sold';
                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES['अन्य']}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSold ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSold ? 'बिक गया (Sold)' : 'सक्रिय (Active)'}
                          </span>
                          <span className="text-[10px] text-stone-500 font-bold">{item.category}</span>
                        </div>
                        <h4 className="font-extrabold text-stone-900 text-sm truncate mt-0.5">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs font-black text-amber-700">
                            ग्राहक कीमत: ₹{item.price.toLocaleString('en-IN')}
                          </p>
                          {item.sellerPrice && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              आपकी राशि: ₹{item.sellerPrice.toLocaleString('en-IN')} (+₹{item.adminMargin || Math.round(item.sellerPrice * 0.1)} मार्जिन)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <button
                        onClick={() => onUpdateOldItem(item.id, { status: isSold ? 'available' : 'sold' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          isSold 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isSold ? '✓ वापस चालू करें' : '✓ बिक गया मार्क करें'}
                      </button>

                      <button
                        onClick={() => handleShareItem(item)}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs"
                        title="शेयर करें"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`क्या आप "${item.title}" विज्ञापन हटाना चाहते हैं?`)) {
                            onDeleteOldItem(item.id);
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: FULL ITEM DETAILS MODAL */}
      <AnimatePresence>
        {selectedDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative no-scrollbar"
            >
              
              {/* Modal Image Header */}
              <div className="relative h-64 sm:h-72 bg-stone-900 shrink-0">
                <img
                  src={selectedDetailItem.imageUrl || DEFAULT_CATEGORY_IMAGES[selectedDetailItem.category] || DEFAULT_CATEGORY_IMAGES['अन्य']}
                  alt={selectedDetailItem.title}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={() => setSelectedDetailItem(null)}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${getConditionBadge(selectedDetailItem.condition).bg}`}>
                    {getConditionBadge(selectedDetailItem.condition).label}
                  </span>
                  
                  {selectedDetailItem.itemAge && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur-sm flex items-center gap-1 shadow">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedDetailItem.itemAge} पुराना</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 sm:p-7 space-y-5">
                
                <div>
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    {selectedDetailItem.category}
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-stone-900 leading-tight">
                    {selectedDetailItem.title}
                  </h2>

                  <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-amber-700">
                      ₹{selectedDetailItem.price.toLocaleString('en-IN')}
                    </span>
                    {selectedDetailItem.originalPrice && selectedDetailItem.originalPrice > selectedDetailItem.price && (
                      <span className="text-sm text-stone-400 line-through font-bold">
                        नई कीमत: ₹{selectedDetailItem.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {selectedDetailItem.sellerPrice && selectedDetailItem.adminMargin && (
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                        (सामान मूल्य ₹{selectedDetailItem.sellerPrice.toLocaleString('en-IN')} + 10% एडमिन मार्जिन शामिल)
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    विवरण व स्थिति (Details & Condition)
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedDetailItem.description}
                  </p>
                </div>

                {/* Seller Profile Box */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-base">
                      {selectedDetailItem.sellerName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-800">विक्रेता का नाम</div>
                      <div className="font-extrabold text-stone-900 text-sm">{selectedDetailItem.sellerName}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{selectedDetailItem.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>वेरिफाइड सेलर</span>
                    </span>
                  </div>
                </div>

                {/* Safety advice */}
                <div className="text-[11px] text-stone-500 bg-stone-100 p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>सामान की जांच करके ही भुगतान करें। बिना जांच के ऑनलाइन टोकन न भेजें।</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleCallSeller(selectedDetailItem.sellerPhone, selectedDetailItem.title)}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>सीधा कॉल करें ({selectedDetailItem.sellerPhone})</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppSeller(selectedDetailItem.whatsappPhone || selectedDetailItem.sellerPhone, selectedDetailItem.title, selectedDetailItem.price)}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-sm flex items-center justify-center gap-2 border border-emerald-300 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleShareItem(selectedDetailItem)}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/40 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="WhatsApp स्टेटस पर शेयर करें"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp स्टेटस</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
