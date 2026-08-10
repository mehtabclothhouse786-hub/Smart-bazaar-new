import React, { useState } from 'react';
import { UserRole } from '../types';
import { MadeInIndiaLogo } from './MadeInIndiaLogo';
import { 
  Search,
  Sparkles,
  MoreHorizontal,
  X
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
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  activeOrdersCount,
  onOpenOrdersTab
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const roles: { id: UserRole; label: string }[] = [
    { id: 'customer', label: 'ग्राहक' },
    { id: 'vendor', label: 'दुकानदार' },
    { id: 'delivery', label: 'डिलीवरी' },
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

            {/* Search bar for customer view in desktop */}
            {currentRole === 'customer' && (
              <div className="hidden lg:flex flex-1 max-w-xs mx-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="खोजें (चावल, दूध, आलू)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 focus:bg-white text-xs border border-stone-200 focus:border-emerald-500 rounded-full outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Right Side: Action Badges & Three Dots Button ONLY */}
            <div className="flex items-center gap-2">
              {/* Active Orders Quick Access Badge */}
              {currentRole === 'customer' && activeOrdersCount > 0 && (
                <button
                  onClick={onOpenOrdersTab}
                  className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-black hover:bg-amber-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>ऑर्डर ({activeOrdersCount})</span>
                </button>
              )}

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

          {/* Mobile Search Bar */}
          {currentRole === 'customer' && (
            <div className="lg:hidden mt-2 px-1">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="उत्पाद खोजें (टमाटर, चावल, दूध, तेल)..."
                  className="w-full pl-10 pr-4 py-2 bg-white text-xs font-medium border border-stone-200 rounded-full outline-none shadow-xs"
                />
              </div>
            </div>
          )}
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
    </>
  );
};

