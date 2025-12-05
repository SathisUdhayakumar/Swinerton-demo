import Link from 'next/link';

export default function CombinedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Title */}
            <Link href="/dashboard" className="flex items-center gap-3">
              {/* Swinerton Official Logo */}
              <img 
                src="/swinerton-logo.png" 
                alt="Swinerton" 
                className="h-14 w-auto"
              />
              <div className="hidden sm:block border-l border-slate-300 pl-3">
                <p className="text-[#1e3a5f] text-sm font-medium tracking-wide">Self Perform</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/capture-receipt"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <span className="hidden sm:inline">Receipt</span>
              </Link>
              <Link
                href="/capture-bol"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">BOL</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
