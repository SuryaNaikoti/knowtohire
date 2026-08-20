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

  // 1. Explicitly check for Word documents and provide dedicated error message
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
      error: `File exceeds maximum allowed size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
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
 * Legacy/general validation fallback (strictly redirects to PDF validation).
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
  return cleanUrl.endsWith('.pdf');
}

/**
 * Derives the format label (e.g., 'PDF', 'DOCX', 'DOC') from a stored resume URL.
 */
export function getResumeFormat(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const cleanUrl = url.split('?')[0].toLowerCase();
  const lastDotIndex = cleanUrl.lastIndexOf('.');
  if (lastDotIndex === -1) return 'DOCUMENT';
  const ext = cleanUrl.substring(lastDotIndex + 1).toUpperCase();
  return ext || 'DOCUMENT';
}

/**
 * Extracts a human-readable filename from a Supabase storage URL.
 * e.g. "https://.../resumes/userId/1723456789_My_Resume.pdf" -> "My_Resume.pdf"
 */
export function extractResumeFileName(url?: string | null, fallback = 'Candidate_Resume.pdf'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  try {
    const cleanUrl = url.split('?')[0]; // Remove query params
    const lastSegment = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
    if (!lastSegment) return fallback;

    const decoded = decodeURIComponent(lastSegment);
    // Strip timestamp prefix if formatted like 1723456789_Filename.ext
    const stripped = decoded.replace(/^\d+_\s*/, '');
    return stripped || decoded || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Uploads a candidate resume to Supabase Storage in the 'resumes' bucket.
 * Uses a deterministic, candidate-scoped path: resumes/{userId}/{timestamp}_{cleanFileName}
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

  if (!isSupabaseConfigured()) {
    console.info('[ResumeService] Supabase credentials not configured. Using local file reference.');
    return {
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      error: null,
    };
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `resumes/${userId}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf',
      });

    if (error) {
      console.warn('[ResumeService] Storage upload error:', error.message);
      return {
        url: null,
        fileName: null,
        fileSize: null,
        error: `Upload failed: ${error.message}. Ensure the 'resumes' storage bucket is accessible.`,
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);

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
      error: 'An unexpected error occurred while uploading your resume. Please try again.',
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
};
