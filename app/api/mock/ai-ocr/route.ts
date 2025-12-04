import { NextRequest, NextResponse } from 'next/server';
import { ParsedReceipt, ParsedBOL, OCRResult } from '@/types';
import { generateBOLNumber, generateImageHash } from '@/lib/mockStorage';

/**
 * Mock AI OCR endpoint
 * Returns deterministic results based on image filename
 */

// Receipt OCR mock results
const mockReceiptResults: Record<string, ParsedReceipt> = {
  'home_depot.jpg': {
    merchant: 'Home Depot',
    merchantConfidence: 0.98,
    date: new Date().toISOString().split('T')[0],
    dateConfidence: 0.95,
    total: 142.50,
    totalConfidence: 0.97,
    tax: 11.75,
    taxConfidence: 0.92,
    items: [
      { id: 'item-001', description: 'Concrete Mix 80lb', qty: 5, unitPrice: 6.50, total: 32.50, confidence: 0.95 },
      { id: 'item-002', description: '2x4x8 Lumber', qty: 20, unitPrice: 4.25, total: 85.00, confidence: 0.92 },
      { id: 'item-003', description: 'Wood Screws 3"', qty: 2, unitPrice: 12.50, total: 25.00, confidence: 0.90 },
    ],
    imageHash: 'hash_home_depot_001',
  },
  'receipt_good.jpg': {
    merchant: 'Home Depot',
    merchantConfidence: 0.96,
    date: new Date().toISOString().split('T')[0],
    dateConfidence: 0.94,
    total: 89.99,
    totalConfidence: 0.95,
    tax: 7.42,
    taxConfidence: 0.90,
    items: [
      { id: 'item-004', description: 'PVC Pipe 4"x10ft', qty: 3, unitPrice: 18.99, total: 56.97, confidence: 0.93 },
      { id: 'item-005', description: 'PVC Cement', qty: 1, unitPrice: 8.99, total: 8.99, confidence: 0.91 },
      { id: 'item-006', description: 'Pipe Fittings Assorted', qty: 1, unitPrice: 24.03, total: 24.03, confidence: 0.88 },
    ],
    imageHash: 'hash_receipt_good_001',
  },
  'lowconf.jpg': {
    merchant: 'Home Depot',
    merchantConfidence: 0.72,
    date: new Date().toISOString().split('T')[0],
    dateConfidence: 0.68,
    total: 156.00,
    totalConfidence: 0.60, // Low confidence!
    tax: 12.87,
    taxConfidence: 0.55,
    items: [
      { id: 'item-007', description: 'Unknown Item', qty: 1, unitPrice: 156.00, total: 156.00, confidence: 0.45 },
    ],
    rawText: 'H0ME DEP0T\n...[blurred]...\nT0TAL: $156.??',
    imageHash: 'hash_lowconf_001',
  },
  'duplicate.jpg': {
    merchant: 'Home Depot',
    merchantConfidence: 0.98,
    date: new Date().toISOString().split('T')[0],
    dateConfidence: 0.95,
    total: 142.50,
    totalConfidence: 0.97,
    tax: 11.75,
    taxConfidence: 0.92,
    items: [
      { id: 'item-001', description: 'Concrete Mix 80lb', qty: 5, unitPrice: 6.50, total: 32.50, confidence: 0.95 },
      { id: 'item-002', description: '2x4x8 Lumber', qty: 20, unitPrice: 4.25, total: 85.00, confidence: 0.92 },
      { id: 'item-003', description: 'Wood Screws 3"', qty: 2, unitPrice: 12.50, total: 25.00, confidence: 0.90 },
    ],
    imageHash: 'hash_home_depot_001', // Same hash as home_depot.jpg for duplicate detection
  },
};

// BOL OCR mock results
const mockBOLResults: Record<string, Partial<ParsedBOL>> = {
  'bol_steel.jpg': {
    vendor: 'SteelCo',
    poReference: '552',
    lines: [
      { id: 'ocr-001', description: 'Steel Beams W12x26', qty: 100, unit: 'EA', confidence: 0.95, rawText: 'STEEL BEAMS W12X26 - QTY: 100 EA' },
      { id: 'ocr-002', description: 'Steel Bolts 3/4" x 3"', qty: 500, unit: 'EA', confidence: 0.92, rawText: 'STEEL BOLTS 3/4" X 3" - QTY: 500 EA' },
    ],
    confidence: 0.93,
  },
  'bol_partial.jpg': {
    vendor: 'SteelCo',
    poReference: '552',
    lines: [
      { id: 'ocr-003', description: 'Steel Beams W12x26', qty: 80, unit: 'EA', confidence: 0.91, rawText: 'STEEL BEAMS W12X26 - QTY: 80 EA' },
      { id: 'ocr-004', description: 'Steel Bolts 3/4" x 3"', qty: 400, unit: 'EA', confidence: 0.89, rawText: 'STEEL BOLTS 3/4 X 3 - QTY: 400 EA' },
    ],
    confidence: 0.90,
  },
};

// Default results for unknown images
const defaultReceiptResult: ParsedReceipt = {
  merchant: 'Unknown Store',
  merchantConfidence: 0.85,
  date: new Date().toISOString().split('T')[0],
  dateConfidence: 0.80,
  total: 50.00,
  totalConfidence: 0.85,
  items: [
    { id: 'item-default', description: 'Miscellaneous Items', qty: 1, unitPrice: 50.00, total: 50.00, confidence: 0.80 },
  ],
};

const defaultBOLResult: Partial<ParsedBOL> = {
  vendor: 'Unknown Vendor',
  lines: [
    { id: 'ocr-default', description: 'Unknown Item', qty: 1, unit: 'EA', confidence: 0.75, rawText: 'UNKNOWN ITEM' },
  ],
  confidence: 0.75,
};

function extractFilename(input: string): string {
  const parts = input.split('/');
  return parts[parts.length - 1].toLowerCase();
}

function detectDocumentType(filename: string, hint?: string): 'receipt' | 'bol' {
  // If a hint is provided, use it directly
  if (hint === 'bol') {
    return 'bol';
  }
  if (hint === 'receipt') {
    return 'receipt';
  }
  
  // Filename-based detection for demo files
  if (filename.includes('bol')) {
    return 'bol';
  }
  
  // Default to receipt if no hint and no 'bol' in filename
  return 'receipt';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const documentTypeHint = formData.get('documentType') as string | null;

    let filename = 'default';
    if (image) {
      filename = image.name.toLowerCase();
    } else if (imageUrl) {
      filename = extractFilename(imageUrl);
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const docType = detectDocumentType(filename, documentTypeHint || undefined);
    const processingTime = Date.now() - startTime;

    if (docType === 'bol') {
      // BOL processing
      const mockResult = mockBOLResults[filename] || defaultBOLResult;
      const today = new Date().toISOString().split('T')[0];

      const parsedBOL: ParsedBOL = {
        bolNumber: generateBOLNumber(),
        vendor: mockResult.vendor || 'Unknown Vendor',
        deliveryDate: today,
        poReference: mockResult.poReference,
        lines: mockResult.lines || [],
        confidence: mockResult.confidence || 0.75,
        rawImageUrl: imageUrl || undefined,
      };

      const result: OCRResult = {
        success: true,
        type: 'bol',
        parsedBOL,
        processingTime,
        warnings: parsedBOL.confidence < 0.8
          ? ['Low confidence OCR result - manual review recommended']
          : undefined,
      };

      return NextResponse.json(result);
    } else {
      // Receipt processing
      const mockResult = mockReceiptResults[filename] || {
        ...defaultReceiptResult,
        imageHash: generateImageHash(filename),
      };

      const avgConfidence = (
        mockResult.merchantConfidence +
        mockResult.dateConfidence +
        mockResult.totalConfidence
      ) / 3;

      const result: OCRResult = {
        success: true,
        type: 'receipt',
        parsedReceipt: mockResult,
        processingTime,
        warnings: avgConfidence < 0.8
          ? ['Low confidence OCR result - manual review recommended']
          : undefined,
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

