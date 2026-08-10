import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalTitle: string;
  currentUsername?: string;
  isFirstTime?: boolean;
  onSave: (newPassword: string) => Promise<void> | void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  portalTitle,
  currentUsername = 'यूज़र',
  isFirstTime = false,
  onSave
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanPass) {
      setErrorMsg('कृपया नया पासवर्ड दर्ज करें।');
      return;
    }

    if (cleanPass.length < 4) {
      setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMsg('दोनों पासवर्ड आपस में मेल नहीं खा रहे हैं। कृपया पुनः जांचें।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(cleanPass);
      setSuccessMsg('✅ आपका नया पासवर्ड सफलतापूर्वक बदल दिया गया है!');
      setTimeout(() => {
        setIsSubmitting(false);
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Password change error:', err);
      setErrorMsg('पासवर्ड अपडेट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
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
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-500 relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-teal-900 text-white p-5 relative">
            {!isFirstTime && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase text-emerald-300 tracking-wider block">
                  {portalTitle}
                </span>
                <h3 className="text-lg font-black text-white">
                  {isFirstTime ? 'प्रथम लॉगिन: अपना पासवर्ड बदलें' : 'पासवर्ड बदलें (Change Password)'}
                </h3>
              </div>
            </div>

            {isFirstTime && (
              <div className="mt-3 bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>सुरक्षा के लिए, कृपया डिफ़ॉल्ट पासवर्ड बदल कर अपनी पसंद का नया पासवर्ड सेट करें।</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {currentUsername && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>खाता / यूज़र:</span>
                <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  {currentUsername}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold p-3 rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  अपनी पसंद का नया पासवर्ड (New Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="नया पासवर्ड दर्ज करें (उदा: mypass123)"
                    className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  नया पासवर्ड पुनः दर्ज करें (Confirm Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड दोबारा लिखें"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {!isFirstTime && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-2xl text-xs transition-colors"
                  >
                    रद्द करें
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isFirstTime ? 'w-full' : 'w-2/3'} bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'सेव हो रहा है...' : 'नया पासवर्ड सेट करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
