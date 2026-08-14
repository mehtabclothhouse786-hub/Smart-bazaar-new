import { LucideIcon } from 'lucide-react';

export interface CategoryInfo {
  id: string;
  name: string;
  hindiName: string;
  imageUrl: string;
  photos: string[];
  gradient: string;
  iconBg: string;
  keywords: string[];
}

export const ALL_SHOP_CATEGORIES: CategoryInfo[] = [
  {
    id: 'clothing',
    name: 'Cloth House & Fashion',
    hindiName: 'कपड़े व परिधान',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-amber-600 to-rose-700',
    iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
    keywords: ['cloth', 'clothing', 'कपड़े', 'साड़ी', 'कुर्ता', 'सूट', 'fashion', 'garments', 'textile', 'boutique', 'kamal', 'mahtab']
  },
  {
    id: 'hardware',
    name: 'Hardware & Sanitary',
    hindiName: 'हार्डवेयर व सेनेटरी',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-blue-600 to-cyan-800',
    iconBg: 'bg-blue-50 text-blue-800 border-blue-200',
    keywords: ['hardware', 'sanitary', 'हार्डवेयर', 'सैनिटरी', 'नल', 'पाइप', 'टूल्स', 'tools']
  },
  {
    id: 'grocery',
    name: 'Grocery & Kirana',
    hindiName: 'किराना व राशन',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-emerald-600 to-teal-800',
    iconBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    keywords: ['grocery', 'groceries', 'kirana', 'किराना', 'राशन', 'अनाज', 'तेल', 'मसाले', 'spices', 'supermarket']
  },
  {
    id: 'vegetables',
    name: 'Vegetables & Fruits',
    hindiName: 'सब्ज़ियां व ताज़ा फल',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-green-600 to-emerald-800',
    iconBg: 'bg-green-50 text-green-800 border-green-200',
    keywords: ['vegetables', 'fruits', 'सब्जी', 'सब्जियां', 'फल', 'ताजा', 'sabzi', 'mandi']
  },
  {
    id: 'electronics',
    name: 'Electronics & Mobile',
    hindiName: 'इलेक्ट्रॉनिक्स व मोबाइल',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-indigo-600 to-blue-800',
    iconBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    keywords: ['electronics', 'mobile', 'phone', 'इलेक्ट्रॉनिक्स', 'मोबाइल', 'टीवी', 'फ्रिज', 'tech', 'gadgets']
  },
  {
    id: 'footwear',
    name: 'Footwear & Shoes',
    hindiName: 'जूते व चप्पल',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-orange-600 to-amber-800',
    iconBg: 'bg-orange-50 text-orange-800 border-orange-200',
    keywords: ['footwear', 'shoes', 'जूते', 'चप्पल', 'सैंडल', 'sneakers', 'boots']
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics & Beauty',
    hindiName: 'कॉस्मेटिक्स व श्रृंगार',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-pink-600 to-rose-800',
    iconBg: 'bg-pink-50 text-pink-800 border-pink-200',
    keywords: ['cosmetics', 'beauty', 'makeup', 'कॉस्मेटिक्स', 'श्रृंगार', 'पार्लर', 'क्रीम', 'perfume']
  },
  {
    id: 'sweets',
    name: 'Sweets & Bakery',
    hindiName: 'मिठाई व बेकरी',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-amber-500 to-yellow-700',
    iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
    keywords: ['sweets', 'bakery', 'मिठाई', 'बेकरी', 'केक', 'समोसा', 'पेस्ट्री', 'mithai']
  },
  {
    id: 'stationery',
    name: 'Stationery & Books',
    hindiName: 'स्टेशनरी व बुक्स',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-violet-600 to-purple-800',
    iconBg: 'bg-violet-50 text-violet-800 border-violet-200',
    keywords: ['stationery', 'books', 'स्टेशनरी', 'किताबें', 'कापी', 'पेन', 'स्कूल', 'bookstore']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Medical',
    hindiName: 'दवाइयां व मेडिकल',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-red-600 to-rose-700',
    iconBg: 'bg-red-50 text-red-800 border-red-200',
    keywords: ['pharmacy', 'medical', 'medicine', 'दवा', 'दवाइयां', 'केमिस्ट', 'healthcare']
  },
  {
    id: 'general',
    name: 'General Store',
    hindiName: 'जनरल स्टोर',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'
    ],
    gradient: 'from-stone-600 to-stone-800',
    iconBg: 'bg-stone-50 text-stone-800 border-stone-200',
    keywords: ['general', 'जनरल स्टोर', 'दुकान', 'store', 'all']
  }
];

// Curated shop photo options for vendors & admin
export const CURATED_SHOP_PHOTOS = [
  { name: 'कपड़ा शोरूम / बुटीक (Mahtab)', category: 'कपड़े', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80' },
  { name: 'पारंपरिक वस्त्र व साड़ियां (Kamal)', category: 'कपड़े', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' },
  { name: 'डिजाइनर वियर स्टोर', category: 'कपड़े', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80' },
  { name: 'हार्डवेयर व टूल्स स्टोर', category: 'हार्डवेयर', url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80' },
  { name: 'सैनिटरी व नल फिटिंग', category: 'हार्डवेयर', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' },
  { name: 'किराना व राशन सुपरमार्केट', category: 'किराना', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
  { name: 'मसाले व ड्राई फ्रूट्स', category: 'किराना', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
  { name: 'ताजी हरी सब्जियां व फल', category: 'सब्जियां', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80' },
  { name: 'इलेक्ट्रॉनिक्स व मोबाइल गैजेट्स', category: 'इलेक्ट्रॉनिक्स', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80' },
  { name: 'जूते-चप्पल व फुटवियर', category: 'जूते', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80' },
  { name: 'ब्यूटी कॉस्मेटिक्स व परफ्यूम', category: 'कॉस्मेटिक्स', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80' },
  { name: 'मिठाई, केक व बेकरी', category: 'मिठाई', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
  { name: 'स्टेशनरी, बुक्स व क्राफ्ट', category: 'स्टेशनरी', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80' },
  { name: 'दवाइयां व मेडिकल स्टोर', category: 'दवाइयां', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80' },
  { name: 'जनरल स्टोर व दैनिक सामान', category: 'जनरल स्टोर', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80' }
];

// Curated product photo options for vendors when adding products
export const CURATED_PRODUCT_PHOTOS = [
  { name: 'सूती साड़ी / वस्त्र', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80' },
  { name: 'शर्ट / कुर्ता', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&auto=format&fit=crop&q=80' },
  { name: 'सूट / लेडीज वियर', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80' },
  { name: 'जींस / पैंट', category: 'Cloth House', url: 'https://images.unsplash.com/photo-1542272604-780c36856842?w=500&auto=format&fit=crop&q=80' },
  { name: 'हार्डवेयर व टूल्स', category: 'Hardware', url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=80' },
  { name: 'सैनिटरी व नल', category: 'Hardware', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80' },
  { name: 'किराना व राशन', category: 'Groceries', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80' },
  { name: 'मसाले व तेल', category: 'Groceries', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80' },
  { name: 'ताज़ी सब्जियां', category: 'Vegetables', url: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=500&auto=format&fit=crop&q=80' },
  { name: 'ताजे फल', category: 'Vegetables', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80' },
  { name: 'मोबाइल व हेडफोन', category: 'Electronics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
  { name: 'जूते व स्नीकर्स', category: 'Footwear', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80' },
  { name: 'लिपस्टिक व मेकअप', category: 'Cosmetics', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80' },
  { name: 'नोटबुक व पेन सेट', category: 'Stationery', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80' },
  { name: 'काजू, बादाम व मेवे', category: 'Groceries', url: 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=500&auto=format&fit=crop&q=80' }
];

/**
 * Get distinct, high-quality image URL for any vendor or category
 * Ensures every shop gets a unique, beautiful photo even if in same category!
 */
export function getCategoryPhoto(
  categoryStr?: string,
  shopName?: string,
  vendorId?: string,
  currentImgUrl?: string
): string {
  // If user provided a specific non-default custom image, keep it
  if (
    currentImgUrl &&
    currentImgUrl.trim() !== '' &&
    !currentImgUrl.includes('photo-1558769132-cb1aea458c5e') // avoid the old duplicate hanger image
  ) {
    return currentImgUrl;
  }

  const sName = (shopName || '').toLowerCase().trim();
  const cStr = (categoryStr || '').toLowerCase().trim();
  const vId = (vendorId || '').toLowerCase().trim();

  // Explicit shop name overrides for distinctness
  if (sName.includes('kamal')) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'; // Saree & Bridal shop
  }
  if (sName.includes('mahtab')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80'; // Boutique showroom
  }

  // Find matching category
  for (const cat of ALL_SHOP_CATEGORIES) {
    if (cat.keywords.some(k => sName.includes(k.toLowerCase()) || cStr.includes(k.toLowerCase()))) {
      // Deterministically pick photo by hashing shopName or vendorId
      const seedStr = sName || vId || 'seed';
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % cat.photos.length;
      return cat.photos[idx] || cat.imageUrl;
    }
  }

  // Fallback to vibrant general store
  return 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80';
}
