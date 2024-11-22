import { SealingKey } from "fhenixjs";

export type FhenixPermitNftInfo = {
  id: bigint;
  issuer: string;
  name: string;
  holder: string;
  createdAt: bigint;
  validityDur: bigint;
  expiresAt: bigint;
  fineGrained: boolean;
  revoked: boolean;
  contracts: string[];
  projects: string[];
  routers: string[];
};

export type FhenixJsPermitV2 = {
  sealingKey: SealingKey;
  permitId: bigint;
};

export type FhenixPermissionV2 = {
  permitId: bigint;
  publicKey: string;
};
