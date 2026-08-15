import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, Vendor } from '../types';
import { 
  Search, 
  X, 
  Sparkles, 
  Store, 
  Tag, 
  ShoppingBag, 
  ChevronRight, 
  Truck, 
  ArrowRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { HighlightMatch } from './HighlightMatch';
import { ALL_SHOP_CATEGORIES, getCategoryPhoto } from '../utils/categoryData';

interface PredictiveSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  vendors: Vendor[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  onSelectVendor?: (vendorId: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  products = [],
  vendors = [],
  onSelectProduct,
  onAddToCart,
  onSelectCategory,
  onSelectVendor,
  placeholder = "सामान, राशन, कपड़ा, पेंट, या दुकान का नाम खोजें (Predictive Search)...",
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // 1. Predictive Match Analysis for Products (matching name, category, description, vendorName)
  const matchingProducts = useMemo(() => {
    if (!query) return [];
    return products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(query);
      const catMatch = (p.category || '').toLowerCase().includes(query);
      const descMatch = (p.description || '').toLowerCase().includes(query) || (p.shortDescription || '').toLowerCase().includes(query);
      const vendorNameMatch = (p.vendorName || '').toLowerCase().includes(query);
      
      // Also match vendor category if vendor found
      const vendor = vendors.find(v => v.id === p.vendorId || v.shopName === p.vendorName);
      const vendorCatMatch = (vendor?.category || '').toLowerCase().includes(query);

      return nameMatch || catMatch || descMatch || vendorNameMatch || vendorCatMatch;
    }).slice(0, 6);
  }, [products, vendors, query]);

  // 2. Predictive Match Analysis for Vendor Categories / Shop Categories
  const matchingCategories = useMemo(() => {
    // Unique list of all shop and product categories
    const categoriesSet = new Set<string>();
    ALL_SHOP_CATEGORIES.forEach(c => {
      categoriesSet.add(c.hindiName);
      categoriesSet.add(c.name);
    });
    vendors.forEach(v => {
      if (v.category) categoriesSet.add(v.category);
    });
    products.forEach(p => {
      if (p.category) categoriesSet.add(p.category);
    });

    const allCats = Array.from(categoriesSet);
    if (!query) {
      // Default top suggestions when focused with no query
      return allCats.slice(0, 5).map(catName => {
        const prodCount = products.filter(p => (p.category || '').toLowerCase().includes(catName.toLowerCase())).length;
        const vendorCount = vendors.filter(v => (v.category || '').toLowerCase().includes(catName.toLowerCase())).length;
        return { name: catName, prodCount, vendorCount, matchesQuery: false };
      });
    }

    return allCats
      .filter(cat => cat.toLowerCase().includes(query))
      .slice(0, 6)
      .map(catName => {
        const prodCount = products.filter(p => (p.category || '').toLowerCase().includes(catName.toLowerCase())).length;
        const vendorCount = vendors.filter(v => (v.category || '').toLowerCase().includes(catName.toLowerCase())).length;
        return { name: catName, prodCount, vendorCount, matchesQuery: true };
      });
  }, [products, vendors, query]);

  // 3. Predictive Match Analysis for Vendors / Stores
  const matchingVendors = useMemo(() => {
    if (!query) return [];
    return vendors.filter(v => {
      const nameMatch = v.shopName.toLowerCase().includes(query);
      const catMatch = (v.category || '').toLowerCase().includes(query);
      const addressMatch = (v.address || '').toLowerCase().includes(query);
      const hasProdMatch = products.some(p => 
        (p.vendorId === v.id || p.vendorName === v.shopName) && 
        (p.name.toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query))
      );
      return nameMatch || catMatch || addressMatch || hasProdMatch;
    }).slice(0, 4);
  }, [vendors, products, query]);

  // Popular predictive quick search keyword pills
  const popularKeywords = [
    'किराना व राशन',
    'कपड़े व साड़ी',
    'दूध व डेयरी',
    'इलेक्ट्रॉनिक्स',
    'हार्डवेयर व पेंट',
    'सब्जियां व फल',
    'दवाइयां'
  ];

  const totalResultsCount = matchingProducts.length + matchingCategories.filter(c => c.matchesQuery).length + matchingVendors.length;

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleSelectKeyword = (keyword: string) => {
    onSearchChange(keyword);
    setIsOpen(false);
  };

  const handleCategoryClick = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    } else {
      onSearchChange(catName);
    }
    setIsOpen(false);
  };

  const handleVendorClick = (vendor: Vendor) => {
    if (onSelectVendor) {
      onSelectVendor(vendor.id);
    } else {
      onSearchChange(vendor.shopName);
    }
    setIsOpen(false);
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      onSearchChange(product.name);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-30 mb-5">
      {/* Main Search Input Box */}
      <div 
        className={`relative flex items-center bg-white rounded-3xl border-2 transition-all duration-200 shadow-sm ${
          isFocused || isOpen
            ? 'border-emerald-600 ring-4 ring-emerald-500/15 shadow-md'
            : 'border-stone-200/90 hover:border-emerald-400/80 hover:shadow-xs'
        }`}
      >
        {/* Left Search Icon with Live Pulse if Active */}
        <div className="pl-4 pr-2 flex items-center pointer-events-none text-emerald-700">
          <Search className={`w-5 h-5 transition-transform ${query ? 'text-emerald-600 scale-110' : 'text-stone-400'}`} />
        </div>

        {/* Input Element */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3.5 pr-20 bg-transparent text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-400 outline-none leading-normal"
        />

        {/* Right Badges & Controls */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              title="सर्च खाली करें (Clear search)"
              className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>लाइव सर्च</span>
          </div>
        </div>
      </div>

      {/* Real-time Predictive Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-98 duration-150 max-h-[75vh] flex flex-col">
          
          {/* Dropdown Header Stats */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-stone-50 via-emerald-50/40 to-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रेडिक्टिव खोज सुझाव (Predictive Suggestions)</span>
              </span>
              {query && (
                <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {totalResultsCount} मैच मिले
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>बंद करें</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown Scrollable Body */}
          <div className="overflow-y-auto p-3.5 space-y-4 no-scrollbar divide-y divide-stone-100">

            {/* SECTION 1: Matching Vendor Categories */}
            {matchingCategories.length > 0 && (
              <div className="space-y-2 pt-1 first:pt-0">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>दुकान श्रेणियां (Vendor Categories)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold lowercase">
                    {matchingCategories.length} श्रेणियां
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {matchingCategories.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCategoryClick(cat.name)}
                      className="group inline-flex items-center gap-1.5 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-400 px-3 py-1.5 rounded-xl text-xs font-extrabold text-stone-800 hover:text-emerald-900 transition-all cursor-pointer shadow-2xs"
                    >
                      <Tag className="w-3 h-3 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                      <HighlightMatch
                        text={cat.name}
                        query={query}
                        highlightClassName="bg-amber-300 text-amber-950 font-black px-1 py-0.5 rounded-sm"
                      />
                      {(cat.prodCount > 0 || cat.vendorCount > 0) && (
                        <span className="text-[10px] bg-stone-200 group-hover:bg-emerald-200 group-hover:text-emerald-900 text-stone-600 font-black px-1.5 py-0.2 rounded-full">
                          {cat.prodCount > 0 ? `${cat.prodCount} सामान` : `${cat.vendorCount} दुकानें`}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: Real-time Matching Products (Highlighting Product Name & Vendor Category) */}
            {matchingProducts.length > 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>मिलते-जुलते उत्पाद (Matching Products)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold lowercase">
                    {matchingProducts.length} प्रोडक्ट्स
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingProducts.map((product) => {
                    // Find corresponding vendor to get vendor category
                    const vendor = vendors.find(v => v.id === product.vendorId || v.shopName === product.vendorName);
                    const vendorCategory = vendor?.category || product.category || 'दुकान सामान';

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center justify-between gap-3 p-2.5 bg-stone-50/70 hover:bg-emerald-50/60 border border-stone-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Product Image */}
                          <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="min-w-0">
                            {/* Product Name with Match Highlighting */}
                            <h4 className="text-xs font-extrabold text-stone-900 truncate group-hover:text-emerald-950">
                              <HighlightMatch
                                text={product.name}
                                query={query}
                                highlightClassName="bg-amber-300 text-stone-950 font-black px-1 py-0.5 rounded-sm"
                              />
                            </h4>

                            {/* Vendor Name & Category with Match Highlighting */}
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 truncate mt-0.5">
                              <span className="font-semibold text-stone-700 truncate">
                                {product.vendorName}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center bg-white border border-stone-200 px-1.5 py-0.2 rounded-md font-bold text-emerald-800">
                                <HighlightMatch
                                  text={vendorCategory}
                                  query={query}
                                  highlightClassName="bg-amber-300 text-stone-950 font-black px-1 py-0.2 rounded-sm"
                                />
                              </span>
                            </div>

                            {/* Price & Delivery Mode Tag */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-black text-emerald-800 text-xs">
                                ₹{product.price}
                              </span>
                              {product.deliveryMode === 'platform' ? (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <Truck className="w-2.5 h-2.5" /> डिलीवरी
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <Store className="w-2.5 h-2.5" /> पिकअप
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Button */}
                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            title="कार्ट में जोड़ें"
                            className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-transform active:scale-90 shrink-0 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: Matching Shops & Vendors */}
            {matchingVendors.length > 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>दुकानें / विक्रेता (Matching Shops)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold lowercase">
                    {matchingVendors.length} दुकानें
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingVendors.map((vendor) => {
                    const shopPhoto = getCategoryPhoto(vendor.category, vendor.shopName, vendor.id, vendor.imageUrl);
                    const vendorProdCount = products.filter(p => p.vendorId === vendor.id || p.vendorName === vendor.shopName).length;

                    return (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorClick(vendor)}
                        className="flex items-center justify-between gap-3 p-2.5 bg-stone-50/70 hover:bg-emerald-50/60 border border-stone-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={shopPhoto}
                              alt={vendor.shopName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-stone-900 truncate group-hover:text-emerald-950">
                              <HighlightMatch
                                text={vendor.shopName}
                                query={query}
                                highlightClassName="bg-amber-300 text-stone-950 font-black px-1 py-0.5 rounded-sm"
                              />
                            </h4>

                            {/* Highlight Vendor Category */}
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 truncate mt-0.5">
                              <span className="inline-flex items-center bg-white border border-stone-200 px-1.5 py-0.2 rounded-md font-bold text-emerald-800">
                                <HighlightMatch
                                  text={vendor.category}
                                  query={query}
                                  highlightClassName="bg-amber-300 text-stone-950 font-black px-1 py-0.2 rounded-sm"
                                />
                              </span>
                              <span>•</span>
                              <span>{vendorProdCount} उत्पाद</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-1.5 bg-white group-hover:bg-emerald-600 group-hover:text-white text-stone-600 rounded-xl border border-stone-200 group-hover:border-emerald-600 transition-colors shrink-0">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Searches if empty query */}
            {!query && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>लोकप्रिय खोजें (Popular Searches)</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {popularKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectKeyword(kw)}
                      className="px-3 py-1 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 hover:border-amber-300 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches fallback */}
            {query && totalResultsCount === 0 && (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold text-stone-800">
                  "{searchQuery}" के लिए कोई सीधा परिणाम नहीं मिला
                </h4>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  कृपया दूसरा नाम, उत्पाद या दुकान की श्रेणी लिखकर खोजें।
                </p>
              </div>
            )}

          </div>

          {/* Footer View All hint */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 text-center flex items-center justify-between text-[11px] text-stone-500 font-semibold">
            <span>दुकान या सामान पर क्लिक करके सीधे कैटलॉग देखें</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              पूरा पेज देखें →
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
