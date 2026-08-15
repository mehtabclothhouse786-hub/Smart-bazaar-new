export type UserRole = 'customer' | 'vendor' | 'delivery' | 'service' | 'old_items' | 'admin';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  password?: string;
  address?: string;
  profilePicture?: string;
  isLoggedIn: boolean;
  createdAt?: number;
}

export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  costPrice?: number; // Vendor Rate
  price: number; // Customer Price (+25% markup)
  originalPrice?: number; // MRP
  category: string;
  vendorId: string;
  vendorName: string;
  stock: number;
  imageUrl: string;
  unit: string;
  deliveryMode?: 'platform' | 'self';
  description?: string;
  isPopular?: boolean;
  createdAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'Placed' 
  | 'Vendor Accepted' 
  | 'Vendor Confirmed'
  | 'Pickup Assigned'
  | 'Preparing' 
  | 'Out for Delivery' 
  | 'In Transit'
  | 'Delivered' 
  | 'Settlement Completed'
  | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal?: number;
  deliveryCharge?: number;
  totalAmount: number;
  status: OrderStatus;
  pickupStatus?: string;
  paymentMode?: 'online' | 'cod' | 'shop';
  deliveryMode?: 'platform' | 'self';
  paymentScreenshot?: string | null;
  otp: string;
  vendorId?: string;
  vendorName?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  adminCommission?: number;
  partnerCommission?: number;
  deliveryCommission?: number;
  codCollected?: boolean;
  settlementStatus?: string;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface Vendor {
  id: string;
  shopName: string;
  ownerName: string;
  username?: string;
  password?: string;
  phone: string;
  email?: string;
  category: string;
  status: 'active' | 'pending' | 'suspended';
  address: string;
  rating: number;
  totalOrders?: number;
  imageUrl?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  username?: string;
  phone: string;
  password?: string;
  email?: string;
  vehicle: string;
  status: 'Online' | 'Offline' | 'Busy';
  currentLocation: string;
  earnings: number;
  completedDeliveries: number;
  rating: number;
  walletBalance?: number;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface Category {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
}

export interface ServiceProvider {
  id: string;
  providerName: string; // तकनीशियन/डॉक्टर का नाम
  serviceName: string; // कार्य/सर्विस का नाम (उदा: नल एवं सैनिटरी रिपेयर)
  category: string; // प्लंबर | इलेक्ट्रिशियन | डॉक्टर | ब्यूटी पार्लर | तकनीशियन | कारपेंटर | पेंटर | अन्य
  description: string; // शॉर्ट विवरण
  primaryPhone: string; // 10 अंकों का प्राथमिक कॉल नंबर (e.g. 9876543210)
  whatsappPhone?: string; // WhatsApp नंबर (optional)
  address?: string; // क्षेत्र / स्थान (e.g. Bijnor / Chandpur)
  location?: string;
  rating?: number; // स्टार रेटिंग
  experienceYears?: number; // अनुभव (साल)
  imageUrl?: string;
  visitCharge?: number;
  username?: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt?: number;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerPhone: string;
  customerPhone: string; // 10 अंकों का ग्राहक मोबाइल नंबर (saved to system)
  customerName?: string;
  address?: string;
  customerAddress?: string;
  serviceCategory?: string;
  notes?: string;
  status: 'Booked / Contacted' | 'Completed' | 'Cancelled';
  createdAt: number;
  visitFee?: number; // Per call fee (Fixed ₹100)
  visitCharge?: number;
  materialCost?: number; // सामान/पार्ट्स खर्च (Fill by Provider)
  subtotal?: number; // visitFee + materialCost
  platformFee?: number; // 10% platform charge
  finalBillAmount?: number; // Total customer bill
  billGeneratedAt?: number;
}

export interface OldItem {
  id: string;
  title: string; // सामान का नाम (उदा. Hero Splendor, 32 inch Smart TV, 5 Seater Sofa)
  category: string; // मोबाइल एवं इलेक्ट्रॉनिक्स | वाहन / बाइक | फर्नीचर | घरेलू उपकरण | कपड़े एवं परिधान | किताबें | अन्य
  price: number; // ग्राहकों के लिए कुल अंतिम बिक्री मूल्य (₹) (विक्रेता मूल्य + 10% एडमिन मार्जिन)
  sellerPrice?: number; // विक्रेता द्वारा मांगी गई मूल राशि (₹)
  adminMargin?: number; // 10% एडमिन मार्जिन (₹)
  originalPrice?: number; // नई कीमत / MRP (₹)
  itemAge?: string; // कितना पुराना है (उदा. 6 माह, 1 साल, 2 वर्ष)
  condition: 'Like New' | 'Good' | 'Fair'; // 'लगभग नया' | 'अच्छी स्थिति' | 'सामान्य'
  description: string; // सामान का विवरण व खासियत
  sellerName: string; // विक्रेता का नाम
  sellerPhone: string; // संपर्क मोबाइल नंबर (कॉल व WhatsApp)
  whatsappPhone?: string; // WhatsApp नंबर (optional)
  location: string; // स्थान / गांव / शहर (उदा. बिजनौर, नजीबाबाद)
  imageUrl?: string; // सामान की फोटो
  status: 'available' | 'sold'; // 'available' = उपलब्ध, 'sold' = बिक गया
  createdAt: number;
  sellerUserId?: string;
}

export interface CommissionSettings {
  vendorMarkupPercent: number; // e.g. 25 (% added to vendor cost price to get customer retail price)
  adminCommissionPercent: number; // e.g. 12.5 (% admin platform share)
  deliveryPartnerBasePay: number; // e.g. 50 (₹ per delivery base payout to rider)
  deliveryPartnerCommissionPercent: number; // e.g. 12.5 (% share of order)
  deliveryPartnerPayType: 'fixed_per_order' | 'percent_of_order'; // default 'fixed_per_order'
  customerDeliveryFee: number; // e.g. 40 (₹ standard customer delivery fee)
  freeDeliveryThreshold: number; // e.g. 500 (₹ free delivery above this amount)
  servicePlatformFeePercent: number; // e.g. 10 (%) platform fee on Home Service bookings
  oldItemAdminMarginPercent: number; // e.g. 10 (%) admin margin on 2nd Hand / Old Items
  smartDeliveryUpi: string; // e.g. '9457695918@airtel'
  updatedAt?: number;
  updatedBy?: string;
}

export const DEFAULT_COMMISSION_SETTINGS: CommissionSettings = {
  vendorMarkupPercent: 25,
  adminCommissionPercent: 12.5,
  deliveryPartnerBasePay: 50,
  deliveryPartnerCommissionPercent: 12.5,
  deliveryPartnerPayType: 'fixed_per_order',
  customerDeliveryFee: 40,
  freeDeliveryThreshold: 500,
  servicePlatformFeePercent: 10,
  oldItemAdminMarginPercent: 10,
  smartDeliveryUpi: '9457695918@airtel',
  updatedAt: Date.now(),
  updatedBy: 'Admin'
};

