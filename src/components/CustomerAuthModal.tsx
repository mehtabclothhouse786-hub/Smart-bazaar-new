import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  X, 
  Sparkles, 
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { CustomerUser } from '../types';
import { MadeInIndiaLogo } from './MadeInIndiaLogo';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  pendingActionText?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  pendingActionText = 'खरीदारी और सर्विस बुकिंग के लिए लॉगिन आवश्यक है'
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    if (!cleanName) {
      setErrorMessage('कृपया अपना नाम दर्ज करें।');
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें। (उदा: 9876543210)');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const user: CustomerUser = {
        id: 'cust_' + cleanPhone,
        name: cleanName,
        phone: cleanPhone,
        isLoggedIn: true,
        createdAt: Date.now()
      };

      setIsSubmitting(false);
      onLoginSuccess(user);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400 relative"
        >
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 text-white p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <MadeInIndiaLogo className="w-11 h-11 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>स्मार्ट बाज़ार खाता (Customer Account)</span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  ग्राहक लॉगिन
                </h2>
              </div>
            </div>

            {pendingActionText && (
              <div className="mt-3 bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2">
                <LogIn className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{pendingActionText}</span>
              </div>
            )}
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  आपका नाम (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा: राहुल शर्मा / Mahtab"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  मोबाइल नंबर (Mobile Number) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-black text-stone-900 text-sm tracking-wide transition-all"
                  />
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isSubmitting ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}</span>
                </button>
              </div>
            </form>

            <div className="border-t border-stone-100 pt-3 text-center">
              <p className="text-[11px] text-stone-500 font-medium">
                लॉगिन करने से आप स्मार्ट बाज़ार की सेवा शर्तों को स्वीकार करते हैं।
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
