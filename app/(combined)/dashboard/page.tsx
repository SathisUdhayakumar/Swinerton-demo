'use client';

import { ProjectsBudgets } from '@/components/dashboard/ProjectsBudgets';
import { SiteWorkflowPill } from '@/components/site-workflow/SiteWorkflowPill';

export default function DashboardPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Self Perform Concrete</h1>
            <p className="text-sm text-slate-500 mt-1">Click on a project to view receipts, deliveries, and details</p>
          </div>
        </div>

        {/* Projects & Budgets Section */}
        <ProjectsBudgets />
      </div>

      {/* Floating Site Workflow Pill - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <SiteWorkflowPill />
      </div>
    </>
  );
}
