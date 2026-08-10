import { 
  db, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where 
} from '../firebase';
import { Product, Order, Vendor, DeliveryPartner, OrderStatus, ServiceProvider, ServiceBooking, CustomerUser } from '../types';

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const VENDORS_COL = 'vendors';
const DELIVERY_COL = 'deliveryPartners';
const SERVICES_COL = 'serviceProviders';
const SERVICE_BOOKINGS_COL = 'serviceBookings';
const CUSTOMERS_COL = 'customers';
const ADMIN_COL = 'adminSettings';

// Pricing and commission rates
export const MARKUP_RATE = 0.25; // +25% automatically added to vendor rate
export const ADMIN_COMMISSION_RATE = 0.125; // 12.5%
export const PARTNER_COMMISSION_RATE = 0.125; // 12.5%
export const SECURITY_QUESTION = 'आपका सुरक्षा शब्द (Security Word) क्या है?';
export const SMART_DELIVERY_UPI = '9457695918@airtel';

// Local storage fallbacks in case of offline / fallback
const LOCAL_STORAGE_PREFIX = 'smart_bazaar_';

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData(key: string, value: any) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage save error', e);
  }
}

// Default Initial Vendors (1 Primary Account)
export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: 'v1',
    shopName: 'Mahtab Cloth House',
    ownerName: 'Mahtab Ahmed',
    username: 'mahtab',
    password: '12345',
    phone: '9876500001',
    category: 'कपड़े (Clothing)',
    status: 'active',
    address: 'Main Bazaar, Chandpur',
    rating: 4.9,
    totalOrders: 184,
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80',
    securityQuestion: SECURITY_QUESTION,
    securityAnswer: 'kapda'
  }
];

// Default Initial Products with Cost Price (Vendor Rate) and Customer Price (+25%)
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'कॉटन कुर्ता (पुरुष)',
    hindiName: 'कॉटन कुर्ता (पुरुष)',
    costPrice: 399,
    price: 499, // 399 * 1.25 = ~499
    originalPrice: 699,
    category: 'कपड़े',
    vendorId: 'v1',
    vendorName: 'Mahtab Cloth House',
    stock: 20,
    unit: '1 Piece',
    deliveryMode: 'platform',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
    description: 'प्रीमियम 100% कॉटन कुर्ता, आरामदायक एवं टिकाऊ।',
    isPopular: true
  },
  {
    id: 'p2',
    name: 'महिला साड़ी - सिल्क',
    hindiName: 'महिला साड़ी - सिल्क',
    costPrice: 1039,
    price: 1299, // 1039 * 1.25 = ~1299
    originalPrice: 1799,
    category: 'कपड़े',
    vendorId: 'v1',
    vendorName: 'Mahtab Cloth House',
    stock: 10,
    unit: '1 Saree',
    deliveryMode: 'platform',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    description: 'आकर्षक बनारसी आर्ट सिल्क साड़ी, हैवी पल्लू वर्क।',
    isPopular: true
  }
];

export const SAMPLE_DELIVERY_PARTNERS: DeliveryPartner[] = [
  {
    id: 'dp1',
    name: 'Rakesh Kumar',
    phone: '9876543210',
    password: '12345',
    vehicle: 'बाइक',
    status: 'Online',
    currentLocation: 'Chandpur',
    earnings: 450,
    walletBalance: 250,
    completedDeliveries: 12,
    rating: 4.9,
    securityQuestion: SECURITY_QUESTION,
    securityAnswer: 'chandpur'
  }
];

// --- REALTIME LISTENERS & ACTIONS ---

export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        const hasSeeded = localStorage.getItem('smart_bazaar_has_seeded_products');
        if (!hasSeeded) {
          seedProducts();
        } else {
          setLocalData(PRODUCTS_COL, []);
          onUpdate([]);
        }
      } else {
        localStorage.setItem('smart_bazaar_has_seeded_products', 'true');
        const list: Product[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Product));
        setLocalData(PRODUCTS_COL, list);
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Firestore products subscribe warning, falling back to local storage:', err);
      onUpdate(getLocalData(PRODUCTS_COL, SAMPLE_PRODUCTS.map((p, i) => ({ ...p, id: 'p_' + i }))));
    });
  } catch (e) {
    onUpdate(getLocalData(PRODUCTS_COL, SAMPLE_PRODUCTS.map((p, i) => ({ ...p, id: 'p_' + i }))));
    return () => {};
  }
}

export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  try {
    const colRef = collection(db, ORDERS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: Order[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Order));
      // Sort newest first
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLocalData(ORDERS_COL, list);
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore orders subscribe error:', err);
      onUpdate(getLocalData(ORDERS_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(ORDERS_COL, []));
    return () => {};
  }
}

export function subscribeVendors(onUpdate: (vendors: Vendor[]) => void) {
  try {
    const colRef = collection(db, VENDORS_COL);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        seedVendors();
      } else {
        const list: Vendor[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Vendor));
        setLocalData(VENDORS_COL, list);
        onUpdate(list);
      }
    }, (err) => {
      onUpdate(getLocalData(VENDORS_COL, SAMPLE_VENDORS));
    });
  } catch (e) {
    onUpdate(getLocalData(VENDORS_COL, SAMPLE_VENDORS));
    return () => {};
  }
}

export function subscribeDeliveryPartners(onUpdate: (partners: DeliveryPartner[]) => void) {
  try {
    const colRef = collection(db, DELIVERY_COL);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        seedDeliveryPartners();
      } else {
        const list: DeliveryPartner[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as DeliveryPartner));
        setLocalData(DELIVERY_COL, list);
        onUpdate(list);
      }
    }, (err) => {
      onUpdate(getLocalData(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS));
    });
  } catch (e) {
    onUpdate(getLocalData(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS));
    return () => {};
  }
}

// Seed helper functions
export async function seedProducts() {
  try {
    for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
      const prod = SAMPLE_PRODUCTS[i];
      const prodId = prod.id || `prod_sample_${i + 1}`;
      await setDoc(doc(db, PRODUCTS_COL, prodId), {
        ...prod,
        id: prodId,
        createdAt: Date.now()
      });
    }
    localStorage.setItem('smart_bazaar_has_seeded_products', 'true');
  } catch (e) {
    console.error('Error seeding products:', e);
  }
}

export async function seedVendors() {
  try {
    for (const v of SAMPLE_VENDORS) {
      await setDoc(doc(db, VENDORS_COL, v.id), v);
    }
  } catch (e) {
    console.error('Error seeding vendors:', e);
  }
}

export async function seedDeliveryPartners() {
  try {
    for (const dp of SAMPLE_DELIVERY_PARTNERS) {
      await setDoc(doc(db, DELIVERY_COL, dp.id), dp);
    }
  } catch (e) {
    console.error('Error seeding delivery partners:', e);
  }
}

// Helper to strip undefined values so Firestore setDoc/addDoc never fails
function sanitizeForFirestore(data: any): any {
  if (data === undefined) return null;
  if (data === null) return null;
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore);
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: any = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean;
  }
  return data;
}

// Database Operations
export async function addProductDoc(product: Omit<Product, 'id'>) {
  const newId = 'prod_' + Date.now();
  const prodObj = {
    ...product,
    id: newId,
    createdAt: Date.now()
  };
  const cleanObj = sanitizeForFirestore(prodObj);

  try {
    await setDoc(doc(db, PRODUCTS_COL, newId), cleanObj);
    const current = getLocalData<Product[]>(PRODUCTS_COL, []);
    current.push(prodObj);
    setLocalData(PRODUCTS_COL, current);
    return newId;
  } catch (e) {
    console.error('Error adding product doc:', e);
    const current = getLocalData<Product[]>(PRODUCTS_COL, []);
    current.push(prodObj);
    setLocalData(PRODUCTS_COL, current);
    return newId;
  }
}

export async function updateProductDoc(id: string, updates: Partial<Product>) {
  const cleanUpdates = sanitizeForFirestore(updates);
  try {
    await updateDoc(doc(db, PRODUCTS_COL, id), cleanUpdates);
  } catch (e) {
    console.error('Error updating product doc:', e);
    const current = getLocalData<Product[]>(PRODUCTS_COL, []);
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(PRODUCTS_COL, current);
    }
  }
}

export async function deleteProductDoc(id: string) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, id));
  } catch (e) {
    console.error('Error deleting product doc by id:', e);
  }

  try {
    const q = query(collection(db, PRODUCTS_COL), where('id', '==', id));
    const snap = await getDocs(q);
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
    }
  } catch (e) {
    console.error('Error deleting product doc query:', e);
  }

  // Always update local data backup
  const current = getLocalData<Product[]>(PRODUCTS_COL, []);
  const filtered = current.filter(p => p.id !== id);
  setLocalData(PRODUCTS_COL, filtered);
}

export async function createOrderDoc(orderData: Omit<Order, 'id'>): Promise<string> {
  const customId = 'SB' + Math.floor(100000 + Math.random() * 900000);
  const otp = orderData.otp || Math.floor(1000 + Math.random() * 9000).toString();
  
  const orderDoc: Order = {
    ...orderData,
    id: customId,
    otp,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const cleanDoc = sanitizeForFirestore(orderDoc);

  try {
    await setDoc(doc(db, ORDERS_COL, customId), cleanDoc);
    const current = getLocalData<Order[]>(ORDERS_COL, []);
    const filtered = current.filter(o => o.id !== customId);
    filtered.unshift(orderDoc);
    setLocalData(ORDERS_COL, filtered);
    return customId;
  } catch (e) {
    console.error('Error creating order doc:', e);
    const current = getLocalData<Order[]>(ORDERS_COL, []);
    current.unshift(orderDoc);
    setLocalData(ORDERS_COL, current);
    return customId;
  }
}

export async function updateOrderStatusDoc(
  orderId: string, 
  status: OrderStatus, 
  extraData: Partial<Order> = {}
) {
  const cleanUpdates = sanitizeForFirestore({
    status,
    updatedAt: Date.now(),
    ...extraData
  });

  try {
    await updateDoc(doc(db, ORDERS_COL, orderId), cleanUpdates);
  } catch (e) {
    console.error('Error updating order doc:', e);
    const current = getLocalData<Order[]>(ORDERS_COL, []);
    const idx = current.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], status, updatedAt: Date.now(), ...extraData };
      setLocalData(ORDERS_COL, current);
    }
  }
}

export async function updateVendorDoc(vendorId: string, updates: Partial<Vendor>) {
  try {
    const cleanUpdates = sanitizeForFirestore(updates);
    await updateDoc(doc(db, VENDORS_COL, vendorId), cleanUpdates);
  } catch (e) {
    console.error('Error updating vendor doc:', e);
    const current = getLocalData<Vendor[]>(VENDORS_COL, SAMPLE_VENDORS);
    const idx = current.findIndex(v => v.id === vendorId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(VENDORS_COL, current);
    }
  }
}

export async function updateDeliveryPartnerDoc(partnerId: string, updates: Partial<DeliveryPartner>) {
  try {
    const cleanUpdates = sanitizeForFirestore(updates);
    await updateDoc(doc(db, DELIVERY_COL, partnerId), cleanUpdates);
  } catch (e) {
    console.error('Error updating delivery partner doc:', e);
    const current = getLocalData<DeliveryPartner[]>(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS);
    const idx = current.findIndex(p => p.id === partnerId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(DELIVERY_COL, current);
    }
  }
}

export async function updateServiceProviderDoc(serviceId: string, updates: Partial<ServiceProvider>) {
  try {
    const cleanUpdates = sanitizeForFirestore(updates);
    await updateDoc(doc(db, SERVICES_COL, serviceId), cleanUpdates);
  } catch (e) {
    console.error('Error updating service provider doc:', e);
    const current = getLocalData<ServiceProvider[]>(SERVICES_COL, SAMPLE_SERVICES);
    const idx = current.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(SERVICES_COL, current);
    }
  }
}

export async function addVendorDoc(vendor: Omit<Vendor, 'id'>) {
  const newId = 'v_' + Date.now();
  const vObj: Vendor = { ...vendor, id: newId };
  const cleanObj = sanitizeForFirestore(vObj);

  try {
    await setDoc(doc(db, VENDORS_COL, newId), cleanObj);
  } catch (e) {
    console.error('Error adding vendor doc:', e);
    const current = getLocalData<Vendor[]>(VENDORS_COL, SAMPLE_VENDORS);
    current.push(vObj);
    setLocalData(VENDORS_COL, current);
  }
  return newId;
}

export async function deleteVendorDoc(vendorId: string) {
  try {
    await deleteDoc(doc(db, VENDORS_COL, vendorId));
  } catch (e) {
    console.error('Error deleting vendor doc:', e);
    const current = getLocalData<Vendor[]>(VENDORS_COL, SAMPLE_VENDORS);
    setLocalData(VENDORS_COL, current.filter(v => v.id !== vendorId));
  }
}

export async function addDeliveryPartnerDoc(partner: Omit<DeliveryPartner, 'id'>) {
  const newId = 'dp_' + Date.now();
  const pObj: DeliveryPartner = { ...partner, id: newId };
  const cleanObj = sanitizeForFirestore(pObj);

  try {
    await setDoc(doc(db, DELIVERY_COL, newId), cleanObj);
  } catch (e) {
    console.error('Error adding delivery partner doc:', e);
    const current = getLocalData<DeliveryPartner[]>(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS);
    current.push(pObj);
    setLocalData(DELIVERY_COL, current);
  }
  return newId;
}

export async function deleteDeliveryPartnerDoc(partnerId: string) {
  try {
    await deleteDoc(doc(db, DELIVERY_COL, partnerId));
  } catch (e) {
    console.error('Error deleting delivery partner doc:', e);
    const current = getLocalData<DeliveryPartner[]>(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS);
    setLocalData(DELIVERY_COL, current.filter(p => p.id !== partnerId));
  }
}

export async function updateVendorPasswordDoc(vendorId: string, newPass: string) {
  try {
    await updateDoc(doc(db, VENDORS_COL, vendorId), { password: newPass });
  } catch (e) {
    console.error('Error updating vendor password:', e);
    const current = getLocalData<Vendor[]>(VENDORS_COL, SAMPLE_VENDORS);
    const v = current.find(x => x.id === vendorId);
    if (v) { v.password = newPass; setLocalData(VENDORS_COL, current); }
  }
}

export async function updatePartnerPasswordDoc(partnerId: string, newPass: string) {
  try {
    await updateDoc(doc(db, DELIVERY_COL, partnerId), { password: newPass });
  } catch (e) {
    console.error('Error updating partner password:', e);
    const current = getLocalData<DeliveryPartner[]>(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS);
    const p = current.find(x => x.id === partnerId);
    if (p) { p.password = newPass; setLocalData(DELIVERY_COL, current); }
  }
}

export async function updateDeliveryPartnerStatus(partnerId: string, status: 'Online' | 'Offline' | 'Busy') {
  try {
    await updateDoc(doc(db, DELIVERY_COL, partnerId), { status });
  } catch (e) {
    console.error('Error updating partner status:', e);
    const current = getLocalData<DeliveryPartner[]>(DELIVERY_COL, SAMPLE_DELIVERY_PARTNERS);
    const p = current.find(x => x.id === partnerId);
    if (p) { p.status = status; setLocalData(DELIVERY_COL, current); }
  }
}

// Default Initial Service Providers
export const SAMPLE_SERVICES: ServiceProvider[] = [
  {
    id: 's1',
    providerName: 'राजेश वर्मा',
    serviceName: 'नल एवं प्लंबिंग फिटिंग',
    category: 'प्लंबर',
    description: 'बाथरूम, किचन नल, वाटर टैंक, पाइप लीकेज एवं सैनिटरी रिपेयर। तुरंत होम सर्विस।',
    primaryPhone: '9876543210',
    whatsappPhone: '9876543210',
    address: 'चांदपुर / बिजनौर रोड',
    rating: 4.9,
    experienceYears: 7,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    createdAt: Date.now()
  }
];

// --- SERVICES REALTIME LISTENERS & CRUD ---

export function subscribeServices(onUpdate: (services: ServiceProvider[]) => void) {
  try {
    const colRef = collection(db, SERVICES_COL);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        seedServices();
      } else {
        const list: ServiceProvider[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as ServiceProvider));
        setLocalData(SERVICES_COL, list);
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Firestore services subscribe error, using fallback:', err);
      onUpdate(getLocalData(SERVICES_COL, SAMPLE_SERVICES));
    });
  } catch (e) {
    onUpdate(getLocalData(SERVICES_COL, SAMPLE_SERVICES));
    return () => {};
  }
}

export function subscribeServiceBookings(onUpdate: (bookings: ServiceBooking[]) => void) {
  try {
    const colRef = collection(db, SERVICE_BOOKINGS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: ServiceBooking[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ServiceBooking));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLocalData(SERVICE_BOOKINGS_COL, list);
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore service bookings subscribe error:', err);
      onUpdate(getLocalData(SERVICE_BOOKINGS_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(SERVICE_BOOKINGS_COL, []));
    return () => {};
  }
}

export async function seedServices() {
  try {
    for (const s of SAMPLE_SERVICES) {
      await setDoc(doc(db, SERVICES_COL, s.id), s);
    }
  } catch (e) {
    console.error('Error seeding services:', e);
  }
}

export async function addServiceProviderDoc(service: Omit<ServiceProvider, 'id'>) {
  const newId = 'srv_' + Date.now();
  const sObj: ServiceProvider = {
    ...service,
    id: newId,
    createdAt: Date.now()
  };
  const cleanObj = sanitizeForFirestore(sObj);

  try {
    await setDoc(doc(db, SERVICES_COL, newId), cleanObj);
    const current = getLocalData<ServiceProvider[]>(SERVICES_COL, SAMPLE_SERVICES);
    current.push(sObj);
    setLocalData(SERVICES_COL, current);
    return newId;
  } catch (e) {
    console.error('Error adding service provider doc:', e);
    const current = getLocalData<ServiceProvider[]>(SERVICES_COL, SAMPLE_SERVICES);
    current.push(sObj);
    setLocalData(SERVICES_COL, current);
    return newId;
  }
}

export async function deleteServiceProviderDoc(serviceId: string) {
  try {
    await deleteDoc(doc(db, SERVICES_COL, serviceId));
  } catch (e) {
    console.error('Error deleting service provider doc:', e);
    const current = getLocalData<ServiceProvider[]>(SERVICES_COL, SAMPLE_SERVICES);
    setLocalData(SERVICES_COL, current.filter(s => s.id !== serviceId));
  }
}

export async function createServiceBookingDoc(bookingData: Omit<ServiceBooking, 'id'>): Promise<string> {
  const newId = 'SBK' + Math.floor(100000 + Math.random() * 900000);
  const bookingDoc: ServiceBooking = {
    ...bookingData,
    id: newId,
    createdAt: Date.now()
  };
  const cleanDoc = sanitizeForFirestore(bookingDoc);

  try {
    await setDoc(doc(db, SERVICE_BOOKINGS_COL, newId), cleanDoc);
    const current = getLocalData<ServiceBooking[]>(SERVICE_BOOKINGS_COL, []);
    current.unshift(bookingDoc);
    setLocalData(SERVICE_BOOKINGS_COL, current);
    return newId;
  } catch (e) {
    console.error('Error creating service booking doc:', e);
    const current = getLocalData<ServiceBooking[]>(SERVICE_BOOKINGS_COL, []);
    current.unshift(bookingDoc);
    setLocalData(SERVICE_BOOKINGS_COL, current);
    return newId;
  }
}

export async function updateServiceBookingStatus(bookingId: string, status: 'Booked / Contacted' | 'Completed' | 'Cancelled') {
  try {
    await updateDoc(doc(db, SERVICE_BOOKINGS_COL, bookingId), { status });
  } catch (e) {
    console.error('Error updating service booking status:', e);
    const current = getLocalData<ServiceBooking[]>(SERVICE_BOOKINGS_COL, []);
    const idx = current.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      current[idx].status = status;
      setLocalData(SERVICE_BOOKINGS_COL, current);
    }
  }
}

export async function updateServiceBookingBill(
  bookingId: string, 
  materialCost: number, 
  visitFee: number = 100
) {
  const subtotal = visitFee + materialCost;
  const platformFee = Math.round(subtotal * 0.10); // 10%
  const finalBillAmount = subtotal + platformFee;
  const updates: Partial<ServiceBooking> = {
    visitFee,
    materialCost,
    subtotal,
    platformFee,
    finalBillAmount,
    billGeneratedAt: Date.now(),
    status: 'Completed'
  };

  try {
    await updateDoc(doc(db, SERVICE_BOOKINGS_COL, bookingId), updates);
  } catch (e) {
    console.error('Error updating service booking bill:', e);
    const current = getLocalData<ServiceBooking[]>(SERVICE_BOOKINGS_COL, []);
    const idx = current.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(SERVICE_BOOKINGS_COL, current);
    }
  }
}

// --- CUSTOMER ACCOUNT MANAGEMENT ---

export async function saveCustomerAccountDoc(customer: CustomerUser): Promise<void> {
  const cleanPhone = customer.phone.replace(/\D/g, '');
  const docId = 'cust_' + cleanPhone;
  const cleanObj = sanitizeForFirestore({
    ...customer,
    id: docId,
    phone: cleanPhone,
    updatedAt: Date.now()
  });

  try {
    await setDoc(doc(db, CUSTOMERS_COL, docId), cleanObj);
  } catch (e) {
    console.error('Error saving customer account in Firestore:', e);
  }

  // Backup in local storage
  const allCustomers = getLocalData<Record<string, CustomerUser>>('customers_map', {});
  allCustomers[cleanPhone] = { ...customer, id: docId, phone: cleanPhone };
  setLocalData('customers_map', allCustomers);
}

export async function getCustomerAccountByPhoneDoc(phone: string): Promise<CustomerUser | null> {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return null;
  const docId = 'cust_' + cleanPhone;

  try {
    const snap = await getDocs(query(collection(db, CUSTOMERS_COL), where('phone', '==', cleanPhone)));
    if (!snap.empty) {
      const data = snap.docs[0].data() as CustomerUser;
      return { ...data, id: docId };
    }
  } catch (e) {
    console.warn('Error fetching customer account from Firestore:', e);
  }

  // Fallback to local storage
  const allCustomers = getLocalData<Record<string, CustomerUser>>('customers_map', {});
  return allCustomers[cleanPhone] || null;
}




