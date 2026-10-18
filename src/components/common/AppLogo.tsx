import React, { useState } from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  logoUrl?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  logoUrl = '/logo.jpg',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-xl bg-white flex items-center justify-center p-0.5 shadow-xs border border-slate-200/80 ${sizeClasses[size]}`}>
        {!imgError ? (
          <img
            src={logoUrl}
            alt="جهاد أحمد للمحاسبة"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          // Crisp vector SVG fallback if image cannot load
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
              fill="#1D4ED8"
              stroke="#F59E0B"
              strokeWidth="4"
            />
            <path
              d="M10,40 Q40,10 90,30"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
            جهاد أحمد للمحاسبة
          </span>
          <span className="text-[10px] font-medium text-slate-500 mt-1 leading-none">
            نظام الحسابات والمالية المتكامل
          </span>
        </div>
      )}
    </div>
  );
};
