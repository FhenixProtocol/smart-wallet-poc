import { Abi } from "abitype";
import { FhenixClientSync } from "fhenixjs";
import { Encryptable } from "fhenix-utils/encryption/input";
import { FhenixContractFunctionArgs } from "fhenix-utils/multicall/multicall";
import { ContractFunctionName } from "viem";
import { PermissionV2 } from "~~/permits/types";

export const transformFhenixInputArgs = <
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi>,
  argsIn = FhenixContractFunctionArgs<abi, "pure" | "view", functionName, true>,
  argsOut = FhenixContractFunctionArgs<abi, "pure" | "view", functionName, false>,
>(
  args: argsIn | unknown | undefined,
  fhenixClient: FhenixClientSync | undefined,
  permission: PermissionV2 | undefined,
): argsOut | undefined => {
  if (args == null) return undefined;
  const withPermission = (args as any[]).map((arg: any) => (arg === "populate-fhenix-permission" ? permission : arg));
  if (fhenixClient == null) return withPermission as argsOut;
  return Encryptable.encrypt(withPermission, fhenixClient) as argsOut;
};
