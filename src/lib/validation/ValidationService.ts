export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

export const DateValidator = {
  isValidSequence(startDate: string, endDate?: string): boolean {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  }
};

export const URLValidator = {
  isValid(url?: string): boolean {
    if (!url) return true;
    return url.startsWith('http://') || url.startsWith('https://');
  }
};

export const DuplicateValidator = {
  hasDuplicate<T>(list: T[], predicate: (item: T) => boolean): boolean {
    return list.some(predicate);
  }
};

export const LengthValidator = {
  isValidLength(text: string, maxLength: number): boolean {
    return text.length <= maxLength;
  }
};

export const RequiredValidator = {
  hasValues(fields: Record<string, any>): boolean {
    return Object.values(fields).every(val => {
      if (typeof val === 'string') return val.trim().length > 0;
      return val !== null && val !== undefined;
    });
  }
};

export const FileValidator = {
  isValidType(fileType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(fileType);
  },
  isValidSize(fileSize: number, maxSizeInBytes: number): boolean {
    return fileSize <= maxSizeInBytes;
  }
};

// Placeholders for future validators
export const EmailValidator = {
  isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

export const PhoneValidator = {
  isValid(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }
};

export const LinkedInValidator = {
  isValid(url: string): boolean {
    return url.includes('linkedin.com/');
  }
};

export class ValidationService {
  static validateEducation(edu: { institution: string; degree: string; startDate: string; endDate?: string }): IValidationResult {
    const errors: string[] = [];
    if (!RequiredValidator.hasValues({ institution: edu.institution, degree: edu.degree, startDate: edu.startDate })) {
      errors.push('Please fill in all required fields.');
    }
    if (!DateValidator.isValidSequence(edu.startDate, edu.endDate)) {
      errors.push('Start date must precede graduation date.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateExperience(exp: { companyName: string; roleTitle: string; startDate: string; endDate?: string; isCurrent: boolean }): IValidationResult {
    const errors: string[] = [];
    if (!RequiredValidator.hasValues({ companyName: exp.companyName, roleTitle: exp.roleTitle, startDate: exp.startDate })) {
      errors.push('Please fill in all required fields.');
    }
    if (!exp.isCurrent && !exp.endDate) {
      errors.push('Please enter an end date or select "I currently work in this role".');
    }
    if (!DateValidator.isValidSequence(exp.startDate, exp.endDate)) {
      errors.push('Start date must precede the end date.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCertification(cert: { name: string; issuingOrg: string; issueDate: string; expirationDate?: string; credentialUrl?: string }): IValidationResult {
    const errors: string[] = [];
    if (!RequiredValidator.hasValues({ name: cert.name, issuingOrg: cert.issuingOrg, issueDate: cert.issueDate })) {
      errors.push('Please fill in all required fields.');
    }
    if (!DateValidator.isValidSequence(cert.issueDate, cert.expirationDate)) {
      errors.push('Issue date must precede the expiration date.');
    }
    if (!URLValidator.isValid(cert.credentialUrl)) {
      errors.push('Please enter a valid credential URL starting with http:// or https://');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateProject(proj: { title: string; description: string; projectUrl?: string; githubUrl?: string }): IValidationResult {
    const errors: string[] = [];
    if (!RequiredValidator.hasValues({ title: proj.title, description: proj.description })) {
      errors.push('Project title and description are required.');
    }
    if (!URLValidator.isValid(proj.projectUrl)) {
      errors.push('Please enter a valid live demo URL starting with http:// or https://');
    }
    if (!URLValidator.isValid(proj.githubUrl)) {
      errors.push('Please enter a valid GitHub URL starting with http:// or https://');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
