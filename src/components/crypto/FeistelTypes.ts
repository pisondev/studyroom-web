export type SimStatus = 'idle' | 'running' | 'completed';
export type CryptoMode = 'encrypt' | 'decrypt';

export type FeistelLog = {
  round: number;
  L_in: string;
  R_in: string;
  K: string;
  F: string;
  L_out: string;
  R_out: string;
};