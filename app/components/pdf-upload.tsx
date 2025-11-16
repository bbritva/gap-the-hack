'use client';

import { useState, useRef } from 'react';

interface PDFUploadProps {
  onUploadSuccess: (data: {
    sessionId: number;
    code: string;
    extractionFailed: boolean;
    message?: string;
  }) => void;
  onUploadError: (error: string) => void;
}

export default function PDFUpload({ onUploadSuccess, onUploadError }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        onUploadError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onUploadError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      onUploadError('Please provide both a title and a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', title);

    try {
      const response = await fetch('/api/sessions/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload PDF');
      }

      onUploadSuccess(data);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        onUploadError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onUploadError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Upload Course PDF
      </h3>

      {/* Session Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Mathematics - Fractions"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={uploading}
        />
      </div>

      {/* PDF Upload - Drag & Drop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Course PDF
        </label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50 dark:bg-gray-700/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                disabled={uploading}
              >
                Change file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag & drop your PDF here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Max 10MB • PDF only
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Questions will be generated during your session
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              After uploading, use the "Generate Checkpoint" button during your live class to create questions for specific concepts you've explained. You'll be able to preview and approve questions before adding them.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile || !title.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {uploading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing PDF...
          </span>
        ) : (
          'Create Session'
        )}
      </button>
    </div>
  );
}
