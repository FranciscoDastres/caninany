export const AUTH_NOTIFICATION = Symbol("AUTH_NOTIFICATION");

export interface AuthNotification {
  sendPasswordReset(email: string, token: string): Promise<void>;
  sendVerification(email: string, token: string): Promise<void>;
}
