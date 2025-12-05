import { NextRequest, NextResponse } from 'next/server';
import { ParsedBOL, BOLLine, OCRResult } from '@/types';
import { generateBOLNumber } from '@/lib/mockStorage';

// Deterministic mock OCR results based on image filename
const mockOCRResults: Record<string, Partial<ParsedBOL>> = {
  'bol_steel.jpg': {
    vendor: 'SteelCo',
    poReference: 'PO-2024-003',
    lines: [
      {
        id: 'ocr-001',
        description: 'Steel Beams W12x26',
        qty: 100,
        unit: 'EA',
        confidence: 0.95,
        rawText: 'STEEL BEAMS W12X26 - QTY: 100 EA',
      },
      {
        id: 'ocr-002',
        description: 'Steel Bolts 3/4" x 3"',
        qty: 500,
        unit: 'EA',
        confidence: 0.92,
        rawText: 'STEEL BOLTS 3/4" X 3" - QTY: 500 EA',
      },
    ],
    confidence: 0.93,
  },
  'bol_partial.jpg': {
    vendor: 'SteelCo',
    poReference: 'PO-2024-003',
    lines: [
      {
        id: 'ocr-003',
        description: 'Steel Beams W12x26',
        qty: 80,
        unit: 'EA',
        confidence: 0.91,
        rawText: 'STEEL BEAMS W12X26 - QTY: 80 EA',
      },
      {
        id: 'ocr-004',
        description: 'Steel Bolts 3/4" x 3"',
        qty: 400,
        unit: 'EA',
        confidence: 0.89,
        rawText: 'STEEL BOLTS 3/4 X 3 - QTY: 400 EA',
      },
    ],
    confidence: 0.90,
  },
  'bol_lowconf.jpg': {
    vendor: 'SteelCo',
    poReference: 'PO-2024-003',
    lines: [
      {
        id: 'ocr-005',
        description: 'Steel Beams W12x26',
        qty: 100,
        unit: 'EA',
        confidence: 0.65,
        rawText: 'STEEL B34MS W12X?6 - QTY: 100 EA',
      },
      {
        id: 'ocr-006',
        description: 'Steel Bolts',
        qty: 500,
        unit: 'EA',
        confidence: 0.72,
        rawText: 'ST33L B0LTS - QTY: 5?0 EA',
      },
    ],
    confidence: 0.68,
  },
  'bol_frameworks.jpg': {
    vendor: 'FrameWorks',
    poReference: '771',
    lines: [
      {
        id: 'ocr-007',
        description: 'Structural Steel Frames 8ft',
        qty: 50,
        unit: 'EA',
        confidence: 0.94,
        rawText: 'STRUCTURAL STEEL FRAMES 8FT - QTY: 50 EA',
      },
      {
        id: 'ocr-008',
        description: 'Connection Plates 12"x12"',
        qty: 200,
        unit: 'EA',
        confidence: 0.91,
        rawText: 'CONNECTION PLATES 12"X12" - QTY: 200 EA',
      },
      {
        id: 'ocr-009',
        description: 'Anchor Bolts 1" x 8"',
        qty: 400,
        unit: 'EA',
        confidence: 0.93,
        rawText: 'ANCHOR BOLTS 1" X 8" - QTY: 400 EA',
      },
    ],
    confidence: 0.93,
  },
};

// Default OCR result for unknown images
const defaultOCRResult: Partial<ParsedBOL> = {
  vendor: 'SteelCo',
  poReference: 'PO-2024-003',
  lines: [
    {
      id: 'ocr-default-001',
      description: 'Steel Beams W12x26',
      qty: 100,
      unit: 'EA',
      confidence: 0.95,
      rawText: 'STEEL BEAMS W12X26 - QTY: 100 EA',
    },
    {
      id: 'ocr-default-002',
      description: 'Steel Bolts 3/4" x 3"',
      qty: 500,
      unit: 'EA',
      confidence: 0.92,
      rawText: 'STEEL BOLTS 3/4" X 3" - QTY: 500 EA',
    },
  ],
  confidence: 0.93,
};

function extractFilename(input: string): string {
  // Extract filename from path or URL
  const parts = input.split('/');
  return parts[parts.length - 1].toLowerCase();
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;

    let filename = 'default';
    if (image) {
      filename = image.name.toLowerCase();
    } else if (imageUrl) {
      filename = extractFilename(imageUrl);
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get mock result based on filename
    const mockResult = mockOCRResults[filename] || defaultOCRResult;
    const today = new Date().toISOString().split('T')[0];

    const parsedBOL: ParsedBOL = {
      bolNumber: generateBOLNumber(),
      vendor: mockResult.vendor || 'Unknown Vendor',
      deliveryDate: today,
      poReference: mockResult.poReference,
      lines: (mockResult.lines || []) as BOLLine[],
      confidence: mockResult.confidence || 0.85,
      rawImageUrl: imageUrl || undefined,
    };

    const processingTime = Date.now() - startTime;

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

