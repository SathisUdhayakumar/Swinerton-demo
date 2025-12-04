'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BOLvsPOCompare } from '@/components/compare/BOLvsPOCompare';
import { Delivery, DeliveryStatus, DeliveryAction } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const styles: Record<DeliveryStatus, string> = {
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
    needs_review: 'bg-orange-100 text-orange-700 border-orange-200',
    unmatched: 'bg-red-100 text-red-700 border-red-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };

  const labels: Record<DeliveryStatus, string> = {
    verified: 'Verified',
    approved: 'Approved',
    pending_approval: 'Pending Approval',
    needs_review: 'Needs Review',
    unmatched: 'Unmatched',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function DeliveryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<DeliveryAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDelivery = useCallback(async () => {
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      if (data.success) {
        const found = data.data.find((d: Delivery) => d.id === id);
        if (found) {
          setDelivery(found);
        } else {
          setError('Delivery not found');
        }
      }
    } catch (err) {
      setError('Failed to fetch delivery');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  const handleAction = async (action: DeliveryAction, notes?: string) => {
    if (!delivery) return;

    setActionInProgress(action);
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/${delivery.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Action failed');
      }

      setDelivery(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!delivery) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/${delivery.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      // Redirect to dashboard after successful delete
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-600 mb-2">{error || 'Delivery not found'}</h3>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const canApprove = ['pending_approval', 'needs_review'].includes(delivery.status);
  const canReject = ['pending_approval', 'needs_review', 'unmatched'].includes(delivery.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">{delivery.bolNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{delivery.bolNumber}</h1>
            <StatusBadge status={delivery.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {delivery.vendor}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {delivery.project}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {delivery.deliveryDate}
            </span>
            {delivery.poNumber && (
              <span className="flex items-center gap-1.5 font-mono text-blue-600">PO #{delivery.poNumber}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAction('approve')}
              disabled={!!actionInProgress}
            >
              {actionInProgress === 'approve' ? 'Approving...' : '✓ Approve'}
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => handleAction('reject')}
              disabled={!!actionInProgress}
            >
              {actionInProgress === 'reject' ? 'Rejecting...' : '✗ Reject'}
            </Button>
          )}
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => handleAction('flag_damage', 'Damage reported')}
            disabled={!!actionInProgress}
          >
            ⚠ Flag Damage
          </Button>
          <Button
            variant="outline"
            className="border-slate-300 text-slate-600 hover:bg-slate-50"
            onClick={() => handleAction('require_pm_approval', 'Requires PM approval')}
            disabled={!!actionInProgress}
          >
            ↗ Require PM
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
            disabled={!!actionInProgress}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* CMiC ID */}
      {delivery.cmicDeliveryId && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-700">Synced to CMiC: <code className="font-mono bg-emerald-100 px-1 rounded">{delivery.cmicDeliveryId}</code></span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison */}
        <div className="lg:col-span-2">
          <BOLvsPOCompare
            lines={delivery.lines}
            bolNumber={delivery.bolNumber}
            poNumber={delivery.poNumber}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Match Score */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-slate-500">Match Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className={`text-4xl font-bold ${
                delivery.matchScore >= 0.8 ? 'text-emerald-600' :
                delivery.matchScore >= 0.5 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {(delivery.matchScore * 100).toFixed(0)}%
              </p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    delivery.matchScore >= 0.8 ? 'bg-emerald-500' :
                    delivery.matchScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${delivery.matchScore * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* OCR Confidence */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-slate-500">OCR Confidence</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className={`text-4xl font-bold ${
                delivery.parsedBOL.confidence >= 0.9 ? 'text-emerald-600' :
                delivery.parsedBOL.confidence >= 0.8 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {(delivery.parsedBOL.confidence * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-slate-500">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 bg-slate-400 rounded-full" />
                <div>
                  <p className="text-sm text-slate-700">Created</p>
                  <p className="text-xs text-slate-500">{new Date(delivery.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full" />
                <div>
                  <p className="text-sm text-slate-700">Last Updated</p>
                  <p className="text-xs text-slate-500">{new Date(delivery.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              {delivery.approvedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-slate-700">Approved by</p>
                    <p className="text-xs text-slate-500">{delivery.approvedBy}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {delivery.notes && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-slate-500">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-700">{delivery.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Delivery
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this delivery record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-slate-700">{delivery.bolNumber}</p>
              <p className="text-slate-500">{delivery.vendor} • {delivery.deliveryDate}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Delivery'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
