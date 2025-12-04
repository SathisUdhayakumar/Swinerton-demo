import { PurchaseOrder, ParsedBOL, BOLLine, POLine, DeliveryLine, MatchResult, ProjectSuggestion } from '@/types';
import { mockPOs, getProjectById, getCurrentUser } from './mockStorage';

// Quantity tolerance (±2%)
const QTY_TOLERANCE = 0.02;

// ============== Text Tokenization & Matching ==============

/**
 * Tokenize and normalize text for fuzzy matching
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Calculate token overlap score between two strings
 * Returns value between 0 and 1
 */
export function tokenOverlapScore(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  let overlap = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) overlap++;
  });
  
  return (2 * overlap) / (tokens1.size + tokens2.size);
}

/**
 * Check if a date falls within a delivery window
 */
function isWithinDeliveryWindow(
  deliveryDate: string,
  window: { start: string; end: string }
): boolean {
  const date = new Date(deliveryDate);
  const start = new Date(window.start);
  const end = new Date(window.end);
  return date >= start && date <= end;
}

// ============== PO Matching ==============

/**
 * Match BOL to best PO using hierarchical matching:
 * 1. Exact PO number match
 * 2. Vendor + delivery window match
 * 3. Fuzzy description token match
 */
export function matchBOLToPO(parsedBOL: ParsedBOL): MatchResult | null {
  // Try exact PO number match first
  if (parsedBOL.poReference) {
    const exactMatch = mockPOs.find(
      (po) => po.poNumber === parsedBOL.poReference
    );
    if (exactMatch) {
      return {
        po: exactMatch,
        matchScore: 1.0,
        matchedBy: 'po_number',
        lineMatches: matchLines(parsedBOL.lines, exactMatch.lines),
      };
    }
  }

  // Try vendor + delivery window match
  const vendorMatches = mockPOs.filter(
    (po) =>
      po.vendor.toLowerCase() === parsedBOL.vendor.toLowerCase() &&
      isWithinDeliveryWindow(parsedBOL.deliveryDate, po.deliveryWindow)
  );

  if (vendorMatches.length === 1) {
    return {
      po: vendorMatches[0],
      matchScore: 0.85,
      matchedBy: 'vendor_window',
      lineMatches: matchLines(parsedBOL.lines, vendorMatches[0].lines),
    };
  }

  // Fuzzy match by description tokens
  let bestMatch: PurchaseOrder | null = null;
  let bestScore = 0;

  for (const po of mockPOs) {
    let totalScore = 0;
    let matchCount = 0;

    for (const bolLine of parsedBOL.lines) {
      for (const poLine of po.lines) {
        const score = tokenOverlapScore(bolLine.description, poLine.description);
        if (score > 0.3) {
          totalScore += score;
          matchCount++;
        }
      }
    }

    const avgScore = matchCount > 0 ? totalScore / matchCount : 0;

    // Bonus for vendor match
    if (po.vendor.toLowerCase().includes(parsedBOL.vendor.toLowerCase())) {
      totalScore += 0.2;
    }

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestMatch = po;
    }
  }

  if (bestMatch && bestScore > 0.3) {
    return {
      po: bestMatch,
      matchScore: Math.min(bestScore, 0.75),
      matchedBy: 'fuzzy',
      lineMatches: matchLines(parsedBOL.lines, bestMatch.lines),
    };
  }

  return null;
}

// ============== Line Matching ==============

/**
 * Match individual BOL lines to PO lines
 */
export function matchLines(
  bolLines: BOLLine[],
  poLines: POLine[]
): { bolLineId: string; poLineId: string; confidence: number }[] {
  const matches: { bolLineId: string; poLineId: string; confidence: number }[] = [];
  const usedPOLines = new Set<string>();

  for (const bolLine of bolLines) {
    let bestMatch: POLine | null = null;
    let bestScore = 0;

    for (const poLine of poLines) {
      if (usedPOLines.has(poLine.id)) continue;

      const score = tokenOverlapScore(bolLine.description, poLine.description);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = poLine;
      }
    }

    if (bestMatch && bestScore > 0.4) {
      matches.push({
        bolLineId: bolLine.id,
        poLineId: bestMatch.id,
        confidence: bestScore,
      });
      usedPOLines.add(bestMatch.id);
    }
  }

  return matches;
}

/**
 * Create delivery lines with match status and quantity deltas
 */
export function createDeliveryLines(
  bolLines: BOLLine[],
  poLines: POLine[],
  lineMatches: { bolLineId: string; poLineId: string; confidence: number }[]
): DeliveryLine[] {
  const deliveryLines: DeliveryLine[] = [];
  const matchMap = new Map(lineMatches.map((m) => [m.bolLineId, m]));

  for (const bolLine of bolLines) {
    const match = matchMap.get(bolLine.id);
    const poLine = match
      ? poLines.find((p) => p.id === match.poLineId)
      : undefined;

    const qtyDelivered = bolLine.qty;
    const qtyOrdered = poLine?.qty ?? 0;
    const qtyDelta = qtyDelivered - qtyOrdered;

    let matchStatus: DeliveryLine['matchStatus'] = 'unmatched';
    if (poLine) {
      const tolerance = qtyOrdered * QTY_TOLERANCE;
      if (Math.abs(qtyDelta) <= tolerance) {
        matchStatus = 'exact';
      } else if (qtyDelta < 0) {
        matchStatus = 'partial';
      } else {
        matchStatus = 'over';
      }
    }

    deliveryLines.push({
      id: `dl-${Date.now()}-${bolLine.id}`,
      bolLine,
      poLine,
      qtyDelivered,
      qtyOrdered,
      qtyDelta,
      matchStatus,
      matchConfidence: match?.confidence ?? 0,
    });
  }

  // Add missing PO lines (not delivered)
  const matchedPOLineIds = new Set(lineMatches.map((m) => m.poLineId));
  for (const poLine of poLines) {
    if (!matchedPOLineIds.has(poLine.id)) {
      deliveryLines.push({
        id: `dl-${Date.now()}-missing-${poLine.id}`,
        bolLine: {
          id: `missing-${poLine.id}`,
          description: poLine.description,
          qty: 0,
          unit: poLine.unit,
          confidence: 1,
        },
        poLine,
        qtyDelivered: 0,
        qtyOrdered: poLine.qty,
        qtyDelta: -poLine.qty,
        matchStatus: 'missing',
        matchConfidence: 1,
      });
    }
  }

  return deliveryLines;
}

/**
 * Calculate overall match score for a delivery
 */
export function calculateMatchScore(deliveryLines: DeliveryLine[]): number {
  if (deliveryLines.length === 0) return 0;

  let totalScore = 0;
  for (const line of deliveryLines) {
    switch (line.matchStatus) {
      case 'exact':
        totalScore += 1.0;
        break;
      case 'partial':
        totalScore += 0.7;
        break;
      case 'over':
        totalScore += 0.6;
        break;
      case 'missing':
        totalScore += 0.3;
        break;
      case 'unmatched':
        totalScore += 0;
        break;
    }
  }

  return totalScore / deliveryLines.length;
}

// ============== Project & Cost Code Suggestions ==============

/**
 * Merchant to project/cost code mapping heuristics
 */
const merchantMappings: Record<string, { projectHint?: string; costCodeHint: string }> = {
  'home depot': { costCodeHint: '6100' },
  'lowes': { costCodeHint: '6100' },
  'harbor freight': { costCodeHint: '6300' },
  'grainger': { costCodeHint: '6400' },
  'steelco': { projectHint: 'alpha', costCodeHint: '6200' },
  'frameworks': { projectHint: 'beta', costCodeHint: '6200' },
};

/**
 * Suggest project and cost code based on merchant and user history
 */
export function suggestProjectAndCostCode(
  merchant: string,
  userId?: string
): ProjectSuggestion | null {
  const normalizedMerchant = merchant.toLowerCase();
  const user = getCurrentUser();
  
  // Check merchant mappings
  let mapping: { projectHint?: string; costCodeHint: string } | undefined;
  for (const [key, value] of Object.entries(merchantMappings)) {
    if (normalizedMerchant.includes(key)) {
      mapping = value;
      break;
    }
  }

  // Determine project
  let projectId = mapping?.projectHint || user.lastUsedProjectId || 'alpha';
  const project = getProjectById(projectId);
  
  if (!project) {
    projectId = 'alpha';
  }

  const finalProject = getProjectById(projectId)!;

  // Determine cost code
  const costCodeHint = mapping?.costCodeHint || '6100';
  let costCode = finalProject.costCodes.find((cc) => cc.code === costCodeHint);
  
  if (!costCode) {
    costCode = finalProject.costCodes[0];
  }

  return {
    projectId: finalProject.id,
    projectName: finalProject.name,
    costCodeId: costCode.id,
    costCodeName: `${costCode.code} - ${costCode.description}`,
    confidence: mapping ? 0.9 : 0.7,
    reason: mapping
      ? `Based on merchant "${merchant}"`
      : `Based on your recent activity`,
  };
}
