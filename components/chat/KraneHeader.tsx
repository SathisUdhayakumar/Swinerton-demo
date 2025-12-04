'use client';

import Link from 'next/link';

interface KraneHeaderProps {
  onMenuClick?: () => void;
}

export function KraneHeader({ onMenuClick }: KraneHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {/* Left - Back/Menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Center - Bot Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Krane Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-white/80 text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Right - Menu */}
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
