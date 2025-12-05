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
    exact: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    over: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    unmatched: 'bg-red-500/20 text-red-400 border-red-500/30',
    missing: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
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
    return <span className="text-emerald-400 font-mono text-sm">±0</span>;
  }
  if (delta > 0) {
    return <span className="text-blue-400 font-mono text-sm">+{delta}</span>;
  }
  return <span className="text-red-400 font-mono text-sm">{delta}</span>;
}

export function BOLvsPOCompare({ lines, bolNumber, poNumber }: BOLvsPOCompareProps) {
  const matchedLines = lines.filter((l) => l.matchStatus !== 'missing');
  const missingLines = lines.filter((l) => l.matchStatus === 'missing');

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-amber-100 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Line Comparison
          </span>
          <span className="text-sm font-normal text-zinc-500">
            {bolNumber} → {poNumber || 'No PO'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-800/50 rounded-t-lg border-b border-zinc-700">
          <div className="col-span-5 text-xs text-zinc-500 uppercase tracking-wider">
            BOL (Delivered)
          </div>
          <div className="col-span-5 text-xs text-zinc-500 uppercase tracking-wider">
            PO (Ordered)
          </div>
          <div className="col-span-2 text-xs text-zinc-500 uppercase tracking-wider text-right">
            Delta
          </div>
        </div>

        {/* Line Items */}
        <div className="divide-y divide-zinc-800">
          {matchedLines.map((line) => (
            <div
              key={line.id}
              className={`grid grid-cols-12 gap-2 px-3 py-3 hover:bg-zinc-800/30 transition-colors ${
                line.flagged ? 'bg-red-500/5' : ''
              }`}
            >
              {/* BOL Side */}
              <div className="col-span-5">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={line.matchStatus} />
                  {line.flagged && (
                    <span className="text-xs text-red-400">⚠ Flagged</span>
                  )}
                </div>
                <p className="text-zinc-200 text-sm truncate">
                  {line.bolLine.description}
                </p>
                <p className="text-zinc-400 font-mono text-sm">
                  {line.qtyDelivered} <span className="text-zinc-600">{line.bolLine.unit}</span>
                </p>
              </div>

              {/* PO Side */}
              <div className="col-span-5">
                {line.poLine ? (
                  <>
                    <p className="text-zinc-400 text-sm truncate mb-1 mt-1">
                      {line.poLine.description}
                    </p>
                    <p className="text-zinc-400 font-mono text-sm">
                      {line.qtyOrdered} <span className="text-zinc-600">{line.poLine.unit}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-zinc-600 italic text-sm mt-1">No matching PO line</p>
                )}
              </div>

              {/* Delta */}
              <div className="col-span-2 text-right flex flex-col items-end justify-center">
                <DeltaBadge delta={line.qtyDelta} />
                {line.bolLine.confidence < 0.8 && (
                  <span className="text-xs text-amber-400 mt-1">Low conf.</span>
                )}
              </div>
            </div>
          ))}

          {/* Missing Items */}
          {missingLines.length > 0 && (
            <>
              <div className="px-3 py-2 bg-zinc-800/30">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Missing from Delivery
                </span>
              </div>
              {missingLines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-12 gap-2 px-3 py-3 bg-zinc-800/10"
                >
                  <div className="col-span-5">
                    <StatusBadge status="missing" />
                    <p className="text-zinc-500 italic text-sm mt-1">Not delivered</p>
                  </div>
                  <div className="col-span-5">
                    <p className="text-zinc-400 text-sm truncate">
                      {line.poLine?.description}
                    </p>
                    <p className="text-zinc-400 font-mono text-sm">
                      {line.qtyOrdered} <span className="text-zinc-600">{line.poLine?.unit}</span>
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
        <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">
                {lines.filter((l) => l.matchStatus === 'exact').length}
              </p>
              <p className="text-xs text-zinc-500">Exact</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">
                {lines.filter((l) => l.matchStatus === 'partial').length}
              </p>
              <p className="text-xs text-zinc-500">Short</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {lines.filter((l) => l.matchStatus === 'over').length}
              </p>
              <p className="text-xs text-zinc-500">Over</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {lines.filter((l) => l.matchStatus === 'unmatched' || l.matchStatus === 'missing').length}
              </p>
              <p className="text-xs text-zinc-500">Issues</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


