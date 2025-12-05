'use client';

import React, { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Delivery, ParsedReceipt, ProjectSuggestion, Project, CostCode } from '@/types';
import { MaterialTable } from '@/components/material/MaterialTable';
import { BOLvsPOCompare } from '@/components/compare/BOLvsPOCompare';
import { ReceiptUpload } from '@/components/capture/ReceiptUpload';
import { BOLUpload } from '@/components/capture/BOLUpload';
import { ReceiptPreviewModal } from '@/components/ui/ReceiptPreviewModal';
import { ParsedBOL, PurchaseOrder } from '@/types';

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

type TabId = 'materials' | 'po' | 'deliveries';

const tabs: { id: TabId; label: string }[] = [
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

// Budget data removed - no longer needed

// PO Details interface
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

// Mock PO details data (simplified - you can expand this)
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
    ],
    deliveries: [
      { id: 'DEL-001', date: '2024-11-20', bolNumber: 'BOL-78452', itemsDelivered: 4, status: 'Verified' },
      { id: 'DEL-002', date: '2024-11-25', bolNumber: 'BOL-78501', itemsDelivered: 3, status: 'Verified' },
    ],
    invoices: [
      { id: 'INV-2024-1001', date: '2024-11-22', amount: 45000, status: 'Paid' },
      { id: 'INV-2024-1045', date: '2024-11-28', amount: 32000, status: 'Approved' },
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
    ],
    deliveries: [
      { id: 'DEL-004', date: '2024-11-28', bolNumber: 'BOL-S1234', itemsDelivered: 5, status: 'Verified' },
    ],
    invoices: [
      { id: 'INV-2024-2001', date: '2024-11-30', amount: 125000, status: 'Approved' },
    ],
  },
};

// Mock PO data - expanded list
const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-001', poNumber: 'PO-2024-001', vendor: 'ABC Concrete Supply', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-15', end: '2024-12-15' }, lines: [], status: 'open', createdAt: '2024-11-15T10:00:00Z' },
  { id: 'PO-2024-002', poNumber: 'PO-2024-002', vendor: 'Steel Solutions Inc', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-20', end: '2024-12-20' }, lines: [], status: 'open', createdAt: '2024-11-20T14:30:00Z' },
  { id: 'PO-2024-003', poNumber: 'PO-2024-003', vendor: 'Material Works Co', project: 'Clemson-210 Keowee Trl', projectId: 'alpha', deliveryWindow: { start: '2024-11-25', end: '2024-12-25' }, lines: [
    { id: 'po-line-003-001', description: 'Steel Beams W12x26', qty: 100, unit: 'EA', unitPrice: 125.00 },
    { id: 'po-line-003-002', description: 'Steel Bolts 3/4" x 3"', qty: 500, unit: 'EA', unitPrice: 2.50 },
  ], status: 'open', createdAt: '2024-11-25T09:00:00Z' },
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
  
  // Get initial tab from URL search params, default to 'materials' if no param
  const tabFromUrl = searchParams?.get('tab') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'materials');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isDeliveriesLoading, setIsDeliveriesLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PODetail | null>(null);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set());
  const [ripplePOId, setRipplePOId] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [receiptSuggestion, setReceiptSuggestion] = useState<ProjectSuggestion | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [receiptProjects, setReceiptProjects] = useState<Project[]>([]);
  const [selectedReceiptProject, setSelectedReceiptProject] = useState<string>(id);
  const [selectedReceiptCostCode, setSelectedReceiptCostCode] = useState<string>('');
  const [isProcessingBOL, setIsProcessingBOL] = useState(false);
  const [parsedBOL, setParsedBOL] = useState<ParsedBOL | null>(null);
  const [matchedPO, setMatchedPO] = useState<PurchaseOrder | null>(null);
  const [bolMatchScore, setBolMatchScore] = useState<number>(0);
  const [bolError, setBolError] = useState<string | null>(null);
  const [isMatchingBOL, setIsMatchingBOL] = useState(false);
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);

  // Update tab when URL search params change
  useEffect(() => {
    if (tabFromUrl && ['materials', 'po', 'deliveries'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      // If no tab param, default to materials
      setActiveTab('materials');
    }
  }, [tabFromUrl]);

  const project = projects[id];
  const projectPOs = purchaseOrders.filter(po => po.projectId === id);

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
      
      // If a new delivery is created and linked to a PO, show ripple effect
      if (data.type === 'created' && data.delivery.poId && data.delivery.projectId === id) {
        setRipplePOId(data.delivery.poId);
        // Remove ripple after animation completes
        setTimeout(() => setRipplePOId(null), 2000);
      }
      if (data.delivery && data.delivery.projectId === id) {
        if (data.type === 'created') {
          setDeliveries((prev) => [data.delivery, ...prev]);
        } else if (data.type === 'updated') {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === data.delivery.id ? data.delivery : d))
          );
        } else if (data.type === 'deleted') {
          // Remove the deleted delivery from state
          setDeliveries((prev) => {
            const filtered = prev.filter((d) => d.id !== data.delivery.id);
            // If the deleted delivery was linked to a PO, clear any expanded state for that PO
            if (data.delivery.poId || data.delivery.poNumber) {
              // The count will automatically update since it's calculated from the filtered deliveries
            }
            return filtered;
          });
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

  // Receipt upload handler
  const handleReceiptUpload = async (fileOrUrl: File | string) => {
    setIsProcessingReceipt(true);
    setReceiptError(null);
    setParsedReceipt(null);
    setReceiptSuggestion(null);

    try {
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }

      // OCR
      const ocrResponse = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const ocrData = await ocrResponse.json();

      if (!ocrData.success || ocrData.type !== 'receipt') {
        throw new Error('Failed to process receipt');
      }

      setParsedReceipt(ocrData.parsedReceipt);

      // Get suggestion
      const suggestResponse = await fetch('/api/mock/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: ocrData.parsedReceipt.merchant }),
      });
      const suggestData = await suggestResponse.json();

      if (suggestData.success) {
        setReceiptSuggestion(suggestData.suggestion);
        // Default to current project if suggestion matches, otherwise use suggestion
        setSelectedReceiptProject(suggestData.suggestion.projectId || id);
        setSelectedReceiptCostCode(suggestData.suggestion.costCodeId);
      } else {
        // Default to current project if no suggestion
        setSelectedReceiptProject(id);
      }

      // Fetch projects for manual selection
      setReceiptProjects([
        {
          id: 'alpha',
          name: 'Clemson-210 Keowee Trl',
          code: 'ALPHA-2025',
          budget: 500000,
          spent: 125000,
          costCodes: [
            { id: 'cc-001', code: '6100', description: 'Materials - General', budget: 100000, spent: 25000 },
            { id: 'cc-002', code: '6200', description: 'Materials - Steel', budget: 200000, spent: 75000 },
            { id: 'cc-003', code: '6300', description: 'Tools & Equipment', budget: 50000, spent: 15000 },
          ],
        },
        {
          id: 'beta',
          name: 'DFW Terminal F',
          code: 'BETA-2025',
          budget: 750000,
          spent: 180000,
          costCodes: [
            { id: 'cc-005', code: '6100', description: 'Materials - General', budget: 150000, spent: 45000 },
            { id: 'cc-006', code: '6200', description: 'Materials - Steel', budget: 300000, spent: 100000 },
          ],
        },
      ]);

      setShowReceiptPreview(true);
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleReceiptConfirm = async () => {
    if (!parsedReceipt || !selectedReceiptProject || !selectedReceiptCostCode) return;

    setIsSubmittingReceipt(true);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedReceipt,
          projectId: selectedReceiptProject,
          costCodeId: selectedReceiptCostCode,
        }),
      });

      const data = await response.json();

      if (data.status === 'duplicate') {
        setReceiptError('This receipt has already been submitted (duplicate detected)');
        setShowReceiptPreview(false);
        return;
      }

      if (data.success) {
        setIsReceiptModalOpen(false);
        setParsedReceipt(null);
        setShowReceiptPreview(false);
        setReceiptError(null);
        // Optionally refresh or show success message
      } else {
        setReceiptError(data.error || 'Failed to create receipt');
      }
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : 'Failed to save receipt');
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  // BOL upload handler
  const handleBOLUpload = async (fileOrUrl: File | string) => {
    setIsProcessingBOL(true);
    setBolError(null);
    setParsedBOL(null);
    setMatchedPO(null);

    try {
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }
      formData.append('documentType', 'bol');

      const response = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!data.success || data.type !== 'bol') {
        throw new Error('Failed to process BOL');
      }

      setParsedBOL(data.parsedBOL);

      // Auto-match to PO
      handleMatchBOLToPO(data.parsedBOL);
    } catch (err) {
      setBolError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessingBOL(false);
    }
  };

  const handleMatchBOLToPO = async (bol: ParsedBOL) => {
    setIsMatchingBOL(true);
    try {
      const response = await fetch('/api/mock/bol/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedBOL: bol }),
      });
      const data = await response.json();

      if (data.success && data.matched && data.matchResult) {
        setMatchedPO(data.matchResult.po);
        setBolMatchScore(data.matchResult.matchScore);
      }
    } catch (err) {
      console.error('Failed to match BOL:', err);
    } finally {
      setIsMatchingBOL(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!parsedBOL) return;

    setIsCreatingDelivery(true);
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedBOL,
          matchedPO: matchedPO || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsReceiptModalOpen(false);
        setParsedBOL(null);
        setMatchedPO(null);
        setBolError(null);
        // Refresh deliveries
        fetchDeliveries();
        
        // Show ripple effect on the linked PO
        if (matchedPO) {
          setRipplePOId(matchedPO.id);
          setTimeout(() => setRipplePOId(null), 2000);
        }
      } else {
        setBolError(data.error || 'Failed to create delivery');
      }
    } catch (err) {
      setBolError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setIsCreatingDelivery(false);
    }
  };

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
                View All BOL
              </Button>
            </div>
          )}
        </div>

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

        {/* PO Tab */}
        {activeTab === 'po' && (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Purchase Orders</h3>
                  <Button 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm px-3 py-1.5"
                    onClick={() => setIsReceiptModalOpen(true)}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    BOL
                  </Button>
                </div>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Deliveries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectPOs.map((po) => {
                        // Find deliveries linked to this PO
                        const linkedDeliveries = deliveries.filter(d => 
                          d.poNumber === po.poNumber || 
                          d.poId === po.id ||
                          (d.vendor === po.vendor && d.projectId === po.projectId)
                        );
                        const isExpanded = expandedPOs.has(po.id);
                        
                        return (
                          <React.Fragment key={po.id}>
                            <tr 
                              className={`border-b border-slate-100 hover:bg-slate-50 transition-all relative overflow-hidden ${
                                ripplePOId === po.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              {ripplePOId === po.id && (
                                <>
                                  <div className="absolute inset-0 bg-blue-200 opacity-20 animate-ping pointer-events-none" />
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse" />
                                </>
                              )}
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => {
                                    const poDetail = poDetails[po.id];
                                    if (poDetail) {
                                      setSelectedPO(poDetail);
                                      setIsPOModalOpen(true);
                                    }
                                  }}
                                  className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                >
                                  {po.poNumber || po.id}
                                </button>
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
                              <td className="py-3 px-4">
                                {linkedDeliveries.length === 0 ? (
                                  <span className="text-sm text-slate-400">0</span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedPOs);
                                      if (isExpanded) {
                                        newExpanded.delete(po.id);
                                      } else {
                                        newExpanded.add(po.id);
                                      }
                                      setExpandedPOs(newExpanded);
                                    }}
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                                  >
                                    <span className="font-medium text-blue-600 hover:underline">{linkedDeliveries.length}</span>
                                    <svg 
                                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            </tr>
                            {isExpanded && linkedDeliveries.length > 0 && (
                              <tr key={`${po.id}-deliveries`} className="bg-slate-50">
                                <td colSpan={6} className="py-4 px-4">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Linked Deliveries</h4>
                                    <div className="space-y-2">
                                      {linkedDeliveries.map((delivery) => (
                                        <div 
                                          key={delivery.id}
                                          className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <button
                                                onClick={() => {
                                                  setSelectedDelivery(delivery);
                                                  setIsDeliveryModalOpen(true);
                                                }}
                                                className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                              >
                                                {delivery.bolNumber}
                                              </button>
                                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                delivery.status === 'verified' || delivery.status === 'approved'
                                                  ? 'bg-emerald-100 text-emerald-700' :
                                                delivery.status === 'pending_approval'
                                                  ? 'bg-amber-100 text-amber-700' :
                                                'bg-orange-100 text-orange-700'
                                              }`}>
                                                {delivery.status === 'verified' ? 'Verified' :
                                                 delivery.status === 'approved' ? 'Approved' :
                                                 delivery.status === 'pending_approval' ? 'Pending' :
                                                 delivery.status}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                              <span>{delivery.deliveryDate}</span>
                                              <span>{delivery.lines.length} items</span>
                                              <span className="font-medium">
                                                Match: {(delivery.matchScore * 100).toFixed(0)}%
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {isExpanded && linkedDeliveries.length === 0 && (
                              <tr key={`${po.id}-no-deliveries`} className="bg-slate-50">
                                <td colSpan={6} className="py-4 px-4">
                                  <div className="text-center text-sm text-slate-500">
                                    No deliveries linked to this PO
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
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
                                <button
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setIsDeliveryModalOpen(true);
                                  }}
                                  className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                >
                                  {delivery.id}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-800 font-mono">{delivery.bolNumber}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">{delivery.vendor}</td>
                              <td className="py-3 px-4">
                                {matchedPO ? (
                                  <button
                                    onClick={() => {
                                      const poDetail = poDetails[matchedPO.id];
                                      if (poDetail) {
                                        setSelectedPO(poDetail);
                                        setIsPOModalOpen(true);
                                      }
                                    }}
                                    className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                  >
                                    {matchedPO.id}
                                  </button>
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

      {/* PO Details Modal */}
      <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-6" style={{ maxWidth: '95vw', width: '95vw' }}>
          {selectedPO && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {selectedPO.poNumber}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Vendor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vendor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{selectedPO.vendor}</p>
                      <p className="text-sm text-slate-600">{selectedPO.vendorAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500">Contact</p>
                        <p className="text-sm text-slate-700">{selectedPO.vendorContact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm text-slate-700">{selectedPO.vendorPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm text-slate-700">{selectedPO.vendorEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PO Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <p className={`text-sm font-semibold ${
                          selectedPO.status === 'Active' ? 'text-emerald-600' :
                          selectedPO.status === 'Completed' ? 'text-slate-600' :
                          'text-amber-600'
                        }`}>
                          {selectedPO.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Date Issued</p>
                        <p className="text-sm text-slate-700">{selectedPO.dateIssued}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Date Required</p>
                        <p className="text-sm text-slate-700">{selectedPO.dateRequired}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Payment Terms</p>
                        <p className="text-sm text-slate-700">{selectedPO.paymentTerms}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedPO.amount)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Description</p>
                        <p className="text-sm text-slate-700">{selectedPO.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Line Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Description</th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Quantity</th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Unit Price</th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Total</th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Delivered</th>
                            <th className="text-right py-2 px-3 text-sm font-medium text-slate-500 whitespace-nowrap">Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPO.lineItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-sm text-slate-700">{item.description}</td>
                              <td className="py-2 px-3 text-sm text-right text-slate-600 whitespace-nowrap">{item.quantity} {item.unit}</td>
                              <td className="py-2 px-3 text-sm text-right text-slate-600 whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-2 px-3 text-sm text-right text-slate-900 font-medium whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                              <td className="py-2 px-3 text-sm text-right text-emerald-600 whitespace-nowrap">{item.delivered}</td>
                              <td className="py-2 px-3 text-sm text-right text-slate-600 whitespace-nowrap">{item.remaining}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Deliveries */}
                {selectedPO.deliveries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPO.deliveries.map((delivery) => (
                          <div key={delivery.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{delivery.bolNumber}</p>
                              <p className="text-xs text-slate-500">{delivery.date} • {delivery.itemsDelivered} items</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              delivery.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {delivery.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Invoices */}
                {selectedPO.invoices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPO.invoices.map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{invoice.id}</p>
                              <p className="text-xs text-slate-500">{invoice.date} • {formatCurrency(invoice.amount)}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                              invoice.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delivery Details Modal */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-6" style={{ maxWidth: '95vw', width: '95vw' }}>
          {selectedDelivery && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {selectedDelivery.bolNumber}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">BOL Number</p>
                        <p className="text-sm font-semibold text-slate-700 font-mono">{selectedDelivery.bolNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Vendor</p>
                        <p className="text-sm text-slate-700">{selectedDelivery.vendor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Delivery Date</p>
                        <p className="text-sm text-slate-700">{selectedDelivery.deliveryDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                          selectedDelivery.status === 'verified' || selectedDelivery.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          selectedDelivery.status === 'pending_approval'
                            ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          selectedDelivery.status === 'needs_review' || selectedDelivery.status === 'unmatched'
                            ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {selectedDelivery.status === 'verified' ? 'Verified' :
                           selectedDelivery.status === 'approved' ? 'Approved' :
                           selectedDelivery.status === 'pending_approval' ? 'Pending' :
                           selectedDelivery.status === 'needs_review' ? 'Needs Review' :
                           selectedDelivery.status === 'unmatched' ? 'Unmatched' :
                           selectedDelivery.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">PO Number</p>
                        <p className="text-sm text-slate-700 font-mono">{selectedDelivery.poNumber || 'No PO'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Project</p>
                        <p className="text-sm text-slate-700">{selectedDelivery.project}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Match Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                selectedDelivery.matchScore >= 0.8 ? 'bg-emerald-500' :
                                selectedDelivery.matchScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedDelivery.matchScore * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            selectedDelivery.matchScore >= 0.8 ? 'text-emerald-600' :
                            selectedDelivery.matchScore >= 0.5 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {(selectedDelivery.matchScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">OCR Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                selectedDelivery.parsedBOL.confidence >= 0.9 ? 'bg-emerald-500' :
                                selectedDelivery.parsedBOL.confidence >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedDelivery.parsedBOL.confidence * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            selectedDelivery.parsedBOL.confidence >= 0.9 ? 'text-emerald-600' :
                            selectedDelivery.parsedBOL.confidence >= 0.8 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {(selectedDelivery.parsedBOL.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* BOL vs PO Comparison */}
                {selectedDelivery.lines && selectedDelivery.lines.length > 0 && (
                  <Card>
                    <CardContent className="p-0">
                      <BOLvsPOCompare
                        lines={selectedDelivery.lines}
                        bolNumber={selectedDelivery.bolNumber}
                        poNumber={selectedDelivery.poNumber}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Additional Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Delivery ID</p>
                        <p className="text-sm text-slate-700 font-mono">{selectedDelivery.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Created At</p>
                        <p className="text-sm text-slate-700">
                          {selectedDelivery.createdAt ? new Date(selectedDelivery.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      {selectedDelivery.approvedBy && (
                        <div>
                          <p className="text-xs text-slate-500">Approved By</p>
                          <p className="text-sm text-slate-700">{selectedDelivery.approvedBy}</p>
                        </div>
                      )}
                      {selectedDelivery.cmicDeliveryId && (
                        <div>
                          <p className="text-xs text-slate-500">CMiC Delivery ID</p>
                          <p className="text-sm text-slate-700 font-mono">{selectedDelivery.cmicDeliveryId}</p>
                        </div>
                      )}
                      {selectedDelivery.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">Notes</p>
                          <p className="text-sm text-slate-700">{selectedDelivery.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* BOL Capture Modal */}
      <Dialog open={isReceiptModalOpen && !parsedBOL} onOpenChange={(open) => {
        if (!open) {
          setIsReceiptModalOpen(false);
          setParsedBOL(null);
          setBolError(null);
          setMatchedPO(null);
        }
      }}>
        <DialogContent className="!max-w-2xl !w-[90vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Capture Bill of Lading
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* BOL Upload Component */}
            <BOLUpload key="bol-upload" onUpload={handleBOLUpload} isLoading={isProcessingBOL || isMatchingBOL} />

            {/* Error Message */}
            {bolError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{bolError}</p>
                </div>
              </div>
            )}

            {/* Workflow Info */}
            {!parsedBOL && (
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-medium text-slate-600 mb-3">Delivery Workflow</h3>
                <div className="space-y-3">
                  {[
                    { step: 1, label: 'Scan BOL document', icon: '📷' },
                    { step: 2, label: 'AI extracts line items', icon: '🤖' },
                    { step: 3, label: 'Auto-match to PO', icon: '🔗' },
                    { step: 4, label: 'Review quantities', icon: '📊' },
                    { step: 5, label: 'Create delivery record', icon: '✅' },
                  ].map(({ step, label, icon }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        {step}
                      </div>
                      <span className="text-slate-600 text-sm">{label}</span>
                      <span className="text-sm">{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* BOL Processing Result Modal */}
      {parsedBOL && (
        <Dialog open={!!parsedBOL} onOpenChange={(open) => {
          if (!open) {
            setParsedBOL(null);
            setMatchedPO(null);
            setIsReceiptModalOpen(false);
            setBolError(null);
          }
        }}>
          <DialogContent className="!max-w-4xl !w-[95vw] max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">BOL Processing Result</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* BOL Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">BOL Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">BOL Number</p>
                      <p className="text-sm font-semibold text-slate-700 font-mono">{parsedBOL.bolNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Vendor</p>
                      <p className="text-sm text-slate-700">{parsedBOL.vendor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Delivery Date</p>
                      <p className="text-sm text-slate-700">{parsedBOL.deliveryDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Confidence</p>
                      <p className="text-sm text-slate-700">{(parsedBOL.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PO Match Result */}
              {matchedPO && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Matched Purchase Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">PO Number:</span>
                        <span className="text-sm font-semibold text-slate-900">{matchedPO.poNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Vendor:</span>
                        <span className="text-sm text-slate-700">{matchedPO.vendor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Match Score:</span>
                        <span className="text-sm font-semibold text-emerald-600">{(bolMatchScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Line Items */}
              {parsedBOL.lines && parsedBOL.lines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Line Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Description</th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Quantity</th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedBOL.lines.map((line, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-sm text-slate-700">{line.description}</td>
                              <td className="py-2 px-3 text-sm text-slate-700 text-right">{line.qty}</td>
                              <td className="py-2 px-3 text-sm text-slate-500">{line.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-600"
                  onClick={() => {
                    setParsedBOL(null);
                    setMatchedPO(null);
                    setBolError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleCreateDelivery}
                  disabled={isCreatingDelivery}
                >
                  {isCreatingDelivery ? 'Accepting...' : 'Accept Delivery'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Receipt Preview Modal - Separate modal that opens after OCR */}
      {showReceiptPreview && parsedReceipt && (
        <ReceiptPreviewModal
          receipt={parsedReceipt}
          suggestion={receiptSuggestion || undefined}
          onConfirm={handleReceiptConfirm}
          onEdit={() => setShowReceiptPreview(false)}
          onClose={() => {
            setShowReceiptPreview(false);
            setParsedReceipt(null);
            setIsReceiptModalOpen(false);
            setReceiptError(null);
          }}
          isLoading={isSubmittingReceipt}
        />
      )}
    </div>
  );
}
