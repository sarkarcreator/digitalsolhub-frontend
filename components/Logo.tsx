import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", withText = false }) => {
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src="/brand/Final%20Logo%20(1).png"
        alt="Digital Solutions Hub"
        className={`${className} object-contain rounded-md`}
        loading="eager"
        decoding="async"
      />
      
      {/* Text Part: Stacked layout matching the image typography */}
      {withText && (
        <div className="flex flex-col items-start leading-none justify-center">
          <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
            DIGITAL
          </span>
          <div className="w-full flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900 border border-blue-500/30 rounded-[2px] my-[2px] px-1 py-[1px] shadow-sm">
             <span className="text-[8px] md:text-[9px] font-bold text-cyan-100 tracking-[0.25em] ml-1">
               SOLUTIONS
             </span>
          </div>
          <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
            HUB
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
