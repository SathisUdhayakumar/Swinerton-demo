import Link from 'next/link';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { SidebarNav } from '@/components/layout/SidebarNav';

export default function CombinedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header - Full Width */}
      <header className="h-16 bg-[#1e3a5f] border-b border-[#2a4a6f] flex items-center justify-between px-6 flex-shrink-0">
        {/* Logo */}
        <Link href="/projects" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            {/* Yellow Pyramid Icon */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left face (darker yellow) */}
              <path d="M12 5L7 19L12 17L12 5Z" fill="#f59e0b"/>
              {/* Right face (brighter yellow) */}
              <path d="M12 5L17 19L12 17L12 5Z" fill="#fbbf24"/>
              {/* Base edge */}
              <path d="M7 19L17 19L12 17L7 19Z" fill="#fbbf24" opacity="0.6"/>
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">KRANE</span>
        </Link>

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

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1e3a5f] flex-shrink-0 overflow-y-auto">
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-auto">{children}</main>
      </div>
    </div>
  );
}
