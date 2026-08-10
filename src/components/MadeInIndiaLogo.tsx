import React from 'react';

export const MadeInIndiaLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => {
  return (
    <div className={`relative rounded-full shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          {/* Metallic Silver Rim Gradient */}
          <linearGradient id="silverBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <radialGradient id="silverInner" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>

          {/* Arc Paths for Text */}
          <path id="arcTopText" d="M 19 50 A 31 31 0 0 1 81 50" />
          <path id="arcBottomText" d="M 81 50 A 31 31 0 0 1 19 50" />

          {/* Clip path for Flag */}
          <clipPath id="flagInnerCircle">
            <circle cx="50" cy="50" r="29" />
          </clipPath>
        </defs>

        {/* Outer Metallic Bezel */}
        <circle cx="50" cy="50" r="49" fill="url(#silverBezel)" stroke="#334155" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="42" fill="url(#silverInner)" />
        <circle cx="50" cy="50" r="31" fill="#1e293b" />

        {/* Curved MADE IN INDIA Text */}
        <text className="fill-slate-900 font-black text-[7.2px] tracking-widest uppercase">
          <textPath href="#arcTopText" startOffset="50%" textAnchor="middle">
            MADE IN INDIA
          </textPath>
        </text>
        <text className="fill-slate-900 font-black text-[7.2px] tracking-widest uppercase">
          <textPath href="#arcBottomText" startOffset="50%" textAnchor="middle">
            MADE IN INDIA
          </textPath>
        </text>

        {/* Left Side Stars */}
        <g fill="#1e293b">
          <polygon points="12,41 13.2,43.5 16,43.9 14,45.8 14.5,48.5 12,47.2 9.5,48.5 10,45.8 8,43.9 10.8,43.5" transform="scale(0.7) translate(5, 10)" />
          <polygon points="12,50 13.2,52.5 16,52.9 14,54.8 14.5,57.5 12,56.2 9.5,57.5 10,54.8 8,52.9 10.8,52.5" transform="scale(0.7) translate(5, 12)" />
          <polygon points="12,59 13.2,61.5 16,61.9 14,63.8 14.5,66.5 12,65.2 9.5,66.5 10,63.8 8,61.9 10.8,61.5" transform="scale(0.7) translate(5, 14)" />
        </g>

        {/* Right Side Stars */}
        <g fill="#1e293b">
          <polygon points="12,41 13.2,43.5 16,43.9 14,45.8 14.5,48.5 12,47.2 9.5,48.5 10,45.8 8,43.9 10.8,43.5" transform="scale(0.7) translate(118, 10)" />
          <polygon points="12,50 13.2,52.5 16,52.9 14,54.8 14.5,57.5 12,56.2 9.5,57.5 10,54.8 8,52.9 10.8,52.5" transform="scale(0.7) translate(118, 12)" />
          <polygon points="12,59 13.2,61.5 16,61.9 14,63.8 14.5,66.5 12,65.2 9.5,66.5 10,63.8 8,61.9 10.8,61.5" transform="scale(0.7) translate(118, 14)" />
        </g>

        {/* Inner Tricolor Flag Circle */}
        <g clipPath="url(#flagInnerCircle)">
          {/* Saffron */}
          <rect x="20" y="20" width="60" height="20" fill="#FF9933" />
          {/* White */}
          <rect x="20" y="40" width="60" height="20" fill="#FFFFFF" />
          {/* Green */}
          <rect x="20" y="60" width="60" height="20" fill="#138808" />

          {/* Ashoka Chakra */}
          <circle cx="50" cy="50" r="8" fill="none" stroke="#000080" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="1.2" fill="#000080" />
          {/* 24 spokes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 8 * Math.cos(angle)}
                y2={50 + 8 * Math.sin(angle)}
                stroke="#000080"
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        {/* Inner Bezel Ring Frame */}
        <circle cx="50" cy="50" r="29" fill="none" stroke="#475569" strokeWidth="1.2" />
      </svg>
    </div>
  );
};
