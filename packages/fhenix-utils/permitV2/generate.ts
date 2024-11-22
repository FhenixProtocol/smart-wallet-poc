import { GenerateSealingKey } from "fhenixjs";
import { FhenixJsPermitV2, FhenixPermissionV2 } from "./types";

export const extractPermissionV2 = (permit: FhenixJsPermitV2): FhenixPermissionV2 => {
  return {
    permitId: permit.permitId,
    publicKey: `0x${permit.sealingKey.publicKey}`,
  };
};

export const generatePermitV2 = async (permitId: bigint): Promise<FhenixJsPermitV2> => {
  return {
    sealingKey: await GenerateSealingKey(),
    permitId,
  };
};
