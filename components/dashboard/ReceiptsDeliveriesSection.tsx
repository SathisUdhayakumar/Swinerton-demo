'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReceiptCard } from '@/components/dashboard/ReceiptCard';
import { DeliveryCard } from '@/components/dashboard/DeliveryCard';
import { Receipt, Delivery, SSEReceiptEvent, SSEDeliveryEvent } from '@/types';

type ViewMode = 'all' | 'receipts' | 'deliveries';
type StatusFilter = 'all' | 'logged' | 'verified' | 'pending' | 'review';

interface ReceiptsDeliveriesSectionProps {
  projectId?: string;
  projectName?: string;
}

export function ReceiptsDeliveriesSection({ projectId, projectName }: ReceiptsDeliveriesSectionProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isReceiptsConnected, setIsReceiptsConnected] = useState(false);
  const [isDeliveriesConnected, setIsDeliveriesConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [receiptsRes, deliveriesRes] = await Promise.all([
        fetch('/api/receipts'),
        fetch('/api/deliveries'),
      ]);

      const [receiptsData, deliveriesData] = await Promise.all([
        receiptsRes.json(),
        deliveriesRes.json(),
      ]);

      if (receiptsData.success) {
        // Filter by projectId if provided
        const filteredReceipts = projectId 
          ? receiptsData.data.filter((r: Receipt) => r.projectId === projectId)
          : receiptsData.data;
        setReceipts(filteredReceipts);
      }
      
      if (deliveriesData.success) {
        // Filter by projectId if provided
        const filteredDeliveries = projectId
          ? deliveriesData.data.filter((d: Delivery) => d.projectId === projectId)
          : deliveriesData.data;
        setDeliveries(filteredDeliveries);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Subscribe to SSE streams
  useEffect(() => {
    fetchData();

    // Receipts SSE
    const receiptSource = new EventSource('/api/receipts/stream');
    
    receiptSource.addEventListener('connected', () => {
      setIsReceiptsConnected(true);
    });

    receiptSource.addEventListener('receipt', (event) => {
      const data: SSEReceiptEvent = JSON.parse(event.data);
      setLastUpdate(new Date().toLocaleTimeString());

      // Only process if matches projectId filter (or no filter)
      if (projectId && data.receipt.projectId !== projectId) return;

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
      setIsReceiptsConnected(false);
      setTimeout(() => fetchData(), 3000);
    };

    // Deliveries SSE
    const deliverySource = new EventSource('/api/deliveries/stream');

    deliverySource.addEventListener('connected', () => {
      setIsDeliveriesConnected(true);
    });

    deliverySource.addEventListener('delivery', (event) => {
      const data: SSEDeliveryEvent = JSON.parse(event.data);
      setLastUpdate(new Date().toLocaleTimeString());

      // Only process if matches projectId filter (or no filter)
      if (projectId && data.delivery.projectId !== projectId) return;

      if (data.type === 'created') {
        setDeliveries((prev) => [data.delivery, ...prev]);
      } else if (data.type === 'updated') {
        setDeliveries((prev) =>
          prev.map((d) => (d.id === data.delivery.id ? data.delivery : d))
        );
      } else if (data.type === 'deleted') {
        setDeliveries((prev) => prev.filter((d) => d.id !== data.delivery.id));
      }
    });

    deliverySource.onerror = () => {
      setIsDeliveriesConnected(false);
      setTimeout(() => fetchData(), 3000);
    };

    return () => {
      receiptSource.close();
      deliverySource.close();
    };
  }, [fetchData, projectId]);

  // Filter data
  const filteredReceipts = receipts.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'logged') return r.status === 'logged' || r.status === 'approved';
    if (statusFilter === 'pending') return r.status === 'pending_approval';
    if (statusFilter === 'review') return r.status === 'needs_review';
    return true;
  });

  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'verified') return d.status === 'verified' || d.status === 'approved';
    if (statusFilter === 'pending') return d.status === 'pending_approval';
    if (statusFilter === 'review') return d.status === 'needs_review' || d.status === 'unmatched';
    return true;
  });

  // Stats
  const stats = {
    receipts: {
      total: receipts.length,
      logged: receipts.filter((r) => r.status === 'logged' || r.status === 'approved').length,
      pending: receipts.filter((r) => r.status === 'pending_approval').length,
      review: receipts.filter((r) => r.status === 'needs_review').length,
    },
    deliveries: {
      total: deliveries.length,
      verified: deliveries.filter((d) => d.status === 'verified' || d.status === 'approved').length,
      pending: deliveries.filter((d) => d.status === 'pending_approval').length,
      review: deliveries.filter((d) => d.status === 'needs_review' || d.status === 'unmatched').length,
    },
  };

  const isConnected = isReceiptsConnected && isDeliveriesConnected;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {projectName ? `${projectName} - Receipts & Deliveries` : 'Receipts & Deliveries'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-500">Real-time transactions</p>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-400">{isConnected ? 'Live' : 'Reconnecting...'}</span>
                {lastUpdate && <span className="text-xs text-slate-400">• {lastUpdate}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/capture-receipt">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800">
                + Add Receipt
              </Button>
            </Link>
            <Link href="/capture-bol">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800">
                + Add BOL
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.receipts.total}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Receipts</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{stats.receipts.logged}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Logged</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.deliveries.total}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Deliveries</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{stats.deliveries.verified}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Verified</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{stats.receipts.pending + stats.deliveries.pending}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.receipts.review + stats.deliveries.review}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Review</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'receipts', 'deliveries'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'logged', 'verified', 'pending', 'review'] as StatusFilter[]).map((status) => (
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

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Receipts Section */}
            {(viewMode === 'all' || viewMode === 'receipts') && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  <h3 className="text-base font-semibold text-slate-700">
                    Receipts
                    <span className="text-sm text-slate-400 font-normal ml-2">({filteredReceipts.length})</span>
                  </h3>
                </div>
                {filteredReceipts.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 text-sm">No receipts found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReceipts.map((receipt) => (
                      <ReceiptCard key={receipt.id} receipt={receipt} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deliveries Section */}
            {(viewMode === 'all' || viewMode === 'deliveries') && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-base font-semibold text-slate-700">
                    Deliveries
                    <span className="text-sm text-slate-400 font-normal ml-2">({filteredDeliveries.length})</span>
                  </h3>
                </div>
                {filteredDeliveries.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 text-sm">No deliveries found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDeliveries.map((delivery) => (
                      <DeliveryCard key={delivery.id} delivery={delivery} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

