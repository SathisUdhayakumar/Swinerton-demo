'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ReceiptCard } from '@/components/dashboard/ReceiptCard';
import { Receipt, SSEReceiptEvent } from '@/types';

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
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

