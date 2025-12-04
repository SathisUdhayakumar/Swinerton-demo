import { NextRequest, NextResponse } from 'next/server';
import { ParsedBOL, PurchaseOrder } from '@/types';
import { 
  getDeliveries, 
  createDelivery, 
  determineDeliveryStatus,
  getCurrentUser,
  addAuditLog
} from '@/lib/mockStorage';
import { 
  matchBOLToPO, 
  createDeliveryLines, 
  calculateMatchScore 
} from '@/lib/matchUtils';
import { eventBus, DELIVERY_EVENTS } from '@/lib/eventBus';

/**
 * GET /api/deliveries - List all deliveries
 */
export async function GET() {
  const deliveries = getDeliveries();
  return NextResponse.json({
    success: true,
    data: deliveries,
    count: deliveries.length,
  });
}

/**
 * POST /api/deliveries - Create a new delivery
 * Handles PO matching, line reconciliation, and SSE emission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parsedBOL, matchedPO } = body as {
      parsedBOL: ParsedBOL;
      matchedPO?: PurchaseOrder;
    };

    if (!parsedBOL) {
      return NextResponse.json(
        { success: false, error: 'Missing parsedBOL in request body' },
        { status: 400 }
      );
    }

    const user = getCurrentUser();

    // If no matched PO provided, try to find one
    let po = matchedPO;
    let matchScore = 1.0;
    let lineMatches: { bolLineId: string; poLineId: string; confidence: number }[] = [];

    if (!po) {
      const matchResult = matchBOLToPO(parsedBOL);
      if (matchResult) {
        po = matchResult.po;
        matchScore = matchResult.matchScore;
        lineMatches = matchResult.lineMatches;
      }
    } else {
      // Use provided PO for matching
      const matchResult = matchBOLToPO(parsedBOL);
      if (matchResult && matchResult.po.id === po.id) {
        lineMatches = matchResult.lineMatches;
        matchScore = matchResult.matchScore;
      }
    }

    // Create delivery lines
    const deliveryLines = po
      ? createDeliveryLines(parsedBOL.lines, po.lines, lineMatches)
      : parsedBOL.lines.map((bolLine, idx) => ({
          id: `dl-${Date.now()}-${idx}`,
          bolLine,
          qtyDelivered: bolLine.qty,
          qtyOrdered: 0,
          qtyDelta: bolLine.qty,
          matchStatus: 'unmatched' as const,
          matchConfidence: 0,
        }));

    // Determine status
    const status = determineDeliveryStatus(deliveryLines, parsedBOL);

    // Calculate match score
    const finalMatchScore = po ? calculateMatchScore(deliveryLines) : 0;

    // Create delivery record
    const newDelivery = createDelivery({
      bolNumber: parsedBOL.bolNumber,
      vendor: parsedBOL.vendor,
      project: po?.project || 'Unassigned',
      projectId: po?.projectId,
      poNumber: po?.poNumber,
      poId: po?.id,
      deliveryDate: parsedBOL.deliveryDate,
      status,
      lines: deliveryLines,
      matchScore: finalMatchScore,
      parsedBOL,
    });

    // Add audit log
    addAuditLog({
      entityType: 'delivery',
      entityId: newDelivery.id,
      action: 'created',
      performedBy: user.name,
      details: { status, matchScore: finalMatchScore, poNumber: po?.poNumber },
    });

    // Emit SSE event
    eventBus.emit(DELIVERY_EVENTS.CREATED, {
      type: 'created',
      delivery: newDelivery,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: newDelivery,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create delivery',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
