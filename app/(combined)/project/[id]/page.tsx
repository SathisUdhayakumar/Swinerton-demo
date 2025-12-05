'use client';

import { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ReceiptsDeliveriesSection } from '@/components/dashboard/ReceiptsDeliveriesSection';
import { Delivery } from '@/types';
import { MaterialTable } from '@/components/material/MaterialTable';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  project: string;
  projectId: string;
  deliveryWindow: {
    start: string;
    end: string;
  };
  lines: any[];
  status: string;
  createdAt: string;
}

type TabId = 'materials' | 'budget' | 'po' | 'deliveries';

const tabs: { id: TabId; label: string }[] = [
  { id: 'materials', label: 'Materials' },
  { id: 'budget', label: 'Budget vs Spent' },
  { id: 'po', label: 'PO' },
  { id: 'deliveries', label: 'Deliveries' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

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
    { code: '07', description: 'DIRECT WORK', budget: 6000000, spent: 3517500, level: 0, isHeader: true },
    { code: '0727', description: 'RAT SLABS', budget: 1350000, spent: 936000, level: 1, isHeader: true },
    { code: '07.727010', description: 'Fine Grade', budget: 255000, spent: 216000, level: 2 },
    { code: '07.727013', description: 'Visqueen', budget: 135000, spent: 115500, level: 2 },
    { code: '07.727024', description: 'Construction Joints', budget: 360000, spent: 285000, level: 2 },
    { code: '07.727030', description: 'Concrete', budget: 450000, spent: 235500, level: 2 },
    { code: '07.727040', description: 'Wet Finish', budget: 150000, spent: 84000, level: 2 },
    { code: '0730', description: 'MAT FOUNDATION', budget: 2040000, spent: 1275000, level: 1, isHeader: true },
    { code: '07.730005', description: 'Concrete Column Templates', budget: 285000, spent: 246000, level: 2 },
    { code: '07.730007', description: 'CMU/Curb/Wall Template', budget: 234000, spent: 195000, level: 2 },
    { code: '07.730010', description: 'Fine Grade and Hand Clean', budget: 135000, spent: 114000, level: 2 },
    { code: '07.730024', description: 'Form Construction Joints', budget: 336000, spent: 234000, level: 2 },
    { code: '07.730028', description: 'Depress/hanging Edge Forms', budget: 255000, spent: 156000, level: 2 },
    { code: '07.730030', description: 'Concrete', budget: 555000, spent: 246000, level: 2 },
    { code: '07.730040', description: 'Wet Finish', budget: 240000, spent: 84000, level: 2 },
    { code: '0731', description: 'SLAB ON GRADE', budget: 960000, spent: 556500, level: 1, isHeader: true },
    { code: '07.731013', description: 'Visqueen', budget: 195000, spent: 126000, level: 2 },
    { code: '07.731027', description: 'Edge Forms', budget: 285000, spent: 205500, level: 2 },
    { code: '07.731030', description: 'Concrete', budget: 480000, spent: 225000, level: 2 },
    { code: '0732', description: 'SUSPENDED CONCRETE DECKS', budget: 1650000, spent: 750000, level: 1, isHeader: true },
    { code: '07.732007', description: 'CMU/Curb/Wall Template', budget: 126000, spent: 54000, level: 2 },
    { code: '07.732011', description: 'S/S Typ Deck 6ft - 12ft', budget: 255000, spent: 135000, level: 2 },
    { code: '07.732012', description: 'S/S High Deck 12ft - 20ft', budget: 285000, spent: 156000, level: 2 },
    { code: '07.732013', description: 'Set/Strip Handset, 21ft High or more', budget: 234000, spent: 105000, level: 2 },
    { code: '07.732024', description: 'Form Construction Joint', budget: 195000, spent: 84000, level: 2 },
    { code: '07.732030', description: 'Concrete', budget: 375000, spent: 156000, level: 2 },
    { code: '07.732040', description: 'Wet Finish', budget: 180000, spent: 60000, level: 2 },
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
    { code: '07.730007', description: 'CMU/Curb/Wall Template', budget: 320000, spent: 245000, level: 2 },
    { code: '07.730010', description: 'Fine Grade and Hand Clean', budget: 180000, spent: 145000, level: 2 },
    { code: '07.730024', description: 'Form Construction Joints', budget: 450000, spent: 380000, level: 2 },
    { code: '07.730028', description: 'Depress/hanging Edge Forms', budget: 340000, spent: 280000, level: 2 },
    { code: '07.730030', description: 'Concrete', budget: 520000, spent: 380000, level: 2 },
    { code: '07.730040', description: 'Wet Finish', budget: 210000, spent: 150000, level: 2 },
  ],
};

// Mock PO data - expanded list
const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-001', poNumber: 'PO-2024-001', vendor: 'ABC Concrete Supply', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-15', end: '2024-12-15' }, lines: [], status: 'open', createdAt: '2024-11-15T10:00:00Z' },
  { id: 'PO-2024-002', poNumber: 'PO-2024-002', vendor: 'Steel Solutions Inc', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-20', end: '2024-12-20' }, lines: [], status: 'open', createdAt: '2024-11-20T14:30:00Z' },
  { id: 'PO-2024-003', poNumber: 'PO-2024-003', vendor: 'Material Works Co', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-25', end: '2024-12-25' }, lines: [], status: 'open', createdAt: '2024-11-25T09:00:00Z' },
  { id: 'PO-2024-004', poNumber: 'PO-2024-004', vendor: 'Equipment Rentals LLC', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-12-01', end: '2025-01-01' }, lines: [], status: 'open', createdAt: '2024-12-01T11:00:00Z' },
  { id: 'PO-2024-005', poNumber: 'PO-2024-005', vendor: 'Construction Supplies Inc', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-12-05', end: '2025-01-05' }, lines: [], status: 'open', createdAt: '2024-12-05T13:00:00Z' },
  { id: 'PO-2024-006', poNumber: 'PO-2024-006', vendor: 'Steel Fabricators Ltd', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-11-18', end: '2024-12-18' }, lines: [], status: 'open', createdAt: '2024-11-18T08:00:00Z' },
  { id: 'PO-2024-007', poNumber: 'PO-2024-007', vendor: 'FrameWorks Industries', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-11-22', end: '2024-12-22' }, lines: [], status: 'open', createdAt: '2024-11-22T10:00:00Z' },
  { id: 'PO-2024-008', poNumber: 'PO-2024-008', vendor: 'Electrical Components Co', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-11-28', end: '2024-12-28' }, lines: [], status: 'open', createdAt: '2024-11-28T14:00:00Z' },
  { id: 'PO-2024-009', poNumber: 'PO-2024-009', vendor: 'HVAC Systems Inc', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-12-02', end: '2025-01-02' }, lines: [], status: 'open', createdAt: '2024-12-02T09:00:00Z' },
  { id: 'PO-2024-010', poNumber: 'PO-2024-010', vendor: 'Plumbing Solutions', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-12-06', end: '2025-01-06' }, lines: [], status: 'open', createdAt: '2024-12-06T11:00:00Z' },
  { id: 'PO-2024-011', poNumber: 'PO-2024-011', vendor: 'Roofing Materials Co', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-12-10', end: '2025-01-10' }, lines: [], status: 'open', createdAt: '2024-12-10T15:00:00Z' },
  { id: 'PO-2024-012', poNumber: 'PO-2024-012', vendor: 'Insulation Specialists', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-12-12', end: '2025-01-12' }, lines: [], status: 'open', createdAt: '2024-12-12T08:00:00Z' },
  { id: 'PO-2024-013', poNumber: 'PO-2024-013', vendor: 'Paint & Coatings Inc', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-12-08', end: '2025-01-08' }, lines: [], status: 'open', createdAt: '2024-12-08T12:00:00Z' },
  { id: 'PO-2024-014', poNumber: 'PO-2024-014', vendor: 'Flooring Solutions', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-12-14', end: '2025-01-14' }, lines: [], status: 'open', createdAt: '2024-12-14T16:00:00Z' },
  { id: 'PO-2024-015', poNumber: 'PO-2024-015', vendor: 'Glass & Windows Co', project: 'DFW Terminal F', projectId: 'beta', deliveryWindow: { start: '2024-12-16', end: '2025-01-16' }, lines: [], status: 'open', createdAt: '2024-12-16T10:00:00Z' },
];

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL search params, default to 'budget' if coming from dashboard
  const tabFromUrl = searchParams?.get('tab') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'budget');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isDeliveriesLoading, setIsDeliveriesLoading] = useState(true);

  // Update tab when URL search params change
  useEffect(() => {
    if (tabFromUrl && ['materials', 'budget', 'po', 'deliveries'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const project = projects[id];
  const budgetItems = budgetData[id] || [];
  const projectPOs = purchaseOrders.filter(po => po.projectId === id);

  // Calculate totals
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Fetch deliveries for this project
  const fetchDeliveries = useCallback(async () => {
    setIsDeliveriesLoading(true);
    try {
      const res = await fetch('/api/deliveries');
      const data = await res.json();
      if (data.success) {
        const projectDeliveries = data.data.filter((d: Delivery) => d.projectId === id);
        setDeliveries(projectDeliveries);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setIsDeliveriesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeliveries();

    // Subscribe to SSE for deliveries
    const deliverySource = new EventSource('/api/deliveries/stream');
    deliverySource.addEventListener('delivery', (event) => {
      const data = JSON.parse(event.data);
      if (data.delivery.projectId === id) {
        if (data.type === 'created') {
          setDeliveries((prev) => [data.delivery, ...prev]);
        } else if (data.type === 'updated') {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === data.delivery.id ? data.delivery : d))
          );
        } else if (data.type === 'deleted') {
          setDeliveries((prev) => prev.filter((d) => d.id !== data.delivery.id));
        }
      }
    });

    deliverySource.onerror = () => {
      console.error('Deliveries SSE disconnected, attempting reconnect...');
      setTimeout(() => fetchDeliveries(), 3000);
    };

    return () => {
      deliverySource.close();
    };
  }, [id, fetchDeliveries]);

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            {activeTab === 'materials' ? (
              <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Project Overview</h1>
                <p className="text-sm text-slate-500 mt-1">{project.name}</p>
              </>
            )}
          </div>
          {activeTab !== 'materials' && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => router.push(`/project/${id}/receipts`)}
              >
                Receipt
              </Button>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => router.push(`/project/${id}/deliveries`)}
              >
                BOL
              </Button>
            </div>
          )}
        </div>

        {/* Summary Stats - Hidden on Materials tab */}
        {activeTab !== 'materials' && (
          <Card className="bg-slate-50 border-slate-200 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Budget</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalBudget)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Remaining</p>
                  <p className={`text-lg font-semibold ${totalRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Segment Control - Hidden on Materials tab */}
      {activeTab !== 'materials' && (
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <MaterialTable projectId={id} />
        )}

        {/* Budget vs Spent Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Budget</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Spent</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {budgetItems.map((item, idx) => (
                        <tr
                          key={`${item.code}-${idx}`}
                          className={item.isHeader ? 'bg-slate-50' : 'hover:bg-slate-50'}
                        >
                          <td className={`px-4 py-3 ${item.isHeader ? 'font-semibold' : ''} ${item.level === 0 ? 'text-slate-900' : item.level === 1 ? 'text-slate-800' : 'text-slate-700'}`}>
                            <div style={{ paddingLeft: `${item.level * 1}rem` }}>
                              {item.code}
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${item.isHeader ? 'font-semibold' : ''} ${item.level === 0 ? 'text-slate-900' : item.level === 1 ? 'text-slate-800' : 'text-slate-700'}`}>
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(item.budget)}</td>
                          <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(item.spent)}</td>
                          <td className={`px-4 py-3 text-right ${item.budget - item.spent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {formatCurrency(item.budget - item.spent)}
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date Issued</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Delivery Window</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectPOs.map((po) => (
                        <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link href={`/po/${po.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                              {po.id}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{po.vendor}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(po.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {po.deliveryWindow.start} to {po.deliveryWindow.end}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              po.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                              po.status === 'completed' ? 'bg-slate-100 text-slate-700' :
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
                {isDeliveriesLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm mt-2">Loading deliveries...</p>
                  </div>
                ) : deliveries.length === 0 ? (
                  <div className="py-12 text-center">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-500 text-lg font-medium">No deliveries found</p>
                    <p className="text-slate-400 text-sm mt-1">Site team can upload BOLs via the workflow</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Delivery ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">BOL Number</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Vendor</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">PO Number</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Items</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Match Score</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((delivery) => {
                          const exactMatches = delivery.lines.filter((l) => l.matchStatus === 'exact').length;
                          const totalItems = delivery.lines.length;
                          
                          const matchedPO = purchaseOrders.find(po => 
                            po.id === delivery.poId || 
                            po.poNumber === delivery.poNumber ||
                            (po.vendor === delivery.vendor && po.projectId === delivery.projectId)
                          );

                          return (
                            <tr key={delivery.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <Link href={`/delivery/${delivery.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                  {delivery.id}
                                </Link>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-800 font-mono">{delivery.bolNumber}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">{delivery.vendor}</td>
                              <td className="py-3 px-4">
                                {matchedPO ? (
                                  <Link href={`/po/${matchedPO.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                    {matchedPO.id}
                                  </Link>
                                ) : (
                                  <span className="text-sm text-slate-400">{delivery.poNumber || 'No PO'}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-600">{delivery.deliveryDate}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">
                                <div className="flex flex-col">
                                  <span>{totalItems} items</span>
                                  {exactMatches > 0 && (
                                    <span className="text-xs text-emerald-600">{exactMatches} matched</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        delivery.matchScore >= 0.8 ? 'bg-emerald-500' :
                                        delivery.matchScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${delivery.matchScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500">{(delivery.matchScore * 100).toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  delivery.status === 'verified' || delivery.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                  delivery.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {delivery.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Receipts & Deliveries Section - Hidden on Materials tab */}
      {activeTab !== 'materials' && (
        <div className="mt-8">
          <ReceiptsDeliveriesSection projectId={id} initialViewMode="all" />
        </div>
      )}
    </div>
  );
}
