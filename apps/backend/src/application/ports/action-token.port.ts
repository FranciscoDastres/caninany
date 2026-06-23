export const ACTION_TOKEN_CODEC = Symbol("ACTION_TOKEN_CODEC");

export interface ActionToken {
  hash: string;
  raw: string;
}

export interface ActionTokenCodec {
  create(): ActionToken;
  hash(raw: string): string;
}
