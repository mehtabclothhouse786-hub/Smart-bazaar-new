import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, X, User, UserCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalTitle: string;
  currentUsername?: string;
  isFirstTime?: boolean;
  allowEditUsername?: boolean;
  onSave: (newPassword: string, newUsername?: string) => Promise<void> | void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  portalTitle,
  currentUsername = 'यूज़र',
  isFirstTime = false,
  allowEditUsername = true,
  onSave
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = username.trim();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (allowEditUsername && !cleanUser) {
      setErrorMsg('कृपया वैध यूज़रनेम दर्ज करें।');
      return;
    }

    if (cleanPass) {
      if (cleanPass.length < 3) {
        setErrorMsg('पासवर्ड कम से कम 3 अक्षरों का होना चाहिए।');
        return;
      }

      if (cleanPass !== cleanConfirm) {
        setErrorMsg('दोनों पासवर्ड आपस में मेल नहीं खा रहे हैं। कृपया पुनः जांचें।');
        return;
      }
    } else if (isFirstTime) {
      setErrorMsg('सुरक्षा के लिए कृपया नया पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(cleanPass, cleanUser);
      setSuccessMsg('✅ क्रेडेंशियल (यूज़रनेम/पासवर्ड) सफलतापूर्वक अपडेट कर दिए गए हैं!');
      setTimeout(() => {
        setIsSubmitting(false);
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('');
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Credentials update error:', err);
      setErrorMsg('क्रेडेंशियल अपडेट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
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
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
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
                  {isFirstTime ? 'प्रथम लॉगिन: यूज़रनेम व पासवर्ड बदलें' : 'यूज़रनेम व पासवर्ड बदलें (Edit Credentials)'}
                </h3>
              </div>
            </div>

            {isFirstTime && (
              <div className="mt-3 bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>सुरक्षा के लिए, कृपया अपना नया यूज़रनेम व सुरक्षित पासवर्ड सेट करें।</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
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
              {/* Editable Username Field */}
              {allowEditUsername ? (
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>लॉगिन यूज़रनेम (Username)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      एडिटेबल (Editable)
                    </span>
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="नया यूज़रनेम दर्ज करें"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    अगली बार इस नए यूज़रनेम से आसानी से लॉगिन कर सकेंगे।
                  </p>
                </div>
              ) : (
                currentUsername && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>खाता / यूज़र:</span>
                    <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                      {currentUsername}
                    </span>
                  </div>
                )
              )}

              <div>
                <label className="block text-xs font-extrabold text-stone-700 mb-1.5">
                  नया पासवर्ड (New Password) {isFirstTime && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={isFirstTime}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isFirstTime ? 'नया पासवर्ड दर्ज करें' : 'नया पासवर्ड (पासवर्ड नहीं बदलना हो तो खाली छोड़ें)'}
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
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

              {(newPassword || isFirstTime) && (
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
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none font-bold text-stone-900 text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                {!isFirstTime && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    रद्द करें
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${isFirstTime ? 'w-full' : 'w-2/3'} bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'सेव हो रहा है...' : 'सेव करें (Save Credentials)'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
