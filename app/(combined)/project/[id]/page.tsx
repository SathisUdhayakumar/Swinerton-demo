'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MaterialTable } from '@/components/material/MaterialTable';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const project = projects[id] || { name: 'Unknown Project', company: 'Unknown Company' };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        {/* Logo and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fbbf24] rounded-lg flex items-center justify-center">
              <span className="text-[#1e3a5f] font-bold text-lg">K</span>
            </div>
            <span className="text-[#1e3a5f] text-xl font-bold">KRANE</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{project.company}</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">{project.name}</span>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <span className="text-sm font-medium">English</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Help Icon */}
          <button className="text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notification Badge */}
          <button className="relative text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Dollar Sign Icon */}
          <button className="text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* User Profile */}
          <button className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center hover:bg-slate-300 transition-colors">
            S
          </button>
        </div>
      </header>

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ProjectSidebar />

        {/* Main Content */}
        <main className="flex-1 bg-white overflow-auto">
          <MaterialTable projectId={id} />
        </main>
      </div>
    </div>
  );
}
