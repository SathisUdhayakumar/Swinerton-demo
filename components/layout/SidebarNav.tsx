'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Projects is active for both /projects and /dashboard routes
    if (path === '/projects') {
      return pathname === '/projects' || pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="px-3 pt-4">
      <Link 
        href="/projects" 
        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
          isActive('/projects')
            ? 'bg-[#2a4a6f] text-white'
            : 'text-white/70 hover:bg-[#2a4a6f] hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="font-medium text-sm">Projects</span>
      </Link>
      <Link 
        href="#" 
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="font-medium text-sm">Companies</span>
      </Link>
    </nav>
  );
}
