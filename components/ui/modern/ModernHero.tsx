'use client';

import { Orb } from './Orb';

interface ModernHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function ModernHero({ 
  title = "Meet KAI",
  subtitle = "Your AI Assistant",
  description = "Upload receipts or BOLs to get started. I'll help you process and log them."
}: ModernHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Orb Visual */}
      <div className="relative mb-6">
        <Orb size={80} />
      </div>
      
      {/* Title & Subtitle */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-slate-900 mb-1.5 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-amber-600 font-medium">
          {subtitle}
        </p>
      </div>
      
      {/* Description */}
      <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

