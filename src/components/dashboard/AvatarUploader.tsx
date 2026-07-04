import React, { useState, useRef } from 'react';
import { UploadCloud, User, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { candidateService } from '../../lib/services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface AvatarUploaderProps {
  candidateId: string;
  currentAvatarUrl: string;
  onUploadSuccess: (url: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  candidateId,
  currentAvatarUrl,
  onUploadSuccess,
}) => {
  const { refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

    if (file.size > maxSizeBytes) {
      setError('Avatar image size must be under 2MB.');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, JPEG, and GIF images are accepted.');
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
      const url = await candidateService.uploadAvatar(candidateId, file);
      onUploadSuccess(url);
      setSuccess(true);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError('An error occurred during avatar upload. Please try again.');
    } finally {
      setUploading(false);
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
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group">
          <img
            src={currentAvatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${candidateId}`}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full border-2 border-slate-200 object-cover shadow-sm bg-slate-50"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/jpg, image/gif"
            onChange={handleChange}
            disabled={uploading}
          />
          <Button
            size="sm"
            onClick={triggerClick}
            isLoading={uploading}
            className="text-xs font-bold"
          >
            Upload New Photo
          </Button>
          <p className="text-[10px] text-gray-400 font-medium mt-1.5">
            PNG, JPG or GIF (Max: 2MB)
          </p>
        </div>
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
          <div className="text-[10px] font-semibold">Avatar updated successfully!</div>
        </div>
      )}
    </div>
  );
};
