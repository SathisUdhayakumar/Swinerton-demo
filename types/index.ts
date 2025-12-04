// Types for Combined Demo: Workflow 1 (Receipt Capture) + Workflow 2 (Delivery Reconciliation)

// ============== Projects & Users ==============

export interface Project {
  id: string;
  name: string;
  code: string;
  budget: number;
  spent: number;
  costCodes: CostCode[];
}

export interface CostCode {
  id: string;
  code: string;
  description: string;
  budget: number;
  spent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'site_worker' | 'foreman' | 'pm' | 'admin';
  projectIds: string[];
  lastUsedProjectId?: string;
  lastUsedCostCodeId?: string;
}

// ============== Purchase Orders ==============

export interface POLine {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  project: string;
  projectId: string;
  deliveryWindow: {
    start: string;
    end: string;
  };
  lines: POLine[];
  status: 'open' | 'partially_fulfilled' | 'fulfilled' | 'closed';
  createdAt: string;
}

// ============== BOL & Delivery ==============

export interface BOLLine {
  id: string;
  description: string;
  qty: number;
  unit: string;
  confidence: number;
  rawText?: string;
}

export interface ParsedBOL {
  bolNumber: string;
  vendor: string;
  deliveryDate: string;
  poReference?: string;
  lines: BOLLine[];
  confidence: number;
  rawImageUrl?: string;
}

export interface DeliveryLine {
  id: string;
  bolLine: BOLLine;
  poLine?: POLine;
  qtyDelivered: number;
  qtyOrdered: number;
  qtyDelta: number;
  matchStatus: 'exact' | 'partial' | 'over' | 'unmatched' | 'missing';
  matchConfidence: number;
  flagged?: boolean;
  flagReason?: string;
}

export type DeliveryStatus = 
  | 'verified'
  | 'pending_approval'
  | 'needs_review'
  | 'unmatched'
  | 'rejected'
  | 'approved';

export interface Delivery {
  id: string;
  bolNumber: string;
  vendor: string;
  project: string;
  projectId?: string;
  poNumber?: string;
  poId?: string;
  deliveryDate: string;
  status: DeliveryStatus;
  lines: DeliveryLine[];
  matchScore: number;
  parsedBOL: ParsedBOL;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  notes?: string;
  cmicDeliveryId?: string;
}

export type DeliveryAction = 
  | 'approve'
  | 'reject'
  | 'reconcile'
  | 'flag_damage'
  | 'require_pm_approval'
  | 'request_return';

export interface DeliveryActionPayload {
  action: DeliveryAction;
  notes?: string;
  lineIds?: string[];
}

// ============== Receipts ==============

export interface ReceiptItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  confidence: number;
}

export interface ParsedReceipt {
  merchant: string;
  merchantConfidence: number;
  date: string;
  dateConfidence: number;
  total: number;
  totalConfidence: number;
  tax?: number;
  taxConfidence?: number;
  items: ReceiptItem[];
  rawText?: string;
  imageHash?: string;
}

export type ReceiptStatus = 
  | 'logged'
  | 'needs_review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'duplicate';

export interface Receipt {
  id: string;
  imageUrl?: string;
  merchant: string;
  date: string;
  total: number;
  tax?: number;
  items: ReceiptItem[];
  projectId: string;
  projectName: string;
  costCodeId: string;
  costCodeName: string;
  status: ReceiptStatus;
  confidence: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  cmicLineId?: string;
  imageHash?: string;
}

export type ReceiptAction = 
  | 'approve'
  | 'reject'
  | 'reconcile'
  | 'needs_review'
  | 'request_return';

export interface ReceiptActionPayload {
  action: ReceiptAction;
  notes?: string;
}

// ============== Chat Messages ==============

export type MessageType = 'text' | 'image' | 'receipt' | 'bol' | 'action' | 'system';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  imageUrl?: string;
  parsedData?: ParsedReceipt | ParsedBOL;
  suggestions?: ProjectSuggestion;
  receiptId?: string;
  deliveryId?: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ProjectSuggestion {
  projectId: string;
  projectName: string;
  costCodeId: string;
  costCodeName: string;
  confidence: number;
  reason: string;
}

// ============== OCR Results ==============

export interface OCRResult {
  success: boolean;
  type: 'receipt' | 'bol';
  parsedReceipt?: ParsedReceipt;
  parsedBOL?: ParsedBOL;
  processingTime: number;
  warnings?: string[];
}

// ============== PO Matching ==============

export interface MatchResult {
  po: PurchaseOrder;
  matchScore: number;
  matchedBy: 'po_number' | 'vendor_window' | 'fuzzy';
  lineMatches: {
    bolLineId: string;
    poLineId: string;
    confidence: number;
  }[];
}

// ============== SSE Events ==============

export interface SSEDeliveryEvent {
  type: 'created' | 'updated' | 'deleted';
  delivery: Delivery;
  timestamp: string;
}

export interface SSEReceiptEvent {
  type: 'created' | 'updated' | 'deleted';
  receipt: Receipt;
  timestamp: string;
}

// ============== Audit Log ==============

export interface AuditLog {
  id: string;
  entityType: 'receipt' | 'delivery';
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
