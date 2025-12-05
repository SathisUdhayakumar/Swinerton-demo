'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { KraneChatEmbed } from '@/components/chat/KraneChatEmbed';
import { BOLCaptureEmbed } from '@/components/capture/BOLCaptureEmbed';

type TabId = 'receipt' | 'bol';

const tabs: { id: TabId; label: string }[] = [
  { id: 'receipt', label: 'Upload Receipt' },
  { id: 'bol', label: 'Upload BOL' },
];

export default function SiteWorkflowPage() {
  const [activeTab, setActiveTab] = useState<TabId>('receipt');
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the mockup container on page load
    mockupRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].id);
      } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  return (
    <div role="main" className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex flex-col">
      {/* Page Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Site Team Workflow</h1>
                <p className="text-xs text-slate-500">Upload receipts or BOLs</p>
              </div>
            </div>
          </div>

          {/* Segment Control */}
          <div
            role="tablist"
            aria-label="Workflow type"
            onKeyDown={handleKeyDown}
            className="flex bg-slate-100 rounded-lg p-1"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-4 lg:p-8">
        {/* Mobile Mockup Container */}
        <div
          ref={mockupRef}
          tabIndex={-1}
          className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          style={{ height: 'min(85vh, 780px)' }}
        >
          {/* Device Frame Top Bar (subtle) */}
          <div className="h-6 bg-slate-900 flex items-center justify-center">
            <div className="w-20 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* Content */}
          <div className="h-[calc(100%-24px)] flex flex-col bg-slate-50">
            {/* Receipt Tab */}
            <div
              id="panel-receipt"
              role="tabpanel"
              aria-labelledby="tab-receipt"
              className={`flex-1 ${activeTab === 'receipt' ? 'flex flex-col' : 'hidden'}`}
            >
              <KraneChatEmbed embedded />
            </div>

            {/* BOL Tab */}
            <div
              id="panel-bol"
              role="tabpanel"
              aria-labelledby="tab-bol"
              className={`flex-1 overflow-y-auto ${activeTab === 'bol' ? 'block' : 'hidden'}`}
            >
              <BOLCaptureEmbed embedded />
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-400 text-center max-w-md mx-auto">
          Site teams can snap receipts or upload BOLs. Data syncs to the dashboard in real-time via SSE.
        </p>
      </footer>
    </div>
  );
}


