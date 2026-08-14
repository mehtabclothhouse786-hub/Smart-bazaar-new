import React from 'react';

interface Product3DIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  withBadge?: boolean;
  badgeText?: string;
  animate?: boolean;
  variant?: 'box' | 'add' | 'cart' | 'star';
}

/**
 * High-quality 3D Product Icon component with realistic isometric shading,
 * glossy lighting highlights, golden ribbon accents, and modern 3D depth.
 */
export const Product3DIcon: React.FC<Product3DIconProps> = ({
  size = 'md',
  className = '',
  withBadge = false,
  badgeText = '3D',
  animate = false,
  variant = 'box'
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28'
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* 3D SVG Render with Isometric Gradient Shading & Gloss */}
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)] ${animate ? 'hover:scale-110 hover:-rotate-3 transition-transform duration-300' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top Surface Gradient (Bright Light) */}
          <linearGradient id="topFaceGrad" x1="60" y1="12" x2="60" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Left Side Face (Mid Shadow) */}
          <linearGradient id="leftFaceGrad" x1="16" y1="50" x2="60" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Right Side Face (Deep Shadow) */}
          <linearGradient id="rightFaceGrad" x1="104" y1="50" x2="60" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Golden Ribbon Gloss */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          {/* Emerald Ribbon Accent */}
          <linearGradient id="emeraldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* 3D Drop Shadow */}
          <radialGradient id="boxShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Top Flap Highlights */}
          <linearGradient id="highlightGloss" x1="30" y1="20" x2="90" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 3D Soft Cast Shadow on Ground */}
        <ellipse cx="60" cy="112" rx="44" ry="7" fill="url(#boxShadow)" />

        {/* 3D Isometric Cube / Parcel Box */}
        {/* 1. Left Face */}
        <path
          d="M 16 48 L 60 72 L 60 108 L 16 84 Z"
          fill="url(#leftFaceGrad)"
        />

        {/* 2. Right Face */}
        <path
          d="M 60 72 L 104 48 L 104 84 L 60 108 Z"
          fill="url(#rightFaceGrad)"
        />

        {/* 3. Top Face */}
        <path
          d="M 60 14 L 104 48 L 60 72 L 16 48 Z"
          fill="url(#topFaceGrad)"
        />

        {/* Gloss Rim on Top Edge */}
        <path
          d="M 60 16 L 100 47 L 60 70 L 20 47 Z"
          fill="url(#highlightGloss)"
          opacity="0.6"
        />

        {/* Central Vertical Seam Accent */}
        <path
          d="M 60 72 L 60 108"
          stroke="#5B2909"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 3D Wrap Ribbon - Vertical Across Top & Front */}
        {/* Top ribbon part */}
        <path
          d="M 54 19 L 66 10 L 66 67 L 54 75 Z"
          fill="url(#emeraldRibbon)"
          opacity="0.95"
        />
        {/* Front Left Ribbon */}
        <path
          d="M 33 58 L 43 63 L 43 97 L 33 91 Z"
          fill="url(#emeraldRibbon)"
          opacity="0.9"
        />
        {/* Front Right Ribbon */}
        <path
          d="M 77 63 L 87 58 L 87 91 L 77 97 Z"
          fill="url(#emeraldRibbon)"
          opacity="0.9"
        />

        {/* 3D Golden Bow & Knot on Top */}
        <circle cx="60" cy="38" r="8.5" fill="url(#ribbonGrad)" stroke="#B45309" strokeWidth="1" />
        <circle cx="60" cy="38" r="4" fill="#FEF08A" />

        {/* Bow Wings */}
        <path
          d="M 52 35 C 44 26, 42 42, 54 38 Z"
          fill="url(#ribbonGrad)"
          stroke="#B45309"
          strokeWidth="0.8"
        />
        <path
          d="M 68 35 C 76 26, 78 42, 66 38 Z"
          fill="url(#ribbonGrad)"
          stroke="#B45309"
          strokeWidth="0.8"
        />

        {/* Floating Sparkle Stars */}
        <path
          d="M 94 20 L 96 26 L 102 28 L 96 30 L 94 36 L 92 30 L 86 28 L 92 26 Z"
          fill="#FDE047"
          className="animate-pulse"
        />
        <circle cx="28" cy="32" r="2.5" fill="#FDE047" />
        <circle cx="98" cy="80" r="2" fill="#FDE047" />

        {/* Variant: Add '+' Badge if variant === 'add' */}
        {variant === 'add' && (
          <g transform="translate(68, 64)">
            <circle cx="18" cy="18" r="16" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M 18 10 L 18 26 M 10 18 L 26 18" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Floating 3D Badge */}
      {withBadge && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-white tracking-wider">
          {badgeText}
        </span>
      )}
    </div>
  );
};
