'use client';

interface OrbProps {
  size?: number;
  className?: string;
}

export function Orb({ size = 64, className = '' }: OrbProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 blur-xl"
        style={{ transform: 'scale(1.2)' }}
      />
      
      {/* Main orb */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-lg flex items-center justify-center">
        {/* Inner highlight */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/30 blur-sm" />
        
        {/* Icon */}
        <svg 
          className="w-8 h-8 text-white relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </div>
    </div>
  );
}

