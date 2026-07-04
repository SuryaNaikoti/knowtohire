import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { candidateService } from '../../lib/services/candidateService';
import { Button } from '../ui/Button';

interface ResumeUploaderProps {
  candidateId: string;
  currentResumeUrl: string;
  onUploadSuccess: (url: string) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  candidateId,
  currentResumeUrl,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // 5MB max
    const maxSizeBytes = 5 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (file.size > maxSizeBytes) {
      setError('File size exceeds the 5MB maximum limit.');
      return false;
    }

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Invalid file type. Only PDF and Microsoft Word (DOC/DOCX) files are accepted.');
      return false;
    }

    setError('');
    return true;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setSuccess(false);
    setFileName(file.name);

    try {
      const url = await candidateService.uploadResume(candidateId, file);
      onUploadSuccess(url);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while uploading your file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleUpload(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleUpload(file);
      }
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  // Get file name from URL if possible
  const getDisplayFileName = () => {
    if (fileName) return fileName;
    if (!currentResumeUrl) return '';
    try {
      const decoded = decodeURIComponent(currentResumeUrl);
      return decoded.substring(decoded.lastIndexOf('/') + 1);
    } catch {
      return 'Current_Resume.pdf';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px]
          ${dragActive ? 'border-primary bg-primary-light/40 scale-[0.99]' : 'border-gray-300 hover:border-primary/60 hover:bg-gray-50/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-gray-700">Uploading resume to secure vault...</p>
            <p className="text-[10px] text-gray-400 font-semibold">{fileName}</p>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <div className="p-3 bg-blue-50 text-primary rounded-full">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                Drag and drop your resume file, or <span className="text-primary hover:underline">browse files</span>
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                Supports PDF, DOCX, or DOC formats (Max file size: 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-150 border-solid rounded-lg p-3 flex items-start space-x-2.5 text-red-900 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[11px] font-semibold">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-150 border-solid rounded-lg p-3 flex items-start space-x-2.5 text-emerald-900 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[11px] font-semibold">
            Resume uploaded successfully!
          </div>
        </div>
      )}

      {/* Current File Display */}
      {currentResumeUrl && !uploading && !error && (
        <div className="bg-gray-50 border border-gray-200 border-solid rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-gray-700 hover:text-primary truncate hover:underline"
            >
              {getDisplayFileName()}
            </a>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              triggerInputClick();
            }}
            className="text-[10px] h-7 py-0 font-bold bg-white"
          >
            Replace File
          </Button>
        </div>
      )}
    </div>
  );
};
