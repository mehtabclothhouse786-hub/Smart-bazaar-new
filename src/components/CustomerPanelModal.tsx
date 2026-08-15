import React, { useState, useRef, useEffect } from 'react';
import { CustomerUser, Order, ServiceBooking } from '../types';
import { 
  X, 
  UserCheck, 
  ShoppingBag, 
  ShieldCheck, 
  Pencil, 
  LogOut, 
  Phone, 
  MapPin, 
  Clock, 
  Wrench,
  CheckCircle2,
  Package,
  Store,
  Truck,
  Home,
  AlertCircle,
  Sparkles,
  Bike,
  Camera,
  RefreshCw,
  Trash2,
  Upload,
  Check,
  SwitchCamera,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerUser: CustomerUser | null;
  orders: Order[];
  serviceBookings?: ServiceBooking[];
  onCustomerLogout: () => void;
  onUpdateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  onRequireLogin?: () => void;
}

// Order Status Progress Tracker Component
const OrderStatusProgressTracker: React.FC<{ order: Order }> = ({ order }) => {
  const isSelfPickup = order.deliveryMode === 'self';

  const getStageDetails = (status: Order['status']) => {
    if (status === 'Cancelled') {
      return { stageIndex: -1, isCancelled: true, message: 'यह ऑर्डर रद्द कर दिया गया है।' };
    }

    switch (status) {
      case 'Placed':
        return {
          stageIndex: 0,
          isCancelled: false,
          message: 'ऑर्डर सफलतापूर्वक दर्ज हो चुका है। दुकानदार की पुष्टि की प्रतीक्षा है।'
        };
      case 'Vendor Accepted':
      case 'Vendor Confirmed':
        return {
          stageIndex: 1,
          isCancelled: false,
          message: 'दुकानदार द्वारा ऑर्डर स्वीकार कर लिया गया है।'
        };
      case 'Preparing':
        return {
          stageIndex: 1,
          isCancelled: false,
          message: 'दुकान पर आपका सामान पैक व तैयार किया जा रहा है।'
        };
      case 'Pickup Assigned':
        return {
          stageIndex: 1,
          isCancelled: false,
          message: isSelfPickup ? 'दुकान पर पिकअप के लिए सामान तैयार किया जा रहा है।' : 'डिलीवरी पार्टनर को कार्य सौंपा गया है।'
        };
      case 'Out for Delivery':
      case 'In Transit':
        return {
          stageIndex: 2,
          isCancelled: false,
          message: isSelfPickup
            ? '✅ सामान दुकान पर तैयार है! आप जाकर पिकअप कर सकते हैं।'
            : '🚚 डिलीवरी पार्टनर सामान लेकर आपके पते की ओर निकल चुका है।'
        };
      case 'Delivered':
      case 'Settlement Completed':
        return {
          stageIndex: 3,
          isCancelled: false,
          message: isSelfPickup
            ? '🎉 सामान सफलतापूर्वक प्राप्त कर लिया गया है।'
            : '🎉 ऑर्डर सफलतापूर्वक आपके पते पर डिलीवर हो चुका है।'
        };
      default:
        return {
          stageIndex: 0,
          isCancelled: false,
          message: 'ऑर्डर प्रोसेस में है।'
        };
    }
  };

  const { stageIndex, isCancelled, message } = getStageDetails(order.status);

  const stages = [
    {
      step: 0,
      label: 'दर्ज हुआ',
      subLabel: 'Placed',
      icon: Package
    },
    {
      step: 1,
      label: 'तैयारी जारी',
      subLabel: 'Preparing',
      icon: Store
    },
    {
      step: 2,
      label: isSelfPickup ? 'पिकअप तैयार' : 'रास्ते में है',
      subLabel: isSelfPickup ? 'Ready' : 'On The Way',
      icon: isSelfPickup ? Store : Bike
    },
    {
      step: 3,
      label: isSelfPickup ? 'प्राप्त हुआ' : 'डिलीवर हुआ',
      subLabel: 'Delivered',
      icon: Home
    }
  ];

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3 text-rose-800">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="font-extrabold text-xs sm:text-sm">ऑर्डर रद्द (Cancelled)</div>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">{message}</p>
        </div>
      </div>
    );
  }

  // Calculate percentage width for progress line: 0% at step 0, 33.3% at step 1, 66.6% at step 2, 100% at step 3
  const progressPercentage = Math.min(100, Math.max(0, (stageIndex / 3) * 100));

  return (
    <div className="bg-gradient-to-b from-stone-50 to-white border border-stone-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-2xs">
      {/* Tracker Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {stageIndex < 3 ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
            लाइव स्टेटस ट्रैकर (Live Progress)
          </span>
        </div>

        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
          stageIndex === 3 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
            : 'bg-emerald-700 text-white shadow-2xs'
        }`}>
          चरण {stageIndex + 1} / 4 • {stages[stageIndex]?.label}
        </span>
      </div>

      {/* Progress Animation Bar & Step Nodes */}
      <div className="pt-2 pb-1 px-2 sm:px-4">
        <div className="relative">
          {/* Background Bar Track */}
          <div className="h-2 bg-stone-200 rounded-full w-full relative overflow-hidden">
            {/* Animated Fill Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-full relative"
            >
              {/* Shimmer Light on Active Bar */}
              {stageIndex < 3 && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full"
                />
              )}
            </motion.div>
          </div>

          {/* 4 Step Icon Nodes */}
          <div className="flex justify-between items-start -mt-4 relative">
            {stages.map((stage) => {
              const isCompleted = stage.step < stageIndex;
              const isCurrent = stage.step === stageIndex;
              const isUpcoming = stage.step > stageIndex;
              const StageIcon = stage.icon;

              return (
                <div key={stage.step} className="flex flex-col items-center group">
                  {/* Node Icon Circle */}
                  <div className="relative flex items-center justify-center">
                    {/* Ripple on active node */}
                    {isCurrent && stageIndex < 3 && (
                      <motion.span
                        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        className="absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 -z-10"
                      />
                    )}

                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.12 : 1,
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-colors shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                          : isCurrent
                            ? 'bg-emerald-700 text-white ring-3 ring-emerald-300 shadow-md'
                            : 'bg-white border-2 border-stone-300 text-stone-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <StageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </motion.div>
                  </div>

                  {/* Stage Labels */}
                  <div className="text-center mt-1.5 max-w-[65px] sm:max-w-[85px]">
                    <div className={`text-[10px] sm:text-[11px] leading-tight transition-colors ${
                      isCurrent
                        ? 'font-black text-emerald-800'
                        : isCompleted
                          ? 'font-bold text-stone-800'
                          : 'font-medium text-stone-400'
                    }`}>
                      {stage.label}
                    </div>
                    <div className={`text-[8px] sm:text-[9px] tracking-tight mt-0.5 ${
                      isCurrent ? 'font-bold text-emerald-600' : 'text-stone-400'
                    }`}>
                      {stage.subLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Status Explanation Banner */}
      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
        stageIndex === 3
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : 'bg-stone-100/90 text-stone-800 border-stone-200'
      }`}>
        <Sparkles className={`w-4 h-4 shrink-0 ${stageIndex === 3 ? 'text-emerald-600' : 'text-amber-600'}`} />
        <span className="font-semibold text-[11px] sm:text-xs">
          {message}
        </span>
      </div>
    </div>
  );
};

export const CustomerPanelModal: React.FC<CustomerPanelModalProps> = ({
  isOpen,
  onClose,
  customerUser,
  orders = [],
  serviceBookings = [],
  onCustomerLogout,
  onUpdateCustomerProfile
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'profile'>('orders');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [editName, setEditName] = useState(customerUser?.name || '');
  const [editPhone, setEditPhone] = useState(customerUser?.phone || '');
  const [editAddress, setEditAddress] = useState(customerUser?.address || '');

  // Camera & Profile Picture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when customerUser changes
  useEffect(() => {
    if (customerUser) {
      setEditName(customerUser.name || '');
      setEditPhone(customerUser.phone || '');
      setEditAddress(customerUser.address || '');
    }
  }, [customerUser]);

  // Clean up camera stream when modal unmounts or camera closes
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    stopCameraStream();
    setCameraError(null);
    setCapturedPhoto(null);
    setIsCapturing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('इस ब्राउज़र या डिवाइस में लाइव कैमरा समर्थित नहीं है। कृपया फ़ाइल से अपलोड करें।');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'कैमरा शुरू करने में समस्या हुई। कृपया कैमरा अनुमति (Permission) की जांच करें या फ़ाइल से फोटो अपलोड करें।';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'कैमरा एक्सेस की अनुमति अस्वीकार कर दी गई है। कृपया ब्राउज़र सेटिंग्स में जाकर कैमरा अनुमति दें।';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'डिवाइस पर कोई कैमरा नहीं मिला। कृपया फ़ाइल या गैलरी से फोटो अपलोड करें।';
      }
      setCameraError(msg);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenLiveCamera = () => {
    setIsCameraOpen(true);
    setCapturedPhoto(null);
    startCamera('user');
  };

  const handleCloseCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setCameraError(null);
  };

  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture square photo from live video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    // Square crop calculation
    const size = Math.min(videoWidth, videoHeight);
    const startX = (videoWidth - size) / 2;
    const startY = (videoHeight - size) / 2;

    const targetDimension = 360;
    canvas.width = targetDimension;
    canvas.height = targetDimension;

    // Flip horizontally if user front-facing camera
    if (cameraFacing === 'user') {
      ctx.translate(targetDimension, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      video,
      startX,
      startY,
      size,
      size,
      0,
      0,
      targetDimension,
      targetDimension
    );

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCameraStream();
  };

  const handleConfirmCapturedPhoto = () => {
    if (!capturedPhoto) return;
    setIsSavingPhoto(true);
    try {
      onUpdateCustomerProfile({
        profilePicture: capturedPhoto
      });
      handleCloseCameraModal();
    } catch (e) {
      console.error('Error saving profile picture:', e);
      alert('फोटो सेव करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    if (window.confirm('क्या आप अपनी प्रोफाइल फोटो हटाना चाहते हैं?')) {
      onUpdateCustomerProfile({
        profilePicture: ''
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (फोटो) फ़ाइल चुनें!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        const targetDimension = 360;

        canvas.width = targetDimension;
        canvas.height = targetDimension;

        ctx.drawImage(
          img,
          startX,
          startY,
          size,
          size,
          0,
          0,
          targetDimension,
          targetDimension
        );

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onUpdateCustomerProfile({
          profilePicture: resizedDataUrl
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  // Filter orders strictly related to this customer's phone number or name
  const myOrders = orders.filter(o => {
    if (!customerUser) return false;
    const cleanCustomerPhone = (customerUser.phone || '').replace(/\D/g, '').slice(-10);
    const cleanOrderPhone = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
    const phoneMatch = Boolean(cleanCustomerPhone && cleanOrderPhone && cleanCustomerPhone === cleanOrderPhone);
    const nameMatch = Boolean(o.customerName && customerUser.name && o.customerName.trim().toLowerCase() === customerUser.name.trim().toLowerCase());
    return phoneMatch || nameMatch;
  });

  // Filter service bookings strictly related to this customer's phone number or name
  const myBookings = serviceBookings.filter(b => {
    if (!customerUser) return false;
    const cleanCustomerPhone = (customerUser.phone || '').replace(/\D/g, '').slice(-10);
    const cleanBookingPhone = (b.customerPhone || '').replace(/\D/g, '').slice(-10);
    const phoneMatch = Boolean(cleanCustomerPhone && cleanBookingPhone && cleanCustomerPhone === cleanBookingPhone);
    const nameMatch = Boolean(b.customerName && customerUser.name && b.customerName.trim().toLowerCase() === customerUser.name.trim().toLowerCase());
    return phoneMatch || nameMatch;
  });

  const handleOpenEdit = () => {
    setEditName(customerUser?.name || '');
    setEditPhone(customerUser?.phone || '');
    setEditAddress(customerUser?.address || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      alert('कृपया अपना नाम और मोबाइल नंबर दर्ज करें!');
      return;
    }
    onUpdateCustomerProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim()
    });
    alert('✅ आपकी प्रोफाइल जानकारी सफलतापूर्वक अपडेट कर दी गई है!');
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 my-auto overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Hidden File Input for fallback upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Hidden Canvas for Photo Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Panel Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            {/* Customer Profile Avatar with Quick Camera Trigger */}
            <div className="relative group shrink-0">
              {customerUser?.profilePicture ? (
                <img
                  src={customerUser.profilePicture}
                  alt={customerUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-md ring-2 ring-emerald-400/50"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-inner">
                  {customerUser?.name ? customerUser.name.charAt(0).toUpperCase() : <UserCheck className="w-7 h-7" />}
                </div>
              )}
              
              {customerUser && (
                <button
                  type="button"
                  onClick={handleOpenLiveCamera}
                  title="कैमरा से फोटो लें (Take Photo)"
                  className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-stone-950 p-1.5 rounded-xl shadow-md border border-white transition-transform active:scale-90 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-lg sm:text-xl leading-tight">कस्टमर पैनल</h2>
                <span className="bg-emerald-900 border border-emerald-400/40 text-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Customer Account
                </span>
              </div>
              <p className="text-emerald-100 text-xs mt-0.5 font-medium">
                {customerUser ? `${customerUser.name} (${customerUser.phone})` : 'अतिथि ग्राहक (Guest Customer)'}
              </p>
            </div>
          </div>

          {/* Quick Profile Summary Bar */}
          {customerUser && (
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-50">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-200" />
                  <span>+91 {customerUser.phone}</span>
                </span>
                {customerUser.address && (
                  <span className="flex items-center gap-1 font-semibold truncate max-w-[250px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span className="truncate">{customerUser.address}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOpenLiveCamera}
                  className="bg-amber-400/90 hover:bg-amber-300 text-stone-900 font-extrabold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-stone-900" />
                  <span>फोटो लें</span>
                </button>
                <button
                  onClick={handleOpenEdit}
                  className="bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-emerald-200" />
                  <span>एडिट</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => { setActiveTab('orders'); setIsEditingProfile(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders' && !isEditingProfile
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>लाइव ऑर्डर व OTP ({myOrders.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('services'); setIsEditingProfile(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'services' && !isEditingProfile
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>मेरी सर्विस बुकिंग्स ({myBookings.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>प्रोफ़ाइल व फोटो (Profile)</span>
          </button>
        </div>

        {/* Panel Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">

          {/* PROFILE TAB (PHOTO & USER DETAILS) */}
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              {/* Profile Photo Management Card */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-stone-50 to-amber-50/40 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  {/* Big Circular Photo Avatar */}
                  <div className="relative group">
                    {customerUser?.profilePicture ? (
                      <img
                        src={customerUser.profilePicture}
                        alt={customerUser.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-emerald-500/30"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 border-4 border-white shadow-lg ring-4 ring-emerald-500/20 flex items-center justify-center text-white font-black text-3xl">
                        {customerUser?.name ? customerUser.name.charAt(0).toUpperCase() : <UserCheck className="w-12 h-12" />}
                      </div>
                    )}

                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-2 rounded-full border-2 border-white shadow-md">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Photo Actions */}
                  <div className="flex-1 text-center sm:text-left space-y-2.5">
                    <div>
                      <h4 className="font-black text-stone-900 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
                        <span>प्रोफ़ाइल फोटो (Profile Picture)</span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-stone-500 text-xs mt-0.5">
                        कैमरे से अपनी लाइव सेल्फी/फोटो खींचें या गैलरी से अपलोड करें।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleOpenLiveCamera}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>कैमरा से फोटो खींचें</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>गैलरी / फ़ाइल से चुनें</span>
                      </button>

                      {customerUser?.profilePicture && (
                        <button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>फोटो हटाएं</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Card / Edit Form */}
              <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>व्यक्तिगत विवरण (Account Details)</span>
                  </h3>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-black flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>बदलें</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">पूरा नाम (Full Name) *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="अपना नाम लिखें"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">डिलिवरी पता (Delivery Address)</label>
                      <textarea
                        rows={2}
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        placeholder="मकान नंबर, गली, लैंडमार्क, क्षेत्र, शहर..."
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        रद्द करें
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        सेव करें (Save Changes)
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-150">
                      <span className="text-stone-400 block text-[11px] font-bold">पूरा नाम:</span>
                      <span className="font-extrabold text-stone-900 text-sm">{customerUser?.name || 'दर्ज नहीं'}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-150">
                      <span className="text-stone-400 block text-[11px] font-bold">मोबाइल नंबर:</span>
                      <span className="font-extrabold text-stone-900 text-sm font-mono">+91 {customerUser?.phone || 'दर्ज नहीं'}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-150 sm:col-span-2">
                      <span className="text-stone-400 block text-[11px] font-bold">डिलिवरी पता (Default Address):</span>
                      <span className="font-semibold text-stone-800 mt-0.5 block">{customerUser?.address || 'डिफ़ॉल्ट पता दर्ज नहीं किया गया है।'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            /* MY LIVE ORDERS & PURCHASE HISTORY VIEW INSIDE CUSTOMER PANEL */
            <div className="space-y-4">
              {!customerUser?.isLoggedIn ? (
                <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200 space-y-3">
                  <UserCheck className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="font-extrabold text-stone-800 text-sm">खाता लॉगिन करें</h3>
                  <p className="text-stone-500 text-xs">अपने मोबाइल नंबर और पासवर्ड से लॉगिन करके अपने सभी ऑर्डर और डिलीवरी ट्रैक करें!</p>
                </div>
              ) : myOrders.length === 0 ? (
                <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200 my-2">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <h3 className="font-extrabold text-stone-800 text-sm mb-1">अभी तक कोई ख़रीदारी नहीं की</h3>
                  <p className="text-stone-500 text-xs">शॉप कैटलॉग से अपने पसंदीदा प्रोडक्ट्स जोड़कर पहला ऑर्डर करें!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map(order => {
                    const isDelivered = order.status === 'Delivered' || order.status === 'Settlement Completed';
                    const isCancelled = order.status === 'Cancelled';
                    
                    return (
                      <div key={order.id} className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
                        {/* Order Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-stone-900 text-xs sm:text-sm">
                                Order #{order.id}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                isDelivered 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : isCancelled 
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                    : 'bg-emerald-800 text-white shadow-2xs'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                                {order.deliveryMode === 'platform' ? '🚚 स्मार्ट डिलीवरी' : '🏪 दुकान से पिकअप'}
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                              <span>तारीख: {new Date(order.createdAt || Date.now()).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              {order.vendorName && <span className="text-stone-700 font-bold">• दुकान: {order.vendorName}</span>}
                            </div>
                          </div>

                          {/* OTP Box for active delivery */}
                          {order.otp && !isDelivered && !isCancelled && (
                            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white border border-emerald-700 px-3.5 py-1.5 rounded-2xl text-center shadow-xs">
                              <span className="text-[9px] font-black uppercase text-amber-300 block tracking-wider">डिलीवरी OTP</span>
                              <span className="font-mono font-black text-lg text-white tracking-widest">{order.otp}</span>
                            </div>
                          )}
                        </div>

                        {/* Visual Animated Order Status Progress Bar Tracker */}
                        <OrderStatusProgressTracker order={order} />

                        {/* Estimated Delivery Time Banner */}
                        {!isDelivered && !isCancelled && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between gap-2 text-xs font-extrabold text-emerald-950">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>संभावित डिलीवरी: {order.deliveryMode === 'platform' ? '25-40 मिनट में आपके पते पर' : '30 मिनट में दुकान पर तैयार'}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-black">लाइव</span>
                          </div>
                        )}

                        {/* Purchased Product Items Breakdown */}
                        <div className="space-y-2 bg-stone-50/80 rounded-2xl p-3 border border-stone-200">
                          <div className="text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1">
                            ऑर्डर किए गए प्रोडक्ट्स (Items)
                          </div>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-stone-100 shadow-2xs">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.product.imageUrl ? (
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt={item.product.name} 
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 font-bold text-xs shrink-0">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-stone-900 text-xs truncate">
                                    {item.product.name}
                                  </h5>
                                  <div className="text-[11px] font-medium text-stone-500">
                                    ₹{item.product.price} × {item.quantity} {item.product.unit || 'इकाई'}
                                  </div>
                                </div>
                              </div>
                              <span className="font-black text-stone-900 text-xs shrink-0">
                                ₹{item.product.price * item.quantity}
                              </span>
                            </div>
                          ))}

                          {/* Bill Pricing Breakdown */}
                          <div className="border-t border-stone-200 pt-2 space-y-1 text-xs font-semibold text-stone-700">
                            {order.deliveryCharge !== undefined && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span>डिलीवरी शुल्क (Delivery Fee)</span>
                                <span>{order.deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">मुफ्त (Free)</span> : `₹${order.deliveryCharge}`}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center font-black text-stone-900 text-sm pt-1 border-t border-stone-200">
                              <span>कुल भुगतान राशि (Total Bill)</span>
                              <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address & Payment details */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                          <div>
                            <span className="font-bold text-stone-800">डिलिवरी पता: </span>
                            <span>{order.deliveryAddress || customerUser?.address || 'स्टोर पिकअप / डिफ़ॉल्ट पता'}</span>
                          </div>
                          {order.paymentScreenshot && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-stone-500">पेमेंट रसीद:</span>
                              <img
                                src={order.paymentScreenshot}
                                alt="Payment Proof"
                                className="w-8 h-8 object-cover rounded-lg border border-stone-300 shadow-2xs cursor-pointer"
                                onClick={() => {
                                  const w = window.open('');
                                  if (w) w.document.write(`<img src="${order.paymentScreenshot}" style="max-width:100%;">`);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* MY SERVICE BOOKINGS VIEW */
            <div className="space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm">मेरी हालिया सर्विस बुकिंग्स</h3>
              {myBookings.length === 0 ? (
                <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200">
                  <Wrench className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <h3 className="font-extrabold text-stone-800 text-sm mb-1">कोई बुकिंग नहीं</h3>
                  <p className="text-stone-500 text-xs">स्थानीय मिस्त्री व तकनीशियन सेवाओं से ऑर्डर करें!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myBookings.map(b => (
                    <div key={b.id} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-stone-900">
                        <span>{b.serviceCategory} ({b.providerName})</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-stone-600">पता: {b.customerAddress}</div>
                      <div className="text-stone-500 text-[11px]">विजिट शुल्क: ₹{b.visitCharge}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Panel Footer */}
        <div className="bg-stone-100 border-t border-stone-200 p-3.5 flex items-center justify-between gap-2 shrink-0">
          {customerUser ? (
            showLogoutConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-black text-rose-800">लॉगआउट निश्चित?</span>
                <button
                  type="button"
                  onClick={() => {
                    onCustomerLogout();
                    setShowLogoutConfirm(false);
                    onClose();
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  हाँ, लॉगआउट
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  रद्द
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>लॉगआउट करें (Logout)</span>
              </button>
            )
          ) : (
            <div className="text-xs font-semibold text-stone-500">
              अतिथि मोड (Guest Mode)
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>

      {/* LIVE CAMERA CAPTURE MODAL OVERLAY */}
      {isCameraOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col relative text-white">
            {/* Camera Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white leading-tight">कैमरा से फोटो लें</h3>
                  <p className="text-[10px] text-stone-400">प्रोफ़ाइल फोटो के लिए अपनी लाइव फोटो खींचें</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCameraModal}
                className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder / Capture Box */}
            <div className="p-4 flex flex-col items-center justify-center bg-stone-950">
              {cameraError ? (
                <div className="w-full aspect-square max-w-[320px] rounded-2xl bg-stone-900 border border-rose-800/50 p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-rose-300 font-medium leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-col w-full gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacing)}
                      className="w-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-extrabold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>पुनः प्रयास करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCameraModal();
                        fileInputRef.current?.click();
                      }}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>फ़ाइल / गैलरी से अपलोड करें</span>
                    </button>
                  </div>
                </div>
              ) : capturedPhoto ? (
                /* Snapped Preview Mode */
                <div className="flex flex-col items-center space-y-3 w-full">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl ring-4 ring-emerald-500/20">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      प्रीव्यू
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 font-medium text-center">
                    क्या आप इस फोटो को प्रोफाइल फोटो के रूप में सेट करना चाहते हैं?
                  </p>
                </div>
              ) : (
                /* Live Camera Stream Mode */
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-stone-700 shadow-2xl bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Circular Viewfinder Guidelines */}
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full pointer-events-none" />

                  {/* Camera switch button inside viewfinder */}
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    title="कैमरा बदलें (Switch Camera)"
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs border border-white/20 transition-all active:scale-90 cursor-pointer"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  {isCapturing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Camera Controls Footer */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhoto(null);
                      startCamera(cameraFacing);
                    }}
                    className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>फिर से लें (Retake)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingPhoto}
                    onClick={handleConfirmCapturedPhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingPhoto ? 'सेव हो रहा है...' : 'प्रोफ़ाइल फोटो सेट करें'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCameraModal();
                      fileInputRef.current?.click();
                    }}
                    className="text-stone-400 hover:text-stone-200 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">गैलरी से</span>
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    type="button"
                    disabled={Boolean(cameraError) || isCapturing}
                    onClick={handleSnapPhoto}
                    className="w-14 h-14 rounded-full bg-white hover:bg-stone-200 text-stone-900 border-4 border-emerald-500 flex items-center justify-center shadow-lg transition-transform active:scale-90 mx-auto cursor-pointer disabled:opacity-40"
                    title="फोटो खींचें"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    className="text-stone-400 hover:text-stone-200 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    title="कैमरा पलटें"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="hidden sm:inline">फ्लिप</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
