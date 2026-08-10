import React from 'react';

export const MadeInIndiaFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-stone-200 py-6 mt-auto flex flex-col items-center justify-center gap-2">
      {/* "MADE IN INDIA" Text */}
      <div className="font-extrabold italic tracking-[0.25em] text-stone-900 text-base sm:text-lg uppercase select-none font-sans">
        MADE IN INDIA
      </div>

      {/* Tricolor Strip Container */}
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        {/* Saffron Stripe */}
        <div className="w-full h-1.5 bg-[#FF9933] rounded-t-xs" />
        
        {/* White Stripe with Ashoka Chakra */}
        <div className="w-full h-2.5 bg-white flex items-center justify-center relative my-[0.5px]">
          {/* Ashoka Chakra (24-spoke navy blue wheel) */}
          <div className="w-3.5 h-3.5 rounded-full border border-[#000080] relative flex items-center justify-center shrink-0 bg-white z-10">
            {/* Center dot */}
            <div className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
            {/* Spokes representation */}
            <div className="absolute inset-0 border-[0.5px] border-[#000080]/30 rounded-full" />
          </div>
        </div>

        {/* Green Stripe */}
        <div className="w-full h-1.5 bg-[#138808] rounded-b-xs" />
      </div>
    </footer>
  );
};
