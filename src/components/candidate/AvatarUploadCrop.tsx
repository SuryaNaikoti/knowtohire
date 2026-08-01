import React, { useState } from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { Upload, RotateCw, ZoomIn, ZoomOut, Check, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const AvatarUploadCrop: React.FC = () => {
  const { profile, uploadAvatarFile } = useIdentityWorkspace();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url || null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadSuccess(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const uploadedUrl = await uploadAvatarFile(selectedFile);
    setIsUploading(false);
    if (uploadedUrl) {
      setUploadSuccess(true);
      setSelectedFile(null);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
        Professional Avatar Studio
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Interactive Circular Preview */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-32 h-32 rounded-full border-4 border-emerald-500/30 overflow-hidden bg-slate-100 shadow-inner group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Studio Preview"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Circular Recruiter Preview</span>
        </div>

        {/* Controls & Adjustment Panel */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2 shadow-sm">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Select New Photo</span>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>

            {selectedFile && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Supports high-resolution PNG, JPG, or WEBP images up to 5MB. Automatic optimization generates both full and thumbnail sizes.
          </p>

          {selectedFile && (
            <Button
              onClick={handleConfirmUpload}
              isLoading={isUploading}
              className="w-full sm:w-auto px-5 h-10 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isUploading ? 'Optimizing & Uploading...' : 'Save & Update Avatar'}</span>
            </Button>
          )}

          {uploadSuccess && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Avatar uploaded and synchronized with recruiter preview!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
