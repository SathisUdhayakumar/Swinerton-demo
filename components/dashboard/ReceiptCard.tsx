'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Receipt, ReceiptStatus } from '@/types';

interface ReceiptCardProps {
  receipt: Receipt;
  onClick?: () => void;
}

function isNewReceipt(receiptId: string): boolean {
  if (typeof window === 'undefined') return false;
  const viewed = localStorage.getItem('viewedItems');
  if (!viewed) return true;
  const parsed = JSON.parse(viewed);
  return !(parsed.receipts || []).includes(receiptId);
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
    pending_approval: 'Pending',
    rejected: 'Rejected',
    duplicate: 'Duplicate',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(isNewReceipt(receipt.id));
  }, [receipt.id]);

  const handleClick = (e: React.MouseEvent) => {
    if (isNew) {
      // Mark as viewed
      const viewed = localStorage.getItem('viewedItems');
      const parsed = viewed ? JSON.parse(viewed) : { receipts: [], deliveries: [] };
      if (!parsed.receipts) parsed.receipts = [];
      if (!parsed.receipts.includes(receipt.id)) {
        parsed.receipts.push(receipt.id);
        localStorage.setItem('viewedItems', JSON.stringify(parsed));
        setIsNew(false);
      }
    }
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <Card className="bg-white border-slate-200 hover:border-emerald-300 transition-all hover:shadow-lg cursor-pointer group relative">
      {isNew && (
        <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
          NEW
        </span>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-slate-800 font-semibold group-hover:text-emerald-600 transition-colors">
                {receipt.merchant}
              </h3>
              <p className="text-slate-500 text-sm">{receipt.date}</p>
            </div>
          </div>
          <StatusBadge status={receipt.status} />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-left">
            <p className="text-2xl font-bold text-slate-800">${receipt.total.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{receipt.items?.length || 0} items</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600 font-medium">{receipt.projectName}</p>
            <p className="text-xs text-slate-500">{receipt.costCodeName}</p>
          </div>
        </div>

        {/* Confidence indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Confidence</span>
            <span className={`font-medium ${
              receipt.confidence >= 0.9 ? 'text-emerald-600' :
              receipt.confidence >= 0.8 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {(receipt.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                receipt.confidence >= 0.9 ? 'bg-emerald-500' :
                receipt.confidence >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${receipt.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return <div onClick={handleClick}>{cardContent}</div>;
  }

  return (
    <Link href={`/receipt/${receipt.id}`} onClick={handleClick}>
      {cardContent}
    </Link>
  );
}
