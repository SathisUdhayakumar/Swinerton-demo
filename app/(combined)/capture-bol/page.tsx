'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BOLUpload } from '@/components/capture/BOLUpload';
import { ParsedBOL, PurchaseOrder } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export default function CaptureBOLPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedBOL, setParsedBOL] = useState<ParsedBOL | null>(null);
  const [matchedPO, setMatchedPO] = useState<PurchaseOrder | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchedBy, setMatchedBy] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBOL, setEditedBOL] = useState<ParsedBOL | null>(null);

  // Check for pending BOL from Krane chat
  useEffect(() => {
    const pendingBOL = sessionStorage.getItem('pendingBOL');
    if (pendingBOL) {
      const bol = JSON.parse(pendingBOL);
      setParsedBOL(bol);
      setEditedBOL(bol);
      sessionStorage.removeItem('pendingBOL');
      // Auto-match
      handleMatchPO(bol);
    }
  }, []);

  const handleUpload = async (fileOrUrl: File | string) => {
    setIsProcessing(true);
    setError(null);
    setParsedBOL(null);
    setMatchedPO(null);

    try {
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }

      const response = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!data.success || data.type !== 'bol') {
        throw new Error('Failed to process BOL');
      }

      setParsedBOL(data.parsedBOL);
      setEditedBOL(data.parsedBOL);

      // Auto-match
      handleMatchPO(data.parsedBOL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMatchPO = async (bol: ParsedBOL) => {
    setIsMatching(true);

    try {
      const response = await fetch('/api/mock/bol/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedBOL: bol }),
      });
      const data = await response.json();

      if (data.success && data.matched) {
        setMatchedPO(data.matchResult.po);
        setMatchScore(data.matchResult.matchScore);
        setMatchedBy(data.matchResult.matchedBy);
      }
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!parsedBOL) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedBOL: editedBOL || parsedBOL,
          matchedPO,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/delivery/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to create delivery');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setIsCreating(false);
    }
  };

  const handleFieldChange = (field: keyof ParsedBOL, value: string) => {
    if (editedBOL) {
      setEditedBOL({ ...editedBOL, [field]: value });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Capture Bill of Lading</h1>
        <p className="text-slate-500">Upload or scan a BOL to reconcile with purchase orders</p>
      </div>

      {/* Upload Component */}
      {!parsedBOL && <BOLUpload onUpload={handleUpload} isLoading={isProcessing} />}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Parsed BOL Card */}
      {parsedBOL && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                OCR Results
              </CardTitle>
              <div className="flex items-center gap-2">
                <ConfidenceBadge confidence={parsedBOL.confidence} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Done' : 'Edit'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">BOL #</label>
                {editMode ? (
                  <Input
                    value={editedBOL?.bolNumber || ''}
                    onChange={(e) => handleFieldChange('bolNumber', e.target.value)}
                    className="mt-1 h-8"
                  />
                ) : (
                  <p className="text-slate-800 font-mono text-sm">{parsedBOL.bolNumber}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Vendor</label>
                {editMode ? (
                  <Input
                    value={editedBOL?.vendor || ''}
                    onChange={(e) => handleFieldChange('vendor', e.target.value)}
                    className="mt-1 h-8"
                  />
                ) : (
                  <p className="text-slate-800 font-medium">{parsedBOL.vendor}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Delivery Date</label>
                <p className="text-slate-700">{parsedBOL.deliveryDate}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">PO Reference</label>
                <p className="text-slate-700 font-mono">
                  {parsedBOL.poReference || <span className="text-slate-400">Not found</span>}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Line Items</label>
              <div className="mt-2 space-y-2">
                {parsedBOL.lines.map((line, idx) => (
                  <div
                    key={line.id}
                    className={`p-3 rounded-lg border ${
                      (line.confidence ?? 0) < 0.8
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">#{idx + 1}</span>
                          <ConfidenceBadge confidence={line.confidence ?? 0} />
                        </div>
                        <p className="text-slate-700 text-sm truncate">{line.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-800 font-mono font-medium">
                          {line.qty} <span className="text-slate-500 text-sm">{line.unit}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Result */}
            {matchedPO && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-emerald-700 font-medium">
                      Matched to PO #{matchedPO.poNumber}
                    </p>
                    <p className="text-emerald-600 text-sm">
                      {(matchScore * 100).toFixed(0)}% confidence • {matchedBy.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600"
                onClick={() => handleMatchPO(editedBOL || parsedBOL)}
                disabled={isMatching || !!matchedPO}
              >
                {isMatching ? 'Matching...' : matchedPO ? '✓ Matched' : 'Match PO'}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleCreateDelivery}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Delivery'}
              </Button>
            </div>

            {/* Low Confidence Warning */}
            {parsedBOL.confidence < 0.8 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-700 font-medium text-sm">Low OCR Confidence</p>
                  <p className="text-red-600 text-xs mt-0.5">
                    Please review and correct any errors before creating the delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Reset */}
            <Button
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-700"
              onClick={() => {
                setParsedBOL(null);
                setEditedBOL(null);
                setMatchedPO(null);
                setError(null);
              }}
            >
              Scan Another BOL
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow Info */}
      {!parsedBOL && (
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Delivery Workflow</h3>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Scan BOL document', icon: '📷' },
              { step: 2, label: 'AI extracts line items', icon: '🤖' },
              { step: 3, label: 'Auto-match to PO', icon: '🔗' },
              { step: 4, label: 'Review quantities', icon: '📊' },
              { step: 5, label: 'Create delivery record', icon: '✅' },
            ].map(({ step, label, icon }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                  {step}
                </div>
                <span className="text-slate-600 text-sm">{label}</span>
                <span className="text-sm">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
