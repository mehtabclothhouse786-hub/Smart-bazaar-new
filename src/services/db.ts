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
import { Product, Order, Vendor, DeliveryPartner, OrderStatus, ServiceProvider, ServiceBooking, CustomerUser, OldItem, CommissionSettings, DEFAULT_COMMISSION_SETTINGS } from '../types';

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const VENDORS_COL = 'vendors';
const DELIVERY_COL = 'deliveryPartners';
const SERVICES_COL = 'serviceProviders';
const SERVICE_BOOKINGS_COL = 'serviceBookings';
const CUSTOMERS_COL = 'customers';
const OLD_ITEMS_COL = 'oldItems';
const ADMIN_COL = 'adminSettings';
const PRICING_CONFIG_DOC = 'pricingConfig';

// Default / fallback pricing and commission rates
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

// Default Initial Vendors - Purged (No dummy accounts)
export const SAMPLE_VENDORS: Vendor[] = [];

// Default Initial Products - Purged (No dummy products)
export const SAMPLE_PRODUCTS: Product[] = [];

// Default Initial Delivery Partner - Purged (No dummy accounts)
export const SAMPLE_DELIVERY_PARTNERS: DeliveryPartner[] = [];

// Default Initial Customer Users - Purged (No dummy accounts)
export const SAMPLE_CUSTOMERS: CustomerUser[] = [];

// Default Initial Admin Accounts - Purged (No dummy accounts)
export const SAMPLE_ADMINS: Array<{ roleName: string; username: string; phone: string; password?: string; desc: string }> = [];

// Default Initial Old Items - Purged (No dummy items)
export const SAMPLE_OLD_ITEMS: OldItem[] = [];

// --- REALTIME LISTENERS & ACTIONS ---

export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: Product[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Product));
      setLocalData(PRODUCTS_COL, list);
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore products subscribe warning, falling back to local storage:', err);
      onUpdate(getLocalData(PRODUCTS_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(PRODUCTS_COL, []));
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
      const list: Vendor[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Vendor));
      setLocalData(VENDORS_COL, list);
      onUpdate(list);
    }, (err) => {
      onUpdate(getLocalData(VENDORS_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(VENDORS_COL, []));
    return () => {};
  }
}

export function subscribeDeliveryPartners(onUpdate: (partners: DeliveryPartner[]) => void) {
  try {
    const colRef = collection(db, DELIVERY_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: DeliveryPartner[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as DeliveryPartner));
      setLocalData(DELIVERY_COL, list);
      onUpdate(list);
    }, (err) => {
      onUpdate(getLocalData(DELIVERY_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(DELIVERY_COL, []));
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

// Default Initial Service Providers - Purged (No dummy accounts)
export const SAMPLE_SERVICES: ServiceProvider[] = [];

// --- SERVICES REALTIME LISTENERS & CRUD ---

export function subscribeServices(onUpdate: (services: ServiceProvider[]) => void) {
  try {
    const colRef = collection(db, SERVICES_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: ServiceProvider[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ServiceProvider));
      setLocalData(SERVICES_COL, list);
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore services subscribe error, using fallback:', err);
      onUpdate(getLocalData(SERVICES_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(SERVICES_COL, []));
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
  visitFee: number = 100,
  settings?: CommissionSettings
) {
  const subtotal = visitFee + materialCost;
  const marginPercent = settings?.servicePlatformFeePercent ?? 10;
  const platformFee = Math.round(subtotal * (marginPercent / 100));
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

export async function seedCustomers() {
  try {
    for (const c of SAMPLE_CUSTOMERS) {
      await saveCustomerAccountDoc(c);
    }
  } catch (e) {
    console.error('Error seeding customers:', e);
  }
}

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
  if (allCustomers[cleanPhone]) {
    return allCustomers[cleanPhone];
  }

  return null;
}

// --- OLD ITEMS (USED GOODS / SECOND HAND BAZAAR) ---

export function subscribeOldItems(onUpdate: (items: OldItem[]) => void) {
  try {
    const colRef = collection(db, OLD_ITEMS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const list: OldItem[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as OldItem));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLocalData(OLD_ITEMS_COL, list);
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore oldItems subscribe error, using fallback:', err);
      onUpdate(getLocalData(OLD_ITEMS_COL, []));
    });
  } catch (e) {
    onUpdate(getLocalData(OLD_ITEMS_COL, []));
    return () => {};
  }
}

export async function seedOldItems() {
  // Purged: No dummy old items seeded
}

export async function addOldItemDoc(item: Omit<OldItem, 'id'>): Promise<string> {
  const newId = 'old_' + Date.now();
  const obj: OldItem = {
    ...item,
    id: newId,
    status: item.status || 'available',
    createdAt: Date.now()
  };
  const cleanObj = sanitizeForFirestore(obj);

  try {
    await setDoc(doc(db, OLD_ITEMS_COL, newId), cleanObj);
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    current.unshift(obj);
    setLocalData(OLD_ITEMS_COL, current);
    return newId;
  } catch (e) {
    console.error('Error adding old item doc:', e);
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    current.unshift(obj);
    setLocalData(OLD_ITEMS_COL, current);
    return newId;
  }
}

export async function updateOldItemDoc(id: string, updates: Partial<OldItem>): Promise<void> {
  const cleanUpdates = sanitizeForFirestore(updates);
  try {
    await updateDoc(doc(db, OLD_ITEMS_COL, id), cleanUpdates);
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    const idx = current.findIndex(it => it.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(OLD_ITEMS_COL, current);
    }
  } catch (e) {
    console.error('Error updating old item doc:', e);
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    const idx = current.findIndex(it => it.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(OLD_ITEMS_COL, current);
    }
  }
}

export async function deleteOldItemDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, OLD_ITEMS_COL, id));
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    setLocalData(OLD_ITEMS_COL, current.filter(it => it.id !== id));
  } catch (e) {
    console.error('Error deleting old item doc:', e);
    const current = getLocalData<OldItem[]>(OLD_ITEMS_COL, []);
    setLocalData(OLD_ITEMS_COL, current.filter(it => it.id !== id));
  }
}

// Master Purge Function to wipe dummy accounts and dummy documents from Firestore and LocalStorage
export async function purgeAllDummyAccountsFromDb(): Promise<void> {
  try {
    // 1. Purge known dummy delivery partners
    const dummyDeliveryIds = ['dp1', 'dp_sample_1'];
    for (const dpId of dummyDeliveryIds) {
      try { await deleteDoc(doc(db, DELIVERY_COL, dpId)); } catch {}
    }

    // 2. Purge known dummy customers
    const dummyCustIds = ['cust_9876510001', 'cust_9876543210'];
    for (const cId of dummyCustIds) {
      try { await deleteDoc(doc(db, CUSTOMERS_COL, cId)); } catch {}
    }

    // 3. Purge dummy products
    const dummyProductIds = ['p1', 'p2', 'prod_sample_1', 'prod_sample_2', 'prod_sample_3'];
    for (const pId of dummyProductIds) {
      try { await deleteDoc(doc(db, PRODUCTS_COL, pId)); } catch {}
    }

    // 4. Purge dummy services
    const dummyServiceIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
    for (const sId of dummyServiceIds) {
      try { await deleteDoc(doc(db, SERVICES_COL, sId)); } catch {}
    }

    // 5. Purge dummy old items
    const dummyOldItemIds = ['old_1', 'old_2', 'old_3', 'old_4', 'old_5'];
    for (const oId of dummyOldItemIds) {
      try { await deleteDoc(doc(db, OLD_ITEMS_COL, oId)); } catch {}
    }

    // 6. Reset LocalStorage keys to clean empty states
    setLocalData(PRODUCTS_COL, []);
    setLocalData(VENDORS_COL, []);
    setLocalData(DELIVERY_COL, []);
    setLocalData(SERVICES_COL, []);
    setLocalData(OLD_ITEMS_COL, []);
    setLocalData('customers_map', {});
    localStorage.removeItem('smart_bazaar_has_seeded_products');
    localStorage.removeItem('smart_bazaar_has_seeded_old_items');
    localStorage.setItem('smart_bazaar_purged_all_dummy_v1', 'true');
  } catch (e) {
    console.error('Error purging dummy accounts from db:', e);
  }
}

// Auto-run purge on startup if not already run
if (typeof window !== 'undefined' && !localStorage.getItem('smart_bazaar_purged_all_dummy_v1')) {
  purgeAllDummyAccountsFromDb().catch(() => {});
}

// Master Factory Reset & Restore Function
export async function restoreAllDefaults(): Promise<void> {
  try {
    // 1. Reset LocalStorage keys
    setLocalData(PRODUCTS_COL, []);
    setLocalData(VENDORS_COL, []);
    setLocalData(DELIVERY_COL, []);
    setLocalData(SERVICES_COL, []);
    setLocalData(OLD_ITEMS_COL, []);
    setLocalData(ORDERS_COL, []);
    setLocalData(SERVICE_BOOKINGS_COL, []);
    setLocalData('customers_map', {});
    setLocalData(ADMIN_COL, DEFAULT_COMMISSION_SETTINGS);

    // 2. Clear dummy documents
    await purgeAllDummyAccountsFromDb();
    await updateCommissionSettingsDoc(DEFAULT_COMMISSION_SETTINGS);
  } catch (e) {
    console.error('Error restoring all defaults:', e);
  }
}

// ----------------------------------------------------
// DYNAMIC ADMIN MARGIN & COMMISSION CONTROL FUNCTIONS
// ----------------------------------------------------

/**
 * Subscribe to Admin Margin & Commission Settings in real-time.
 * Automatically synchronizes with Firestore doc 'adminSettings/pricingConfig'
 * with local fallback support.
 */
export function subscribeCommissionSettings(onUpdate: (settings: CommissionSettings) => void): () => void {
  try {
    const configDocRef = doc(db, ADMIN_COL, PRICING_CONFIG_DOC);
    return onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CommissionSettings;
        const merged: CommissionSettings = {
          ...DEFAULT_COMMISSION_SETTINGS,
          ...data,
          vendorMarkupPercent: Number(data.vendorMarkupPercent ?? DEFAULT_COMMISSION_SETTINGS.vendorMarkupPercent),
          adminCommissionPercent: Number(data.adminCommissionPercent ?? DEFAULT_COMMISSION_SETTINGS.adminCommissionPercent),
          deliveryPartnerBasePay: Number(data.deliveryPartnerBasePay ?? DEFAULT_COMMISSION_SETTINGS.deliveryPartnerBasePay),
          deliveryPartnerCommissionPercent: Number(data.deliveryPartnerCommissionPercent ?? DEFAULT_COMMISSION_SETTINGS.deliveryPartnerCommissionPercent),
          deliveryPartnerPayType: data.deliveryPartnerPayType || DEFAULT_COMMISSION_SETTINGS.deliveryPartnerPayType,
          customerDeliveryFee: Number(data.customerDeliveryFee ?? DEFAULT_COMMISSION_SETTINGS.customerDeliveryFee),
          freeDeliveryThreshold: Number(data.freeDeliveryThreshold ?? DEFAULT_COMMISSION_SETTINGS.freeDeliveryThreshold),
          servicePlatformFeePercent: Number(data.servicePlatformFeePercent ?? DEFAULT_COMMISSION_SETTINGS.servicePlatformFeePercent),
          oldItemAdminMarginPercent: Number(data.oldItemAdminMarginPercent ?? DEFAULT_COMMISSION_SETTINGS.oldItemAdminMarginPercent),
          smartDeliveryUpi: data.smartDeliveryUpi || DEFAULT_COMMISSION_SETTINGS.smartDeliveryUpi,
          updatedAt: data.updatedAt || Date.now()
        };
        setLocalData(ADMIN_COL, merged);
        onUpdate(merged);
      } else {
        // Doc doesn't exist yet, seed default
        const local = getLocalData<CommissionSettings>(ADMIN_COL, DEFAULT_COMMISSION_SETTINGS);
        setDoc(configDocRef, sanitizeForFirestore({ ...local, updatedAt: Date.now() })).catch(() => {});
        onUpdate(local);
      }
    }, (err) => {
      console.warn('Firestore pricingConfig subscribe error, using fallback:', err);
      onUpdate(getLocalData<CommissionSettings>(ADMIN_COL, DEFAULT_COMMISSION_SETTINGS));
    });
  } catch (e) {
    onUpdate(getLocalData<CommissionSettings>(ADMIN_COL, DEFAULT_COMMISSION_SETTINGS));
    return () => {};
  }
}

/**
 * Update Admin Margin & Commission Control settings in Firestore & Local storage.
 */
export async function updateCommissionSettingsDoc(updates: Partial<CommissionSettings>): Promise<void> {
  const current = getLocalData<CommissionSettings>(ADMIN_COL, DEFAULT_COMMISSION_SETTINGS);
  const merged: CommissionSettings = {
    ...current,
    ...updates,
    updatedAt: Date.now()
  };
  const cleanDoc = sanitizeForFirestore(merged);

  try {
    const configDocRef = doc(db, ADMIN_COL, PRICING_CONFIG_DOC);
    await setDoc(configDocRef, cleanDoc, { merge: true });
    setLocalData(ADMIN_COL, merged);
  } catch (e) {
    console.error('Error updating pricing config doc:', e);
    setLocalData(ADMIN_COL, merged);
  }
}

/**
 * Reset commission settings back to default.
 */
export async function resetCommissionSettingsDoc(): Promise<void> {
  await updateCommissionSettingsDoc(DEFAULT_COMMISSION_SETTINGS);
}

// ----------------------------------------------------
// CALCULATION HELPERS BASED ON ACTIVE SETTINGS
// ----------------------------------------------------

/**
 * Calculate Customer Retail Price from Vendor Cost Price using dynamic markup %
 */
export function calculateCustomerPrice(costPrice: number, settings?: CommissionSettings): number {
  const markup = (settings?.vendorMarkupPercent ?? 25) / 100;
  return Math.round(costPrice * (1 + markup));
}

/**
 * Calculate Vendor Cost Price from Customer Retail Price
 */
export function calculateVendorCostPrice(retailPrice: number, settings?: CommissionSettings): number {
  const markup = (settings?.vendorMarkupPercent ?? 25) / 100;
  return Math.round(retailPrice / (1 + markup));
}

/**
 * Calculate Admin Commission amount from Order Total GMV
 */
export function calculateAdminCommissionAmount(orderTotal: number, settings?: CommissionSettings): number {
  const rate = (settings?.adminCommissionPercent ?? 12.5) / 100;
  return Math.round(orderTotal * rate);
}

/**
 * Calculate Delivery Partner Commission / Payout for an Order
 */
export function calculateDeliveryPartnerPayout(orderTotal: number, settings?: CommissionSettings): number {
  if (settings?.deliveryPartnerPayType === 'percent_of_order') {
    const rate = (settings?.deliveryPartnerCommissionPercent ?? 12.5) / 100;
    return Math.round(orderTotal * rate);
  }
  return settings?.deliveryPartnerBasePay ?? 50;
}

export const calculateDeliveryPartnerPayoutAmount = calculateDeliveryPartnerPayout;

/**
 * Calculate Customer Delivery Fee based on Subtotal & Free Delivery Threshold
 */
export function calculateCustomerDeliveryCharge(subtotal: number, settings?: CommissionSettings): number {
  const threshold = settings?.freeDeliveryThreshold ?? 500;
  const fee = settings?.customerDeliveryFee ?? 40;
  return subtotal >= threshold ? 0 : fee;
}

/**
 * Calculate Home Service bill amounts with dynamic platform fee
 */
export function calculateServiceBill(visitFee: number, materialCost: number, settings?: CommissionSettings) {
  const subtotal = visitFee + materialCost;
  const feePercent = (settings?.servicePlatformFeePercent ?? 10) / 100;
  const platformFee = Math.round(subtotal * feePercent);
  const finalBillAmount = subtotal + platformFee;
  return {
    subtotal,
    platformFee,
    finalBillAmount,
    platformFeePercent: settings?.servicePlatformFeePercent ?? 10
  };
}

/**
 * Calculate Old Items listing price with dynamic admin margin
 */
export function calculateOldItemPricing(sellerPrice: number, settings?: CommissionSettings) {
  const marginPercent = (settings?.oldItemAdminMarginPercent ?? 10) / 100;
  const adminMargin = Math.round(sellerPrice * marginPercent);
  const finalCustomerPrice = sellerPrice + adminMargin;
  return {
    sellerPrice,
    adminMargin,
    finalCustomerPrice,
    marginPercent: settings?.oldItemAdminMarginPercent ?? 10
  };
}
