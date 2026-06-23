export const REFRESH_TOKEN_CODEC = Symbol("REFRESH_TOKEN_CODEC");

export interface EncodedRefreshToken {
  hash: string;
  raw: string;
}

export interface ParsedRefreshToken {
  hash: string;
  sessionId: string;
}

export interface RefreshTokenCodec {
  create(sessionId: string): EncodedRefreshToken;
  parse(raw: string): ParsedRefreshToken | null;
}
