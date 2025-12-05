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
              {/* Swinerton Logo Icon - Two figures representing partnership/collaboration */}
              <div className="w-11 h-11 bg-[#1e3a5f] rounded flex items-center justify-center overflow-hidden">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  {/* Two figures side by side */}
                  <circle cx="14" cy="12" r="4" fill="#8faabe"/>
                  <path d="M8 28c0-4 3-7 6-7s6 3 6 7" stroke="#8faabe" strokeWidth="2" fill="none"/>
                  <circle cx="26" cy="12" r="4" fill="white"/>
                  <path d="M20 28c0-4 3-7 6-7s6 3 6 7" stroke="white" strokeWidth="2" fill="none"/>
                  {/* Raised arm gesture */}
                  <path d="M28 16 L34 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[#1e3a5f] text-xl tracking-widest uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '0.15em' }}>Swinerton</h1>
                <p className="text-slate-400 text-[10px] tracking-widest uppercase">Self Perform</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/krane-chat"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Krane</span>
              </Link>
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
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
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
