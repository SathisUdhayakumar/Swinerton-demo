'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ReceiptCard } from '@/components/dashboard/ReceiptCard';
import { Receipt, SSEReceiptEvent } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

const projects: Record<string, { id: string; name: string }> = {
  'alpha': {
    id: 'alpha',
    name: 'Clemson-210 Keowee Trl',
  },
  'beta': {
    id: 'beta',
    name: 'DFW Terminal F',
  },
};

export default function ProjectReceiptsPage({ params }: PageProps) {
  const { id } = use(params);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'logged' | 'pending' | 'review'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const project = projects[id];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const receiptsRes = await fetch('/api/receipts');
      const receiptsData = await receiptsRes.json();

      if (receiptsData.success) {
        const filteredReceipts = receiptsData.data.filter((r: Receipt) => r.projectId === id);
        setReceipts(filteredReceipts);
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Subscribe to SSE stream
  useEffect(() => {
    fetchData();

    const receiptSource = new EventSource('/api/receipts/stream');
    
    receiptSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    receiptSource.addEventListener('receipt', (event) => {
      const data: SSEReceiptEvent = JSON.parse(event.data);
      setLastUpdate(new Date().toLocaleTimeString());

      if (data.receipt.projectId !== id) return;

      if (data.type === 'created') {
        setReceipts((prev) => [data.receipt, ...prev]);
      } else if (data.type === 'updated') {
        setReceipts((prev) =>
          prev.map((r) => (r.id === data.receipt.id ? data.receipt : r))
        );
      } else if (data.type === 'deleted') {
        setReceipts((prev) => prev.filter((r) => r.id !== data.receipt.id));
      }
    });

    receiptSource.onerror = () => {
      setIsConnected(false);
      setTimeout(() => fetchData(), 3000);
    };

    return () => {
      receiptSource.close();
    };
  }, [fetchData, id]);

  // Filter receipts
  const filteredReceipts = receipts.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'logged') return r.status === 'logged' || r.status === 'approved';
    if (statusFilter === 'pending') return r.status === 'pending_approval';
    if (statusFilter === 'review') return r.status === 'needs_review';
    return true;
  });

  // Stats
  const stats = {
    total: receipts.length,
    logged: receipts.filter((r) => r.status === 'logged' || r.status === 'approved').length,
    pending: receipts.filter((r) => r.status === 'pending_approval').length,
    review: receipts.filter((r) => r.status === 'needs_review').length,
  };

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-800">Project Not Found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link>
        <span>›</span>
        <Link href={`/project/${id}`} className="hover:text-slate-700">{project.name}</Link>
        <span>›</span>
        <span className="text-slate-800 font-medium">Receipts</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Receipts</h1>
          <p className="text-slate-500 mt-1">{project.name} - Real-time receipts from site team</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-500">{isConnected ? 'Live' : 'Reconnecting...'}</span>
          {lastUpdate && <span className="text-slate-400">• {lastUpdate}</span>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{stats.logged}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Logged</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.review}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Review</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'logged', 'pending', 'review'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">No receipts found</p>
            <p className="text-slate-400 text-sm mt-1">Site team can upload receipts via the workflow</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onClick={() => {
                  setSelectedReceipt(receipt);
                  setIsReceiptModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Receipt Details Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-6" style={{ maxWidth: '95vw', width: '95vw' }}>
          {selectedReceipt && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Receipt Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Receipt Image */}
                {selectedReceipt.imageUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Receipt Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={selectedReceipt.imageUrl}
                        alt="Receipt"
                        className="max-w-full h-auto rounded-lg border border-slate-200"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Receipt Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Receipt Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Merchant</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedReceipt.merchant}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="text-sm text-slate-700">{selectedReceipt.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedReceipt.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                          selectedReceipt.status === 'logged' || selectedReceipt.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          selectedReceipt.status === 'needs_review'
                            ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          selectedReceipt.status === 'pending_approval'
                            ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {selectedReceipt.status === 'logged' ? 'Logged' :
                           selectedReceipt.status === 'approved' ? 'Approved' :
                           selectedReceipt.status === 'needs_review' ? 'Needs Review' :
                           selectedReceipt.status === 'pending_approval' ? 'Pending' :
                           selectedReceipt.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Project</p>
                        <p className="text-sm text-slate-700">{selectedReceipt.projectName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Cost Code</p>
                        <p className="text-sm text-slate-700">{selectedReceipt.costCodeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                selectedReceipt.confidence >= 0.9 ? 'bg-emerald-500' :
                                selectedReceipt.confidence >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedReceipt.confidence * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            selectedReceipt.confidence >= 0.9 ? 'text-emerald-600' :
                            selectedReceipt.confidence >= 0.8 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {(selectedReceipt.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Items Count</p>
                        <p className="text-sm text-slate-700">{selectedReceipt.items?.length || 0} items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Items */}
                {selectedReceipt.items && selectedReceipt.items.length > 0 && (
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
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReceipt.items.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 px-3 text-sm text-slate-700">{item.description || 'N/A'}</td>
                                <td className="py-2 px-3 text-sm text-right text-slate-600 whitespace-nowrap">{item.quantity || '-'}</td>
                                <td className="py-2 px-3 text-sm text-right text-slate-600 whitespace-nowrap">{item.unitPrice ? formatCurrency(item.unitPrice) : '-'}</td>
                                <td className="py-2 px-3 text-sm text-right text-slate-900 font-medium whitespace-nowrap">{item.total ? formatCurrency(item.total) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                        <p className="text-xs text-slate-500">Receipt ID</p>
                        <p className="text-sm text-slate-700 font-mono">{selectedReceipt.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Created At</p>
                        <p className="text-sm text-slate-700">
                          {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      {selectedReceipt.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">Notes</p>
                          <p className="text-sm text-slate-700">{selectedReceipt.notes}</p>
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
    </div>
  );
}

