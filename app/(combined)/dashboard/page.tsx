'use client';

import { useState } from 'react';
import { ProjectsBudgets } from '@/components/dashboard/ProjectsBudgets';
import { SiteWorkflowPill } from '@/components/site-workflow/SiteWorkflowPill';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
          
          {/* Search Bar */}
          <div className="max-w-md relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
          </div>
        </div>

        {/* Projects Section */}
        <ProjectsBudgets />
      </div>

      {/* Floating Site Workflow Pill - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <SiteWorkflowPill />
      </div>
    </>
  );
}
