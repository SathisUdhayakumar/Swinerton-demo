'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ParsedBOL, BOLLine } from '@/types';

interface ParsedBOLCardProps {
  parsedBOL: ParsedBOL;
  onUpdate: (updatedBOL: ParsedBOL) => void;
  onMatchPO: () => void;
  onCreateDelivery: () => void;
  isMatching?: boolean;
  isCreating?: boolean;
  matchResult?: { poNumber: string; matchScore: number; matchedBy: string } | null;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (confidence >= 0.8) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${getColor()}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
}

export function ParsedBOLCard({
  parsedBOL,
  onUpdate,
  onMatchPO,
  onCreateDelivery,
  isMatching,
  isCreating,
  matchResult,
}: ParsedBOLCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedBOL, setEditedBOL] = useState(parsedBOL);

  const handleFieldChange = (field: keyof ParsedBOL, value: string) => {
    setEditedBOL({ ...editedBOL, [field]: value });
  };

  const handleLineChange = (lineId: string, field: keyof BOLLine, value: string | number) => {
    const updatedLines = editedBOL.lines.map((line) =>
      line.id === lineId ? { ...line, [field]: value } : line
    );
    setEditedBOL({ ...editedBOL, lines: updatedLines });
  };

  const handleSave = () => {
    onUpdate(editedBOL);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedBOL(parsedBOL);
    setEditMode(false);
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-amber-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            OCR Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={parsedBOL.confidence} />
            {!editMode && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => setEditMode(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">BOL #</label>
            {editMode ? (
              <Input
                value={editedBOL.bolNumber}
                onChange={(e) => handleFieldChange('bolNumber', e.target.value)}
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 h-8"
              />
            ) : (
              <p className="text-zinc-200 font-mono text-sm">{parsedBOL.bolNumber}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Vendor</label>
            {editMode ? (
              <Input
                value={editedBOL.vendor}
                onChange={(e) => handleFieldChange('vendor', e.target.value)}
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 h-8"
              />
            ) : (
              <p className="text-zinc-200 font-medium">{parsedBOL.vendor}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Delivery Date</label>
            {editMode ? (
              <Input
                type="date"
                value={editedBOL.deliveryDate}
                onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 h-8"
              />
            ) : (
              <p className="text-zinc-200">{parsedBOL.deliveryDate}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">PO Reference</label>
            {editMode ? (
              <Input
                value={editedBOL.poReference || ''}
                onChange={(e) => handleFieldChange('poReference', e.target.value)}
                placeholder="Enter PO #"
                className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200 h-8"
              />
            ) : (
              <p className="text-zinc-200 font-mono">
                {parsedBOL.poReference || <span className="text-zinc-500">Not found</span>}
              </p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Line Items</label>
          <div className="mt-2 space-y-2">
            {(editMode ? editedBOL.lines : parsedBOL.lines).map((line, idx) => (
              <div
                key={line.id}
                className={`p-3 rounded-lg border ${
                  line.confidence < 0.8
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-zinc-800/50 border-zinc-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-zinc-500">#{idx + 1}</span>
                      <ConfidenceBadge confidence={line.confidence} />
                    </div>
                    {editMode ? (
                      <Input
                        value={line.description}
                        onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-200 h-8 text-sm"
                      />
                    ) : (
                      <p className="text-zinc-200 text-sm truncate">{line.description}</p>
                    )}
                    {line.rawText && !editMode && (
                      <p className="text-xs text-zinc-500 mt-1 font-mono truncate">
                        Raw: {line.rawText}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {editMode ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={line.qty}
                          onChange={(e) => handleLineChange(line.id, 'qty', parseInt(e.target.value) || 0)}
                          className="w-20 bg-zinc-800 border-zinc-700 text-zinc-200 h-8 text-sm text-right"
                        />
                        <span className="text-zinc-500 text-sm">{line.unit}</span>
                      </div>
                    ) : (
                      <p className="text-zinc-200 font-mono font-medium">
                        {line.qty} <span className="text-zinc-500 text-sm">{line.unit}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Mode Buttons */}
        {editMode && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        )}

        {/* Match Result */}
        {matchResult && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-emerald-400 font-medium">
                  Matched to PO #{matchResult.poNumber}
                </p>
                <p className="text-emerald-400/70 text-sm">
                  {(matchResult.matchScore * 100).toFixed(0)}% confidence • Matched by {matchResult.matchedBy.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!editMode && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={onMatchPO}
              disabled={isMatching || !!matchResult}
            >
              {isMatching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Matching...
                </>
              ) : matchResult ? (
                <>
                  <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Matched
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Match PO
                </>
              )}
            </Button>
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              onClick={onCreateDelivery}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Delivery
                </>
              )}
            </Button>
          </div>
        )}

        {/* Low Confidence Warning */}
        {parsedBOL.confidence < 0.8 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-red-400 font-medium text-sm">Low OCR Confidence</p>
              <p className="text-red-400/70 text-xs mt-0.5">
                Please review and correct any errors before creating the delivery record.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


