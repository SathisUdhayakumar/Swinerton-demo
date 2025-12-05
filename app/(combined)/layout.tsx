import { HeaderWithBreadcrumbs } from '@/components/layout/HeaderWithBreadcrumbs';
import { ConditionalSidebar } from '@/components/layout/ConditionalSidebar';

export default function CombinedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header - Full Width */}
      <HeaderWithBreadcrumbs />

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1e3a5f] flex-shrink-0 overflow-y-auto">
          <ConditionalSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-auto">{children}</main>
      </div>
    </div>
  );
}
