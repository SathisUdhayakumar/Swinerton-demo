'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BOLUploadProps {
  onUpload: (file: File | string) => void;
  isLoading?: boolean;
}

export function BOLUpload({ onUpload, isLoading }: BOLUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setImageUrl('');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImageUrl('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    } else if (imageUrl) {
      onUpload(imageUrl);
    }
  };

  const handleCameraCapture = () => {
    inputRef.current?.click();
  };

  // Demo preset buttons for quick testing
  const demoPresets = [
    { name: 'Full Delivery', file: 'bol_steel.jpg' },
    { name: 'Partial Delivery', file: 'bol_partial.jpg' },
    { name: 'Low Confidence', file: 'bol_lowconf.jpg' },
    { name: 'FrameWorks BOL', file: 'bol_frameworks.jpg' },
  ];

  return (
    <Card className="border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-zinc-900 to-zinc-950">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-amber-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Scan Bill of Lading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center p-8 rounded-lg
            border-2 border-dashed transition-all duration-200 cursor-pointer
            ${dragActive
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'}
          `}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {selectedFile ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-amber-100 font-medium">{selectedFile.name}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-zinc-700/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-zinc-300 font-medium">
                Drop BOL image here
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                or click to browse
              </p>
            </div>
          )}
        </div>

        {/* Camera Button (Mobile) */}
        <Button
          variant="outline"
          className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          onClick={handleCameraCapture}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take Photo
        </Button>

        {/* URL Input */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900 px-2 text-zinc-500">OR</span>
          </div>
        </div>

        <Input
          type="url"
          placeholder="Enter image URL..."
          value={imageUrl}
          onChange={handleUrlChange}
          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
        />

        {/* Demo Presets */}
        <div className="pt-2">
          <p className="text-xs text-zinc-500 mb-2">Quick Demo:</p>
          <div className="grid grid-cols-2 gap-2">
            {demoPresets.map((preset) => (
              <Button
                key={preset.file}
                variant="ghost"
                size="sm"
                className="text-xs bg-zinc-800/50 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                onClick={() => {
                  setImageUrl(preset.file);
                  setSelectedFile(null);
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
          disabled={(!selectedFile && !imageUrl) || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing OCR...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scan BOL
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

