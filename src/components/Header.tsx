import React, { useState } from 'react';
import { UserRole, CustomerUser } from '../types';
import { MadeInIndiaLogo } from './MadeInIndiaLogo';
import { playOrderSound, requestNotificationPermission } from '../services/notification';
import { 
  Search,
  Sparkles,
  MoreHorizontal,
  X,
  UserCheck,
  LogIn,
  LogOut,
  Pencil,
  Bell
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeOrdersCount: number;
  onOpenOrdersTab?: () => void;
  customerUser?: CustomerUser | null;
  onOpenLoginModal?: () => void;
  onCustomerLogout?: () => void;
  onUpdateCustomerProfile?: (updates: Partial<CustomerUser>) => void;
  onOpenCustomerPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  activeOrdersCount,
  onOpenOrdersTab,
  customerUser,
  onOpenLoginModal,
  onCustomerLogout,
  onUpdateCustomerProfile,
  onOpenCustomerPanel
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const handleOpenEditProfile = () => {
    if (customerUser) {
      setEditName(customerUser.name || '');
      setEditPhone(customerUser.phone || '');
      setEditAddress(customerUser.address || '');
      setIsEditProfileOpen(true);
    }
  };

  const handleSaveCustomerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      alert('कृपया अपना नाम और मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (onUpdateCustomerProfile) {
      onUpdateCustomerProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim()
      });
      alert('✅ आपकी प्रोफाइल जानकारी सफलतापूर्वक अपडेट कर दी गई है!');
    }
    setIsEditProfileOpen(false);
  };

  const roles: { id: UserRole; label: string }[] = [
    { id: 'customer', label: 'ग्राहक' },
    { id: 'vendor', label: 'दुकानदार' },
    { id: 'delivery', label: 'डिलीवरी' },
    { id: 'service', label: 'सर्विस प्रदाता' },
    { id: 'admin', label: 'एडमिन' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-100/90 backdrop-blur-md py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main 3D Skewed Pill Container matching screenshot */}
          <div className="bg-white rounded-full shadow-md hover:shadow-lg border-2 border-stone-200/90 border-b-[5px] border-b-amber-400 p-2 sm:p-2.5 flex items-center justify-between gap-2 transition-all">
            
            {/* Left Side: Brand Logo Badge, Stacked Text, Yellow Badge, Cart Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Made In India Round Badge */}
              <MadeInIndiaLogo className="w-10 h-10 sm:w-11 sm:h-11" />

              {/* Stacked Smart Bazaar Title */}
              <div className="flex flex-col justify-center -space-y-1">
                <span className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight">
                  Smart
                </span>
                <span className="font-extrabold text-base sm:text-lg text-emerald-600 leading-tight">
                  Bazaar
                </span>
              </div>

              {/* Divider */}
              <div className="h-7 sm:h-8 w-[1.5px] bg-stone-200 mx-0.5 sm:mx-1 shrink-0" />

              {/* Yellow Badge "स्मार्ट बाज़ार" */}
              <div className="hidden xs:flex bg-gradient-to-b from-amber-300 to-amber-400 border-2 border-amber-200 text-stone-900 font-extrabold text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-xs text-center leading-tight shrink-0">
                स्मार्ट<br />बाज़ार
              </div>


            </div>



            {/* Right Side: Action Badges & Three Dots Button ONLY */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Customer Login / Account Badge */}
              {currentRole === 'customer' && (
                customerUser?.isLoggedIn ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onOpenCustomerPanel}
                      title="खाता विवरण एवं ऑर्डर इतिहास (My Account)"
                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="max-w-[90px] sm:max-w-[130px] truncate">{customerUser.name}</span>
                    </button>
                    {onCustomerLogout && (
                      <button
                        onClick={onCustomerLogout}
                        title="लॉगआउट करें (Logout)"
                        className="flex items-center justify-center p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenLoginModal}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>लॉगिन</span>
                  </button>
                )
              )}



              {/* Notification Sound / Ring Test Button */}
              <button
                onClick={async () => {
                  playOrderSound();
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    alert('🔔 ऑडियो रिंग और सिस्टम नोटिफिकेशन एक्टिवेट कर दिए गए हैं!');
                  }
                }}
                title="ऑर्डर रिंग साउंड टेस्ट करें व नोटिफिकेशन चालू करें"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 hover:text-amber-900 transition-all active:scale-95 shadow-xs cursor-pointer relative"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              </button>

              {/* Three Dots Button ONLY to open Role Switcher */}
              <button
                onClick={() => setIsRoleModalOpen(true)}
                id="three-dots-role-menu-btn"
                title="रोल बदलें (Open Role Menu)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-100 hover:bg-stone-200 border-2 border-stone-300/80 flex items-center justify-center text-stone-800 hover:text-stone-950 transition-all active:scale-95 shadow-xs"
              >
                <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Radio Modal matching user screenshot */}
      {isRoleModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsRoleModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-stone-200 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header close button (subtle) */}
            <div className="flex justify-end p-2 pb-0">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radio Options List matching screenshot */}
            <div className="divide-y divide-stone-200">
              {roles.map((role) => {
                const isSelected = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role.id);
                      setIsRoleModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-6 py-4.5 hover:bg-stone-50 transition-colors text-left group"
                  >
                    <span className="text-stone-900 font-medium text-lg sm:text-xl">
                      {role.label}
                    </span>

                    {/* Radio circle */}
                    <div className="flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center bg-white">
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-stone-400 bg-white group-hover:border-stone-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Profile Modal */}
      {isEditProfileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-stone-200 relative animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Pencil className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">ग्राहक प्रोफ़ाइल एडिट करें</h3>
                  <p className="text-[11px] text-stone-500">Edit Customer Profile Details</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="अपना नाम लिखें"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर (Phone Number) *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="10 अंकों का फोन नंबर"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">डिलिवरी पता (Delivery Address)</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="मकान नंबर, गली, लैंडमार्क, क्षेत्र, शहर..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  सेव करें (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

