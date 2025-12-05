'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateMessageId, formatTimestamp } from '@/lib/chatUtils';
import { ParsedReceipt, ProjectSuggestion } from '@/types';

interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'receipt' | 'system' | 'cost-code-prompt';
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  imageUrl?: string;
  status?: 'sending' | 'sent' | 'error';
  parsedData?: ParsedReceipt;
  suggestions?: ProjectSuggestion;
}

interface CostCode {
  id: string;
  code: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  costCodes: CostCode[];
}

interface KraneChatEmbedProps {
  onReceiptCreated?: () => void;
  embedded?: boolean;
}

const projects: Project[] = [
  {
    id: 'alpha',
    name: 'Clemson-210 Keowee Trl',
    costCodes: [
      { id: 'cc-001', code: '6100', name: 'Materials - General' },
      { id: 'cc-002', code: '6200', name: 'Materials - Steel' },
      { id: 'cc-003', code: '6300', name: 'Tools & Equipment' },
    ],
  },
  {
    id: 'beta',
    name: 'DFW Terminal F',
    costCodes: [
      { id: 'cc-005', code: '6100', name: 'Materials - General' },
      { id: 'cc-006', code: '6200', name: 'Materials - Steel' },
    ],
  },
];

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

function CostCodeSelector({ 
  onSelect 
}: { 
  onSelect: (projectId: string, projectName: string, costCodeId: string, costCodeName: string) => void;
}) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCostCode, setSelectedCostCode] = useState('');

  const currentProject = projects.find(p => p.id === selectedProject);

  const handleConfirm = () => {
    if (selectedProject && selectedCostCode && currentProject) {
      const costCode = currentProject.costCodes.find(cc => cc.id === selectedCostCode);
      if (costCode) {
        onSelect(
          selectedProject, 
          currentProject.name, 
          selectedCostCode, 
          `${costCode.code} - ${costCode.name}`
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Project</label>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setSelectedCostCode('');
          }}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Cost Code</label>
        <select
          value={selectedCostCode}
          onChange={(e) => setSelectedCostCode(e.target.value)}
          disabled={!selectedProject}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Cost Code</option>
          {currentProject?.costCodes.map((cc) => (
            <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedProject || !selectedCostCode}
        className="w-full py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}

function MessageBubble({ 
  message, 
  onConfirm, 
  onEdit,
  onCostCodeSelect,
  isConfirming
}: { 
  message: ChatMessage;
  onConfirm?: () => void;
  onEdit?: () => void;
  onCostCodeSelect?: (projectId: string, projectName: string, costCodeId: string, costCodeName: string) => void;
  isConfirming?: boolean;
}) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-[#DCF8C6] text-slate-800 rounded-2xl rounded-br-sm shadow-sm'
            : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm'
        } ${message.type === 'image' ? 'p-1.5' : message.type === 'cost-code-prompt' ? 'p-0 bg-transparent shadow-none' : 'px-3 py-2'}`}
      >
        {message.type === 'image' && message.imageUrl && (
          <div className="space-y-1">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="absolute bottom-1 left-1 right-1 text-xs text-center text-white bg-black/60 rounded px-2 py-0.5 truncate">
                {message.imageUrl}
              </div>
            </div>
            {message.status === 'sending' && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 px-1">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </div>
            )}
          </div>
        )}

        {message.type === 'text' && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {message.type === 'cost-code-prompt' && onCostCodeSelect && (
          <div>
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-3 py-2 mb-2">
              <p className="text-sm">{message.content}</p>
              <div className="text-[10px] mt-1 text-slate-400">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
            <CostCodeSelector onSelect={onCostCodeSelect} />
          </div>
        )}

        {message.type === 'receipt' && message.parsedData && (
          <div>
            <p className="text-sm mb-2">{message.content}</p>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider">
                <span>OCR Results</span>
                <ConfidenceBadge confidence={((message.parsedData.merchantConfidence ?? 0.85) + (message.parsedData.dateConfidence ?? 0.85) + (message.parsedData.totalConfidence ?? 0.85)) / 3} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Merchant</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-800 font-medium">{message.parsedData.merchant}</span>
                    <ConfidenceBadge confidence={message.parsedData.merchantConfidence ?? 0.85} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-700">{message.parsedData.date}</span>
                    <ConfidenceBadge confidence={message.parsedData.dateConfidence ?? 0.85} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-800 font-bold">${message.parsedData.total.toFixed(2)}</span>
                    <ConfidenceBadge confidence={message.parsedData.totalConfidence ?? 0.85} />
                  </div>
                </div>
              </div>
              {message.suggestions && (
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <p className="text-xs text-slate-500 mb-1">Assignment</p>
                  <div className="text-sm">
                    <p className="text-[#075E54] font-medium">{message.suggestions.projectName}</p>
                    <p className="text-slate-600 text-xs">{message.suggestions.costCodeName}</p>
                  </div>
                </div>
              )}
              {(((message.parsedData.merchantConfidence ?? 0.85) + (message.parsedData.dateConfidence ?? 0.85) + (message.parsedData.totalConfidence ?? 0.85)) / 3) < 0.8 && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  ⚠️ Low confidence - please review
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={onEdit}
                  disabled={isConfirming}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="flex-1 px-3 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {message.type === 'system' && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{message.content}</span>
          </div>
        )}

        {message.type !== 'cost-code-prompt' && (
          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isUser ? 'text-slate-500' : 'text-slate-400'}`}>
            {formatTimestamp(message.timestamp)}
            {isUser && message.status === 'sent' && (
              <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 16 15" fill="currentColor">
                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.511z" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function KraneChatEmbed({ onReceiptCreated, embedded = false }: KraneChatEmbedProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<{ 
    messageId: string; 
    data: ParsedReceipt; 
    suggestion: ProjectSuggestion;
    imageUrl: string;
  } | null>(null);
  const [awaitingCostCode, setAwaitingCostCode] = useState<{
    promptMessageId: string;
    parsedData: ParsedReceipt;
    imageUrl: string;
  } | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: generateMessageId(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    addMessage({ type: 'text', content: inputText.trim(), sender: 'user', status: 'sent' });
    setInputText('');
    
    setTimeout(() => {
      addMessage({
        type: 'text',
        content: "📎 Tap the attachment button to upload a receipt image!",
        sender: 'bot',
      });
    }, 500);
  };

  const handleUploadImage = async (fileOrUrl: File | string) => {
    setShowAttachMenu(false);
    setIsProcessing(true);

    const filename = fileOrUrl instanceof File ? fileOrUrl.name : fileOrUrl;
    
    const userMsgId = addMessage({
      type: 'image',
      content: 'Uploaded image',
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
      // Tell the OCR API we're expecting a receipt document
      formData.append('documentType', 'receipt');

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

      if (ocrData.type === 'receipt' && ocrData.parsedReceipt) {
        // First, show a brief OCR summary
        addMessage({
          type: 'text',
          content: `📄 Receipt detected!\n\n• Merchant: ${ocrData.parsedReceipt.merchant}\n• Date: ${ocrData.parsedReceipt.date}\n• Total: $${ocrData.parsedReceipt.total.toFixed(2)}`,
          sender: 'bot',
        });

        // Then ask for cost code
        setTimeout(() => {
          const promptMsgId = addMessage({
            type: 'cost-code-prompt',
            content: '📋 What is the cost code for this material?',
            sender: 'bot',
          });

          setAwaitingCostCode({
            promptMessageId: promptMsgId,
            parsedData: ocrData.parsedReceipt,
            imageUrl: filename,
          });
        }, 500);

      } else if (ocrData.type === 'bol') {
        addMessage({
          type: 'text',
          content: "📋 This looks like a Bill of Lading. Please use the 'Upload BOL' tab for BOL processing.",
          sender: 'bot',
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

  const handleCostCodeSelect = (projectId: string, projectName: string, costCodeId: string, costCodeName: string) => {
    if (!awaitingCostCode) return;

    // Remove the cost code prompt message
    removeMessage(awaitingCostCode.promptMessageId);

    // Add user's selection as a message
    addMessage({
      type: 'text',
      content: `${projectName}\n${costCodeName}`,
      sender: 'user',
      status: 'sent',
    });

    // Now show the confirmation with the selected values
    setTimeout(() => {
      const suggestion: ProjectSuggestion = {
        projectId,
        projectName,
        costCodeId,
        costCodeName,
        confidence: 1.0,
        reason: 'User selected',
      };

      const botMsgId = addMessage({
        type: 'receipt',
        content: '✅ Great! Please confirm the details:',
        sender: 'bot',
        parsedData: awaitingCostCode.parsedData,
        suggestions: suggestion,
      });

      setPendingReceipt({
        messageId: botMsgId,
        data: awaitingCostCode.parsedData,
        suggestion,
        imageUrl: awaitingCostCode.imageUrl,
      });

      setAwaitingCostCode(null);
    }, 300);
  };

  const handleConfirmReceipt = async () => {
    if (!pendingReceipt) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedReceipt: pendingReceipt.data,
          projectId: pendingReceipt.suggestion.projectId,
          costCodeId: pendingReceipt.suggestion.costCodeId,
          imageUrl: pendingReceipt.imageUrl,
          source: 'krane-chat',
        }),
      });

      const data = await response.json();

      if (data.status === 'duplicate') {
        addMessage({
          type: 'system',
          content: '⚠️ This receipt appears to be a duplicate.',
          sender: 'bot',
        });
      } else if (data.success) {
        addMessage({
          type: 'system',
          content: `✅ Receipt logged successfully!\n\nProject: ${pendingReceipt.suggestion.projectName}\nCost Code: ${pendingReceipt.suggestion.costCodeName}\nTotal: $${pendingReceipt.data.total.toFixed(2)}`,
          sender: 'bot',
        });
        onReceiptCreated?.();
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
      setPendingReceipt(null);
    }
  };

  const handleEditReceipt = () => {
    addMessage({
      type: 'text',
      content: '✏️ For detailed editing, please use the standalone Capture Receipt page.',
      sender: 'bot',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#ECE5DD]">
      {/* WhatsApp-style Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#075E54] text-white">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
          <svg className="w-6 h-6 text-[#075E54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-tight">Krane Assistant</h3>
          <p className="text-xs text-white/70">online</p>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Chat Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-3 py-2"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cfc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#ECE5DD'
        }}
      >
        {messages.length === 0 && !showAttachMenu && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm max-w-[280px] mx-auto">
              <h4 className="text-slate-800 font-semibold mb-1">Upload a Receipt</h4>
              <p className="text-sm text-slate-500">Tap the 📎 button below to snap or select a receipt image</p>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onConfirm={msg.id === pendingReceipt?.messageId ? handleConfirmReceipt : undefined}
            onEdit={msg.id === pendingReceipt?.messageId ? handleEditReceipt : undefined}
            onCostCodeSelect={msg.id === awaitingCostCode?.promptMessageId ? handleCostCodeSelect : undefined}
            isConfirming={msg.id === pendingReceipt?.messageId && isProcessing}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Menu - WhatsApp Style (inside chat) */}
      {showAttachMenu && (
        <div className="bg-white border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-4">
            {/* Action Icons Row */}
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
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
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-600">Gallery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-style Input Area */}
      <div className="bg-[#F0F0F0] px-2 py-2 flex items-end gap-2">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={isProcessing || !!awaitingCostCode}
          aria-label="Add attachment"
          className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${
            showAttachMenu 
              ? 'bg-[#075E54] text-white rotate-45' 
              : 'bg-white text-slate-500 hover:bg-slate-100'
          } shadow-sm disabled:opacity-50`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 shadow-sm flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type a message"
            disabled={isProcessing || !!awaitingCostCode}
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm"
          />
          <button className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm3.5-9c.828 0 1.5-.672 1.5-1.5S16.328 8 15.5 8 14 8.672 14 9.5s.672 1.5 1.5 1.5zm-7 0c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5 7.672 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>
        </div>

        {/* Send/Voice Button */}
        <button
          onClick={inputText.trim() ? handleSendText : undefined}
          disabled={isProcessing || !!awaitingCostCode}
          aria-label={inputText.trim() ? "Send message" : "Voice message"}
          className="w-11 h-11 flex-shrink-0 rounded-full bg-[#25D366] hover:bg-[#20BD5A] flex items-center justify-center shadow-sm disabled:opacity-50"
        >
          {inputText.trim() ? (
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
