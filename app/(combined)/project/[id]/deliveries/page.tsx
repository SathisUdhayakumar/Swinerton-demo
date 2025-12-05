'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DeliveryCard } from '@/components/dashboard/DeliveryCard';
import { Delivery, SSEDeliveryEvent } from '@/types';

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

export default function ProjectDeliveriesPage({ params }: PageProps) {
  const { id } = use(params);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'review'>('all');

  const project = projects[id];

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const deliveriesRes = await fetch('/api/deliveries');
      const deliveriesData = await deliveriesRes.json();

      if (deliveriesData.success) {
        const filteredDeliveries = deliveriesData.data.filter((d: Delivery) => d.projectId === id);
        setDeliveries(filteredDeliveries);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Subscribe to SSE stream
  useEffect(() => {
    fetchData();

    const deliverySource = new EventSource('/api/deliveries/stream');

    deliverySource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    deliverySource.addEventListener('delivery', (event) => {
      const data: SSEDeliveryEvent = JSON.parse(event.data);
      setLastUpdate(new Date().toLocaleTimeString());

      if (data.delivery.projectId !== id) return;

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
      setIsConnected(false);
      setTimeout(() => fetchData(), 3000);
    };

    return () => {
      deliverySource.close();
    };
  }, [fetchData, id]);

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'verified') return d.status === 'verified' || d.status === 'approved';
    if (statusFilter === 'pending') return d.status === 'pending_approval';
    if (statusFilter === 'review') return d.status === 'needs_review' || d.status === 'unmatched';
    return true;
  });

  // Stats
  const stats = {
    total: deliveries.length,
    verified: deliveries.filter((d) => d.status === 'verified' || d.status === 'approved').length,
    pending: deliveries.filter((d) => d.status === 'pending_approval').length,
    review: deliveries.filter((d) => d.status === 'needs_review' || d.status === 'unmatched').length,
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
        <span className="text-slate-800 font-medium">Deliveries</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deliveries</h1>
          <p className="text-slate-500 mt-1">{project.name} - Real-time deliveries from site team</p>
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
            <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Verified</p>
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
          {(['all', 'verified', 'pending', 'review'] as const).map((status) => (
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

      {/* Deliveries Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">No deliveries found</p>
            <p className="text-slate-400 text-sm mt-1">Site team can upload BOLs via the workflow</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

