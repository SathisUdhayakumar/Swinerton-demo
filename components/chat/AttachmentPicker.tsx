'use client';

import { useRef } from 'react';

interface AttachmentPickerProps {
  onSelect: (file: File | string) => void;
  onClose: () => void;
}

const demoFiles = [
  { name: 'home_depot.jpg', label: 'HD Receipt (Good)', type: 'receipt' },
  { name: 'receipt_good.jpg', label: 'Receipt (Clean)', type: 'receipt' },
  { name: 'lowconf.jpg', label: 'Receipt (Blurred)', type: 'receipt' },
  { name: 'duplicate.jpg', label: 'Duplicate Receipt', type: 'receipt' },
  { name: 'bol_steel.jpg', label: 'BOL - SteelCo', type: 'bol' },
  { name: 'bol_partial.jpg', label: 'BOL - Partial', type: 'bol' },
];

export function AttachmentPicker({ onSelect, onClose }: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="w-full max-w-lg bg-zinc-900 rounded-t-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Upload Document</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Options */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-300">Camera</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-300">Gallery</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-300">Files</span>
          </button>
        </div>

        {/* Demo Files */}
        <div className="px-4 pb-4">
          <div className="border-t border-zinc-800 pt-4">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Demo Files</span>
            <div className="mt-3 space-y-2">
              {demoFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => onSelect(file.name)}
                  className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    file.type === 'receipt' ? 'bg-emerald-600/20' : 'bg-blue-600/20'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      file.type === 'receipt' ? 'text-emerald-500' : 'text-blue-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-white">{file.label}</p>
                    <p className="text-xs text-zinc-500">{file.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    file.type === 'receipt' 
                      ? 'bg-emerald-600/20 text-emerald-400' 
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {file.type.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safe Area */}
        <div className="h-6 bg-zinc-900" />

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}


