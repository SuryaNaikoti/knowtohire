// Platform Security Hardening Utilities

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'image/png',
  'image/jpeg',
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const securityUtils = {
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF, DOCX, PNG, and JPEG formats are permitted.'
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: 'File size exceeds the 5MB limit. Please upload a smaller file.'
      };
    }

    return { valid: true };
  },

  sanitizeInput(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};
