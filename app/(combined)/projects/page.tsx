'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectsList } from '@/components/dashboard/ProjectsList';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Projects</h1>
        
        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Show Archived Projects
            </Button>
            <Button 
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-white border-0"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <ProjectsList />
    </div>
  );
}
