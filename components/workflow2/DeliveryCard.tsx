'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Delivery, DeliveryStatus } from '@/types';

interface DeliveryCardProps {
  delivery: Delivery;
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const styles: Record<DeliveryStatus, string> = {
    verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending_approval: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    needs_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    unmatched: 'bg-red-500/20 text-red-400 border-red-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels: Record<DeliveryStatus, string> = {
    verified: 'Verified',
    approved: 'Approved',
    pending_approval: 'Pending Approval',
    needs_review: 'Needs Review',
    unmatched: 'Unmatched',
    rejected: 'Rejected',
  };

  const icons: Record<DeliveryStatus, React.ReactNode> = {
    verified: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    approved: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    pending_approval: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    needs_review: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    unmatched: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    rejected: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const exactMatches = delivery.lines.filter((l) => l.matchStatus === 'exact').length;
  const issues = delivery.lines.filter(
    (l) => l.matchStatus !== 'exact' && l.matchStatus !== 'partial'
  ).length;
  const totalLines = delivery.lines.length;

  return (
    <Link href={`/delivery/${delivery.id}`}>
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-amber-100 font-semibold group-hover:text-amber-400 transition-colors">
                  {delivery.bolNumber}
                </h3>
                <StatusBadge status={delivery.status} />
              </div>
              <p className="text-zinc-500 text-sm">{delivery.vendor}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-sm font-mono">
                {delivery.poNumber ? `PO #${delivery.poNumber}` : 'No PO'}
              </p>
              <p className="text-zinc-600 text-xs">{delivery.project}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-zinc-400">{delivery.deliveryDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-zinc-400">{totalLines} items</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {exactMatches > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  {exactMatches} matched
                </span>
              )}
              {issues > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                  {issues} issues
                </span>
              )}
            </div>
          </div>

          {/* Match Score Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-500">Match Score</span>
              <span className="text-zinc-400">{(delivery.matchScore * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  delivery.matchScore >= 0.8
                    ? 'bg-emerald-500'
                    : delivery.matchScore >= 0.5
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${delivery.matchScore * 100}%` }}
              />
            </div>
          </div>

          {delivery.notes && (
            <div className="mt-3 p-2 bg-zinc-800/50 rounded text-xs text-zinc-400 truncate">
              <span className="text-zinc-500">Note:</span> {delivery.notes}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}


