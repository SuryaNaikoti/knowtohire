/**
 * KnowToHire Unified Content Storage Service
 * Handles uploading, validating, replacing, and downloading deliverables,
 * Knowledge Hub resources, and marketplace templates across Supabase Storage buckets.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type StorageBucketName = 'content' | 'knowledge-hub' | 'templates';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface ContentUploadResult {
  url: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: string | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
  format: string | null;
  error: string | null;
}

export const MAX_CONTENT_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.doc',
  '.xlsx',
  '.xls',
  '.pptx',
  '.ppt',
  '.zip',
  '.csv',
  '.txt',
];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
];

/**
 * Format raw byte count into human-readable size string (e.g., '2.4 MB', '780 KB')
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Detect format label (e.g. 'PDF', 'DOCX', 'XLSX', 'PPTX', 'ZIP') from filename or MIME type
 */
export function detectFileFormat(fileName: string, mimeType?: string): string {
  const ext = fileName.split('.').pop()?.toUpperCase();
  if (ext) {
    if (ext === 'DOC' || ext === 'DOCX') return 'DOCX';
    if (ext === 'XLS' || ext === 'XLSX') return 'XLSX';
    if (ext === 'PPT' || ext === 'PPTX') return 'PPTX';
    return ext;
  }
  if (mimeType?.includes('pdf')) return 'PDF';
  if (mimeType?.includes('word')) return 'DOCX';
  if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return 'XLSX';
  if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return 'PPTX';
  if (mimeType?.includes('zip')) return 'ZIP';
  return 'FILE';
}

/**
 * Client-side validation for deliverable, knowledge resource, or template files
 */
export function validateContentFile(
  file: File,
  allowedExtensions = ALLOWED_EXTENSIONS,
  maxSizeBytes = MAX_CONTENT_FILE_SIZE_BYTES
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds the maximum allowed size of ${formatBytes(maxSizeBytes)} (${formatBytes(file.size)}).`,
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) => fileNameLower.endsWith(ext.toLowerCase()));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `File type not supported. Allowed formats: ${allowedExtensions.map((e) => e.replace('.', '').toUpperCase()).join(', ')}.`,
    };
  }

  return { valid: true };
}

/**
 * Convert File to persistent Data URL (base64) for offline/demo fallback mode
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const contentStorageService = {
  /**
   * Upload file to target Supabase Storage bucket with validation, progress simulation, and fallback.
   */
  async uploadFile({
    bucket,
    folder,
    file,
    onProgress,
  }: {
    bucket: StorageBucketName;
    folder: string;
    file: File;
    onProgress?: (progressPct: number) => void;
  }): Promise<ContentUploadResult> {
    const validation = validateContentFile(file);
    if (!validation.valid) {
      return {
        url: null,
        fileName: null,
        filePath: null,
        fileSize: null,
        fileSizeBytes: null,
        mimeType: null,
        format: null,
        error: validation.error || 'Invalid file.',
      };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const storagePath = `${folder.replace(/^\/+|\/+$/g, '')}/${timestamp}_${cleanFileName}`;
    const detectedFormat = detectFileFormat(file.name, file.type);
    const formattedSize = formatBytes(file.size);

    onProgress?.(25);

    // If Supabase is not configured or in offline/demo mode, use base64 data URL
    if (!isSupabaseConfigured()) {
      try {
        onProgress?.(65);
        const dataUrl = await fileToDataUrl(file);
        onProgress?.(100);

        return {
          url: dataUrl,
          fileName: file.name,
          filePath: storagePath,
          fileSize: formattedSize,
          fileSizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          format: detectedFormat,
          error: null,
        };
      } catch {
        const objectUrl = URL.createObjectURL(file);
        onProgress?.(100);
        return {
          url: objectUrl,
          fileName: file.name,
          filePath: storagePath,
          fileSize: formattedSize,
          fileSizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          format: detectedFormat,
          error: null,
        };
      }
    }

    try {
      onProgress?.(50);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (error) {
        console.warn(`[ContentStorageService] Storage upload error on bucket '${bucket}':`, error.message);

        // Graceful fallback to persistent Data URL if RLS or bucket missing
        try {
          const fallbackDataUrl = await fileToDataUrl(file);
          onProgress?.(100);
          return {
            url: fallbackDataUrl,
            fileName: file.name,
            filePath: storagePath,
            fileSize: formattedSize,
            fileSizeBytes: file.size,
            mimeType: file.type || 'application/octet-stream',
            format: detectedFormat,
            error: null,
          };
        } catch {
          return {
            url: null,
            fileName: null,
            filePath: null,
            fileSize: null,
            fileSizeBytes: null,
            mimeType: null,
            format: null,
            error: error.message || 'Upload failed. Please try again.',
          };
        }
      }

      onProgress?.(90);

      // Retrieve public URL from bucket
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      onProgress?.(100);

      return {
        url: publicUrlData.publicUrl,
        fileName: file.name,
        filePath: data.path,
        fileSize: formattedSize,
        fileSizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        format: detectedFormat,
        error: null,
      };
    } catch (err) {
      console.error('[ContentStorageService] Unexpected upload exception:', err);
      try {
        const fallbackUrl = await fileToDataUrl(file);
        onProgress?.(100);
        return {
          url: fallbackUrl,
          fileName: file.name,
          filePath: storagePath,
          fileSize: formattedSize,
          fileSizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          format: detectedFormat,
          error: null,
        };
      } catch {
        return {
          url: null,
          fileName: null,
          filePath: null,
          fileSize: null,
          fileSizeBytes: null,
          mimeType: null,
          format: null,
          error: 'Upload failed. Please try again.',
        };
      }
    }
  },

  /**
   * Generates a signed download URL or downloads a resource directly
   */
  async getDownloadUrl(bucket: StorageBucketName, filePath: string, expiresIn = 3600): Promise<string | null> {
    if (!isSupabaseConfigured() || !filePath) return null;
    try {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn);
      if (error || !data?.signedUrl) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Delete or replace an existing file in storage
   */
  async deleteFile(bucket: StorageBucketName, filePath: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !filePath) return true;
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      return !error;
    } catch {
      return false;
    }
  },
};
