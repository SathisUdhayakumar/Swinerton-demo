'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

// PO Details with line items
interface POLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  delivered: number;
  remaining: number;
}

interface PODetail {
  id: string;
  poNumber: string;
  vendor: string;
  vendorAddress: string;
  vendorContact: string;
  vendorPhone: string;
  vendorEmail: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: 'Active' | 'Completed' | 'Pending' | 'On Hold';
  dateIssued: string;
  dateRequired: string;
  paymentTerms: string;
  description: string;
  lineItems: POLineItem[];
  deliveries: {
    id: string;
    date: string;
    bolNumber: string;
    itemsDelivered: number;
    status: string;
  }[];
  invoices: {
    id: string;
    date: string;
    amount: number;
    status: string;
  }[];
}

const poDetails: Record<string, PODetail> = {
  'PO-2024-001': {
    id: 'PO-2024-001',
    poNumber: 'PO-2024-001',
    vendor: 'ABC Concrete Supply',
    vendorAddress: '1234 Industrial Blvd, Dallas, TX 75201',
    vendorContact: 'John Smith',
    vendorPhone: '(214) 555-0123',
    vendorEmail: 'jsmith@abcconcrete.com',
    projectId: 'alpha',
    projectName: 'Clemson-210 Keowee Trl',
    amount: 125000,
    status: 'Active',
    dateIssued: '2024-11-15',
    dateRequired: '2024-12-15',
    paymentTerms: 'Net 30',
    description: 'Concrete materials for foundation and slab work',
    lineItems: [
      { id: 'L1', description: 'Ready-Mix Concrete 4000 PSI', quantity: 500, unit: 'CY', unitPrice: 145, totalPrice: 72500, delivered: 350, remaining: 150 },
      { id: 'L2', description: 'Concrete Admixture', quantity: 200, unit: 'GAL', unitPrice: 85, totalPrice: 17000, delivered: 150, remaining: 50 },
      { id: 'L3', description: 'Rebar #5', quantity: 1000, unit: 'LF', unitPrice: 12.50, totalPrice: 12500, delivered: 800, remaining: 200 },
      { id: 'L4', description: 'Wire Mesh 6x6 W2.9', quantity: 500, unit: 'SF', unitPrice: 8, totalPrice: 4000, delivered: 500, remaining: 0 },
      { id: 'L5', description: 'Form Release Agent', quantity: 50, unit: 'GAL', unitPrice: 45, totalPrice: 2250, delivered: 30, remaining: 20 },
      { id: 'L6', description: 'Curing Compound', quantity: 100, unit: 'GAL', unitPrice: 38, totalPrice: 3800, delivered: 60, remaining: 40 },
      { id: 'L7', description: 'Expansion Joint Filler', quantity: 200, unit: 'LF', unitPrice: 15, totalPrice: 3000, delivered: 120, remaining: 80 },
      { id: 'L8', description: 'Concrete Sealer', quantity: 75, unit: 'GAL', unitPrice: 65, totalPrice: 4875, delivered: 0, remaining: 75 },
      { id: 'L9', description: 'Dowel Bars', quantity: 500, unit: 'EA', unitPrice: 8.50, totalPrice: 4250, delivered: 350, remaining: 150 },
      { id: 'L10', description: 'Vapor Barrier 15mil', quantity: 825, unit: 'SF', unitPrice: 1, totalPrice: 825, delivered: 825, remaining: 0 },
    ],
    deliveries: [
      { id: 'DEL-001', date: '2024-11-20', bolNumber: 'BOL-78452', itemsDelivered: 4, status: 'Verified' },
      { id: 'DEL-002', date: '2024-11-25', bolNumber: 'BOL-78501', itemsDelivered: 3, status: 'Verified' },
      { id: 'DEL-003', date: '2024-12-01', bolNumber: 'BOL-78623', itemsDelivered: 2, status: 'Pending' },
    ],
    invoices: [
      { id: 'INV-2024-1001', date: '2024-11-22', amount: 45000, status: 'Paid' },
      { id: 'INV-2024-1045', date: '2024-11-28', amount: 32000, status: 'Approved' },
      { id: 'INV-2024-1089', date: '2024-12-03', amount: 28000, status: 'Pending' },
    ],
  },
  'PO-2024-002': {
    id: 'PO-2024-002',
    poNumber: 'PO-2024-002',
    vendor: 'Steel Solutions Inc',
    vendorAddress: '5678 Steel Way, Houston, TX 77001',
    vendorContact: 'Maria Garcia',
    vendorPhone: '(713) 555-0456',
    vendorEmail: 'mgarcia@steelsolutions.com',
    projectId: 'alpha',
    projectName: 'Clemson-210 Keowee Trl',
    amount: 340000,
    status: 'Active',
    dateIssued: '2024-11-20',
    dateRequired: '2024-12-30',
    paymentTerms: 'Net 45',
    description: 'Structural steel for suspended deck framing',
    lineItems: [
      { id: 'L1', description: 'W12x26 Steel Beam', quantity: 120, unit: 'LF', unitPrice: 850, totalPrice: 102000, delivered: 80, remaining: 40 },
      { id: 'L2', description: 'W10x22 Steel Beam', quantity: 200, unit: 'LF', unitPrice: 680, totalPrice: 136000, delivered: 150, remaining: 50 },
      { id: 'L3', description: 'Steel Column HSS 8x8', quantity: 24, unit: 'EA', unitPrice: 1250, totalPrice: 30000, delivered: 16, remaining: 8 },
      { id: 'L4', description: 'Base Plates 12"x12"', quantity: 48, unit: 'EA', unitPrice: 185, totalPrice: 8880, delivered: 32, remaining: 16 },
      { id: 'L5', description: 'Anchor Bolts 3/4"', quantity: 200, unit: 'EA', unitPrice: 25, totalPrice: 5000, delivered: 200, remaining: 0 },
      { id: 'L6', description: 'Shear Studs 3/4"x4"', quantity: 1000, unit: 'EA', unitPrice: 8.50, totalPrice: 8500, delivered: 600, remaining: 400 },
      { id: 'L7', description: 'Connection Hardware Kit', quantity: 50, unit: 'SET', unitPrice: 450, totalPrice: 22500, delivered: 35, remaining: 15 },
      { id: 'L8', description: 'High-Strength Bolts A325', quantity: 2000, unit: 'EA', unitPrice: 4.50, totalPrice: 9000, delivered: 1500, remaining: 500 },
      { id: 'L9', description: 'Steel Decking 3" Composite', quantity: 5000, unit: 'SF', unitPrice: 3.50, totalPrice: 17500, delivered: 3000, remaining: 2000 },
      { id: 'L10', description: 'Shop Drawings & Engineering', quantity: 1, unit: 'LS', unitPrice: 620, totalPrice: 620, delivered: 1, remaining: 0 },
    ],
    deliveries: [
      { id: 'DEL-004', date: '2024-11-28', bolNumber: 'BOL-S1234', itemsDelivered: 5, status: 'Verified' },
      { id: 'DEL-005', date: '2024-12-05', bolNumber: 'BOL-S1289', itemsDelivered: 4, status: 'Pending' },
    ],
    invoices: [
      { id: 'INV-2024-2001', date: '2024-11-30', amount: 125000, status: 'Approved' },
      { id: 'INV-2024-2045', date: '2024-12-06', amount: 95000, status: 'Pending' },
    ],
  },
  'PO-2024-003': {
    id: 'PO-2024-003',
    poNumber: 'PO-2024-003',
    vendor: 'BuildRight Materials',
    vendorAddress: '910 Builder Lane, Austin, TX 78701',
    vendorContact: 'Robert Chen',
    vendorPhone: '(512) 555-0789',
    vendorEmail: 'rchen@buildright.com',
    projectId: 'alpha',
    projectName: 'Clemson-210 Keowee Trl',
    amount: 89000,
    status: 'Completed',
    dateIssued: '2024-10-28',
    dateRequired: '2024-11-15',
    paymentTerms: 'Net 30',
    description: 'Formwork materials for foundation',
    lineItems: [
      { id: 'L1', description: 'Plywood Forms 3/4" HDO', quantity: 200, unit: 'SHT', unitPrice: 125, totalPrice: 25000, delivered: 200, remaining: 0 },
      { id: 'L2', description: 'Aluminum Beam 8"', quantity: 150, unit: 'LF', unitPrice: 180, totalPrice: 27000, delivered: 150, remaining: 0 },
      { id: 'L3', description: 'Shore Post Heavy Duty', quantity: 100, unit: 'EA', unitPrice: 85, totalPrice: 8500, delivered: 100, remaining: 0 },
      { id: 'L4', description: 'Form Ties 18"', quantity: 500, unit: 'EA', unitPrice: 12, totalPrice: 6000, delivered: 500, remaining: 0 },
      { id: 'L5', description: 'Snap Ties', quantity: 1000, unit: 'EA', unitPrice: 3.50, totalPrice: 3500, delivered: 1000, remaining: 0 },
      { id: 'L6', description: 'Walers 2x4 Lumber', quantity: 500, unit: 'LF', unitPrice: 4, totalPrice: 2000, delivered: 500, remaining: 0 },
      { id: 'L7', description: 'Strongbacks 2x6', quantity: 300, unit: 'LF', unitPrice: 6, totalPrice: 1800, delivered: 300, remaining: 0 },
      { id: 'L8', description: 'Form Oil', quantity: 50, unit: 'GAL', unitPrice: 42, totalPrice: 2100, delivered: 50, remaining: 0 },
      { id: 'L9', description: 'Chamfer Strip', quantity: 500, unit: 'LF', unitPrice: 2.20, totalPrice: 1100, delivered: 500, remaining: 0 },
      { id: 'L10', description: 'Delivery & Setup', quantity: 1, unit: 'LS', unitPrice: 12000, totalPrice: 12000, delivered: 1, remaining: 0 },
    ],
    deliveries: [
      { id: 'DEL-006', date: '2024-11-01', bolNumber: 'BOL-BR001', itemsDelivered: 6, status: 'Verified' },
      { id: 'DEL-007', date: '2024-11-08', bolNumber: 'BOL-BR015', itemsDelivered: 4, status: 'Verified' },
    ],
    invoices: [
      { id: 'INV-2024-3001', date: '2024-11-05', amount: 45000, status: 'Paid' },
      { id: 'INV-2024-3012', date: '2024-11-12', amount: 44000, status: 'Paid' },
    ],
  },
  'PO-2024-004': {
    id: 'PO-2024-004',
    poNumber: 'PO-2024-004',
    vendor: 'Premier Equipment Rental',
    vendorAddress: '2345 Rental Road, Fort Worth, TX 76101',
    vendorContact: 'Sarah Johnson',
    vendorPhone: '(817) 555-0321',
    vendorEmail: 'sjohnson@premierequip.com',
    projectId: 'alpha',
    projectName: 'Clemson-210 Keowee Trl',
    amount: 56000,
    status: 'Active',
    dateIssued: '2024-12-01',
    dateRequired: '2025-01-31',
    paymentTerms: 'Net 30',
    description: 'Equipment rental for concrete placement',
    lineItems: [
      { id: 'L1', description: 'Concrete Pump Truck - Daily', quantity: 20, unit: 'DAY', unitPrice: 1200, totalPrice: 24000, delivered: 8, remaining: 12 },
      { id: 'L2', description: 'Power Trowel 48"', quantity: 30, unit: 'DAY', unitPrice: 150, totalPrice: 4500, delivered: 12, remaining: 18 },
      { id: 'L3', description: 'Concrete Vibrator', quantity: 40, unit: 'DAY', unitPrice: 75, totalPrice: 3000, delivered: 15, remaining: 25 },
      { id: 'L4', description: 'Laser Screed', quantity: 15, unit: 'DAY', unitPrice: 850, totalPrice: 12750, delivered: 5, remaining: 10 },
      { id: 'L5', description: 'Bull Float & Handles', quantity: 30, unit: 'DAY', unitPrice: 45, totalPrice: 1350, delivered: 12, remaining: 18 },
      { id: 'L6', description: 'Concrete Blankets', quantity: 50, unit: 'EA', unitPrice: 85, totalPrice: 4250, delivered: 50, remaining: 0 },
      { id: 'L7', description: 'Generator 20KW', quantity: 30, unit: 'DAY', unitPrice: 185, totalPrice: 5550, delivered: 10, remaining: 20 },
      { id: 'L8', description: 'Light Tower', quantity: 10, unit: 'DAY', unitPrice: 60, totalPrice: 600, delivered: 3, remaining: 7 },
    ],
    deliveries: [
      { id: 'DEL-008', date: '2024-12-02', bolNumber: 'BOL-EQ001', itemsDelivered: 3, status: 'Verified' },
    ],
    invoices: [
      { id: 'INV-2024-4001', date: '2024-12-05', amount: 18000, status: 'Pending' },
    ],
  },
};

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const po = poDetails[id];

  if (!po) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-800">PO Not Found</h2>
          <p className="text-slate-500 mt-2">The purchase order you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalOrdered = po.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDeliveredValue = po.lineItems.reduce((sum, item) => sum + (item.delivered / item.quantity) * item.totalPrice, 0);
  const totalRemainingValue = totalOrdered - totalDeliveredValue;
  const deliveryProgress = (totalDeliveredValue / totalOrdered) * 100;

  const totalInvoiced = po.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = po.invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const completedItems = po.lineItems.filter(item => item.remaining === 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <span>›</span>
        <Link href={`/project/${po.projectId}`} className="hover:text-slate-700">{po.projectName}</Link>
        <span>›</span>
        <span className="text-slate-800 font-medium">{po.poNumber}</span>
      </nav>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{po.poNumber}</h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                po.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                po.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                po.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {po.status}
              </span>
            </div>
            <p className="text-slate-600 mb-4">{po.description}</p>
            
            {/* Key Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Issued</p>
                <p className="font-medium text-slate-800">{po.dateIssued}</p>
              </div>
              <div>
                <p className="text-slate-500">Required By</p>
                <p className="font-medium text-slate-800">{po.dateRequired}</p>
              </div>
              <div>
                <p className="text-slate-500">Payment Terms</p>
                <p className="font-medium text-slate-800">{po.paymentTerms}</p>
              </div>
              <div>
                <p className="text-slate-500">Project</p>
                <Link href={`/project/${po.projectId}`} className="font-medium text-blue-600 hover:underline">
                  {po.projectName}
                </Link>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 rounded-lg px-5 py-4 text-center min-w-[120px]">
              <p className="text-xs text-slate-500 uppercase tracking-wider">PO Value</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(po.amount)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg px-5 py-4 text-center min-w-[120px]">
              <p className="text-xs text-emerald-600 uppercase tracking-wider">Delivered</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{deliveryProgress.toFixed(0)}%</p>
            </div>
            <div className="bg-blue-50 rounded-lg px-5 py-4 text-center min-w-[120px]">
              <p className="text-xs text-blue-600 uppercase tracking-wider">Invoiced</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totalInvoiced)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg px-5 py-4 text-center min-w-[120px]">
              <p className="text-xs text-emerald-600 uppercase tracking-wider">Paid</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor & Delivery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Info */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div>
              <p className="font-semibold text-lg text-slate-800">{po.vendor}</p>
              <p className="text-sm text-slate-500 mt-1">{po.vendorAddress}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-slate-600">{po.vendorContact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-slate-600">{po.vendorPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-600">{po.vendorEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Progress */}
        <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Delivery Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Overall Delivery Progress</span>
                <span className="font-semibold text-slate-800">{deliveryProgress.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase">Total Items</p>
                <p className="text-lg font-bold text-slate-800">{po.lineItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Completed</p>
                <p className="text-lg font-bold text-emerald-600">{completedItems}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Value Delivered</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(totalDeliveredValue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Value Remaining</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(totalRemainingValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Line Items</CardTitle>
            <span className="text-sm text-slate-500">{po.lineItems.length} items</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Delivered</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Remaining</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">Progress</th>
                </tr>
              </thead>
              <tbody>
                {po.lineItems.map((item, index) => {
                  const deliveryPercent = (item.delivered / item.quantity) * 100;
                  const isComplete = item.remaining === 0;
                  
                  return (
                    <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isComplete ? 'bg-emerald-50/30' : ''}`}>
                      <td className="py-3 px-4 text-sm font-medium text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-slate-800 font-medium">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-right text-slate-800">{item.quantity.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-center text-slate-500">{item.unit}</td>
                      <td className="py-3 px-4 text-sm text-right text-slate-800">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-slate-800">{formatCurrency(item.totalPrice)}</td>
                      <td className="py-3 px-4 text-sm text-right text-emerald-600 font-medium">{item.delivered.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${isComplete ? 'text-slate-400' : 'text-amber-600'}`}>
                        {item.remaining.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {isComplete ? (
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Complete
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${deliveryPercent}%` }} 
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-10 text-right">{deliveryPercent.toFixed(0)}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold">
                  <td colSpan={5} className="py-3 px-4 text-sm text-slate-800 text-right">Total PO Value</td>
                  <td className="py-3 px-4 text-sm text-right text-slate-800">{formatCurrency(totalOrdered)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliveries */}
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Deliveries
              </CardTitle>
              <span className="text-sm text-slate-500">{po.deliveries.length} shipments</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Delivery</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">BOL #</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Items</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {po.deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link href={`/delivery/${delivery.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {delivery.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{delivery.date}</td>
                      <td className="py-3 px-4 text-sm font-mono text-slate-800">{delivery.bolNumber}</td>
                      <td className="py-3 px-4 text-sm text-center text-slate-800">{delivery.itemsDelivered}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          delivery.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Invoices
              </CardTitle>
              <span className="text-sm text-slate-500">{po.invoices.length} invoices</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Invoice #</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {po.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{invoice.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{invoice.date}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-slate-800">{formatCurrency(invoice.amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          invoice.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={2} className="py-3 px-4 text-sm text-slate-800 text-right">Total Invoiced</td>
                    <td className="py-3 px-4 text-sm text-right text-slate-800">{formatCurrency(totalInvoiced)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Project
        </Button>
      </div>
    </div>
  );
}

