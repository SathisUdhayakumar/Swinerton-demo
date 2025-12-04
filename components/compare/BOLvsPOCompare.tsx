'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryLine } from '@/types';

interface BOLvsPOCompareProps {
  lines: DeliveryLine[];
  bolNumber: string;
  poNumber?: string;
}

function StatusBadge({ status }: { status: DeliveryLine['matchStatus'] }) {
  const styles: Record<DeliveryLine['matchStatus'], string> = {
    exact: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-100 text-amber-700 border-amber-200',
    over: 'bg-blue-100 text-blue-700 border-blue-200',
    unmatched: 'bg-red-100 text-red-700 border-red-200',
    missing: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels: Record<DeliveryLine['matchStatus'], string> = {
    exact: 'Match',
    partial: 'Short',
    over: 'Over',
    unmatched: 'Unmatched',
    missing: 'Missing',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="text-emerald-600 font-mono text-sm font-medium">±0</span>;
  }
  if (delta > 0) {
    return <span className="text-blue-600 font-mono text-sm font-medium">+{delta}</span>;
  }
  return <span className="text-red-600 font-mono text-sm font-medium">{delta}</span>;
}

export function BOLvsPOCompare({ lines, bolNumber, poNumber }: BOLvsPOCompareProps) {
  const matchedLines = lines.filter((l) => l.matchStatus !== 'missing');
  const missingLines = lines.filter((l) => l.matchStatus === 'missing');

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Line Comparison
          </span>
          <span className="text-sm font-normal text-slate-500">
            {bolNumber} → {poNumber || 'No PO'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 rounded-t-lg border-b border-slate-200">
          <div className="col-span-5 text-xs text-slate-600 uppercase tracking-wider font-medium">
            BOL (Delivered)
          </div>
          <div className="col-span-5 text-xs text-slate-600 uppercase tracking-wider font-medium">
            PO (Ordered)
          </div>
          <div className="col-span-2 text-xs text-slate-600 uppercase tracking-wider font-medium text-right">
            Delta
          </div>
        </div>

        {/* Line Items */}
        <div className="divide-y divide-slate-100">
          {matchedLines.map((line) => (
            <div
              key={line.id}
              className={`grid grid-cols-12 gap-2 px-3 py-3 hover:bg-slate-50 transition-colors ${
                line.flagged ? 'bg-red-50' : ''
              }`}
            >
              {/* BOL Side */}
              <div className="col-span-5">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={line.matchStatus} />
                  {line.flagged && (
                    <span className="text-xs text-red-600">⚠</span>
                  )}
                </div>
                <p className="text-slate-700 text-sm truncate">
                  {line.bolLine.description}
                </p>
                <p className="text-slate-500 font-mono text-sm">
                  {line.qtyDelivered} <span className="text-slate-400">{line.bolLine.unit}</span>
                </p>
              </div>

              {/* PO Side */}
              <div className="col-span-5">
                {line.poLine ? (
                  <>
                    <p className="text-slate-500 text-sm truncate mb-1 mt-1">
                      {line.poLine.description}
                    </p>
                    <p className="text-slate-500 font-mono text-sm">
                      {line.qtyOrdered} <span className="text-slate-400">{line.poLine.unit}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 italic text-sm mt-1">No matching PO line</p>
                )}
              </div>

              {/* Delta */}
              <div className="col-span-2 text-right flex flex-col items-end justify-center">
                <DeltaBadge delta={line.qtyDelta} />
              </div>
            </div>
          ))}

          {/* Missing Items */}
          {missingLines.length > 0 && (
            <>
              <div className="px-3 py-2 bg-slate-50">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Missing from Delivery
                </span>
              </div>
              {missingLines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-12 gap-2 px-3 py-3 bg-slate-50/50"
                >
                  <div className="col-span-5">
                    <StatusBadge status="missing" />
                    <p className="text-slate-400 italic text-sm mt-1">Not delivered</p>
                  </div>
                  <div className="col-span-5">
                    <p className="text-slate-600 text-sm truncate">
                      {line.poLine?.description}
                    </p>
                    <p className="text-slate-500 font-mono text-sm">
                      {line.qtyOrdered} <span className="text-slate-400">{line.poLine?.unit}</span>
                    </p>
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end">
                    <DeltaBadge delta={line.qtyDelta} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {lines.filter((l) => l.matchStatus === 'exact').length}
              </p>
              <p className="text-xs text-slate-500">Exact</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {lines.filter((l) => l.matchStatus === 'partial').length}
              </p>
              <p className="text-xs text-slate-500">Short</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {lines.filter((l) => l.matchStatus === 'over').length}
              </p>
              <p className="text-xs text-slate-500">Over</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {lines.filter((l) => l.matchStatus === 'unmatched' || l.matchStatus === 'missing').length}
              </p>
              <p className="text-xs text-slate-500">Issues</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
