'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface CostCode {
  code: string;
  name: string;
  spent: number;
  budget: number;
}

interface Project {
  id: string;
  name: string;
  costCodes: CostCode[];
}

const projects: Project[] = [
  {
    id: "alpha",
    name: "Clemson-210 Keowee Trl",
    costCodes: [
      { code: "0400", name: "Materials", spent: 847500, budget: 1250000 },
      { code: "0410", name: "Equipment", spent: 325000, budget: 750000 },
    ],
  },
  {
    id: "beta",
    name: "DFW Terminal F",
    costCodes: [
      { code: "0500", name: "Labor", spent: 1850000, budget: 2500000 },
      { code: "0510", name: "Subcontracts", spent: 4200000, budget: 5750000 },
    ],
  },
];

function getRiskLevel(spent: number, budget: number) {
  const used = (spent / budget) * 100;
  if (used < 75) return { level: 'low' as const, used };
  if (used < 90) return { level: 'medium' as const, used };
  return { level: 'high' as const, used };
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`} className="block">
      <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          {/* Header with Risk Tag */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              Low Risk
            </span>
          </div>

          {/* Cost Codes */}
          <div className="space-y-4">
            {project.costCodes.map((cc, idx) => {
              const risk = getRiskLevel(cc.spent, cc.budget);
              const progressPercent = Math.min((cc.spent / cc.budget) * 100, 100);
              const remaining = cc.budget - cc.spent;

              return (
                <div key={cc.code} className={idx > 0 ? 'pt-4 border-t border-slate-200' : ''}>
                  {/* Cost Code Name */}
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-slate-900">{cc.name}</span>
                  </div>

                  {/* Progress Bar with Percentage */}
                  <div className="mb-2">
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-visible mb-1.5">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                      {/* Percentage Dot on Progress Bar */}
                      <div 
                        className="absolute top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"
                        style={{ left: `calc(${Math.min(progressPercent, 98)}% - 5px)` }}
                      />
                    </div>
                    {/* Percentage Text with Green Dot */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-emerald-700">
                        {formatPercent(risk.used)} used
                      </span>
                    </div>
                  </div>

                  {/* Budget Details */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Budget</p>
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(cc.budget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Spent</p>
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(cc.spent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-0.5">Remaining</p>
                      <p className={`text-sm font-semibold ${remaining < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow Icon */}
          <div className="mt-4 flex justify-end">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProjectsBudgets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
