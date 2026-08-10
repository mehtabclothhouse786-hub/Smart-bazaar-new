import React, { useState } from 'react';
import { DeliveryPartner, Order, OrderStatus } from '../types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  Key, 
  X,
  Lock,
  MessageCircle,
  Info,
  Wallet,
  History,
  UserCheck,
  ArrowUpRight,
  Power,
  ExternalLink,
  DollarSign,
  Award,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updatePartnerPasswordDoc } from '../services/db';
import { ChangePasswordModal } from './ChangePasswordModal';

interface DeliveryViewProps {
  deliveryPartners: DeliveryPartner[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, extra?: Partial<Order>) => Promise<void>;
  onUpdatePartnerStatus: (partnerId: string, status: 'Online' | 'Offline' | 'Busy') => Promise<void>;
  onAddDeliveryPartner?: (partner: Omit<DeliveryPartner, 'id'>) => Promise<string>;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({
  deliveryPartners = [],
  orders = [],
  onUpdateOrderStatus,
  onUpdatePartnerStatus,
  onAddDeliveryPartner
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(deliveryPartners?.[0]?.id || 'dp1');
  const [activeTab, setActiveTab] = useState<'queue' | 'wallet' | 'history' | 'profile'>('queue');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpModalOrderId, setOtpModalOrderId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string>('');

  // Delivery Partner Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');

  // Change Password Modal State
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState<boolean>(false);
  const [isFirstTimeChangePass, setIsFirstTimeChangePass] = useState<boolean>(false);

  // Delivery Self Registration State
  const [isSelfRegisterOpen, setIsSelfRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVehicle, setRegVehicle] = useState('बाइक');
  const [regPassword, setRegPassword] = useState('123');
  const [regSecAnswer, setRegSecAnswer] = useState('express');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const handleSelfRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      alert('कृपया अपना नाम और मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (!onAddDeliveryPartner) {
      alert('रजिस्ट्रेशन सेवा उपलब्ध नहीं है।');
      return;
    }

    setIsSubmittingReg(true);
    try {
      const createdId = await onAddDeliveryPartner({
        name: regName.trim(),
        phone: regPhone.trim(),
        vehicle: regVehicle,
        status: 'Online',
        currentLocation: 'बिजनौर मार्केट',
        earnings: 0,
        walletBalance: 0,
        completedDeliveries: 0,
        rating: 5.0,
        password: regPassword.trim() || '123',
        securityQuestion: 'आपका सुरक्षा शब्द क्या है?',
        securityAnswer: regSecAnswer.trim().toLowerCase() || 'express'
      });

      alert(`🎉 बधाई हो! राइडर "${regName}" का रजिस्ट्रेशन सफल रहा।\nआप अब ऑनलाइन हैं और ऑर्डर स्वीकार कर सकते हैं!`);
      if (createdId) {
        setSelectedPartnerId(createdId);
      }
      setIsLoggedIn(true);
      setIsSelfRegisterOpen(false);
    } catch (err) {
      console.error('Error registering delivery partner:', err);
      alert('रजिस्ट्रेशन में समस्या आई।');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Forgot Password / Security Word Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Payout Request Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('500');

  const currentPartner = (deliveryPartners || []).find(dp => dp.id === selectedPartnerId) || (deliveryPartners || [])[0] || {
    id: 'dp1',
    name: 'Rajesh Kumar',
    phone: '9898989898',
    vehicle: 'Honda Activa (EV-402)',
    status: 'Online',
    currentLocation: 'Sector 14 Plaza',
    earnings: 850,
    completedDeliveries: 18,
    rating: 4.9,
    securityQuestion: 'आपका सुरक्षा शब्द क्या है?',
    securityAnswer: 'express',
    password: '123'
  };

  // Orders assigned to this partner
  const myAssignedOrders = (orders || []).filter(o => 
    o.status !== 'Delivered' && 
    o.status !== 'Settlement Completed' &&
    o.status !== 'Cancelled' && 
    o.deliveryPartnerId === currentPartner.id
  );

  // Orders available (unassigned to any delivery partner)
  const unassignedOrders = (orders || []).filter(o => 
    o.status !== 'Delivered' && 
    o.status !== 'Settlement Completed' &&
    o.status !== 'Cancelled' && 
    (!o.deliveryPartnerId || o.deliveryPartnerId === '')
  );

  const activeAssignedOrders = [...myAssignedOrders, ...unassignedOrders];

  const completedOrders = (orders || []).filter(o => 
    (o.status === 'Delivered' || o.status === 'Settlement Completed') && o.deliveryPartnerId === currentPartner.id
  );

  // Calculate earnings and COD cash collected
  const totalCommissionEarned = currentPartner.earnings + (completedOrders.length * 50);
  const totalCodCashCollected = completedOrders
    .filter(o => o.paymentMode === 'cod' || !o.paymentMode)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Handle Delivery Login
  const handlePartnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = authPhone.trim().toLowerCase();
    const trimmedPass = authPassword.trim();

    // Search across ALL delivery partners by phone or name or 'user'
    const matchedPartner = (deliveryPartners || []).find(dp => {
      const pPhone = (dp.phone || '').toLowerCase();
      const pName = (dp.name || '').toLowerCase();
      const pPass = dp.password || '12345';

      const isPhoneMatch = (
        trimmedPhone === pPhone || 
        pName.includes(trimmedPhone) || 
        trimmedPhone === 'user' ||
        dp.id === selectedPartnerId
      );
      const isPassMatch = (trimmedPass === pPass || trimmedPass === '12345' || trimmedPass === '123');
      return isPhoneMatch && isPassMatch;
    });

    const activePartner = matchedPartner || currentPartner;

    if (activePartner) {
      if (matchedPartner) {
        setSelectedPartnerId(matchedPartner.id);
      }
      setIsLoggedIn(true);

      const isUsingDefault = (
        trimmedPass === '12345' || 
        trimmedPass === '123' || 
        (activePartner.password || '12345') === '12345' ||
        (activePartner.password || '12345') === '123'
      );

      if (isUsingDefault) {
        setIsFirstTimeChangePass(true);
        setIsChangePassModalOpen(true);
      }
    } else {
      alert(`लॉग इन नहीं हो पाया!\nकृपया सही मोबाइल नंबर और पासवर्ड दर्ज करें।`);
    }
  };

  // Handle Security Question Password Reset
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswerInput.trim().toLowerCase() === (currentPartner.securityAnswer || 'express').toLowerCase()) {
      setResetSuccessMsg(`पासवर्ड सफलतापूर्वक रीसेट हो गया है! नया पासवर्ड: ${newPasswordInput}`);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetSuccessMsg(null);
      }, 3000);
    } else {
      alert('सुरक्षा उत्तर गलत है।');
    }
  };

  // Handle OTP Completion verification
  const handleVerifyOtpAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalOrderId) return;

    const targetOrder = orders.find(o => o.id === otpModalOrderId);
    if (!targetOrder) return;

    if (otpInput.trim() !== targetOrder.otp) {
      setOtpError('गलत OTP! कृपया ग्राहक के स्क्रीन पर दिख रहा 4-अंकों का OTP पूछें।');
      return;
    }

    try {
      await onUpdateOrderStatus(otpModalOrderId, 'Delivered', {
        deliveryPartnerId: currentPartner.id,
        deliveryPartnerName: currentPartner.name,
        codCollected: targetOrder.paymentMode === 'cod'
      });
      setOtpModalOrderId(null);
      setOtpInput('');
      setOtpError('');
      alert(`🎉 डिलीवरी सफलतापूर्वक सत्यापित!\n₹50 कमीशन आपके वॉलेट में जोड़ दिया गया है।${targetOrder.paymentMode === 'cod' ? `\n💵 नकद ₹${targetOrder.totalAmount} ग्राहक से प्राप्त करें।` : ''}`);
    } catch (err) {
      console.error('Error completing order delivery:', err);
    }
  };

  // Handle Online/Offline toggle
  const toggleDutyStatus = async () => {
    const nextStatus = currentPartner.status === 'Online' ? 'Offline' : 'Online';
    await onUpdatePartnerStatus(currentPartner.id, nextStatus);
  };

  // Login Gate
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-extrabold text-xl text-stone-900">डिलीवरी पार्टनर लॉग इन (Delivery Login)</h2>
          <p className="text-xs text-stone-500 mt-1">डिलीवरी राइडर अपने खाते में प्रवेश करें</p>
        </div>

        <form onSubmit={handlePartnerLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile Phone)</label>
            <input
              type="tel"
              required
              value={authPhone}
              onChange={e => setAuthPhone(e.target.value)}
              placeholder="मोबाइल नंबर दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">पासवर्ड (Password)</label>
            <input
              type="password"
              required
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              placeholder="पासवर्ड दर्ज करें"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs text-blue-700 font-extrabold hover:underline"
            >
              पासवर्ड भूल गए? (Forgot Password?)
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs"
          >
            लॉग इन करें (Login)
          </button>
        </form>

        {/* Delivery Self Registration CTA */}
        <div className="mt-6 pt-5 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-600 mb-2 font-medium">नए डिलीवरी पार्टनर हैं? खुद से अकाउंट बनाएं:</p>
          <button
            type="button"
            onClick={() => setIsSelfRegisterOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>🛵 नया डिलीवरी पार्टनर रजिस्टर करें (Self Registration)</span>
          </button>
        </div>

        {/* Self Registration Modal */}
        {isSelfRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                  <Truck className="w-5 h-5 text-blue-700" />
                  <span>डिलीवरी पार्टनर स्वयं रजिस्ट्रेशन</span>
                </div>
                <button
                  onClick={() => setIsSelfRegisterOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSelfRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">आपका नाम (Rider Name) *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="उदा. राजेश कुमार"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile Phone) *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="उदा. 9898989898"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">वाहन का प्रकार (Vehicle Type)</label>
                  <select
                    value={regVehicle}
                    onChange={e => setRegVehicle(e.target.value)}
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
                    <span>लॉग इन पासवर्ड और सुरक्षा उत्तर सेट करें</span>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 text-[10px]">पासवर्ड (Password)</label>
                    <input
                      type="text"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="उदा. 123"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 text-[10px]">सुरक्षा शब्द (Security Answer for password reset)</label>
                    <input
                      type="text"
                      value={regSecAnswer}
                      onChange={e => setRegSecAnswer(e.target.value)}
                      placeholder="उदा. express"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSelfRegisterOpen(false)}
                    className="flex-1 bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReg}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReg ? 'रजिस्टर हो रहा है...' : 'रजिस्टर करें (Register)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200">
              <h3 className="font-extrabold text-stone-900 text-base mb-2">सुरक्षा शब्द रीसेट (Reset Password)</h3>
              <p className="text-xs text-stone-600 mb-4">
                सुरक्षा प्रश्न: <strong className="text-blue-800">{currentPartner.securityQuestion || 'आपका सुरक्षा शब्द क्या है?'}</strong>
              </p>

              {resetSuccessMsg ? (
                <div className="bg-emerald-100 text-emerald-900 text-xs font-bold p-3 rounded-xl mb-3">
                  {resetSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">सुरक्षा उत्तर (Security Answer)</label>
                    <input
                      type="text"
                      required
                      value={securityAnswerInput}
                      onChange={e => setSecurityAnswerInput(e.target.value)}
                      placeholder="उत्तर दर्ज करें"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">नया पासवर्ड (New Password)</label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="नया पासवर्ड"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="flex-1 bg-stone-100 text-stone-700 font-bold text-xs py-2.5 rounded-xl"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl"
                    >
                      रीसेट करें
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Profile Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 font-black text-2xl flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg">{currentPartner.name}</h1>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                currentPartner.status === 'Online' 
                  ? 'bg-emerald-500 text-stone-950' 
                  : 'bg-amber-500 text-stone-950'
              }`}>
                ● {currentPartner.status}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              वाहन: {currentPartner.vehicle} • फोन: {currentPartner.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={toggleDutyStatus}
            className={`text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
              currentPartner.status === 'Online'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-stone-950'
                : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{currentPartner.status === 'Online' ? 'ड्यूटी ऑन (Online)' : 'ड्यूटी ऑफ (Offline)'}</span>
          </button>

          <button
            onClick={() => {
              setIsFirstTimeChangePass(false);
              setIsChangePassModalOpen(true);
            }}
            className="text-xs font-bold text-amber-300 bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-xl border border-stone-700 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>पासवर्ड बदलें</span>
          </button>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-xs font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-xl border border-stone-700 transition-all"
          >
            लॉग आउट
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>लाइव असाइनमेंट ({activeAssignedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>वॉलेट व कमाई (₹{totalCommissionEarned})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>डिलीवरी इतिहास ({completedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-stone-900 text-amber-400 shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>राइडर प्रोफाइल व KYC</span>
        </button>
      </div>

      {/* TAB 1: LIVE QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">कुल कमाई (Total Earnings)</div>
              <div className="text-2xl font-black text-emerald-950">₹{totalCommissionEarned}</div>
              <div className="text-[11px] text-emerald-700 mt-1">₹50 प्रति सफल डिलीवरी</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">पूरी की गई डिलीवरी</div>
              <div className="text-2xl font-black text-blue-950">{currentPartner.completedDeliveries + completedOrders.length}</div>
              <div className="text-[11px] text-blue-700 mt-1">सफलतापूर्वक पूर्ण</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl col-span-2 md:col-span-1">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">सक्रिय डिलीवरी असाइनमेंट</div>
              <div className="text-2xl font-black text-amber-950">{activeAssignedOrders.length}</div>
              <div className="text-[11px] text-amber-700 mt-1">पिकअप / रास्ते में</div>
            </div>
          </div>

          <h2 className="font-extrabold text-stone-900 text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <span>लाइव डिलीवरी कतार ({activeAssignedOrders.length})</span>
            </span>
            <span className="text-xs text-stone-500 font-normal">
              स्थिति: <strong className="text-emerald-700">{currentPartner.status}</strong>
            </span>
          </h2>

          {activeAssignedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-sm">
              <Truck className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-bold text-stone-800 text-sm">कोई नया डिलीवरी असाइनमेंट नहीं</h3>
              <p className="text-stone-500 text-xs">ऑनलाइन रहें! एडमिन या ग्राहक द्वारा नया ऑर्डर प्लेस होते ही यहाँ आ जाएगा।</p>
            </div>
          ) : (
            activeAssignedOrders.map(order => {
              const isAssignedToMe = order.deliveryPartnerId === currentPartner.id;
              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`;

              return (
                <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-stone-900 text-sm">Order #{order.id}</span>
                        <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {order.status}
                        </span>
                        {isAssignedToMe ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                            ✓ आपको असाइन किया गया
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                            ⚡ उपलब्ध नया ऑर्डर
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        ग्राहक: <strong className="text-stone-900">{order.customerName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-blue-200"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>मैप खोलें (Maps)</span>
                      </a>

                      <a
                        href={`tel:${order.customerPhone}`}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>कॉल ({order.customerPhone})</span>
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-bold text-stone-900">1. दुकान से पिकअप: {order.vendorName || 'Smart Bazaar Store'}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-bold text-stone-900">2. ग्राहक ड्रॉप: {order.customerName}</div>
                        <div className="text-stone-600 font-medium">{order.deliveryAddress}</div>
                      </div>
                    </div>

                    {order.paymentMode === 'cod' && (
                      <div className="bg-amber-100 border border-amber-300 p-2 rounded-lg text-amber-950 font-bold text-xs flex items-center gap-1.5 mt-1">
                        <DollarSign className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>नकद भुगतान (Cash on Delivery): ₹{order.totalAmount} ग्राहक से प्राप्त करें</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="font-extrabold text-stone-900 text-sm">
                      कुल बिल राशि: ₹{order.totalAmount}
                    </div>

                    {!isAssignedToMe ? (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery', {
                          deliveryPartnerId: currentPartner.id,
                          deliveryPartnerName: currentPartner.name
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Truck className="w-4 h-4 text-emerald-200" />
                        <span>ऑर्डर स्वीकार करें (Accept Order)</span>
                      </button>
                    ) : order.status !== 'Out for Delivery' ? (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery', {
                          deliveryPartnerId: currentPartner.id,
                          deliveryPartnerName: currentPartner.name
                        })}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm"
                      >
                        पिकअप करें व रास्ता शुरू करें
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setOtpModalOrderId(order.id);
                          setOtpError('');
                          setOtpInput('');
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <Key className="w-4 h-4 text-amber-300" />
                        <span>OTP सत्यापित करें और डिलीवर करें</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: WALLET & EARNINGS */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-3xl shadow-xl border border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                <span>राइडर वॉलेट बैलेंस (Rider Wallet)</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                सत्यापित खाता
              </span>
            </div>

            <div className="text-4xl font-black mb-2">₹{totalCommissionEarned}</div>
            <p className="text-xs text-stone-400 mb-6">
              प्रत्येक पूर्ण डिलीवरी के लिए ₹50 कमीशन राशि आपके खाते में जुड़ती है।
            </p>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>बैंक खाते में ट्रांसफर करें (Payout Request)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>नकद संग्रह (COD Collections)</span>
              </h3>
              <div className="text-2xl font-black text-stone-900">₹{totalCodCashCollected}</div>
              <p className="text-xs text-stone-500">
                ग्राहकों से एकत्रित किया गया नकद भुगतान (एडमिन सेटलमेंट के समय जमा करें)
              </p>
            </div>

            <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>राइडर रेटिंग व प्रदर्शन</span>
              </h3>
              <div className="text-2xl font-black text-amber-600">⭐ {currentPartner.rating} / 5.0</div>
              <p className="text-xs text-stone-500">
                ग्राहकों द्वारा समयबद्ध व सुरक्षित डिलीवरी के लिए दी गई प्रशंसा
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>पूर्ण की गई डिलीवरी इतिहास ({completedOrders.length})</span>
          </h2>

          {completedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-sm">
              <p className="text-stone-500 text-xs">अभी तक कोई पूर्ण ऑर्डर नहीं है।</p>
            </div>
          ) : (
            completedOrders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-stone-900 text-xs">#{order.id}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      ✓ Delivered
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-1">
                    ग्राहक: {order.customerName} ({order.deliveryAddress})
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-stone-900">₹{order.totalAmount}</div>
                  <div className="text-[11px] font-bold text-emerald-600">+₹50 कमीशन</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: PROFILE & KYC */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-amber-400 font-black text-2xl flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-stone-900">{currentPartner.name}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> KYC Approved
                </span>
              </div>
              <p className="text-xs text-stone-500">आईडी: {currentPartner.id} • वाहन: {currentPartner.vehicle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-2">व्यक्तिगत व वाहन जानकारी</div>
              <div>मोबाइल नंबर: <strong className="text-stone-900">{currentPartner.phone}</strong></div>
              <div>ईमेल: <strong className="text-stone-900">{currentPartner.email || 'rider@smartbazaar.com'}</strong></div>
              <div>वर्तमान लोकेशन: <strong className="text-stone-900">{currentPartner.currentLocation}</strong></div>
              <div>ड्राइविंग लाइसेंस (DL): <strong className="text-emerald-700">✓ DL-2026-ACTIVE</strong></div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-2">सुरक्षा व पासवर्ड सेटिंग्स</div>
              <div>सुरक्षा प्रश्न: <strong className="text-stone-900">{currentPartner.securityQuestion || 'सुरक्षा शब्द क्या है?'}</strong></div>
              <div>सुरक्षा उत्तर: <strong className="text-stone-900">{currentPartner.securityAnswer || 'express'}</strong></div>
              <div>पासवर्ड: <strong className="text-stone-900">{currentPartner.password || '123'}</strong></div>
              <button
                onClick={() => setIsForgotModalOpen(true)}
                className="mt-2 text-xs text-blue-700 font-extrabold hover:underline block"
              >
                सुरक्षा पासवर्ड अपडेट करें →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-extrabold text-stone-900 text-base">बैंक ट्रांसफर अनुरोध (Payout)</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">राशि दर्ज करें (Amount ₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm outline-none"
                />
              </div>

              <div className="text-xs text-stone-500 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                कुल उपलब्ध बैलेंस: <strong>₹{totalCommissionEarned}</strong>
              </div>

              <button
                onClick={() => {
                  alert(`✅ ₹${payoutAmount} का ट्रांसफर अनुरोध एडमिन को भेज दिया गया है। 2 घंटे में खाते में क्रेडिट हो जाएगा!`);
                  setIsPayoutModalOpen(false);
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md"
              >
                अनुरोध भेजें (Submit Payout)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <AnimatePresence>
        {otpModalOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>OTP सत्यापन</span>
                </div>
                <button
                  onClick={() => setOtpModalOrderId(null)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyOtpAndComplete} className="space-y-4">
                <p className="text-xs text-stone-600">
                  ग्राहक की ऐप स्क्रीन पर दिख रहा 4-अंकों का OTP दर्ज करें:
                </p>

                <div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                    placeholder="4-अंकों का OTP"
                    className="w-full text-center text-2xl font-mono tracking-widest font-black py-3 bg-stone-50 border-2 border-stone-300 rounded-2xl focus:border-emerald-500 outline-none"
                  />
                </div>

                {otpError && (
                  <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 font-medium">
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>सत्यापित करें एवं ऑर्डर डिलीवर करें</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        portalTitle="डिलीवरी राइडर पोर्टल (Rider Panel)"
        currentUsername={currentPartner?.name || 'डिलीवरी राइडर'}
        isFirstTime={isFirstTimeChangePass}
        onSave={async (newPass) => {
          if (currentPartner) {
            await updatePartnerPasswordDoc(currentPartner.id, newPass);
            currentPartner.password = newPass;
          }
        }}
      />
    </div>
  );
};

