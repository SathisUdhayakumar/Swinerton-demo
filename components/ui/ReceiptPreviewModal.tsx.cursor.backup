'use client';

import { ParsedReceipt, ProjectSuggestion } from '@/types';
import { Button } from '@/components/ui/button';

interface ReceiptPreviewModalProps {
  receipt: ParsedReceipt;
  suggestion?: ProjectSuggestion;
  onConfirm: () => void;
  onEdit: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-700';
    if (confidence >= 0.8) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${getColor()}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
}

export function ReceiptPreviewModal({
  receipt,
  suggestion,
  onConfirm,
  onEdit,
  onClose,
  isLoading,
}: ReceiptPreviewModalProps) {
  const avgConfidence = (
    receipt.merchantConfidence +
    receipt.dateConfidence +
    receipt.totalConfidence
  ) / 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Receipt Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Overall Confidence */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Overall Confidence</span>
            <ConfidenceBadge confidence={avgConfidence} />
          </div>

          {/* Parsed Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Merchant</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-medium">{receipt.merchant}</span>
                <ConfidenceBadge confidence={receipt.merchantConfidence} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-700">{receipt.date}</span>
                <ConfidenceBadge confidence={receipt.dateConfidence} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-bold text-lg">${receipt.total.toFixed(2)}</span>
                <ConfidenceBadge confidence={receipt.totalConfidence} />
              </div>
            </div>
            {receipt.tax && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tax</span>
                <span className="text-slate-600">${receipt.tax.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Items</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {receipt.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate flex-1">{item.description}</span>
                    <span className="text-slate-500 ml-2">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion */}
          {suggestion && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Suggested Assignment</h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600 text-sm">Project</span>
                  <span className="text-amber-700 font-medium">{suggestion.projectName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Cost Code</span>
                  <span className="text-amber-700">{suggestion.costCodeName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{suggestion.reason}</p>
              </div>
            </div>
          )}

          {/* Low Confidence Warning */}
          {avgConfidence < 0.8 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-700 font-medium text-sm">Low Confidence</p>
                <p className="text-red-600 text-xs">Please review and edit before confirming</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="flex-1 border-slate-300 text-slate-600"
            onClick={onEdit}
            disabled={isLoading}
          >
            Edit
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              'Confirm & Log'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
