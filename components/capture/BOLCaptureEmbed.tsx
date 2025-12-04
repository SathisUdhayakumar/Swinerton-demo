'use client';

import { useState, useRef, useEffect } from 'react';
import { ParsedBOL, PurchaseOrder } from '@/types';
import { generateMessageId, formatTimestamp } from '@/lib/chatUtils';

interface BOLCaptureEmbedProps {
  onDeliveryCreated?: () => void;
  embedded?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'bol-result' | 'system';
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  imageUrl?: string;
  status?: 'sending' | 'sent' | 'error';
  parsedBOL?: ParsedBOL;
  matchedPO?: PurchaseOrder | null;
  matchScore?: number;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                confidence >= 0.8 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${color}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirming?: boolean;
}

function MessageBubble({ message, onConfirm, onCancel, isConfirming }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm relative ${
          isUser
            ? 'bg-[#DCF8C6] rounded-br-md'
            : 'bg-white rounded-bl-md'
        }`}
      >
        {/* Image upload preview */}
        {message.type === 'image' && message.imageUrl && (
          <div className="mb-2">
            <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-center p-4">
                <svg className="w-10 h-10 mx-auto text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs text-slate-500">{message.imageUrl}</p>
              </div>
            </div>
          </div>
        )}

        {/* Text content */}
        {message.type === 'text' && (
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{message.content}</p>
        )}

        {/* BOL Result with confirmation */}
        {message.type === 'bol-result' && message.parsedBOL && (
          <div className="space-y-3">
            <p className="text-sm text-slate-800 font-medium">{message.content}</p>
            
            {/* OCR Results */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">OCR Results</span>
                <ConfidenceBadge confidence={message.parsedBOL.confidence} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">BOL #</span>
                  <span className="text-slate-800 font-mono">{message.parsedBOL.bolNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor</span>
                  <span className="text-slate-800">{message.parsedBOL.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-700">{message.parsedBOL.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Items</span>
                  <span className="text-slate-700">{message.parsedBOL.lines.length} line items</span>
                </div>
              </div>
            </div>

            {/* PO Match */}
            {message.matchedPO && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-emerald-700">PO Matched</span>
                </div>
                <p className="text-xs text-emerald-800">PO #{message.matchedPO.poNumber} - {message.matchedPO.vendor}</p>
                {message.matchScore && (
                  <p className="text-[10px] text-emerald-600 mt-0.5">{(message.matchScore * 100).toFixed(0)}% confidence</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            {onConfirm && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onCancel}
                  disabled={isConfirming}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="flex-1 px-3 py-2 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#1DA851] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Create Delivery'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* System message */}
        {message.type === 'system' && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="whitespace-pre-wrap">{message.content}</span>
          </div>
        )}

        {/* Timestamp and status */}
        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isUser ? 'text-slate-500' : 'text-slate-400'}`}>
          {formatTimestamp(message.timestamp)}
          {isUser && message.status === 'sent' && (
            <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 16 15" fill="currentColor">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.511z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export function BOLCaptureEmbed({ onDeliveryCreated, embedded = false }: BOLCaptureEmbedProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingDelivery, setPendingDelivery] = useState<{
    messageId: string;
    parsedBOL: ParsedBOL;
    matchedPO: PurchaseOrder | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        type: 'text',
        content: '📋 Hi! I can help you process Bills of Lading.\n\nUpload a BOL image and I\'ll extract the details, match it to a PO, and create a delivery record.',
        sender: 'bot',
      });
    }
  }, []);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: generateMessageId(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg.id;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleUploadImage = async (fileOrUrl: File | string) => {
    setShowAttachMenu(false);
    setIsProcessing(true);

    const filename = fileOrUrl instanceof File ? fileOrUrl.name : fileOrUrl;
    
    const userMsgId = addMessage({
      type: 'image',
      content: 'Uploaded BOL',
      sender: 'user',
      imageUrl: filename,
      status: 'sending',
    });

    setIsTyping(true);

    try {
      const formData = new FormData();
      if (fileOrUrl instanceof File) {
        formData.append('image', fileOrUrl);
      } else {
        formData.append('imageUrl', fileOrUrl);
      }
      // Tell the OCR API we're expecting a BOL document
      formData.append('documentType', 'bol');

      const ocrResponse = await fetch('/api/mock/ai-ocr', {
        method: 'POST',
        body: formData,
      });
      const ocrData = await ocrResponse.json();

      updateMessage(userMsgId, { status: 'sent' });
      setIsTyping(false);

      if (!ocrData.success) {
        addMessage({
          type: 'text',
          content: "❌ Sorry, I couldn't process that image. Please try again.",
          sender: 'bot',
        });
        return;
      }

      if (ocrData.parsedBOL) {
        // Show processing message
        addMessage({
          type: 'text',
          content: '🔍 BOL detected! Matching to Purchase Order...',
          sender: 'bot',
        });

        setIsTyping(true);

        // Auto-match PO
        const matchResponse = await fetch('/api/mock/bol/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parsedBOL: ocrData.parsedBOL }),
        });
        const matchData = await matchResponse.json();

        setIsTyping(false);

        const matchedPO = matchData.success && matchData.matched ? matchData.matchResult.po : null;
        const matchScore = matchData.success && matchData.matched ? matchData.matchResult.matchScore : 0;

        // Show BOL results with confirmation
        const botMsgId = addMessage({
          type: 'bol-result',
          content: matchedPO ? '✅ Found a matching PO! Review the details below:' : '⚠️ No matching PO found. Review the BOL details:',
          sender: 'bot',
          parsedBOL: ocrData.parsedBOL,
          matchedPO,
          matchScore,
        });

        setPendingDelivery({
          messageId: botMsgId,
          parsedBOL: ocrData.parsedBOL,
          matchedPO,
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsTyping(false);
      addMessage({
        type: 'text',
        content: '❌ An error occurred while processing the image.',
        sender: 'bot',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!pendingDelivery) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedBOL: pendingDelivery.parsedBOL,
          matchedPO: pendingDelivery.matchedPO,
          source: 'krane-chat-bol',
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage({
          type: 'system',
          content: `✅ Delivery created successfully!\n\nBOL #${pendingDelivery.parsedBOL.bolNumber}\nVendor: ${pendingDelivery.parsedBOL.vendor}\nStatus: ${data.data.status}`,
          sender: 'bot',
        });
        onDeliveryCreated?.();
      } else {
        addMessage({
          type: 'text',
          content: `❌ Failed to create delivery: ${data.error || 'Unknown error'}`,
          sender: 'bot',
        });
      }
    } catch (error) {
      addMessage({
        type: 'text',
        content: '❌ An error occurred while creating the delivery.',
        sender: 'bot',
      });
    } finally {
      setPendingDelivery(null);
      setIsProcessing(false);
    }
  };

  const handleCancelDelivery = () => {
    setPendingDelivery(null);
    addMessage({
      type: 'text',
      content: '👍 No problem! Upload another BOL when you\'re ready.',
      sender: 'bot',
    });
  };

  const demoFiles = [
    { name: 'bol_steel.jpg', label: 'Steel BOL' },
    { name: 'bol_partial.jpg', label: 'Partial' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* WhatsApp-style Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
          <svg className="w-6 h-6 text-[#075E54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Krane BOL Assistant</p>
          <p className="text-emerald-200 text-xs">online</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5ddd5\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundColor: '#ECE5DD'
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onConfirm={msg.id === pendingDelivery?.messageId ? handleConfirmDelivery : undefined}
            onCancel={msg.id === pendingDelivery?.messageId ? handleCancelDelivery : undefined}
            isConfirming={msg.id === pendingDelivery?.messageId && isProcessing}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu - WhatsApp Style */}
      {showAttachMenu && (
        <div className="bg-white border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-600">Document</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-600">Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-600">Gallery</span>
              </button>
            </div>

            {/* Quick Demo BOLs */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2 text-center">Quick Demo BOLs</p>
              <div className="flex gap-2 justify-center">
                {demoFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleUploadImage(file.name)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    {file.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-style Input Area */}
      <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          aria-label="Attach file"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            placeholder="Upload a BOL to get started..."
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
            disabled
          />
        </div>

        {/* Camera Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md hover:bg-[#1DA851] transition-colors"
          aria-label="Take photo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUploadImage(e.target.files[0]);
            setShowAttachMenu(false);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
