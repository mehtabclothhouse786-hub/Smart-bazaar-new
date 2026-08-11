import React from 'react';

export const MadeInIndiaLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => {
  return (
    <div className={`relative rounded-full shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
        <defs>
          {/* Outer Metallic Silver Bezel */}
          <linearGradient id="silverBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Inner Silver Ring */}
          <radialGradient id="silverInner" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>

          {/* Text Arcs */}
          <path id="topTextArc" d="M 30 100 A 70 70 0 0 1 170 100" />
          <path id="bottomTextArc" d="M 170 100 A 70 70 0 0 1 30 100" />

          {/* Clip Path for Central Tricolor Flag */}
          <clipPath id="flagCircleClip">
            <circle cx="100" cy="100" r="54" />
          </clipPath>
        </defs>

        {/* Outer Silver Bezel */}
        <circle cx="100" cy="100" r="98" fill="url(#silverBezel)" stroke="#334155" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="93" fill="url(#silverInner)" />
        <circle cx="100" cy="100" r="91" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
        <circle cx="100" cy="100" r="89" fill="url(#silverBezel)" />
        <circle cx="100" cy="100" r="68" fill="url(#silverInner)" stroke="#475569" strokeWidth="2" />

        {/* MADE IN INDIA Text on Top Arc */}
        <text className="font-black tracking-widest uppercase" fill="#0F172A" fontSize="18" fontWeight="900">
          <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
            MADE IN INDIA
          </textPath>
        </text>

        {/* MADE IN INDIA Text on Bottom Arc */}
        <text className="font-black tracking-widest uppercase" fill="#0F172A" fontSize="18" fontWeight="900">
          <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
            MADE IN INDIA
          </textPath>
        </text>

        {/* 3 Stars Left */}
        <g fill="#0F172A">
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(-74, -40) scale(0.68)" />
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(-79, -10) scale(0.68)" />
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(-74, 20) scale(0.68)" />
        </g>

        {/* 3 Stars Right */}
        <g fill="#0F172A">
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(32, -40) scale(0.68)" />
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(37, -10) scale(0.68)" />
          <polygon points="100,100 102.5,107.5 110,107.5 104,112 106,119 100,114.5 94,119 96,112 90,107.5 97.5,107.5" transform="translate(32, 20) scale(0.68)" />
        </g>

        {/* Central Tricolor Flag Circle */}
        <g clipPath="url(#flagCircleClip)">
          {/* Saffron Top Band */}
          <rect x="40" y="40" width="120" height="38" fill="#FF9933" />
          {/* White Middle Band */}
          <rect x="40" y="78" width="120" height="44" fill="#FFFFFF" />
          {/* Green Bottom Band */}
          <rect x="40" y="122" width="120" height="38" fill="#138808" />

          {/* Ashoka Chakra (24 Spokes Wheel) */}
          <g stroke="#000080" strokeWidth="1.2" fill="none">
            <circle cx="100" cy="100" r="16" strokeWidth="1.8" />
            <circle cx="100" cy="100" r="2.5" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 16 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={100 + 16 * Math.sin((i * 15 * Math.PI) / 180)}
              />
            ))}
          </g>
        </g>

        {/* Dark Navy Ring around Tricolor Flag */}
        <circle cx="100" cy="100" r="54" fill="none" stroke="#0F172A" strokeWidth="3" />
      </svg>
    </div>
  );
};
