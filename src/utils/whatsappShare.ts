import { Product, ServiceProvider, OldItem } from '../types';

/**
 * Utility to format and share Products, Services, and Old Items directly to WhatsApp Status with Pic + Short Text
 */

// Helper to convert Image URL (Base64 or HTTP) to File for Native Web Share API
async function fetchImageAsFile(imageUrl: string, filename: string): Promise<File | null> {
  try {
    if (!imageUrl) return null;

    // Handle Data URL (Base64)
    if (imageUrl.startsWith('data:')) {
      const arr = imageUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const ext = mime.split('/')[1] || 'jpg';
      return new File([blob], `${filename}.${ext}`, { type: mime });
    }

    // Handle Remote URL (with cache-busting and cors fallback)
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    const mime = blob.type || 'image/jpeg';
    const ext = mime.split('/')[1] || 'jpg';
    return new File([blob], `${filename}.${ext}`, { type: mime });
  } catch (err) {
    console.warn('Could not convert image to file for share:', err);
    return null;
  }
}

export const APP_SHARE_URL = 'https://bit.ly/4fWoCXK';

export async function shareProductToWhatsApp(product: Product): Promise<void> {
  const priceText = `₹${product.price}${product.unit ? ` / ${product.unit}` : ''}`;
  const discountText = product.originalPrice && product.originalPrice > product.price 
    ? ` (MRP ₹${product.originalPrice} - ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)` 
    : '';

  // Short, high-conversion status text
  const shortText = `🛍️ *${product.name}*
💰 *कीमत:* ${priceText}${discountText}
🏪 *स्टोर:* ${product.vendorName || 'Smart Bazaar'}
🛵 *होम डिलीवरी उपलब्ध*

📲 *ऑर्डर लिंक:*
${APP_SHARE_URL}`;

  await shareWithImageAndText({
    title: product.name,
    text: shortText,
    imageUrl: product.imageUrl,
    filename: `product_${product.id}`
  });
}

export async function shareServiceToWhatsApp(service: ServiceProvider): Promise<void> {
  const shortText = `🛠️ *${service.serviceName}*
👤 *${service.providerName}* (${service.category})
⭐ *रेटिंग:* ${service.rating || 5.0}★
📞 *कॉल / WhatsApp:* ${service.primaryPhone}
📍 *स्थान:* ${service.address || 'चांदपुर / बिजनौर'}

📲 *ऑनलाइन बुकिंग:*
${APP_SHARE_URL}`;

  await shareWithImageAndText({
    title: service.serviceName,
    text: shortText,
    imageUrl: service.imageUrl,
    filename: `service_${service.id}`
  });
}

export async function shareOldItemToWhatsApp(item: OldItem): Promise<void> {
  const shortText = `📦 *${item.title}* (सेकंड हैंड)
💰 *कीमत:* ₹${item.price.toLocaleString('en-IN')} (${item.condition})
📍 *स्थान:* ${item.location}
📞 *संपर्क:* ${item.sellerPhone}

📲 *देखें / खरीदें:*
${APP_SHARE_URL}`;

  await shareWithImageAndText({
    title: item.title,
    text: shortText,
    imageUrl: item.imageUrl,
    filename: `item_${item.id}`
  });
}

async function shareWithImageAndText(options: {
  title: string;
  text: string;
  imageUrl?: string;
  filename: string;
}): Promise<void> {
  const { title, text, imageUrl, filename } = options;

  let imageFile: File | null = null;
  if (imageUrl) {
    imageFile = await fetchImageAsFile(imageUrl, filename);
  }

  // 1. Try Native Web Share API with Image File + Short Caption (Opens WhatsApp Status directly on Mobile)
  if (navigator.share) {
    try {
      if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title,
          text,
          files: [imageFile],
        });
        return;
      } else {
        // Share text + link if file sharing isn't supported
        await navigator.share({
          title,
          text,
          url: APP_SHARE_URL
        });
        return;
      }
    } catch (shareErr) {
      // If user cancelled, do nothing; if unsupported error, proceed to fallback
      if ((shareErr as Error).name === 'AbortError') {
        return;
      }
      console.warn('Native share failed, falling back to direct link:', shareErr);
    }
  }

  // 2. Fallback to WhatsApp URL
  const fallbackText = imageUrl && !imageUrl.startsWith('data:')
    ? `${text}\n🖼️ *फोटो:* ${imageUrl}`
    : text;
  
  const encoded = encodeURIComponent(fallbackText);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(whatsappUrl, '_blank');
}

