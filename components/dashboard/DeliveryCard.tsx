'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Delivery, DeliveryStatus } from '@/types';

interface DeliveryCardProps {
  delivery: Delivery;
}

function isNewDelivery(deliveryId: string): boolean {
  if (typeof window === 'undefined') return false;
  const viewed = localStorage.getItem('viewedItems');
  if (!viewed) return true;
  const parsed = JSON.parse(viewed);
  return !(parsed.deliveries || []).includes(deliveryId);
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
    pending_approval: 'Pending',
    needs_review: 'Review',
    unmatched: 'Unmatched',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const [isNew, setIsNew] = useState(false);
  const exactMatches = delivery.lines.filter((l) => l.matchStatus === 'exact').length;
  const issues = delivery.lines.filter(
    (l) => l.matchStatus !== 'exact' && l.matchStatus !== 'partial'
  ).length;

  useEffect(() => {
    setIsNew(isNewDelivery(delivery.id));
  }, [delivery.id]);

  const handleClick = () => {
    if (isNew) {
      // Mark as viewed
      const viewed = localStorage.getItem('viewedItems');
      const parsed = viewed ? JSON.parse(viewed) : { receipts: [], deliveries: [] };
      if (!parsed.deliveries) parsed.deliveries = [];
      if (!parsed.deliveries.includes(delivery.id)) {
        parsed.deliveries.push(delivery.id);
        localStorage.setItem('viewedItems', JSON.stringify(parsed));
        setIsNew(false);
      }
    }
  };

  return (
    <Link href={`/delivery/${delivery.id}`} onClick={handleClick}>
      <Card className="bg-white border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg cursor-pointer group relative">
        {isNew && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            NEW
          </span>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">
                  {delivery.bolNumber}
                </h3>
                <p className="text-slate-500 text-sm">{delivery.vendor}</p>
              </div>
            </div>
            <StatusBadge status={delivery.status} />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mb-3">
            <div className="text-left">
              <p className="text-sm text-slate-600">
                {delivery.poNumber ? `PO #${delivery.poNumber}` : 'No PO'}
              </p>
              <p className="text-xs text-slate-400">{delivery.project}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">{delivery.deliveryDate}</p>
              <p className="text-xs text-slate-400">{delivery.lines.length} items</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            {exactMatches > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {exactMatches} matched
              </span>
            )}
            {issues > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                {issues} issues
              </span>
            )}
          </div>

          {/* Match Score */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Match Score</span>
              <span className="text-slate-600 font-medium">{(delivery.matchScore * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  delivery.matchScore >= 0.8 ? 'bg-emerald-500' :
                  delivery.matchScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${delivery.matchScore * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
