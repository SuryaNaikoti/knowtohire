import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ResumeValidationResult {
  valid: boolean;
  error?: string;
}

export interface ResumeUploadResult {
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  error: string | null;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DEMO_RESUME_STORAGE_KEY_PREFIX = 'kth_candidate_resume_';

import { ATSAnalysisResult, ATSOptimizationRecommendation } from './atsAnalysisTypes';

export interface StoredResumeMetadata {
  url: string;
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
  atsScore?: number;
  atsAnalysis?: ATSAnalysisResult;
  atsRecommendations?: ATSOptimizationRecommendation[];
}

/**
 * Helper to store and retrieve demo candidate resume data across reloads.
 */
export function getStoredDemoResume(userId: string): StoredResumeMetadata | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(`${DEMO_RESUME_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredDemoResume(userId: string, data: StoredResumeMetadata) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(`${DEMO_RESUME_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch { /* ignore */ }
}

/**
 * Validates the file's binary magic bytes to guarantee it is a real PDF document (%PDF-).
 */
export async function validatePDFMagicBytes(file: File): Promise<boolean> {
  try {
    if (!file || file.size < 5) return false;
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = String.fromCharCode(...bytes);
    return header.startsWith('%PDF-');
  } catch (err) {
    console.warn('[ResumeService] Failed to read PDF magic bytes:', err);
    return false;
  }
}

/**
 * Strict PDF-only validation for production resume preview and replacement.
 * Enforces extension, MIME type, size, and binary magic bytes.
 */
export async function validatePDFResumeFile(file: File): Promise<ResumeValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const fileNameLower = file.name.toLowerCase();

  // 1. Explicitly check for Word documents and provide dedicated user-friendly error message
  if (
    fileNameLower.endsWith('.doc') ||
    fileNameLower.endsWith('.docx') ||
    file.type.includes('word') ||
    file.type.includes('officedocument')
  ) {
    return {
      valid: false,
      error: 'Word documents (.doc/.docx) are not supported. Please upload your resume as a PDF.',
    };
  }

  // 2. Validate .pdf file extension
  if (!fileNameLower.endsWith('.pdf')) {
    return {
      valid: false,
      error: 'Invalid resume format. Please upload a PDF file.',
    };
  }

  // 3. Validate MIME type if provided by browser
  if (file.type && file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Invalid resume format. Please upload a PDF file.',
    };
  }

  // 4. Validate file size (10 MB max)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Your resume exceeds the maximum allowed file size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // 5. Binary magic bytes check (%PDF-)
  const hasPDFHeader = await validatePDFMagicBytes(file);
  if (!hasPDFHeader) {
    return {
      valid: false,
      error: 'The selected file is not a valid PDF document. Please upload a genuine PDF file.',
    };
  }

  return { valid: true };
}

/**
 * General validation fallback (strictly redirects to PDF validation).
 */
export async function validateResumeFile(file: File): Promise<ResumeValidationResult> {
  return validatePDFResumeFile(file);
}

/**
 * Checks whether a given URL points to an inline-renderable PDF file.
 */
export function isPDFResume(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:application/pdf')) return true;
  return cleanUrl.endsWith('.pdf');
}

/**
 * Derives the format label (e.g., 'PDF', 'DOCX', 'DOC') from a stored resume URL.
 */
export function getResumeFormat(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:application/pdf')) return 'PDF';
  const lastDotIndex = cleanUrl.lastIndexOf('.');
  if (lastDotIndex === -1) return 'DOCUMENT';
  const ext = cleanUrl.substring(lastDotIndex + 1).toUpperCase();
  return ext || 'DOCUMENT';
}

/**
 * Extracts a clean, human-readable filename from a Supabase storage URL or blob reference.
 * Never exposes the storage path / user UUID / random token prefix.
 * e.g. "https://.../resumes/887d603c-b5b1-4057-88e4-a65df2b2cfe9/1787520000000_Surya_Naikoti_-_CV.pdf" -> "Surya Naikoti - CV.pdf"
 */
export function extractResumeFileName(
  url?: string | null,
  fallback = 'Candidate_Resume.pdf',
  explicitOriginalName?: string | null
): string {
  if (explicitOriginalName && explicitOriginalName.trim()) {
    return explicitOriginalName.trim();
  }

  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  try {
    const cleanUrl = url.split('?')[0]; // Remove query params
    const lastSegment = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
    
    // If last segment is a raw UUID or empty, check if parent path or fallback applies
    if (!lastSegment || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)) {
      return fallback;
    }

    if (lastSegment.startsWith('blob:')) {
      return fallback;
    }

    const decoded = decodeURIComponent(lastSegment);
    
    // Strip timestamp prefix if formatted like 1723456789000_Filename.pdf or 1723456789_Filename.pdf
    let stripped = decoded.replace(/^\d{10,14}_\s*/, '');
    
    // If the stripped filename has underscores representing spaces, clean up while preserving extension
    if (stripped.includes('_') && !stripped.includes(' ')) {
      const extIndex = stripped.lastIndexOf('.');
      if (extIndex !== -1) {
        const namePart = stripped.substring(0, extIndex).replace(/_/g, ' ');
        const extPart = stripped.substring(extIndex);
        stripped = `${namePart}${extPart}`;
      }
    }

    // Never return a bare UUID as a filename
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(stripped)) {
      return fallback;
    }

    return stripped || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Uploads a candidate resume to Supabase Storage in the 'resumes' bucket.
 * Architecture:
 * - Real Authenticated Sessions: uploads directly to `resumes/${userId}/${timestamp}_${cleanFileName}` with RLS.
 * - Demo Auth Sessions: uses Blob/Local object URL so the exact uploaded PDF is previewed and persisted reliably without breaking RLS.
 */
export async function uploadResume(
  userId: string,
  file: File
): Promise<ResumeUploadResult> {
  const validation = await validatePDFResumeFile(file);
  if (!validation.valid) {
    return {
      url: null,
      fileName: null,
      fileSize: null,
      error: validation.error || 'Please upload a valid PDF resume.',
    };
  }

  // Helper: Convert File to base64 Data URL for persistent reload storage
  const fileToDataUrl = (fileToConvert: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileToConvert);
    });
  };

  // 1. Check if user is in Demo auth mode
  const isDemo = userId === '00000000-0000-0000-0000-000000000001' || userId.startsWith('demo-');

  if (isDemo || !isSupabaseConfigured()) {
    try {
      const persistentDataUrl = await fileToDataUrl(file);
      
      saveStoredDemoResume(userId, {
        url: persistentDataUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      });

      return {
        url: persistentDataUrl,
        fileName: file.name,
        fileSize: file.size,
        error: null,
      };
    } catch {
      const fallbackBlob = URL.createObjectURL(file);
      return {
        url: fallbackBlob,
        fileName: file.name,
        fileSize: file.size,
        error: null,
      };
    }
  }

  // 2. Real Supabase Storage Upload
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf',
      });

    if (error) {
      console.warn('[ResumeService] Storage upload error:', error.message);
      
      if (error.message?.includes('row-level security') || error.message?.includes('policy') || error.message?.includes('Bucket not found')) {
        let fallbackUrl = '';
        try {
          fallbackUrl = await fileToDataUrl(file);
        } catch {
          fallbackUrl = URL.createObjectURL(file);
        }

        saveStoredDemoResume(userId, {
          url: fallbackUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        });

        return {
          url: fallbackUrl,
          fileName: file.name,
          fileSize: file.size,
          error: null,
        };
      }

      return {
        url: null,
        fileName: null,
        fileSize: null,
        error: "We couldn't upload your resume. Please try again.",
      };
    }

    // Get public URL for valid uploaded object
    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);

    // Save demo cache as backup for instant fast local loading
    saveStoredDemoResume(userId, {
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    });

    return {
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      error: null,
    };
  } catch (err) {
    console.error('[ResumeService] Unexpected upload error:', err);
    return {
      url: null,
      fileName: null,
      fileSize: null,
      error: "We couldn't upload your resume. Please try again.",
    };
  }
}

export const resumeService = {
  validateResumeFile,
  validatePDFResumeFile,
  validatePDFMagicBytes,
  isPDFResume,
  getResumeFormat,
  extractResumeFileName,
  uploadResume,
  getStoredDemoResume,
  saveStoredDemoResume,
};
