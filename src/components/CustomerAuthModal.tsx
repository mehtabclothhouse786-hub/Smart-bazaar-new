import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Lock, 
  X, 
  Sparkles, 
  LogIn,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { CustomerUser } from '../types';
import { MadeInIndiaLogo } from './MadeInIndiaLogo';
import { saveCustomerAccountDoc, getCustomerAccountByPhoneDoc, SAMPLE_CUSTOMERS } from '../services/db';

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
  pendingActionText = 'खरीदारी और अपने ऑर्डर देखने के लिए लॉगिन करें'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    if (cleanPhone.length !== 10) {
      setErrorMessage('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें। (उदा: 9876543210)');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setErrorMessage('कृपया कम से कम 4 अक्षरों का पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        if (!cleanName) {
          setErrorMessage('कृपया अपना नाम दर्ज करें।');
          setIsSubmitting(false);
          return;
        }

        // Check if account already exists
        const existingAcc = await getCustomerAccountByPhoneDoc(cleanPhone);
        if (existingAcc) {
          setErrorMessage('यह मोबाइल नंबर पहले से रजिस्टर्ड है! कृपया लॉगिन करें।');
          setAuthMode('login');
          setIsSubmitting(false);
          return;
        }

        const newUser: CustomerUser = {
          id: 'cust_' + cleanPhone,
          name: cleanName,
          phone: cleanPhone,
          password: cleanPassword,
          isLoggedIn: true,
          createdAt: Date.now()
        };

        await saveCustomerAccountDoc(newUser);
        setIsSubmitting(false);
        onLoginSuccess(newUser);
        onClose();
      } else {
        // Login Mode
        const existingAcc = await getCustomerAccountByPhoneDoc(cleanPhone);

        if (!existingAcc) {
          setErrorMessage('यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया "नया खाता बनाएं" चुनें!');
          setIsSubmitting(false);
          return;
        }

        if (existingAcc.password && existingAcc.password !== cleanPassword) {
          setErrorMessage('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।');
          setIsSubmitting(false);
          return;
        }

        // Update password if existing user didn't have one
        const loggedInUser: CustomerUser = {
          ...existingAcc,
          name: existingAcc.name || cleanName || 'Customer',
          phone: cleanPhone,
          password: cleanPassword,
          isLoggedIn: true
        };

        await saveCustomerAccountDoc(loggedInUser);
        setIsSubmitting(false);
        onLoginSuccess(loggedInUser);
        onClose();
      }
    } catch (err) {
      console.error('Customer Auth error:', err);
      setErrorMessage('लॉगिन करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      setIsSubmitting(false);
    }
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
                  <span>स्मार्ट बाज़ार ग्राहक खाता</span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  {authMode === 'login' ? 'ग्राहक लॉगिन (Customer Login)' : 'नया ग्राहक खाता बनाएं'}
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

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-stone-100 p-1 border-b border-stone-200 font-bold text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'login' 
                  ? 'bg-white text-emerald-900 shadow-sm font-black' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              <span>लॉगिन करें (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'register' 
                  ? 'bg-white text-emerald-900 shadow-sm font-black' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>नया खाता (Sign Up)</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                    आपका पूरा नाम (Full Name) <span className="text-rose-500">*</span>
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
              )}

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

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  {authMode === 'register' ? 'पासवर्ड बनाएं (Create Password)' : 'पासवर्ड (Password)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>
                    {isSubmitting 
                      ? 'प्रोसेस हो रहा है...' 
                      : authMode === 'login' ? 'सुरक्षित लॉगिन करें' : 'खाता बनाएं एवं लॉगिन करें'
                    }
                  </span>
                </button>
              </div>
            </form>

            {/* Test demo credentials hint */}
            <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                डेमो लॉगिन: <span className="font-mono text-stone-900 font-extrabold">9876510001</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPhone('9876510001');
                  setPassword('12345');
                  setName('राहुल शर्मा');
                }}
                className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ऑटो-फिल करें
              </button>
            </div>

            <div className="border-t border-stone-100 pt-3 text-center">
              <p className="text-[11px] text-stone-500 font-medium">
                आपके सभी ऑर्डर और बुकिंग आपके मोबाइल नंबर और पासवर्ड से सुरक्षित रहते हैं।
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
