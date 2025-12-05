'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ProjectSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['procurement']));

  // Extract project ID from pathname
  const projectId = pathname?.split('/project/')[1]?.split('/')[0] || '';
  const isDashboard = pathname?.endsWith('/dashboard') || pathname?.match(/\/project\/[^/]+\/?$/);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <aside className="w-64 bg-[#1e3a5f] flex-shrink-0 overflow-y-auto">
      <nav className="px-3 pt-4">
        {/* Dashboard */}
        <Link
          href={`/project/${projectId}/dashboard`}
          className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
            isDashboard
              ? 'bg-[#2a4a6f] text-white'
              : 'text-white/70 hover:bg-[#2a4a6f] hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium text-sm">Dashboard</span>
        </Link>

        {/* Procurement log */}
        <div className="mb-1">
          <button
            onClick={() => toggleSection('procurement')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium text-sm">Procurement log</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('procurement') ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {expandedSections.has('procurement') && (
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href={`/project/${projectId}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  pathname === `/project/${projectId}` || pathname === `/project/${projectId}/`
                    ? 'bg-[#2a4a6f] text-white'
                    : 'text-white/70 hover:bg-[#2a4a6f] hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm">Materials</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm">Orders</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Deliveries</span>
              </Link>
            </div>
          )}
        </div>

        {/* Schedule viewer */}
        <div className="mb-1">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-sm">Schedule viewer</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('schedule') ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {expandedSections.has('schedule') && (
            <div className="ml-4 mt-1 space-y-1">
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">Project Schedule</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">Lookahead Plan</span>
              </Link>
            </div>
          )}
        </div>

        {/* Submittal viewer */}
        <div className="mb-1">
          <button
            onClick={() => toggleSection('submittal')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-sm">Submittal viewer</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('submittal') ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {expandedSections.has('submittal') && (
            <div className="ml-4 mt-1 space-y-1">
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">All</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">For Submission</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">For Review</span>
              </Link>
            </div>
          )}
        </div>

        {/* Delivery board */}
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium text-sm">Delivery board</span>
        </Link>

        {/* Logistics */}
        <div className="mb-1">
          <button
            onClick={() => toggleSection('logistics')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-medium text-sm">Logistics</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('logistics') ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {expandedSections.has('logistics') && (
            <div className="ml-4 mt-1 space-y-1">
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">Area Map</span>
              </Link>
              <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-[#2a4a6f] hover:text-white transition-colors">
                <span className="text-sm">Reservation</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

