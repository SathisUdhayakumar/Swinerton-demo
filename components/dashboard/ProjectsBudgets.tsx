'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getRiskLevel, formatCurrency, formatPercent } from '@/lib/utils';

interface CostCode {
  code: string;
  name: string;
  spent: number;
  budget: number;
}

interface PurchaseOrder {
  number: string;
  name: string;
  remaining: number;
}

interface Project {
  id: string;
  name: string;
  costCodes: CostCode[];
  purchaseOrders: PurchaseOrder[];
}

const projects: Project[] = [
  {
    id: "alpha",
    name: "Clemson-210 Keowee Trl",
    costCodes: [
      { code: "0400", name: "Materials", spent: 847500, budget: 1250000 },
      { code: "0410", name: "Equipment", spent: 325000, budget: 750000 },
    ],
    purchaseOrders: [
      { number: "PO-001", name: "General Materials PO", remaining: 125000 },
    ],
  },
  {
    id: "beta",
    name: "DFW Terminal F",
    costCodes: [
      { code: "0500", name: "Labor", spent: 1850000, budget: 2500000 },
      { code: "0510", name: "Subcontracts", spent: 4200000, budget: 5750000 },
    ],
    purchaseOrders: [],
  },
];

function RiskBadge({ 
  level, 
  used
}: { 
  level: 'low' | 'medium' | 'high'; 
  used: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };

  return (
    <div 
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${colors[level]}`} />
      <span className={`text-xs font-medium ${
        level === 'low' ? 'text-emerald-700' :
        level === 'medium' ? 'text-amber-700' : 'text-red-700'
      }`}>
        {formatPercent(used)} used
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg">
          <p className="font-medium">Risk: {labels[level]}</p>
          <p className="text-slate-300 mt-0.5">{formatPercent(used)} of budget used</p>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

function ProjectRiskChip({ level }: { level: 'low' | 'medium' | 'high' }) {
  const styles = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  const labels = {
    low: 'Low Risk',
    medium: 'Watch',
    high: 'At Risk',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function CostCodeRow({ costCode }: { costCode: CostCode }) {
  const remaining = costCode.budget - costCode.spent;
  const risk = getRiskLevel(costCode.spent, costCode.budget);
  const progressPercent = Math.min((costCode.spent / costCode.budget) * 100, 100);

  const progressColor = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  }[risk.level];

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">
            {costCode.name}
          </span>
        </div>
        <RiskBadge level={risk.level} used={risk.used} />
      </div>
      
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Budget: <span className="font-medium text-slate-700">{formatCurrency(costCode.budget)}</span></span>
        <span>Spent: <span className="font-medium text-slate-700">{formatCurrency(costCode.spent)}</span></span>
        <span>Remaining: <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {formatCurrency(remaining)}
        </span></span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const highestRisk = project.costCodes.reduce((highest, cc) => {
    const risk = getRiskLevel(cc.spent, cc.budget);
    if (risk.level === 'high') return 'high';
    if (risk.level === 'medium' && highest !== 'high') return 'medium';
    return highest;
  }, 'low' as 'low' | 'medium' | 'high');

  return (
    <Link href={`/project/${project.id}`} className="block">
      <Card className={`bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer ${
        highestRisk === 'high' ? 'border-l-4 border-l-red-500' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <ProjectRiskChip level={highestRisk} />
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Cost Codes */}
          <div>
            {project.costCodes.map((cc) => (
              <CostCodeRow key={cc.code} costCode={cc} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProjectsBudgets() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Material Tracking</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track spending across cost codes</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
