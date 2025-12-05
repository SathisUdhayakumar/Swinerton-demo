'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { KraneLogo } from '@/components/layout/KraneLogo';

const projects: Record<string, { name: string; company: string }> = {
  'alpha': {
    name: 'Clemson-210 Keowee Trl',
    company: 'Brigade Group',
  },
  'beta': {
    name: 'DFW Terminal F',
    company: 'Brigade Group',
  },
};

export function HeaderWithBreadcrumbs() {
  const pathname = usePathname();
  const isProjectPage = pathname?.startsWith('/project/');
  
  // Extract project ID from pathname
  const projectId = isProjectPage ? pathname.split('/project/')[1]?.split('/')[0] : null;
  const project = projectId ? projects[projectId] : null;
  const isDashboard = pathname?.endsWith('/dashboard');

  if (isProjectPage && project) {
    // Dark blue header with breadcrumbs for project pages (matching side panel)
    return (
      <header className="h-16 bg-[#1e3a5f] border-b border-[#2a4a6f] flex items-center justify-between px-6 flex-shrink-0">
        {/* Logo and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <KraneLogo href="/projects" size="md" />
          <div className="h-6 w-px bg-white/30" />
          <div className="text-sm text-white font-medium">
            {isDashboard ? 'Dashboard' : project.name}
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <span className="text-sm font-medium">English</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Help Icon */}
          <button className="text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notification Badge */}
          <button className="relative text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Dollar Sign Icon */}
          <button className="text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* User Profile */}
          <button className="w-8 h-8 rounded-full bg-white/20 text-white font-semibold text-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            S
          </button>
        </div>
      </header>
    );
  }

  // Dark blue header for other pages
  return (
    <header className="h-16 bg-[#1e3a5f] border-b border-[#2a4a6f] flex items-center justify-between px-6 flex-shrink-0">
      {/* Logo */}
      <KraneLogo href="/projects" size="md" />

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-sm font-medium">English</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Help Icon */}
        <button className="text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Notification Badge */}
        <NotificationBadge />

        {/* User Profile */}
        <button className="w-8 h-8 rounded-full bg-white/20 text-white font-semibold text-sm flex items-center justify-center hover:bg-white/30 transition-colors">
          S
        </button>
      </div>
    </header>
  );
}

