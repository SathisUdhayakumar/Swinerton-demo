import { 
  PurchaseOrder, 
  Delivery, 
  ParsedBOL, 
  DeliveryStatus, 
  DeliveryLine,
  Receipt,
  ReceiptStatus,
  Project,
  CostCode,
  User,
  AuditLog
} from '@/types';

// ============== Projects ==============

export const mockProjects: Project[] = [
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
      { id: 'cc-004', code: '6400', description: 'Safety Equipment', budget: 25000, spent: 5000 },
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
      { id: 'cc-007', code: '6500', description: 'Electrical', budget: 100000, spent: 20000 },
      { id: 'cc-008', code: '6600', description: 'Plumbing', budget: 75000, spent: 15000 },
    ],
  },
];

// ============== Users ==============

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'John Smith',
    email: 'john.smith@swinerton.com',
    role: 'site_worker',
    projectIds: ['alpha', 'beta'],
    lastUsedProjectId: 'alpha',
    lastUsedCostCodeId: 'cc-001',
  },
  {
    id: 'user-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@swinerton.com',
    role: 'pm',
    projectIds: ['alpha', 'beta'],
  },
];

// ============== Purchase Orders ==============

export const mockPOs: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: '552',
    vendor: 'SteelCo',
    project: 'Clemson-210 Keowee Trl',
    projectId: 'alpha',
    deliveryWindow: {
      start: '2025-12-01',
      end: '2025-12-15',
    },
    lines: [
      {
        id: 'pol-001',
        description: 'Steel Beams W12x26',
        qty: 100,
        unit: 'EA',
        unitPrice: 245.00,
      },
      {
        id: 'pol-002',
        description: 'Steel Bolts 3/4" x 3"',
        qty: 500,
        unit: 'EA',
        unitPrice: 2.50,
      },
    ],
    status: 'open',
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 'po-002',
    poNumber: '771',
    vendor: 'FrameWorks',
    project: 'DFW Terminal F',
    projectId: 'beta',
    deliveryWindow: {
      start: '2025-12-05',
      end: '2025-12-20',
    },
    lines: [
      {
        id: 'pol-003',
        description: 'Structural Steel Frames 8ft',
        qty: 50,
        unit: 'EA',
        unitPrice: 890.00,
      },
      {
        id: 'pol-004',
        description: 'Connection Plates 12"x12"',
        qty: 200,
        unit: 'EA',
        unitPrice: 35.00,
      },
      {
        id: 'pol-005',
        description: 'Anchor Bolts 1" x 8"',
        qty: 400,
        unit: 'EA',
        unitPrice: 8.50,
      },
    ],
    status: 'open',
    createdAt: '2025-11-20T14:30:00Z',
  },
];

// ============== Deliveries ==============

export let mockDeliveries: Delivery[] = [
  {
    id: 'del-001',
    bolNumber: 'BOL-2025-1201-001',
    vendor: 'SteelCo',
    project: 'Clemson-210 Keowee Trl',
    projectId: 'alpha',
    poNumber: 'PO-2024-002',
    poId: 'PO-2024-002',
    deliveryDate: '2025-12-01',
    status: 'verified',
    matchScore: 0.98,
    lines: [
      {
        id: 'dl-001',
        bolLine: {
          id: 'bl-001',
          description: 'Steel Beams W12x26',
          qty: 100,
          unit: 'EA',
          confidence: 0.95,
        },
        poLine: {
          id: 'pol-001',
          description: 'Steel Beams W12x26',
          qty: 100,
          unit: 'EA',
          unitPrice: 245.00,
        },
        qtyDelivered: 100,
        qtyOrdered: 100,
        qtyDelta: 0,
        matchStatus: 'exact',
        matchConfidence: 0.95,
      },
    ],
    parsedBOL: {
      bolNumber: 'BOL-2025-1201-001',
      vendor: 'SteelCo',
      deliveryDate: '2025-12-01',
      poReference: '552',
      lines: [
        {
          id: 'bl-001',
          description: 'Steel Beams W12x26',
          qty: 100,
          unit: 'EA',
          confidence: 0.95,
        },
      ],
      confidence: 0.95,
    },
    createdAt: '2025-12-01T08:30:00Z',
    updatedAt: '2025-12-01T09:15:00Z',
    approvedBy: 'John Smith',
    notes: '100 beams verified and received',
    cmicDeliveryId: 'CMIC-DEL-001',
  },
];

// ============== Receipts ==============

export let mockReceipts: Receipt[] = [
  {
    id: 'rcpt-001',
    merchant: 'Home Depot',
    date: '2025-12-01',
    total: 142.50,
    tax: 11.75,
    items: [
      { id: 'item-001', description: 'Concrete Mix 80lb', qty: 5, unitPrice: 6.50, total: 32.50, confidence: 0.95 },
      { id: 'item-002', description: '2x4x8 Lumber', qty: 20, unitPrice: 4.25, total: 85.00, confidence: 0.92 },
      { id: 'item-003', description: 'Wood Screws 3"', qty: 2, unitPrice: 12.50, total: 25.00, confidence: 0.90 },
    ],
    projectId: 'alpha',
    projectName: 'Clemson-210 Keowee Trl',
    costCodeId: 'cc-001',
    costCodeName: 'Materials - General',
    status: 'logged',
    confidence: 0.92,
    createdAt: '2025-12-01T10:30:00Z',
    updatedAt: '2025-12-01T10:30:00Z',
    createdBy: 'John Smith',
    cmicLineId: 'CMIC-RCPT-001',
  },
];

// ============== Audit Logs ==============

export let mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    entityType: 'delivery',
    entityId: 'del-001',
    action: 'approved',
    performedBy: 'John Smith',
    timestamp: '2025-12-01T09:15:00Z',
    details: { cmicDeliveryId: 'CMIC-DEL-001' },
  },
  {
    id: 'log-002',
    entityType: 'receipt',
    entityId: 'rcpt-001',
    action: 'created',
    performedBy: 'John Smith',
    timestamp: '2025-12-01T10:30:00Z',
  },
];

// ============== Image Hash Tracking (for duplicate detection) ==============

export const imageHashes: Map<string, string> = new Map([
  ['hash_home_depot_001', 'rcpt-001'],
]);

// ============== Helper Functions ==============

// Generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Simple hash function for images (simulated)
export function generateImageHash(filename: string): string {
  // In real implementation, this would compute actual image hash
  // For demo, we use filename-based hash
  if (filename.includes('home_depot') || filename.includes('duplicate')) {
    return 'hash_home_depot_001';
  }
  return `hash_${Date.now()}`;
}

// ============== Project CRUD ==============

export function getProjects(): Project[] {
  return mockProjects;
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getCostCodeById(projectId: string, costCodeId: string): CostCode | undefined {
  const project = getProjectById(projectId);
  return project?.costCodes.find((cc) => cc.id === costCodeId);
}

// ============== User CRUD ==============

export function getUsers(): User[] {
  return mockUsers;
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getCurrentUser(): User {
  return mockUsers[0]; // Default to first user for demo
}

// ============== PO CRUD ==============

export function getPOs(): PurchaseOrder[] {
  return mockPOs;
}

export function getPOById(id: string): PurchaseOrder | undefined {
  return mockPOs.find((po) => po.id === id);
}

export function getPOByNumber(poNumber: string): PurchaseOrder | undefined {
  return mockPOs.find((po) => po.poNumber === poNumber);
}

export function getPOsByVendor(vendor: string): PurchaseOrder[] {
  return mockPOs.filter((po) => 
    po.vendor.toLowerCase().includes(vendor.toLowerCase())
  );
}

// ============== Delivery CRUD ==============

export function getDeliveries(): Delivery[] {
  return mockDeliveries;
}

export function getDeliveryById(id: string): Delivery | undefined {
  return mockDeliveries.find((d) => d.id === id);
}

export function createDelivery(delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Delivery {
  const newDelivery: Delivery = {
    ...delivery,
    id: generateId('del'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockDeliveries.push(newDelivery);
  return newDelivery;
}

export function updateDelivery(id: string, updates: Partial<Delivery>): Delivery | undefined {
  const index = mockDeliveries.findIndex((d) => d.id === id);
  if (index === -1) return undefined;
  
  mockDeliveries[index] = {
    ...mockDeliveries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockDeliveries[index];
}

export function deleteDelivery(id: string): boolean {
  const index = mockDeliveries.findIndex((d) => d.id === id);
  if (index === -1) return false;
  mockDeliveries.splice(index, 1);
  return true;
}

// ============== Receipt CRUD ==============

export function getReceipts(): Receipt[] {
  return mockReceipts;
}

export function getReceiptById(id: string): Receipt | undefined {
  return mockReceipts.find((r) => r.id === id);
}

export function createReceipt(receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Receipt {
  const newReceipt: Receipt = {
    ...receipt,
    id: generateId('rcpt'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockReceipts.push(newReceipt);
  
  // Track image hash for duplicate detection
  if (newReceipt.imageHash) {
    imageHashes.set(newReceipt.imageHash, newReceipt.id);
  }
  
  return newReceipt;
}

export function updateReceipt(id: string, updates: Partial<Receipt>): Receipt | undefined {
  const index = mockReceipts.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  
  mockReceipts[index] = {
    ...mockReceipts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockReceipts[index];
}

export function deleteReceipt(id: string): boolean {
  const index = mockReceipts.findIndex((r) => r.id === id);
  if (index === -1) return false;
  mockReceipts.splice(index, 1);
  return true;
}

export function findDuplicateReceipt(imageHash: string): Receipt | undefined {
  const existingId = imageHashes.get(imageHash);
  if (existingId) {
    return getReceiptById(existingId);
  }
  return undefined;
}

// ============== Audit Log CRUD ==============

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const newLog: AuditLog = {
    ...log,
    id: generateId('log'),
    timestamp: new Date().toISOString(),
  };
  mockAuditLogs.push(newLog);
  return newLog;
}

export function getAuditLogs(entityType?: 'receipt' | 'delivery', entityId?: string): AuditLog[] {
  return mockAuditLogs.filter((log) => {
    if (entityType && log.entityType !== entityType) return false;
    if (entityId && log.entityId !== entityId) return false;
    return true;
  });
}

// ============== Status Determination ==============

export function determineDeliveryStatus(
  lines: DeliveryLine[],
  parsedBOL: ParsedBOL
): DeliveryStatus {
  // Check for low confidence OCR
  if (parsedBOL.confidence < 0.8 || lines.some((l) => l.bolLine.confidence < 0.8)) {
    return 'needs_review';
  }

  // Check for unmatched lines
  if (lines.some((l) => l.matchStatus === 'unmatched')) {
    return 'unmatched';
  }

  // Check for mismatches or partial deliveries
  if (lines.some((l) => l.matchStatus === 'partial' || l.matchStatus === 'over')) {
    return 'pending_approval';
  }

  // All exact matches
  if (lines.every((l) => l.matchStatus === 'exact')) {
    return 'verified';
  }

  return 'pending_approval';
}

export function determineReceiptStatus(
  confidence: number,
  total: number,
  projectId: string,
  costCodeId: string
): ReceiptStatus {
  // Low confidence OCR
  if (confidence < 0.8) {
    return 'needs_review';
  }

  // Check budget
  const project = getProjectById(projectId);
  const costCode = getCostCodeById(projectId, costCodeId);
  
  if (costCode && project) {
    const remainingBudget = costCode.budget - costCode.spent;
    if (total > remainingBudget) {
      return 'pending_approval';
    }
  }

  return 'logged';
}

// ============== Unique Number Generators ==============

export function generateBOLNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(mockDeliveries.length + 1).padStart(3, '0');
  return `BOL-${dateStr}-${seq}`;
}

export function generateCMiCDeliveryId(): string {
  return `CMIC-DEL-${Date.now()}`;
}

export function generateCMiCReceiptId(): string {
  return `CMIC-RCPT-${Date.now()}`;
}
