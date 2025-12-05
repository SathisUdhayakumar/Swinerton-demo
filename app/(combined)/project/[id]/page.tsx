'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ReceiptsDeliveriesSection } from '@/components/dashboard/ReceiptsDeliveriesSection';

type TabId = 'budget' | 'po';

const tabs: { id: TabId; label: string }[] = [
  { id: 'budget', label: 'Budget vs Spent' },
  { id: 'po', label: 'PO' },
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

// Hierarchical budget data structure
interface BudgetLineItem {
  code: string;
  description: string;
  budget: number;
  spent: number;
  level: number;
  isHeader?: boolean;
}

const budgetData: Record<string, BudgetLineItem[]> = {
  'alpha': [
    { code: '07', description: 'DIRECT WORK', budget: 2000000, spent: 1172500, level: 0, isHeader: true },
    { code: '0727', description: 'RAT SLABS', budget: 450000, spent: 312000, level: 1, isHeader: true },
    { code: '07.727010', description: 'Fine Grade', budget: 85000, spent: 72000, level: 2 },
    { code: '07.727013', description: 'Visqueen', budget: 45000, spent: 38500, level: 2 },
    { code: '07.727024', description: 'Construction Joints', budget: 120000, spent: 95000, level: 2 },
    { code: '07.727030', description: 'Concrete', budget: 150000, spent: 78500, level: 2 },
    { code: '07.727040', description: 'Wet Finish', budget: 50000, spent: 28000, level: 2 },
    { code: '0730', description: 'MAT FOUNDATION', budget: 680000, spent: 425000, level: 1, isHeader: true },
    { code: '07.730005', description: 'Concrete Column Templates', budget: 95000, spent: 82000, level: 2 },
    { code: '07.730007', description: 'CMU/Curb/Wall Template', budget: 78000, spent: 65000, level: 2 },
    { code: '07.730010', description: 'Fine Grade and Hand Clean', budget: 45000, spent: 38000, level: 2 },
    { code: '07.730024', description: 'Form Construction Joints', budget: 112000, spent: 78000, level: 2 },
    { code: '07.730028', description: 'Depress/hanging Edge Forms', budget: 85000, spent: 52000, level: 2 },
    { code: '07.730030', description: 'Concrete', budget: 185000, spent: 82000, level: 2 },
    { code: '07.730040', description: 'Wet Finish', budget: 80000, spent: 28000, level: 2 },
    { code: '0731', description: 'SLAB ON GRADE', budget: 320000, spent: 185500, level: 1, isHeader: true },
    { code: '07.731013', description: 'Visqueen', budget: 65000, spent: 42000, level: 2 },
    { code: '07.731027', description: 'Edge Forms', budget: 95000, spent: 68500, level: 2 },
    { code: '07.731030', description: 'Concrete', budget: 160000, spent: 75000, level: 2 },
    { code: '0732', description: 'SUSPENDED CONCRETE DECKS', budget: 550000, spent: 250000, level: 1, isHeader: true },
    { code: '07.732007', description: 'CMU/Curb/Wall Template', budget: 42000, spent: 18000, level: 2 },
    { code: '07.732011', description: 'S/S Typ Deck 6ft - 12ft', budget: 85000, spent: 45000, level: 2 },
    { code: '07.732012', description: 'S/S High Deck 12ft - 20ft', budget: 95000, spent: 52000, level: 2 },
    { code: '07.732013', description: 'Set/Strip Handset, 21ft High or more', budget: 78000, spent: 35000, level: 2 },
    { code: '07.732024', description: 'Form Construction Joint', budget: 65000, spent: 28000, level: 2 },
    { code: '07.732030', description: 'Concrete', budget: 125000, spent: 52000, level: 2 },
    { code: '07.732040', description: 'Wet Finish', budget: 60000, spent: 20000, level: 2 },
  ],
  'beta': [
    { code: '07', description: 'DIRECT WORK', budget: 8250000, spent: 6050000, level: 0, isHeader: true },
    { code: '0727', description: 'RAT SLABS', budget: 1850000, spent: 1420000, level: 1, isHeader: true },
    { code: '07.727010', description: 'Fine Grade', budget: 320000, spent: 285000, level: 2 },
    { code: '07.727013', description: 'Visqueen', budget: 180000, spent: 145000, level: 2 },
    { code: '07.727024', description: 'Construction Joints', budget: 450000, spent: 380000, level: 2 },
    { code: '07.727030', description: 'Concrete', budget: 620000, spent: 420000, level: 2 },
    { code: '07.727040', description: 'Wet Finish', budget: 280000, spent: 190000, level: 2 },
    { code: '0730', description: 'MAT FOUNDATION', budget: 2400000, spent: 1780000, level: 1, isHeader: true },
    { code: '07.730005', description: 'Concrete Column Templates', budget: 380000, spent: 320000, level: 2 },
    { code: '07.730007', description: 'CMU/Curb/Wall Template', budget: 290000, spent: 245000, level: 2 },
    { code: '07.730030', description: 'Concrete', budget: 850000, spent: 620000, level: 2 },
    { code: '07.730040', description: 'Wet Finish', budget: 420000, spent: 295000, level: 2 },
    { code: '07.730050', description: 'Curing', budget: 460000, spent: 300000, level: 2 },
    { code: '0732', description: 'SUSPENDED CONCRETE DECKS', budget: 4000000, spent: 2850000, level: 1, isHeader: true },
    { code: '07.732011', description: 'S/S Typ Deck 6ft - 12ft', budget: 680000, spent: 520000, level: 2 },
    { code: '07.732012', description: 'S/S High Deck 12ft - 20ft', budget: 920000, spent: 680000, level: 2 },
    { code: '07.732030', description: 'Concrete', budget: 1450000, spent: 980000, level: 2 },
    { code: '07.732040', description: 'Wet Finish', budget: 550000, spent: 380000, level: 2 },
    { code: '07.732043', description: 'Reshore Decks', budget: 400000, spent: 290000, level: 2 },
  ],
};

// Sample PO data
const purchaseOrders = [
  { id: 'PO-2024-001', vendor: 'ABC Concrete Supply', amount: 125000, status: 'Active', date: '2024-11-15' },
  { id: 'PO-2024-002', vendor: 'Steel Solutions Inc', amount: 340000, status: 'Active', date: '2024-11-20' },
  { id: 'PO-2024-003', vendor: 'BuildRight Materials', amount: 89000, status: 'Completed', date: '2024-10-28' },
  { id: 'PO-2024-004', vendor: 'Premier Equipment Rental', amount: 56000, status: 'Active', date: '2024-12-01' },
  { id: 'PO-2024-005', vendor: 'Texas Rebar & Wire', amount: 178500, status: 'Active', date: '2024-11-22' },
  { id: 'PO-2024-006', vendor: 'Gulf Coast Aggregates', amount: 95000, status: 'Active', date: '2024-11-25' },
  { id: 'PO-2024-007', vendor: 'Metro Lumber Supply', amount: 67500, status: 'Completed', date: '2024-10-15' },
  { id: 'PO-2024-008', vendor: 'Precision Formwork Inc', amount: 215000, status: 'Active', date: '2024-11-28' },
  { id: 'PO-2024-009', vendor: 'Allied Waterproofing', amount: 48000, status: 'Pending', date: '2024-12-05' },
  { id: 'PO-2024-010', vendor: 'Sunbelt Rentals', amount: 82000, status: 'Active', date: '2024-11-30' },
  { id: 'PO-2024-011', vendor: 'Hilti Corporation', amount: 34500, status: 'Completed', date: '2024-10-20' },
  { id: 'PO-2024-012', vendor: 'Martin Marietta Materials', amount: 156000, status: 'Active', date: '2024-12-02' },
  { id: 'PO-2024-013', vendor: 'Vulcan Materials Company', amount: 198000, status: 'Active', date: '2024-11-18' },
  { id: 'PO-2024-014', vendor: 'White Cap Supply', amount: 45000, status: 'Pending', date: '2024-12-08' },
  { id: 'PO-2024-015', vendor: 'United Rentals', amount: 112000, status: 'Active', date: '2024-11-26' },
  { id: 'PO-2024-016', vendor: 'HD Supply', amount: 73500, status: 'Completed', date: '2024-10-25' },
  { id: 'PO-2024-017', vendor: 'CEMEX USA', amount: 285000, status: 'Active', date: '2024-12-01' },
  { id: 'PO-2024-018', vendor: 'Gerdau Ameristeel', amount: 420000, status: 'Active', date: '2024-11-12' },
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
  const [showReceiptsDeliveries, setShowReceiptsDeliveries] = useState(false);
  const [receiptsDeliveriesView, setReceiptsDeliveriesView] = useState<'receipts' | 'deliveries'>('receipts');
  
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

  // Get totals from the level 0 (DIRECT WORK) item
  const projectBudgetItems = budgetData[id] || [];
  const directWorkItem = projectBudgetItems.find(item => item.level === 0);
  const totalBudget = directWorkItem?.budget || project.costCodes.reduce((sum, cc) => sum + cc.budget, 0);
  const totalSpent = directWorkItem?.spent || project.costCodes.reduce((sum, cc) => sum + cc.spent, 0);
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-500 mt-1">Project Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/project/${id}/receipts`}>
            <Button 
              variant="outline" 
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              Receipt
            </Button>
          </Link>
          <Link href={`/project/${id}/deliveries`}>
            <Button 
              variant="outline" 
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              BOL
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Budget</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Remaining</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Receipts & Deliveries Section */}
      {showReceiptsDeliveries && (
        <div id="receipts-deliveries-section">
          <ReceiptsDeliveriesSection projectId={id} initialViewMode={receiptsDeliveriesView} />
        </div>
      )}

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
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 w-1/2">Description</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Budget</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Spent</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(budgetData[id] || []).map((item, index) => {
                        const remaining = item.budget - item.spent;
                        const isLevel0 = item.level === 0;
                        const isLevel1 = item.level === 1;
                        
                        return (
                          <tr 
                            key={item.code} 
                            className={`border-b border-slate-100 hover:bg-slate-50 ${
                              isLevel0 ? 'bg-slate-100' : isLevel1 ? 'bg-slate-50/50' : ''
                            }`}
                          >
                            <td className={`py-3 px-6 ${
                              isLevel0 ? 'font-bold text-slate-900' : 
                              isLevel1 ? 'font-semibold text-slate-800' : 
                              'text-slate-600'
                            }`}>
                              <div style={{ paddingLeft: `${item.level * 24}px` }}>
                                <span className={`${isLevel0 || isLevel1 ? 'text-[#1e3a5f]' : 'text-slate-500'} mr-2`}>
                                  {item.code}
                                </span>
                                {isLevel0 || isLevel1 ? '' : '- '}
                                {item.description}
                              </div>
                            </td>
                            <td className={`py-3 px-6 text-right ${
                              isLevel0 || isLevel1 ? 'font-semibold text-slate-800' : 'text-slate-700'
                            }`}>
                              {formatCurrency(item.budget)}
                            </td>
                            <td className={`py-3 px-6 text-right ${
                              isLevel0 || isLevel1 ? 'font-semibold text-slate-800' : 'text-slate-700'
                            }`}>
                              {formatCurrency(item.spent)}
                            </td>
                            <td className={`py-3 px-6 text-right ${
                              remaining < 0 ? 'text-red-600' : 'text-emerald-600'
                            } ${isLevel0 || isLevel1 ? 'font-semibold' : ''}`}>
                              {formatCurrency(remaining)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
          </Card>
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
                          <td className="py-3 px-4">
                          <Link href={`/po/${po.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                            {po.id}
                          </Link>
                        </td>
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

      </div>
    </div>
  );
}

