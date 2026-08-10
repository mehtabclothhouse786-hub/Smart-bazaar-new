export type UserRole = 'customer' | 'vendor' | 'delivery' | 'service' | 'admin';

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  address?: string;
  isLoggedIn: boolean;
  createdAt?: number;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
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
  rating?: number; // स्टार रेटिंग
  experienceYears?: number; // अनुभव (साल)
  imageUrl?: string;
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
  notes?: string;
  status: 'Booked / Contacted' | 'Completed' | 'Cancelled';
  createdAt: number;
  visitFee?: number; // Per call fee (Fixed ₹100)
  materialCost?: number; // सामान/पार्ट्स खर्च (Fill by Provider)
  subtotal?: number; // visitFee + materialCost
  platformFee?: number; // 10% platform charge
  finalBillAmount?: number; // Total customer bill
  billGeneratedAt?: number;
}

