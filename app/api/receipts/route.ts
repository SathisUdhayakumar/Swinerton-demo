import { NextRequest, NextResponse } from 'next/server';
import { Receipt, ReceiptStatus } from '@/types';
import { 
  getReceipts, 
  createReceipt, 
  findDuplicateReceipt,
  determineReceiptStatus,
  getCurrentUser,
  getProjectById,
  getCostCodeById,
  generateCMiCReceiptId,
  addAuditLog
} from '@/lib/mockStorage';
import { eventBus, RECEIPT_EVENTS } from '@/lib/eventBus';

/**
 * GET /api/receipts - List all receipts
 */
export async function GET() {
  const receipts = getReceipts();
  return NextResponse.json({
    success: true,
    data: receipts,
    count: receipts.length,
  });
}

/**
 * POST /api/receipts - Create a new receipt
 * Handles duplicate detection, status determination, and SSE emission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      parsedReceipt, 
      projectId, 
      costCodeId, 
      notes,
      imageUrl 
    } = body;

    if (!parsedReceipt) {
      return NextResponse.json(
        { success: false, error: 'Missing parsedReceipt in request body' },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (parsedReceipt.imageHash) {
      const duplicate = findDuplicateReceipt(parsedReceipt.imageHash);
      if (duplicate) {
        return NextResponse.json({
          success: false,
          status: 'duplicate',
          message: 'This receipt has already been submitted',
          duplicates: [duplicate],
        });
      }
    }

    // Get project and cost code info
    const project = getProjectById(projectId);
    const costCode = getCostCodeById(projectId, costCodeId);
    const user = getCurrentUser();

    if (!project || !costCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid project or cost code' },
        { status: 400 }
      );
    }

    // Calculate overall confidence
    const confidence = (
      parsedReceipt.merchantConfidence +
      parsedReceipt.dateConfidence +
      parsedReceipt.totalConfidence
    ) / 3;

    // Determine status
    const status = determineReceiptStatus(
      confidence,
      parsedReceipt.total,
      projectId,
      costCodeId
    );

    // Create receipt
    const newReceipt = createReceipt({
      imageUrl,
      merchant: parsedReceipt.merchant,
      date: parsedReceipt.date,
      total: parsedReceipt.total,
      tax: parsedReceipt.tax,
      items: parsedReceipt.items,
      projectId,
      projectName: project.name,
      costCodeId,
      costCodeName: `${costCode.code} - ${costCode.description}`,
      status,
      confidence,
      notes,
      createdBy: user.name,
      imageHash: parsedReceipt.imageHash,
      cmicLineId: status === 'logged' ? generateCMiCReceiptId() : undefined,
    });

    // Add audit log
    addAuditLog({
      entityType: 'receipt',
      entityId: newReceipt.id,
      action: 'created',
      performedBy: user.name,
      details: { status, confidence },
    });

    // Emit SSE event
    eventBus.emit(RECEIPT_EVENTS.CREATED, {
      type: 'created',
      receipt: newReceipt,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: newReceipt.status,
      data: newReceipt,
      message: getStatusMessage(newReceipt.status),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create receipt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

function getStatusMessage(status: ReceiptStatus): string {
  switch (status) {
    case 'logged':
      return 'Receipt logged successfully and synced to CMiC';
    case 'needs_review':
      return 'Receipt needs manual review due to low OCR confidence';
    case 'pending_approval':
      return 'Receipt exceeds budget and requires PM approval';
    default:
      return 'Receipt processed';
  }
}

