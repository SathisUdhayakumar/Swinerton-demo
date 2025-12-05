'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type TabId = 'budget' | 'po' | 'deliveries';

const tabs: { id: TabId; label: string }[] = [
  { id: 'budget', label: 'Budget vs Spent' },
  { id: 'po', label: 'PO' },
  { id: 'deliveries', label: 'Deliveries' },
];

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
    id: 'alpha',
    name: 'Clemson-210 Keowee Trl',
    costCodes: [
      { code: '0400', name: 'Materials', spent: 847500, budget: 1250000 },
      { code: '0410', name: 'Equipment', spent: 325000, budget: 750000 },
    ],
  },
  'beta': {
    id: 'beta',
    name: 'DFW Terminal F',
    costCodes: [
      { code: '0500', name: 'Labor', spent: 1850000, budget: 2500000 },
      { code: '0510', name: 'Subcontracts', spent: 4200000, budget: 5750000 },
    ],
  },
};

// Sample PO data
const purchaseOrders = [
  { id: 'PO-2024-001', vendor: 'ABC Concrete Supply', amount: 125000, status: 'Active', date: '2024-11-15' },
  { id: 'PO-2024-002', vendor: 'Steel Solutions Inc', amount: 340000, status: 'Active', date: '2024-11-20' },
  { id: 'PO-2024-003', vendor: 'BuildRight Materials', amount: 89000, status: 'Completed', date: '2024-10-28' },
  { id: 'PO-2024-004', vendor: 'Premier Equipment Rental', amount: 56000, status: 'Active', date: '2024-12-01' },
];

// Sample deliveries data
const deliveries = [
  { id: 'DEL-001', description: 'Concrete Mix - 500 yards', date: '2024-12-03', status: 'Delivered', po: 'PO-2024-001' },
  { id: 'DEL-002', description: 'Rebar #4 - 2000 units', date: '2024-12-04', status: 'In Transit', po: 'PO-2024-002' },
  { id: 'DEL-003', description: 'Form Panels - 150 sets', date: '2024-12-05', status: 'Scheduled', po: 'PO-2024-003' },
  { id: 'DEL-004', description: 'Anchor Bolts - 500 units', date: '2024-12-02', status: 'Delivered', po: 'PO-2024-002' },
];

function getRiskLevel(spent: number, budget: number) {
  const used = (spent / budget) * 100;
  if (used < 75) return { level: 'low' as const, color: 'emerald', used };
  if (used < 90) return { level: 'medium' as const, color: 'amber', used };
  return { level: 'high' as const, color: 'red', used };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TabId>('budget');
  
  const project = projects[id];

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const totalBudget = project.costCodes.reduce((sum, cc) => sum + cc.budget, 0);
  const totalSpent = project.costCodes.reduce((sum, cc) => sum + cc.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-500 mt-1">Project Overview</p>
        </div>
        
        {/* Summary Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4 flex items-center gap-8">
          <div className="text-center px-4 border-r border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Budget</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-center px-4 border-r border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Spent</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Remaining</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Segment Control */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Budget vs Spent Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Budget Breakdown</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.costCodes.map((cc) => {
                    const risk = getRiskLevel(cc.spent, cc.budget);
                    const progressPercent = Math.min((cc.spent / cc.budget) * 100, 100);
                    const remaining = cc.budget - cc.spent;
                    
                    const progressColor = {
                      low: 'bg-emerald-500',
                      medium: 'bg-amber-500',
                      high: 'bg-red-500',
                    }[risk.level];

                    return (
                      <div key={cc.code} className="py-4 border-b border-slate-100 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base font-medium text-slate-800">{cc.name}</span>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            risk.level === 'low' ? 'bg-emerald-100 text-emerald-700' :
                            risk.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {risk.used.toFixed(0)}% used
                          </span>
                        </div>
                        
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Budget</p>
                            <p className="font-semibold text-slate-800">{formatCurrency(cc.budget)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Spent</p>
                            <p className="font-semibold text-slate-800">{formatCurrency(cc.spent)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Remaining</p>
                            <p className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {formatCurrency(remaining)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PO Tab */}
        {activeTab === 'po' && (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Purchase Orders</h3>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">PO Number</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Vendor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map((po) => (
                        <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">{po.id}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{po.vendor}</td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">{formatCurrency(po.amount)}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{po.date}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              po.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                              po.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Deliveries</h3>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Delivery ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">PO</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((del) => (
                        <tr key={del.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-800">{del.id}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{del.description}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{del.date}</td>
                          <td className="py-3 px-4 text-sm text-blue-600">{del.po}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              del.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                              del.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {del.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

