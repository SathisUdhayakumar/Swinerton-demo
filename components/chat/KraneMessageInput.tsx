'use client';

import { useState, useRef } from 'react';

interface KraneMessageInputProps {
  onSendMessage: (text: string) => void;
  onUploadImage: (file: File | string) => void;
  disabled?: boolean;
}

export function KraneMessageInput({ 
  onSendMessage, 
  onUploadImage, 
  disabled 
}: KraneMessageInputProps) {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      setShowAttachMenu(false);
    }
  };

  const handleDemoFile = (filename: string) => {
    onUploadImage(filename);
    setShowAttachMenu(false);
  };

  return (
    <div className="relative bg-white border-t border-slate-200">
      {/* Attachment Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-white border-t border-slate-200 p-4 space-y-3 animate-in slide-in-from-bottom-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Upload Document</span>
            <button
              onClick={() => setShowAttachMenu(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm text-slate-600">Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-slate-600">Gallery</span>
            </button>
          </div>

          {/* Demo Files */}
          <div className="border-t border-slate-200 pt-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Demo Files</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleDemoFile('home_depot.jpg')}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left border border-slate-200"
              >
                📄 home_depot.jpg
              </button>
              <button
                onClick={() => handleDemoFile('lowconf.jpg')}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left border border-slate-200"
              >
                📄 lowconf.jpg
              </button>
              <button
                onClick={() => handleDemoFile('duplicate.jpg')}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left border border-slate-200"
              >
                📄 duplicate.jpg
              </button>
              <button
                onClick={() => handleDemoFile('bol_steel.jpg')}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-600 text-left border border-slate-200"
              >
                📄 bol_steel.jpg
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={disabled}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 resize-none outline-none text-sm max-h-24"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
