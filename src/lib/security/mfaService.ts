import { supabase } from '../supabaseClient';

export interface MFAEnrollmentResponse {
  id: string;
  type: 'totp';
  qrCodeSvg?: string;
  secret?: string;
  uri?: string;
}

export interface MFAChallengeResponse {
  id: string;
  expiresAt: number;
}

class MFAService {
  /**
   * Enroll a new TOTP factor for the authenticated user.
   */
  public async enrollTOTP(factorName = 'KnowToHire Authenticator'): Promise<MFAEnrollmentResponse> {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: factorName,
    });

    if (error) {
      console.error('MFA Enrollment error:', error);
      throw new Error(error.message || 'Failed to initialize TOTP MFA factor.');
    }

    return {
      id: data.id,
      type: 'totp',
      qrCodeSvg: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  }

  /**
   * Challenge and verify a 6-digit TOTP code during setup or login.
   */
  public async verifyTOTPCode(factorId: string, code: string): Promise<boolean> {
    const challengeRes = await supabase.auth.mfa.challenge({ factorId });
    if (challengeRes.error) {
      throw new Error(challengeRes.error.message || 'Failed to issue MFA challenge.');
    }

    const challengeId = challengeRes.data.id;
    const verifyRes = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (verifyRes.error) {
      throw new Error('Invalid MFA verification code. Please check your authenticator app.');
    }

    return true;
  }

  /**
   * Unenroll / remove an existing MFA factor.
   */
  public async unenrollFactor(factorId: string): Promise<void> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      throw new Error(error.message || 'Failed to remove MFA factor.');
    }
  }

  /**
   * List enrolled MFA factors for current user.
   */
  public async listUserFactors() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      throw new Error(error.message || 'Failed to retrieve MFA factors.');
    }
    return data.totp;
  }
}

export const mfaService = new MFAService();
