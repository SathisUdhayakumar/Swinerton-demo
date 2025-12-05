'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeliveryCard } from '@/components/dashboard/DeliveryCard';
import { Delivery, SSEDeliveryEvent } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BOLvsPOCompare } from '@/components/compare/BOLvsPOCompare';

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
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'review'>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!selectedDelivery) {
      setShowDeleteConfirm(false);
      return;
    }

    const deliveryToDelete = selectedDelivery;
    setIsDeleting(true);
    setDeleteError(null);

    // Optimistically remove from UI immediately
    setDeliveries((prev) => prev.filter((d) => d.id !== deliveryToDelete.id));
    
    // Close modals immediately
    setShowDeleteConfirm(false);
    setIsDeliveryModalOpen(false);
    setSelectedDelivery(null);

    try {
      const response = await fetch(`/api/deliveries/${deliveryToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      // If it's a 404 (not found), that's okay - we've already removed it from UI
      // Only treat other errors as failures
      if (!response.ok && response.status !== 404) {
        throw new Error(data.error || `HTTP ${response.status}: Delete failed`);
      }

      if (!data.success && data.error && !data.error.includes('not found')) {
        throw new Error(data.error || 'Delete failed');
      }

      // Success - delivery already removed from UI
      setDeleteError(null);
      // The SSE event will also update the list, but we've already removed it optimistically
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      
      // Only restore and show error for real failures (not 404/not found)
      if (!errorMessage.includes('not found') && !errorMessage.includes('404')) {
        // Restore the delivery to the list
        setDeliveries((prev) => {
          const exists = prev.find((d) => d.id === deliveryToDelete.id);
          if (!exists) {
            return [deliveryToDelete, ...prev];
          }
          return prev;
        });
        setDeleteError(errorMessage);
        // Re-open the confirmation dialog to show error
        setShowDeleteConfirm(true);
        setSelectedDelivery(deliveryToDelete);
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => router.push(`/project/${id}?tab=po`)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">BOL</h1>
            <p className="text-slate-500 mt-1">{project.name} - Real-time deliveries from site team</p>
          </div>
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
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onClick={() => {
                  setSelectedDelivery(delivery);
                  setIsDeliveryModalOpen(true);
                }}
                onDelete={(delivery) => {
                  setSelectedDelivery(delivery);
                  setShowDeleteConfirm(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto p-6" style={{ maxWidth: '95vw', width: '95vw' }}>
          {selectedDelivery && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Delivery: {selectedDelivery.bolNumber}
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

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDeliveryModalOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>

                {/* Delete Error */}
                {deleteError && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-700 font-medium">Error</p>
                      <p className="text-red-600 text-sm">{deleteError}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteConfirm} 
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteConfirm(false);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="!max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Delete Delivery?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              This will permanently delete the delivery record for {selectedDelivery?.bolNumber}. All linked information including BOL details, PO matches, and line items will be removed. This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-600"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

