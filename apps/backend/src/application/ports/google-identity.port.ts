export const GOOGLE_IDENTITY = Symbol("GOOGLE_IDENTITY");

export interface VerifiedGoogleIdentity {
  avatarUrl: string | null;
  email: string;
  name: string;
  subject: string;
}

export interface GoogleIdentityVerifier {
  verify(credential: string): Promise<VerifiedGoogleIdentity>;
}
