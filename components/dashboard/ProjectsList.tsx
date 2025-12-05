'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  location: string;
}

const projects: Project[] = [
  {
    id: "alpha",
    name: "Clemson-210 Keowee Trl",
    location: "Clemson, South Carolina, 210",
  },
  {
    id: "beta",
    name: "DFW Terminal F",
    location: "Dallas, Texas, Terminal F",
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`} className="block">
      <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
        {/* Project Image */}
        <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          {/* Placeholder for construction site image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Project Info */}
        <CardContent className="p-4">
          {/* Project Title */}
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
          
          {/* Location/Details */}
          <p className="text-sm text-slate-600">{project.location}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProjectsList() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
