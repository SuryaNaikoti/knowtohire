export interface CountryPhoneCode {
  code: string; // e.g. "+91"
  country: string; // e.g. "India"
  flag: string; // e.g. "🇮🇳"
  iso: string; // e.g. "IN"
}

export const COUNTRY_PHONE_CODES: CountryPhoneCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', iso: 'US' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR' },
  { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', iso: 'BE' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', iso: 'AT' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', iso: 'PT' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO' },
];

/**
 * Splits a full international phone string into { countryCode, nationalNumber }
 */
export function parsePhoneWithCountryCode(fullPhone: string): { countryCode: string; nationalNumber: string } {
  if (!fullPhone) {
    return { countryCode: '+91', nationalNumber: '' };
  }

  const trimmed = fullPhone.trim();
  if (trimmed.startsWith('+')) {
    // Sort descending by code length so +971 is matched before +97 etc.
    const sorted = [...COUNTRY_PHONE_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.code)) {
        const national = trimmed.slice(c.code.length).trim().replace(/^[- ]+/, '');
        return { countryCode: c.code, nationalNumber: national };
      }
    }
  }

  // Default fallback if no country code prefixed
  return { countryCode: '+91', nationalNumber: trimmed };
}

/**
 * Formats countryCode and nationalNumber into a standard international format string
 */
export function formatInternationalPhone(countryCode: string, nationalNumber: string): string {
  const cleanNational = nationalNumber.trim();
  if (!cleanNational) return '';
  const code = countryCode.trim().startsWith('+') ? countryCode.trim() : `+${countryCode.trim()}`;
  return `${code} ${cleanNational}`;
}
