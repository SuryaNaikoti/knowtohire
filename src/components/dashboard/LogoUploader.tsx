import React, { useState, useRef } from 'react';
import { UploadCloud, Image, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { employerService } from '../../lib/services/employerService';
import { Button } from '../ui/Button';

interface LogoUploaderProps {
  companyId: string;
  type: 'logo' | 'banner';
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  companyId,
  type,
  currentUrl,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limitMb = type === 'logo' ? 2 : 3;

  const validateFile = (file: File): boolean => {
    const maxSizeBytes = limitMb * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the ${limitMb}MB limit.`);
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, JPEG, and SVG images are accepted.');
      return false;
    }

    setError('');
    return true;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      let url = '';
      if (type === 'logo') {
        url = await employerService.uploadLogo(companyId, file);
      } else {
        url = await employerService.uploadBanner(companyId, file);
      }
      onUploadSuccess(url);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('An error occurred during image upload. Please try again.');
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

  const triggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerClick}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center
          ${type === 'logo' ? 'min-h-[120px]' : 'min-h-[140px]'}
          ${dragActive ? 'border-primary bg-primary-light/40 scale-[0.99]' : 'border-gray-300 hover:border-primary/60 hover:bg-gray-50/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/svg+xml"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2 flex flex-col items-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-[11px] font-bold text-gray-700">Uploading {type} asset...</p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <div className="p-2 bg-blue-50 text-primary rounded-full">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800">
                Drag/drop or <span className="text-primary hover:underline">browse</span> to upload {type}
              </p>
              <p className="text-[9px] text-gray-400 font-medium">
                PNG, JPG, JPEG, SVG (Max: {limitMb}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-150 border-solid rounded-lg p-2.5 flex items-start space-x-2 text-red-900 animate-fade-in-up">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-[10px] font-semibold">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-150 border-solid rounded-lg p-2.5 flex items-start space-x-2 text-emerald-900 animate-fade-in-up">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[10px] font-semibold">{type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!</div>
        </div>
      )}

      {currentUrl && !uploading && !error && (
        <div className="bg-gray-50 border border-gray-200 border-solid rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Image className="w-4 h-4 text-gray-400 shrink-0" />
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-primary hover:underline truncate max-w-[150px]"
            >
              View current {type}
            </a>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              triggerClick();
            }}
            className="text-[9px] h-6 py-0 font-bold bg-white"
          >
            Change
          </Button>
        </div>
      )}
    </div>
  );
};
