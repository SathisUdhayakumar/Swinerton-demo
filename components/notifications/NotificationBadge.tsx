'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Receipt, Delivery, SSEReceiptEvent, SSEDeliveryEvent } from '@/types';

export function NotificationBadge() {
  const router = useRouter();
  const pathname = usePathname();
  const [newReceipts, setNewReceipts] = useState<Receipt[]>([]);
  const [newDeliveries, setNewDeliveries] = useState<Delivery[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Load viewed items from localStorage
  const getViewedItems = useCallback(() => {
    if (typeof window === 'undefined') return { receipts: new Set(), deliveries: new Set() };
    const viewed = localStorage.getItem('viewedItems');
    if (viewed) {
      const parsed = JSON.parse(viewed);
      return {
        receipts: new Set(parsed.receipts || []),
        deliveries: new Set(parsed.deliveries || []),
      };
    }
    return { receipts: new Set(), deliveries: new Set() };
  }, []);

  // Mark items as viewed
  const markAsViewed = useCallback((type: 'receipts' | 'deliveries', ids: string[]) => {
    if (typeof window === 'undefined') return;
    const viewed = getViewedItems();
    if (type === 'receipts') {
      ids.forEach(id => viewed.receipts.add(id));
    } else {
      ids.forEach(id => viewed.deliveries.add(id));
    }
    localStorage.setItem('viewedItems', JSON.stringify({
      receipts: Array.from(viewed.receipts),
      deliveries: Array.from(viewed.deliveries),
    }));
  }, [getViewedItems]);

  // Subscribe to SSE streams
  useEffect(() => {
    const viewed = getViewedItems();

    // Receipts SSE
    const receiptSource = new EventSource('/api/receipts/stream');
    
    receiptSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    receiptSource.addEventListener('receipt', (event) => {
      const data: SSEReceiptEvent = JSON.parse(event.data);

      if (data.type === 'created' && !viewed.receipts.has(data.receipt.id)) {
        setNewReceipts((prev) => {
          // Avoid duplicates
          if (prev.find(r => r.id === data.receipt.id)) return prev;
          return [data.receipt, ...prev];
        });
      } else if (data.type === 'deleted') {
        setNewReceipts((prev) => prev.filter((r) => r.id !== data.receipt.id));
      }
    });

    receiptSource.onerror = () => {
      setIsConnected(false);
    };

    // Deliveries SSE
    const deliverySource = new EventSource('/api/deliveries/stream');

    deliverySource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    deliverySource.addEventListener('delivery', (event) => {
      const data: SSEDeliveryEvent = JSON.parse(event.data);

      if (data.type === 'created' && !viewed.deliveries.has(data.delivery.id)) {
        setNewDeliveries((prev) => {
          // Avoid duplicates
          if (prev.find(d => d.id === data.delivery.id)) return prev;
          return [data.delivery, ...prev];
        });
      } else if (data.type === 'deleted') {
        setNewDeliveries((prev) => prev.filter((d) => d.id !== data.delivery.id));
      }
    });

    deliverySource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      receiptSource.close();
      deliverySource.close();
    };
  }, [getViewedItems]);

  // Filter out viewed items
  useEffect(() => {
    const viewed = getViewedItems();
    setNewReceipts((prev) => prev.filter((r) => !viewed.receipts.has(r.id)));
    setNewDeliveries((prev) => prev.filter((d) => !viewed.deliveries.has(d.id)));
  }, [getViewedItems]);

  const totalNew = newReceipts.length + newDeliveries.length;

  const handleClick = () => {
    if (newReceipts.length > 0) {
      // Navigate to the first new receipt's project receipts page
      const firstReceipt = newReceipts[0];
      markAsViewed('receipts', newReceipts.map(r => r.id));
      setNewReceipts([]);
      router.push(`/project/${firstReceipt.projectId}/receipts`);
    } else if (newDeliveries.length > 0) {
      // Navigate to the first new delivery's project deliveries page
      const firstDelivery = newDeliveries[0];
      markAsViewed('deliveries', newDeliveries.map(d => d.id));
      setNewDeliveries([]);
      router.push(`/project/${firstDelivery.projectId}/deliveries`);
    }
  };

  if (totalNew === 0) return null;

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
      aria-label={`${totalNew} new items`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
        {totalNew > 9 ? '9+' : totalNew}
      </span>
    </button>
  );
}

