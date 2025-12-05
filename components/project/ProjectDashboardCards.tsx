'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Delivery } from '@/types';

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

const projects: Record<string, Project> = {
  'alpha': {
    id: "alpha",
    name: "Clemson-210 Keowee Trl",
    costCodes: [
      { code: "0400", name: "Materials", spent: 847500, budget: 1250000 },
    ],
  },
  'beta': {
    id: "beta",
    name: "DFW Terminal F",
    costCodes: [
      { code: "0500", name: "Labor", spent: 1850000, budget: 2500000 },
      { code: "0510", name: "Subcontracts", spent: 4200000, budget: 5750000 },
    ],
  },
};

// Mock PO data - matching the project detail page
// These are the POs for alpha project (Clemson-210 Keowee Trl)
const purchaseOrders: { id: string; poNumber: string; projectId: string }[] = [
  { id: 'PO-2024-001', poNumber: 'PO-2024-001', projectId: 'alpha' },
  { id: 'PO-2024-002', poNumber: 'PO-2024-002', projectId: 'alpha' },
  { id: 'PO-2024-003', poNumber: 'PO-2024-003', projectId: 'alpha' },
  { id: 'PO-2024-004', poNumber: 'PO-2024-004', projectId: 'alpha' },
  { id: 'PO-2024-005', poNumber: 'PO-2024-005', projectId: 'alpha' },
  { id: 'PO-2024-011', poNumber: 'PO-2024-011', projectId: 'alpha' },
  { id: 'PO-2024-012', poNumber: 'PO-2024-012', projectId: 'alpha' },
];

function getRiskLevel(spent: number, budget: number) {
  const used = (spent / budget) * 100;
  if (used < 75) return { level: 'low' as const, used };
  if (used < 90) return { level: 'medium' as const, used };
  return { level: 'high' as const, used };
}

function ProjectCard({ project, poCount, deliveryCount }: { project: Project; poCount: number; deliveryCount: number }) {
  return (
    <Link href={`/project/${project.id}?tab=po`} className="block">
      <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-3">
        {/* Header with Risk Tag and Counts */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              Low Risk
            </span>
          </div>
        </div>

        {/* PO and Delivery Counts */}
        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">PO</span> - {poCount}
          </span>
          <span className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Delivery</span> - {deliveryCount}
          </span>
        </div>

        {/* Cost Codes */}
        <div className="space-y-3">
            {project.costCodes.map((cc, idx) => {
              const risk = getRiskLevel(cc.spent, cc.budget);
              const progressPercent = Math.min((cc.spent / cc.budget) * 100, 100);

            return (
              <div key={cc.code} className={idx > 0 ? 'pt-3 border-t border-slate-200' : ''}>
                {/* Cost Code Name */}
                <div className="mb-1.5">
                  <span className="text-xs font-semibold text-slate-900">{cc.name}</span>
                </div>

                {/* Progress Bar with Percentage */}
                <div className="mb-1.5">
                  <div className="relative h-1.5 bg-slate-100 rounded-full overflow-visible mb-1">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* Percentage Dot on Progress Bar */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white shadow-sm"
                      style={{ left: `calc(${Math.min(progressPercent, 98)}% - 4px)` }}
                    />
                  </div>
                  {/* Percentage Text with Green Dot */}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700">
                      {formatPercent(risk.used)} used
                    </span>
                  </div>
                </div>

                {/* Budget Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-600 mb-0.5">From PO</p>
                    <p className="text-xs font-semibold text-slate-900">{formatCurrency(cc.budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-0.5">Delivered</p>
                    <p className="text-xs font-semibold text-slate-900">{formatCurrency(cc.spent)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrow Icon */}
        <div className="mt-3 flex justify-end">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

interface ProjectDashboardCardsProps {
  projectId: string;
}

export function ProjectDashboardCards({ projectId }: ProjectDashboardCardsProps) {
  const project = projects[projectId];
  const [poCount, setPOCount] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);

  useEffect(() => {
    // Count POs for this project
    const projectPOs = purchaseOrders.filter(po => po.projectId === projectId);
    setPOCount(projectPOs.length);

    // Fetch and count deliveries for this project
    const fetchDeliveries = async () => {
      try {
        const res = await fetch('/api/deliveries');
        const data = await res.json();
        if (data.success) {
          const projectDeliveries = data.data.filter((d: Delivery) => d.projectId === projectId);
          setDeliveryCount(projectDeliveries.length);
        }
      } catch (error) {
        console.error('Failed to fetch deliveries:', error);
      }
    };

    fetchDeliveries();

    // Subscribe to SSE for real-time delivery updates
    const deliverySource = new EventSource('/api/deliveries/stream');
    deliverySource.addEventListener('delivery', (event) => {
      const data = JSON.parse(event.data);
      if (data.delivery.projectId === projectId) {
        fetchDeliveries();
      }
    });

    deliverySource.onerror = () => {
      deliverySource.close();
    };

    return () => {
      deliverySource.close();
    };
  }, [projectId]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ProjectCard project={project} poCount={poCount} deliveryCount={deliveryCount} />
    </div>
  );
}

