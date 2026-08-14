import React, { useState, useEffect } from 'react';
import { CommissionSettings, DEFAULT_COMMISSION_SETTINGS } from '../types';
import { 
  Percent, 
  DollarSign, 
  Truck, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  TrendingUp, 
  Wrench, 
  Package, 
  QrCode, 
  Save, 
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarginControlChartProps {
  settings: CommissionSettings;
  onSaveSettings: (newSettings: Partial<CommissionSettings>) => Promise<void>;
  onResetSettings: () => Promise<void>;
}

export const MarginControlChart: React.FC<MarginControlChartProps> = ({
  settings,
  onSaveSettings,
  onResetSettings
}) => {
  const [formData, setFormData] = useState<CommissionSettings>(settings || DEFAULT_COMMISSION_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Live Simulator Test Inputs
  const [simVendorRate, setSimVendorRate] = useState<number>(400);
  const [simServiceMaterial, setSimServiceMaterial] = useState<number>(500);
  const [simOldItemPrice, setSimOldItemPrice] = useState<number>(5000);

  // Synchronize when parent settings change
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleFieldChange = (field: keyof CommissionSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error saving commission settings:', err);
      alert('मार्जिन सेटिंग्स सेव करने में त्रुटि हुई।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('क्या आप सभी मार्जिन व कमीशन दरों को फ़ैक्टरी डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) {
      setIsResetting(true);
      try {
        await onResetSettings();
        setFormData(DEFAULT_COMMISSION_SETTINGS);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } catch (err) {
        console.error('Error resetting commission settings:', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const applyPreset = (preset: {
    vendorMarkupPercent: number;
    adminCommissionPercent: number;
    deliveryPartnerBasePay: number;
    deliveryPartnerCommissionPercent: number;
    deliveryPartnerPayType: 'fixed_per_order' | 'percent_of_order';
    customerDeliveryFee: number;
    freeDeliveryThreshold: number;
    servicePlatformFeePercent: number;
    oldItemAdminMarginPercent: number;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...preset
    }));
  };

  // Calculations for Simulator
  const simCustomerPrice = Math.round(simVendorRate * (1 + (formData.vendorMarkupPercent / 100)));
  const simGrossMargin = simCustomerPrice - simVendorRate;
  const simAdminProfit = Math.round(simCustomerPrice * (formData.adminCommissionPercent / 100));
  const simRiderPay = formData.deliveryPartnerPayType === 'percent_of_order'
    ? Math.round(simCustomerPrice * (formData.deliveryPartnerCommissionPercent / 100))
    : formData.deliveryPartnerBasePay;
  
  const simServiceSubtotal = 100 + simServiceMaterial; // 100 visit fee
  const simServiceFee = Math.round(simServiceSubtotal * (formData.servicePlatformFeePercent / 100));
  const simServiceTotal = simServiceSubtotal + simServiceFee;

  const simOldItemMargin = Math.round(simOldItemPrice * (formData.oldItemAdminMarginPercent / 100));
  const simOldItemCustomerPrice = simOldItemPrice + simOldItemMargin;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Real-Time Commission Master Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              एडमिन व डिलीवरी पार्टनर मार्जिन कंट्रोल चार्ट
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
              यहाँ से आप एडमिन मार्जिन, डिलीवरी राइडर पेआउट, वेंडर मार्कअप, होम सर्विस शुल्क व पुराना सामान कमीशन कभी भी बदल सकते हैं। यह बदलाव <strong className="text-emerald-400">सभी सेक्शन्स में तुरंत और ऑटोमैटिक</strong> लागू हो जाएगा।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="डिफ़ॉल्ट सेटिंग्स रीस्टोर करें"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>डिफ़ॉल्ट रीसेट</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>अपडेट हो रहा है...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>सेव व तुरंत लागू करें</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Status Pill */}
        <div className="mt-4 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>लाइव सिंक: कस्टमर, वेंडर, राइडर, सर्विस व 2nd हैंड पोर्टल जुड़े हुए हैं</span>
          </div>
          {formData.updatedAt && (
            <span className="font-mono text-stone-400">
              अंतिम अपडेट: {new Date(formData.updatedAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(formData.updatedAt).toLocaleDateString('hi-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 border border-emerald-500"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <div>
                <strong className="text-sm font-black block">✅ मार्जिन और कमीशन सेटिंग्स सफलतापूर्वक अपडेट हो गई हैं!</strong>
                <span className="text-xs text-emerald-100 font-medium">नया मार्जिन चार्ट अब पूरे ऐप, वेंडर पोर्टल, डिलीवरी राइडर ऐप व बिलिंग में लाइव सक्रिय है।</span>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-emerald-200 hover:text-white font-black text-xs bg-emerald-700/60 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              ठीक है
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1-Click Strategy Presets */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>त्वरित प्रीसेट रणनीतियाँ (1-Click Strategy Presets)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">एक क्लिक में संतुलित मार्जिन सेट करें</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset({
              vendorMarkupPercent: 25,
              adminCommissionPercent: 12.5,
              deliveryPartnerBasePay: 50,
              deliveryPartnerCommissionPercent: 12.5,
              deliveryPartnerPayType: 'fixed_per_order',
              customerDeliveryFee: 40,
              freeDeliveryThreshold: 500,
              servicePlatformFeePercent: 10,
              oldItemAdminMarginPercent: 10
            })}
            className="p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-2xl text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-black text-stone-900 group-hover:text-emerald-800">⭐ स्टैंडर्ड संतुलित (25% Markup)</div>
            <div className="text-[11px] text-stone-500 mt-0.5">12.5% एडमिन + ₹50 राइडर पेआउट</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              vendorMarkupPercent: 20,
              adminCommissionPercent: 10,
              deliveryPartnerBasePay: 40,
              deliveryPartnerCommissionPercent: 10,
              deliveryPartnerPayType: 'fixed_per_order',
              customerDeliveryFee: 35,
              freeDeliveryThreshold: 400,
              servicePlatformFeePercent: 8,
              oldItemAdminMarginPercent: 8
            })}
            className="p-3 bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 rounded-2xl text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-black text-stone-900 group-hover:text-blue-800">🚀 तीव्र ग्रोथ व प्रतिस्पर्धी (20%)</div>
            <div className="text-[11px] text-stone-500 mt-0.5">10% एडमिन + ₹40 राइडर पेआउट</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              vendorMarkupPercent: 15,
              adminCommissionPercent: 7.5,
              deliveryPartnerBasePay: 35,
              deliveryPartnerCommissionPercent: 7.5,
              deliveryPartnerPayType: 'fixed_per_order',
              customerDeliveryFee: 30,
              freeDeliveryThreshold: 350,
              servicePlatformFeePercent: 5,
              oldItemAdminMarginPercent: 5
            })}
            className="p-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-2xl text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-black text-stone-900 group-hover:text-amber-800">🎉 फेस्टिवल / डिस्काउंट ऑफर (15%)</div>
            <div className="text-[11px] text-stone-500 mt-0.5">7.5% एडमिन + ₹35 राइडर पेआउट</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset({
              vendorMarkupPercent: 30,
              adminCommissionPercent: 15,
              deliveryPartnerBasePay: 60,
              deliveryPartnerCommissionPercent: 15,
              deliveryPartnerPayType: 'fixed_per_order',
              customerDeliveryFee: 50,
              freeDeliveryThreshold: 600,
              servicePlatformFeePercent: 12,
              oldItemAdminMarginPercent: 12
            })}
            className="p-3 bg-stone-50 hover:bg-purple-50 border border-stone-200 hover:border-purple-300 rounded-2xl text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-black text-stone-900 group-hover:text-purple-800">💎 प्रीमियम प्रॉफिट मार्जिन (30%)</div>
            <div className="text-[11px] text-stone-500 mt-0.5">15% एडमिन + ₹60 राइडर पेआउट</div>
          </button>
        </div>
      </div>

      {/* Main Form: Margin & Commission Control Chart */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* CARD 1: E-Commerce Product & Vendor Margins */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">ई-कॉमर्स वेंडर व एडमिन प्रोडक्ट मार्जिन</h3>
                <p className="text-xs text-stone-500">कैटलॉग उत्पाद कीमतों में ऑटोमैटिक मार्कअप</p>
              </div>
            </div>

            {/* Vendor Markup Slider & Number */}
            <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>विक्रेता प्रोडक्ट मार्कअप दर (Vendor Markup %)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={formData.vendorMarkupPercent}
                    onChange={e => handleFieldChange('vendorMarkupPercent', Number(e.target.value))}
                    className="w-18 px-2 py-1 bg-white border border-emerald-400 rounded-xl font-mono font-black text-sm text-emerald-800 text-right outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-xs text-stone-600">%</span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={60}
                step={0.5}
                value={formData.vendorMarkupPercent}
                onChange={e => handleFieldChange('vendorMarkupPercent', Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-bold text-stone-400">
                <span>0% (नो मार्कअप)</span>
                <span className="text-emerald-700 font-extrabold">वर्तमान: +{formData.vendorMarkupPercent}%</span>
                <span>60% (अधिकतम)</span>
              </div>

              <p className="text-[11px] text-stone-600 leading-snug">
                💡 <strong>फ़ॉर्मूला:</strong> जब वेंडर ₹400 रेट भरेगा, तो ग्राहक को स्वतः <strong className="text-emerald-800 font-black">₹{Math.round(400 * (1 + formData.vendorMarkupPercent / 100))}</strong> (+{formData.vendorMarkupPercent}%) दिखेगा।
              </p>
            </div>

            {/* Admin Net Commission Cut */}
            <div className="space-y-2 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                  <span>एडमिन शुद्ध कमीशन (Admin Commission % from GMV)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={formData.adminCommissionPercent}
                    onChange={e => handleFieldChange('adminCommissionPercent', Number(e.target.value))}
                    className="w-18 px-2 py-1 bg-white border border-stone-400 rounded-xl font-mono font-black text-sm text-stone-900 text-right outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <span className="font-bold text-xs text-stone-600">%</span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={40}
                step={0.5}
                value={formData.adminCommissionPercent}
                onChange={e => handleFieldChange('adminCommissionPercent', Number(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-bold text-stone-400">
                <span>0%</span>
                <span className="text-stone-900 font-extrabold">वर्तमान: {formData.adminCommissionPercent}% शुद्ध लाभ</span>
                <span>40%</span>
              </div>
            </div>

          </div>

          {/* CARD 2: Delivery Partner Margin & Customer Shipping */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">डिलीवरी पार्टनर पेआउट व ग्राहक शिपिंग शुल्क</h3>
                <p className="text-xs text-stone-500">राइडर वॉलेट कमाई व ग्राहक डिलीवरी दरें</p>
              </div>
            </div>

            {/* Delivery Partner Payout Mode Selector */}
            <div className="space-y-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-blue-950">
                  🚴 डिलीवरी राइडर पेआउट प्रकार (Payout Mode)
                </label>
                <div className="flex bg-white rounded-xl p-0.5 border border-blue-300">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('deliveryPartnerPayType', 'fixed_per_order')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      formData.deliveryPartnerPayType === 'fixed_per_order'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    निश्चित राशि (Fixed ₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('deliveryPartnerPayType', 'percent_of_order')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      formData.deliveryPartnerPayType === 'percent_of_order'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    प्रतिशत (%)
                  </button>
                </div>
              </div>

              {formData.deliveryPartnerPayType === 'fixed_per_order' ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-stone-700">प्रति सफल डिलीवरी राइडर कमाई:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-stone-800">₹</span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={formData.deliveryPartnerBasePay}
                      onChange={e => handleFieldChange('deliveryPartnerBasePay', Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-blue-50 border border-blue-300 rounded-lg font-mono font-black text-sm text-blue-900 text-right outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-stone-600">/ ऑर्डर</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200">
                  <span className="text-xs font-bold text-stone-700">ऑर्डर वैल्यू से राइडर शेयर:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={formData.deliveryPartnerCommissionPercent}
                      onChange={e => handleFieldChange('deliveryPartnerCommissionPercent', Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-blue-50 border border-blue-300 rounded-lg font-mono font-black text-sm text-blue-900 text-right outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-stone-600">% प्रति ऑर्डर</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Delivery Fee & Free Delivery Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <label className="block text-[11px] font-extrabold text-stone-700">
                  ग्राहक डिलीवरी शुल्क (Customer Fee)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-stone-500">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={formData.customerDeliveryFee}
                    onChange={e => handleFieldChange('customerDeliveryFee', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-xl font-mono font-bold text-xs text-stone-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <label className="block text-[11px] font-extrabold text-stone-700">
                  मुफ्त डिलीवरी सीमा (Free Delivery Min ₹)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-stone-500">₹</span>
                  <input
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={formData.freeDeliveryThreshold}
                    onChange={e => handleFieldChange('freeDeliveryThreshold', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-xl font-mono font-bold text-xs text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* CARD 3: Home Services & Old Items Margins */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-sm">होम सर्विसेज व 2nd हैंड पुराना सामान मार्जिन</h3>
                <p className="text-xs text-stone-500">मिस्त्री/डॉक्टर सर्विस बिल व पुराना सामान बाज़ार दरें</p>
              </div>
            </div>

            {/* Home Service Fee */}
            <div className="space-y-2 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-purple-700" />
                  <span>होम सर्विस प्लेटफॉर्म चार्ज (Service Fee %)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={formData.servicePlatformFeePercent}
                    onChange={e => handleFieldChange('servicePlatformFeePercent', Number(e.target.value))}
                    className="w-18 px-2 py-1 bg-white border border-purple-400 rounded-xl font-mono font-black text-sm text-purple-900 text-right outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-bold text-xs text-stone-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-purple-900">
                प्लंबर/इलेक्ट्रिशियन के फाइनल बिल (विजिट + पार्ट्स) पर ऑटोमैटिक <strong className="font-black">+{formData.servicePlatformFeePercent}%</strong> जुड़ेगा।
              </p>
            </div>

            {/* Old Items 2nd Hand Margin */}
            <div className="space-y-2 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-700" />
                  <span>पुराना सामान एडमिन मार्जिन (2nd Hand Margin %)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    value={formData.oldItemAdminMarginPercent}
                    onChange={e => handleFieldChange('oldItemAdminMarginPercent', Number(e.target.value))}
                    className="w-18 px-2 py-1 bg-white border border-amber-400 rounded-xl font-mono font-black text-sm text-amber-950 text-right outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="font-bold text-xs text-stone-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-900">
                जब भी कोई पुराना सामान लिस्ट करेगा, उसकी मांगी गई राशि में <strong className="font-black">+{formData.oldItemAdminMarginPercent}%</strong> एडमिन मार्जिन जुड़कर ग्राहकों को दिखेगा।
              </p>
            </div>

          </div>

          {/* CARD 4: Admin Payment Settlement & Bank UPI */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">एडमिन सेटलमेंट व QR कोड UPI आईडी</h3>
                  <p className="text-xs text-stone-500">सभी ऑनलाइन पेमेंट्स व QR कोड के लिए मास्टर UPI</p>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    एडमिन UPI आईडी (Master Admin UPI ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.smartDeliveryUpi}
                    onChange={e => handleFieldChange('smartDeliveryUpi', e.target.value.trim())}
                    placeholder="9457695918@airtel"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl font-mono font-bold text-xs text-stone-900 outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    ग्राहक चेकआउट QR कोड व वेंडर/राइडर सेटलमेंट इसी UPI पर आधारित हैं।
                  </span>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1 text-xs text-stone-600">
                  <div className="font-extrabold text-stone-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>ऑटोमैटिक अपडेट की गारंटी:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    इस कंट्रोल पैनल में कोई भी दर बदलने पर आपको कोई कोड या सर्वर बदलने की आवश्यकता नहीं है; पूरे स्मार्ट बाजार में सभी कैलकुलेशंस स्वतः लाइव रिफ्रेश हो जाते हैं।
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सेव हो रहा है...' : '💾 सेव करें व सभी सेक्शन में तुरंत लागू करें'}</span>
            </button>
          </div>

        </div>
      </form>

      {/* SECTION: LIVE PROFIT & BREAKDOWN SIMULATOR */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                लाइव मार्जिन व प्रॉफिट सिमुलेटर (Real-Time Profit Calculator)
              </h3>
              <p className="text-xs text-stone-400">
                वर्तमान दरों के आधार पर सटीक कमाई और ग्राहकों को दिखने वाली कीमत का लाइव डेमो
              </p>
            </div>
          </div>
          <span className="text-xs bg-stone-800 text-amber-300 font-mono px-3 py-1 rounded-full border border-stone-700">
            Interactive Test Mode
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SIMULATOR 1: Product Markup & Split */}
          <div className="bg-stone-850 p-4.5 rounded-2xl border border-stone-750 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>1. प्रोडक्ट ऑर्डर स्प्लिट (E-Commerce)</span>
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-300">
                टेस्ट: विक्रेता रेट दर्ज करें (Vendor Cost Price ₹):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={simVendorRate}
                  onChange={e => setSimVendorRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-xl font-mono text-sm font-black text-amber-300 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-stone-900 p-3.5 rounded-xl border border-stone-800">
              <div className="flex justify-between text-stone-300">
                <span>• वेंडर को भुगतान:</span>
                <span className="font-bold text-white">₹{simVendorRate} (100%)</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>• मार्कअप जोड़ा गया (+{formData.vendorMarkupPercent}%):</span>
                <span className="font-bold text-emerald-400">+₹{simGrossMargin}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold border-t border-stone-800 pt-1.5">
                <span>• ग्राहक अंतिम मूल्य:</span>
                <span className="text-sm">₹{simCustomerPrice}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>• राइडर पेआउट हिस्सा:</span>
                <span>₹{simRiderPay}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold border-t border-stone-800 pt-1">
                <span>• एडमिन शुद्ध लाभ:</span>
                <span>₹{simAdminProfit} ({formData.adminCommissionPercent}%)</span>
              </div>
            </div>
          </div>

          {/* SIMULATOR 2: Home Service Invoice */}
          <div className="bg-stone-850 p-4.5 rounded-2xl border border-stone-750 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>2. होम सर्विस बिल स्प्लिट (Services)</span>
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-300">
                टेस्ट: मिस्त्री का सामान खर्च (Material ₹):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={simServiceMaterial}
                  onChange={e => setSimServiceMaterial(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-xl font-mono text-sm font-black text-purple-300 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-stone-900 p-3.5 rounded-xl border border-stone-800">
              <div className="flex justify-between text-stone-300">
                <span>• फिक्स विजिट शुल्क:</span>
                <span>₹100</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>• सामान / पार्ट्स खर्च:</span>
                <span>₹{simServiceMaterial}</span>
              </div>
              <div className="flex justify-between text-purple-400 font-bold border-t border-stone-800 pt-1.5">
                <span>• स्मार्ट बाजार फीस (+{formData.servicePlatformFeePercent}%):</span>
                <span>+₹{simServiceFee}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-extrabold border-t border-stone-800 pt-1.5">
                <span>• ग्राहक कुल बिल:</span>
                <span className="text-sm">₹{simServiceTotal}</span>
              </div>
            </div>
          </div>

          {/* SIMULATOR 3: 2nd Hand Old Items Margin */}
          <div className="bg-stone-850 p-4.5 rounded-2xl border border-stone-750 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>3. पुराना सामान बाज़ार (Old Items)</span>
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-300">
                टेस्ट: विक्रेता द्वारा मांगी गई राशि (₹):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={simOldItemPrice}
                  onChange={e => setSimOldItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-xl font-mono text-sm font-black text-amber-300 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-stone-900 p-3.5 rounded-xl border border-stone-800">
              <div className="flex justify-between text-stone-300">
                <span>• विक्रेता को शुद्ध राशि:</span>
                <span className="font-bold text-white">₹{simOldItemPrice}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>• एडमिन मार्जिन (+{formData.oldItemAdminMarginPercent}%):</span>
                <span>+₹{simOldItemMargin}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-extrabold border-t border-stone-800 pt-1.5">
                <span>• पोर्टल पर दिखेगी कीमत:</span>
                <span className="text-sm">₹{simOldItemCustomerPrice}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
