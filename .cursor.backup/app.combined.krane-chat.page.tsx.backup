'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { KraneHeader } from '@/components/chat/KraneHeader';
import { KraneMessageList } from '@/components/chat/KraneMessageList';
import { KraneMessageInput } from '@/components/chat/KraneMessageInput';
import { ChatMessage, ParsedReceipt, ParsedBOL, ProjectSuggestion } from '@/types';

export default function KraneChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReceiptMessage, setPendingReceiptMessage] = useState<string | null>(null);
  const [pendingReceiptData, setPendingReceiptData] = useState<{
    parsedReceipt: ParsedReceipt;
    suggestion: ProjectSuggestion;
  } | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  const handleSendMessage = (text: string) => {
    addMessage({
      type: 'text',
      content: text,
      sender: 'user',
      status: 'sent',
    });

    // Bot response
    setTimeout(() => {
      addMessage({
        type: 'text',
        content: "I can help you log receipts and BOLs. Upload an image using the + button below, or use one of the demo files to get started!",
        sender: 'bot',
      });
    }, 500);
  };

  const handleUploadImage = async (fileOrUrl: File | string) => {
    setIsProcessing(true);

    const filename = fileOrUrl instanceof File ? fileOrUrl.name : fileOrUrl;
    
    // Add user message with image
    const userMsgId = addMessage({
      type: 'image',
      content: 'Uploaded image',
      sender: 'user',
      imageUrl: filename,
      status: 'sending',
    });

    try {
      // Call OCR API
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }

      const ocrResponse = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const ocrData = await ocrResponse.json();

      updateMessage(userMsgId, { status: 'sent' });

      if (!ocrData.success) {
        addMessage({
          type: 'text',
          content: '❌ Sorry, I couldn\'t process that image. Please try again.',
          sender: 'bot',
        });
        return;
      }

      if (ocrData.type === 'receipt' && ocrData.parsedReceipt) {
        // Get suggestions
        const suggestResponse = await fetch('/api/mock/ai-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchant: ocrData.parsedReceipt.merchant }),
        });
        const suggestData = await suggestResponse.json();

        // Add bot response with parsed receipt
        const botMsgId = addMessage({
          type: 'receipt',
          content: '📄 I found a receipt! Here\'s what I extracted:',
          sender: 'bot',
          parsedData: ocrData.parsedReceipt,
          suggestions: suggestData.suggestion,
        });

        setPendingReceiptMessage(botMsgId);
        setPendingReceiptData({
          parsedReceipt: ocrData.parsedReceipt,
          suggestion: suggestData.suggestion,
        });
      } else if (ocrData.type === 'bol' && ocrData.parsedBOL) {
        // BOL detected
        addMessage({
          type: 'text',
          content: `📋 I detected a Bill of Lading!\n\n• BOL #: ${ocrData.parsedBOL.bolNumber}\n• Vendor: ${ocrData.parsedBOL.vendor}\n• ${ocrData.parsedBOL.lines.length} line items\n\nRedirecting to BOL capture page...`,
          sender: 'bot',
        });

        // Store BOL data and redirect
        sessionStorage.setItem('pendingBOL', JSON.stringify(ocrData.parsedBOL));
        setTimeout(() => {
          router.push('/capture-bol');
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      addMessage({
        type: 'text',
        content: '❌ An error occurred while processing the image.',
        sender: 'bot',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async (messageId: string) => {
    if (!pendingReceiptData) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedReceipt: pendingReceiptData.parsedReceipt,
          projectId: pendingReceiptData.suggestion.projectId,
          costCodeId: pendingReceiptData.suggestion.costCodeId,
        }),
      });

      const data = await response.json();

      if (data.status === 'duplicate') {
        addMessage({
          type: 'system',
          content: '⚠️ This receipt has already been submitted. Duplicate detected.',
          sender: 'bot',
        });
      } else if (data.success) {
        addMessage({
          type: 'system',
          content: `✅ Receipt logged successfully!\n\nStatus: ${data.status}\n${data.data.cmicLineId ? `CMiC ID: ${data.data.cmicLineId}` : ''}`,
          sender: 'bot',
          receiptId: data.data.id,
        });

        if (data.status === 'needs_review') {
          addMessage({
            type: 'action',
            content: '⚠️ This receipt needs manual review due to low OCR confidence.',
            sender: 'bot',
          });
        } else if (data.status === 'pending_approval') {
          addMessage({
            type: 'action',
            content: '⏳ This receipt requires PM approval (budget exceeded).',
            sender: 'bot',
          });
        }
      } else {
        addMessage({
          type: 'text',
          content: `❌ Failed to log receipt: ${data.error}`,
          sender: 'bot',
        });
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      addMessage({
        type: 'text',
        content: '❌ An error occurred while saving the receipt.',
        sender: 'bot',
      });
    } finally {
      setIsProcessing(false);
      setPendingReceiptMessage(null);
      setPendingReceiptData(null);
    }
  };

  const handleEditReceipt = (messageId: string) => {
    // For now, just show a message
    addMessage({
      type: 'text',
      content: '✏️ Edit mode coming soon! For now, you can use the standalone capture page for more control.',
      sender: 'bot',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50">
      <KraneHeader />
      <KraneMessageList
        messages={messages}
        onConfirmReceipt={handleConfirmReceipt}
        onEditReceipt={handleEditReceipt}
      />
      <KraneMessageInput
        onSendMessage={handleSendMessage}
        onUploadImage={handleUploadImage}
        disabled={isProcessing}
      />
    </div>
  );
}
