import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import {
  validateContentFile,
  detectFileFormat,
  formatBytes,
  ALLOWED_EXTENSIONS,
  MAX_CONTENT_FILE_SIZE_BYTES,
} from '@/services/contentStorageService';

export interface FileUploaderProps {
  label?: string;
  description?: string;
  accept?: string;
  allowedExtensions?: string[];
  maxSizeBytes?: number;
  selectedFile?: File | null;
  uploadedFileName?: string | null;
  uploadedFileSize?: string | null;
  uploadedFormat?: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadSuccess?: boolean;
  errorMessage?: string | null;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label = 'Upload Deliverable',
  description = 'Drag & drop your file here or browse',
  accept = '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.zip,.txt,.csv',
  allowedExtensions = ALLOWED_EXTENSIONS,
  maxSizeBytes = MAX_CONTENT_FILE_SIZE_BYTES,
  selectedFile,
  uploadedFileName,
  uploadedFileSize,
  uploadedFormat,
  onFileSelect,
  onFileRemove,
  isUploading = false,
  uploadProgress = 0,
  uploadSuccess = false,
  errorMessage,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setLocalError(null);
    const validation = validateContentFile(file, allowedExtensions, maxSizeBytes);
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid file format.');
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const currentFileName = selectedFile?.name || uploadedFileName;
  const currentFileSize = selectedFile ? formatBytes(selectedFile.size) : uploadedFileSize;
  const currentFormat = selectedFile
    ? detectFileFormat(selectedFile.name, selectedFile.type)
    : uploadedFormat || 'FILE';

  const hasFile = Boolean(currentFileName);
  const activeError = errorMessage || localError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
          {label}
        </label>
      )}

      {/* Dropzone Container */}
      {!hasFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-kth-primary-500 bg-kth-primary-50/50 scale-[0.99]'
              : activeError
              ? 'border-red-300 bg-red-50/30 hover:border-red-400'
              : 'border-kth-slate-300 hover:border-kth-primary-400 bg-kth-slate-50/60 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-white border border-kth-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs text-kth-primary-600">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs font-bold text-kth-slate-900 mb-0.5">{description}</p>
          <div className="mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </div>

          <p className="text-[10px] text-kth-slate-400 font-mono mt-3 uppercase tracking-wider">
            PDF, DOCX, XLSX, PPTX, ZIP (MAX {formatBytes(maxSizeBytes)})
          </p>
        </div>
      ) : (
        /* Selected / Uploaded File Status Card */
        <div className="p-4 bg-white border border-kth-slate-200 rounded-2xl shadow-xs space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 border border-kth-primary-100 flex items-center justify-center text-kth-primary-700 font-mono font-bold text-xs shrink-0">
                {currentFormat}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-kth-slate-900 truncate">{currentFileName}</p>
                <div className="flex items-center gap-2 text-[11px] text-kth-slate-500 font-mono mt-0.5">
                  <span className="font-semibold">{currentFormat}</span>
                  {currentFileSize && <span>• {currentFileSize}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-kth-slate-600 hover:text-kth-primary-600"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Replace
              </Button>
              {onFileRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={onFileRemove}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-kth-slate-500">
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-kth-primary-600" /> Uploading to secure storage...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-kth-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kth-primary-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Success Badge */}
          {uploadSuccess && !isUploading && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>✓ Upload ready & verified</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message Alert */}
      {activeError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};
