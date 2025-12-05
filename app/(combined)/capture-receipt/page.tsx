'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReceiptUpload } from '@/components/capture/ReceiptUpload';
import { ReceiptPreviewModal } from '@/components/ui/ReceiptPreviewModal';
import { ParsedReceipt, ProjectSuggestion, Project, CostCode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CaptureReceiptPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [suggestion, setSuggestion] = useState<ProjectSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCostCode, setSelectedCostCode] = useState<string>('');

  const handleUpload = async (fileOrUrl: File | string) => {
    setIsProcessing(true);
    setError(null);
    setParsedReceipt(null);
    setSuggestion(null);

    try {
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }

      // OCR
      const ocrResponse = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const ocrData = await ocrResponse.json();

      if (!ocrData.success || ocrData.type !== 'receipt') {
        throw new Error('Failed to process receipt');
      }

      setParsedReceipt(ocrData.parsedReceipt);

      // Get suggestion
      const suggestResponse = await fetch('/api/mock/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: ocrData.parsedReceipt.merchant }),
      });
      const suggestData = await suggestResponse.json();

      if (suggestData.success) {
        setSuggestion(suggestData.suggestion);
        setSelectedProject(suggestData.suggestion.projectId);
        setSelectedCostCode(suggestData.suggestion.costCodeId);
      }

      // Fetch projects for manual selection
      setProjects([
        {
          id: 'alpha',
          name: 'Clemson-210 Keowee Trl',
          code: 'ALPHA-2025',
          budget: 500000,
          spent: 125000,
          costCodes: [
            { id: 'cc-001', code: '6100', description: 'Materials - General', budget: 100000, spent: 25000 },
            { id: 'cc-002', code: '6200', description: 'Materials - Steel', budget: 200000, spent: 75000 },
            { id: 'cc-003', code: '6300', description: 'Tools & Equipment', budget: 50000, spent: 15000 },
          ],
        },
        {
          id: 'beta',
          name: 'DFW Terminal F',
          code: 'BETA-2025',
          budget: 750000,
          spent: 180000,
          costCodes: [
            { id: 'cc-005', code: '6100', description: 'Materials - General', budget: 150000, spent: 45000 },
            { id: 'cc-006', code: '6200', description: 'Materials - Steel', budget: 300000, spent: 100000 },
          ],
        },
      ]);

      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedReceipt || !selectedProject || !selectedCostCode) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedReceipt,
          projectId: selectedProject,
          costCodeId: selectedCostCode,
        }),
      });

      const data = await response.json();

      if (data.status === 'duplicate') {
        setError('This receipt has already been submitted (duplicate detected)');
        setShowModal(false);
        return;
      }

      if (data.success) {
        router.push(`/receipt/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to create receipt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProject);
  const costCodes = currentProject?.costCodes || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Capture Receipt</h1>
        <p className="text-slate-500">Upload or scan a receipt to log expenses</p>
      </div>

      {/* Upload Component */}
      <ReceiptUpload onUpload={handleUpload} isLoading={isProcessing} />

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

      {/* Project/Cost Code Selection (shown after OCR) */}
      {parsedReceipt && !showModal && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Assign to Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 block mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedCostCode('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600 block mb-2">Cost Code</label>
              <select
                value={selectedCostCode}
                onChange={(e) => setSelectedCostCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                disabled={!selectedProject}
              >
                <option value="">Select Cost Code</option>
                {costCodes.map((cc: CostCode) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.description}
                  </option>
                ))}
              </select>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirm}
              disabled={!selectedProject || !selectedCostCode || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Log Receipt'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showModal && parsedReceipt && (
        <ReceiptPreviewModal
          receipt={parsedReceipt}
          suggestion={suggestion || undefined}
          onConfirm={handleConfirm}
          onEdit={() => setShowModal(false)}
          onClose={() => {
            setShowModal(false);
            setParsedReceipt(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Workflow Info */}
      {!parsedReceipt && (
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Upload receipt image', icon: '📷' },
              { step: 2, label: 'AI extracts details', icon: '🤖' },
              { step: 3, label: 'Review & assign project', icon: '✏️' },
              { step: 4, label: 'Log to CMiC', icon: '✅' },
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
