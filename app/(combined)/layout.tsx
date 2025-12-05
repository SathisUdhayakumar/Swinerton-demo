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
          <div className="flex items-center h-14">
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

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
