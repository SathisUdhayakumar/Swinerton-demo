'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BOLUploadProps {
  onUpload: (file: File | string) => void;
  isLoading?: boolean;
}

export function BOLUpload({ onUpload, isLoading }: BOLUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const demoFiles = [
    { name: 'bol_steel.jpg', label: 'Full Delivery (PO#552)' },
    { name: 'bol_partial.jpg', label: 'Partial Delivery' },
  ];

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'}
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
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-800 font-medium">{selectedFile.name}</p>
              <p className="text-slate-500 text-sm mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium">Drop BOL image here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            </div>
          )}
        </div>

        {/* Camera Button */}
        <Button
          variant="outline"
          className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
          onClick={() => inputRef.current?.click()}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take Photo
        </Button>

        {/* Demo Files */}
        <div className="pt-2">
          <p className="text-xs text-slate-500 mb-2">Quick Demo:</p>
          <div className="grid grid-cols-2 gap-2">
            {demoFiles.map((file) => (
              <Button
                key={file.name}
                variant="ghost"
                size="sm"
                className="text-xs bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  onUpload(file.name);
                }}
              >
                {file.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
          disabled={!selectedFile || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
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
