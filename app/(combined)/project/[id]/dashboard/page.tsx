'use client';

import { use } from 'react';
import { ProjectDashboardCards } from '@/components/project/ProjectDashboardCards';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDashboardPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      {/* Project Cards */}
      <ProjectDashboardCards projectId={id} />
    </div>
  );
}


