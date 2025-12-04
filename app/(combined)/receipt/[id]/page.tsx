'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, ReceiptStatus, ReceiptAction } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: ReceiptStatus }) {
  const styles: Record<ReceiptStatus, string> = {
    logged: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    needs_review: 'bg-orange-100 text-orange-700 border-orange-200',
    pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    duplicate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels: Record<ReceiptStatus, string> = {
    logged: 'Logged',
    approved: 'Approved',
    needs_review: 'Needs Review',
    pending_approval: 'Pending Approval',
    rejected: 'Rejected',
    duplicate: 'Duplicate',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-700';
    if (confidence >= 0.8) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${getColor()}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
}

export default function ReceiptDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<ReceiptAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipt = useCallback(async () => {
    try {
      const response = await fetch('/api/receipts');
      const data = await response.json();
      if (data.success) {
        const found = data.data.find((r: Receipt) => r.id === id);
        if (found) {
          setReceipt(found);
        } else {
          setError('Receipt not found');
        }
      }
    } catch (err) {
      setError('Failed to fetch receipt');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  const handleAction = async (action: ReceiptAction, notes?: string) => {
    if (!receipt) return;

    setActionInProgress(action);
    setError(null);

    try {
      const response = await fetch(`/api/receipts/${receipt.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Action failed');
      }

      setReceipt(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-600 mb-2">{error || 'Receipt not found'}</h3>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const canApprove = ['pending_approval', 'needs_review'].includes(receipt.status);
  const canReject = ['pending_approval', 'needs_review'].includes(receipt.status);

  const handleDelete = async () => {
    if (!receipt) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">{receipt.merchant}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{receipt.merchant}</h1>
            <StatusBadge status={receipt.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {receipt.date}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {receipt.projectName}
            </span>
            <span className="text-amber-600 font-medium">{receipt.costCodeName}</span>
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
            className="border-slate-300 text-slate-600 hover:bg-slate-50"
            onClick={() => handleAction('needs_review', 'Flagged for review')}
            disabled={!!actionInProgress}
          >
            Flag for Review
          </Button>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!!actionInProgress || isDeleting}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Receipt?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will permanently delete the receipt from {receipt.merchant}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
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
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* CMiC ID */}
      {receipt.cmicLineId && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-700">Synced to CMiC: <code className="font-mono bg-emerald-100 px-1 rounded">{receipt.cmicLineId}</code></span>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Receipt Image */}
          {receipt.imageUrl && (
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Uploaded Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
                  {/* For demo, show placeholder with filename */}
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-slate-200 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium">{receipt.imageUrl}</p>
                    <p className="text-xs text-slate-400 mt-1">Receipt image uploaded via Krane</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Summary */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                Receipt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Total Amount</span>
                <span className="text-3xl font-bold text-slate-800">${receipt.total.toFixed(2)}</span>
              </div>

              {receipt.tax && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-700">${receipt.tax.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">${(receipt.total - (receipt.tax || 0)).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          {receipt.items && receipt.items.length > 0 && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receipt.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-slate-700">{item.description}</p>
                          <p className="text-xs text-slate-500">
                            {item.qty} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-700 font-medium">${item.total.toFixed(2)}</p>
                        <ConfidenceBadge confidence={item.confidence} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Confidence */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-slate-500">OCR Confidence</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className={`text-4xl font-bold ${
                receipt.confidence >= 0.9 ? 'text-emerald-600' :
                receipt.confidence >= 0.8 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {(receipt.confidence * 100).toFixed(0)}%
              </p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    receipt.confidence >= 0.9 ? 'bg-emerald-500' :
                    receipt.confidence >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${receipt.confidence * 100}%` }}
                />
              </div>
              {receipt.confidence < 0.8 && (
                <p className="text-xs text-red-600 mt-2">⚠ Low confidence - review recommended</p>
              )}
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-slate-500">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Project</p>
                <p className="text-slate-700">{receipt.projectName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cost Code</p>
                <p className="text-amber-600 font-medium">{receipt.costCodeName}</p>
              </div>
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
                  <p className="text-sm text-slate-700">Created by {receipt.createdBy}</p>
                  <p className="text-xs text-slate-500">{new Date(receipt.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full" />
                <div>
                  <p className="text-sm text-slate-700">Last Updated</p>
                  <p className="text-xs text-slate-500">{new Date(receipt.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              {receipt.approvedBy && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-slate-700">Approved by</p>
                    <p className="text-xs text-slate-500">{receipt.approvedBy}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {receipt.notes && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-slate-500">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-700">{receipt.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
