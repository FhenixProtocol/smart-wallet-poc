import { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import { useReadContract } from "wagmi";
import { type Config } from "@wagmi/core";
import { useFhenixClient } from "./store";
import { parseAccount } from "viem/accounts";
import { transformFhenixInputArgs } from "./utils";
import { unsealFhenixSealedItems } from "fhenix-utils/encryption/output";
import { useFhenixPermissionV2 } from "fhenix-utils";
import {
  FhenixContractFunctionArgs,
  FhenixContractFunctionReturnType,
  UseFhenixReadContractParameters,
  UseFhenixReadContractReturnType,
} from "fhenix-utils/multicall/multicall";
import { useAccount } from "@account-kit/react";

const useConfigOrAccount = (configAccount: any) => {
  const { address: connectedAccount } = useAccount({ type: "LightAccount" });
  const account = configAccount ?? connectedAccount;
  return account == null ? undefined : parseAccount(account).address;
};

export const useFhenixReadContract = <
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "pure" | "view">,
  args extends FhenixContractFunctionArgs<abi, "pure" | "view", functionName, true> = FhenixContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName,
    true
  >,
  config extends Config = Config,
>({
  args,
  ...parameters
}: UseFhenixReadContractParameters<abi, functionName, true, args>): UseFhenixReadContractReturnType<
  abi,
  functionName,
  false,
  FhenixContractFunctionArgs<abi, "pure" | "view", functionName, false>
> => {
  const account = useConfigOrAccount(parameters?.account);
  const fhenixClient = useFhenixClient();
  const { sealingKey, permissionV2 } = useFhenixPermissionV2(account);

  const transformedArgs = transformFhenixInputArgs<abi, functionName>(args, fhenixClient, permissionV2);

  const readContractQueryResult = useReadContract<
    abi,
    functionName,
    ContractFunctionArgs<abi, "pure" | "view", functionName>,
    config,
    FhenixContractFunctionReturnType<
      abi,
      "pure" | "view",
      functionName,
      false,
      FhenixContractFunctionArgs<abi, "pure" | "view", functionName, false>
    >
  >({
    args: transformedArgs,
    account,
    ...(parameters as any),
    query: {
      enabled: !Array.isArray(transformedArgs) || !transformedArgs.some((arg: any) => arg === undefined),
      select: (data: FhenixContractFunctionReturnType<abi, "pure" | "view", functionName, true> | undefined) => {
        return data == null || sealingKey == null ? undefined : unsealFhenixSealedItems(data, sealingKey);
      },
      ...parameters?.query,
    },
  });

  return {
    permitted: fhenixClient == null || permissionV2 != null,
    ...readContractQueryResult,
  };
};
