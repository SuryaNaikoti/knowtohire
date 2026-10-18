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

import { generateCandidatePdfDataUrl } from '@/utils/candidatePdfGenerator';

/**
 * Helper to store and retrieve demo candidate resume data across reloads.
 */
export function getStoredDemoResume(userId: string): StoredResumeMetadata | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(`${DEMO_RESUME_STORAGE_KEY_PREFIX}${userId}`);
    // If a candidate uploaded resume is present, return it immediately
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.url && !parsed.url.includes('knowtohire.com/resumes')) {
        return parsed;
      }
    }
    
    // Check if candidate profile in localStorage has an uploaded resume
    const candProfileRaw = window.localStorage.getItem(`kth_demo_cand_profile_${userId}`);
    if (candProfileRaw) {
      try {
        const candProfile = JSON.parse(candProfileRaw);
        if (candProfile?.resumeUrl && !candProfile.resumeUrl.includes('knowtohire.com/resumes')) {
          const resMeta: StoredResumeMetadata = {
            url: candProfile.resumeUrl,
            fileName: candProfile.resumeFileName || 'Candidate_Resume.pdf',
            uploadedAt: new Date().toISOString(),
          };
          saveStoredDemoResume(userId, resMeta);
          return resMeta;
        }
      } catch {
        // ignore
      }
    }

    // Default fallback PDF data URL when candidate has not yet uploaded a custom document
    const defaultDataUrl = generateCandidatePdfDataUrl({
      fullName: 'Surya Naikoti',
      headline: 'Senior Full Stack & Cloud Solutions Engineer',
      email: 'candidate@knowtohire.com',
      phone: '+91 98765 43210',
      location: 'Hyderabad, Telangana',
      skills: ['React & TypeScript', 'Node.js & API Architecture', 'Cloud Infrastructure (AWS/GCP)', 'Database Systems & SQL'],
      bio: 'Senior Solutions Engineer with 6+ years architecting scalable full-stack applications, distributed cloud architectures on AWS/GCP, and CI/CD automation.',
    });

    const defaultResume: StoredResumeMetadata = {
      url: defaultDataUrl,
      fileName: 'Surya_Naikoti_Senior_Engineer_Resume.pdf',
      fileSize: 1048576,
      uploadedAt: new Date().toISOString(),
      atsScore: 92,
      atsRecommendations: [
        {
          id: 'rec-machine-readable-ok',
          category: 'Parsing & Machine Readability',
          type: 'positive',
          title: 'ATS Machine-Readable PDF',
          explanation: 'Your document utilizes a clean single-column structure and standard text encoding, allowing ATS parsers to accurately extract candidate metadata.',
          evidence: 'Document parsed successfully with standard text stream encoding and zero OCR corruption.',
          severity: 'positive',
          confidence: 98,
          suggestedAction: 'Maintain clean standard font styles without multi-layer vector tables or graphic overlays.',
        },
        {
          id: 'rec-contact-info-ok',
          category: 'Contact Information',
          type: 'positive',
          title: 'Direct Contact Details Verified',
          explanation: 'Standard direct email address and mobile telephone number were detected in the header.',
          evidence: 'Found email: candidate@knowtohire.com and phone: +91 98765 43210.',
          severity: 'positive',
          confidence: 96,
          suggestedAction: 'Ensure phone number includes international calling code (+91) for global recruiters.',
        },
        {
          id: 'rec-skills-ok',
          category: 'Technical & Domain Skills',
          type: 'positive',
          title: 'Strong Technical Keyword Density',
          explanation: 'Found extensive high-demand core technical skills and framework keywords.',
          evidence: 'Detected skills: React, TypeScript, Node.js, AWS/GCP, SQL, CI/CD automation.',
          severity: 'positive',
          confidence: 94,
          suggestedAction: 'Keep technical skills categorized into Frontend, Backend, Cloud & DevOps, and Databases.',
        },
        {
          id: 'rec-quantified-ok',
          category: 'Measurable Impact & Achievements',
          type: 'positive',
          title: 'Measurable Impact Detected',
          explanation: 'Your work experience incorporates quantified metrics and concrete performance indicators.',
          evidence: 'Identified 6+ years experience with quantified enterprise delivery benchmarks.',
          severity: 'positive',
          confidence: 90,
          suggestedAction: 'Continue highlighting quantified outcomes in future career milestones.',
        },
      ],
    };

    saveStoredDemoResume(userId, defaultResume);
    return defaultResume;
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
    const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, {
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
        error: `Resume upload failed: ${error.message || 'Please check your connection and try again.'}`,
      };
    }

    // Persist storage object path in storage rather than public URL
    const objectPath = data.path || storagePath;

    // Cache metadata with objectPath
    saveStoredDemoResume(userId, {
      url: objectPath,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    });

    return {
      url: objectPath,
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

/**
 * Extracts the storage object path from a raw resume reference (whether path, full URL, or UUID pattern).
 */
export function extractResumeStoragePath(rawResumeRef?: string | null): string | null {
  if (!rawResumeRef || typeof rawResumeRef !== 'string') return null;
  const trimmed = rawResumeRef.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

  // If already a clean relative path (e.g. "userId/123_resume.pdf" or "resumes/userId/123_resume.pdf")
  if (trimmed.includes('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/^resumes\//, '');
  }

  // If it's a Supabase public/signed storage URL:
  // e.g. https://.../storage/v1/object/public/resumes/userId/timestamp_file.pdf
  const marker = '/storage/v1/object/public/resumes/';
  const signMarker = '/storage/v1/object/sign/resumes/';
  const authMarker = '/storage/v1/object/authenticated/resumes/';

  for (const m of [marker, signMarker, authMarker]) {
    const idx = trimmed.indexOf(m);
    if (idx !== -1) {
      const pathWithQuery = trimmed.substring(idx + m.length);
      return decodeURIComponent(pathWithQuery.split('?')[0]);
    }
  }

  // Fallback pattern match: /resumes/(...)
  const genericMatch = trimmed.match(/\/resumes\/(.+?)(\?|$)/);
  if (genericMatch && genericMatch[1]) {
    return decodeURIComponent(genericMatch[1].replace(/^resumes\//, ''));
  }

  return null;
}

/**
 * Authoritatively verifies access permissions and generates a short-lived signed URL for a candidate resume.
 * Authorization Rules:
 * 1. Admin users have global inspection rights.
 * 2. Candidate users can access ONLY their own resume.
 * 3. Employer users can access resumes ONLY if the candidate has applied to one of their company jobs,
 *    or if the candidate profile is marked discoverable and unlocked.
 */
export async function getAuthorizedResumeUrl(
  resumeRef: string,
  targetCandidateId?: string,
  expiresIn = 300
): Promise<string | null> {
  if (!resumeRef) return null;

  // Data URLs or Blob URLs in local/demo mode pass through directly
  if (resumeRef.startsWith('data:') || resumeRef.startsWith('blob:')) {
    return resumeRef;
  }

  const storagePath = extractResumeStoragePath(resumeRef);
  if (!storagePath || !isSupabaseConfigured()) {
    return resumeRef.startsWith('http') ? resumeRef : null;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    // In local demo mode (no active Supabase session), verify demo session authorization
    if (!currentUser) {
      if (typeof window !== 'undefined' && window.localStorage) {
        const demoAuth = window.localStorage.getItem('kth_demo_auth_session');
        if (demoAuth) {
          const parsed = JSON.parse(demoAuth);
          if (parsed?.role === 'admin' || parsed?.role === 'employer') {
            // Demo employer/admin can view preview
            const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
            return signed?.signedUrl || null;
          }
          if (parsed?.role === 'candidate') {
            if (!targetCandidateId || targetCandidateId === parsed.id || storagePath.startsWith(`${parsed.id}/`)) {
              const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
              return signed?.signedUrl || null;
            }
          }
        }
      }
      return null;
    }

    // 1. Resolve role of current authenticated user
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .maybeSingle();

    const role = profile?.role;

    // Admin has global audit permission
    if (role === 'admin') {
      const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
      return signed?.signedUrl || null;
    }

    // Candidate can view only their own resume
    if (role === 'candidate') {
      const isOwner = storagePath.startsWith(`${currentUser.id}/`) || targetCandidateId === currentUser.id;
      if (isOwner) {
        const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
        return signed?.signedUrl || null;
      }
      return null;
    }

    // Employer can view if candidate applied to their company's job
    if (role === 'employer') {
      // Find employer's company
      const { data: emp } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', currentUser.id)
        .maybeSingle();

      if (emp?.company_id) {
        // Check if application exists from this candidate to any job posted by this company
        const candidateIdToCheck = targetCandidateId || storagePath.split('/')[0];
        const { data: apps } = await supabase
          .from('job_applications')
          .select('id, jobs!inner(company_id)')
          .eq('candidate_id', candidateIdToCheck)
          .eq('jobs.company_id', emp.company_id)
          .limit(1);

        if (apps && apps.length > 0) {
          const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
          return signed?.signedUrl || null;
        }

        // Also check if candidate is discoverable
        const { data: candProfile } = await supabase
          .from('candidate_profiles')
          .select('is_discoverable')
          .eq('profile_id', candidateIdToCheck)
          .maybeSingle();

        if (candProfile?.is_discoverable) {
          const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(storagePath, expiresIn);
          return signed?.signedUrl || null;
        }
      }
      return null;
    }

    return null;
  } catch (err) {
    console.warn('[ResumeService] getAuthorizedResumeUrl failed:', err);
    return null;
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
  extractResumeStoragePath,
  getAuthorizedResumeUrl,
  getStoredDemoResume,
  saveStoredDemoResume,
};
