import { useReadContracts } from "wagmi";
import { useFhenixClient } from "./store";
import { transformFhenixInputArgs } from "./utils";
import { useFhenixPermissionV2 } from "fhenix-utils";
import {
  FhenixMulticallReturnType,
  UseFhenixReadContractsParameters,
  UseFhenixReadContractsReturnType,
} from "fhenix-utils/multicall/multicall";
import { unsealFhenixSealedItems } from "fhenix-utils/encryption/output";
import { useAccount } from "@account-kit/react";

export const useFhenixReadContracts = <
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  selectData = FhenixMulticallReturnType<contracts, allowFailure>,
>(
  parameters: UseFhenixReadContractsParameters<contracts, allowFailure, true>,
): UseFhenixReadContractsReturnType<contracts, allowFailure, selectData> => {
  const { address: account } = useAccount({ type: "LightAccount" });
  const fhenixClient = useFhenixClient();
  const { permissionV2, sealingKey } = useFhenixPermissionV2(account);

  const transformedContracts = parameters?.contracts?.map((contract: any) => {
    if (contract.args == null) return contract;
    return {
      ...contract,
      args: transformFhenixInputArgs(contract.args, fhenixClient, permissionV2),
      account,
    };
  });

  // const queryDisabled = transformedContracts?.some((contract: any) => {
  //   if (contract.args == null) return false;
  //   return contract.args.some((arg: any) => arg == null);
  // });

  return useReadContracts({
    ...(parameters as any),
    contracts: transformedContracts,
    query: {
      // enabled: !queryDisabled,
      select: data => {
        return data.map(item => {
          if (item.status === "failure") return item;
          return {
            ...item,
            result: sealingKey == null ? item.result : unsealFhenixSealedItems(item.result, sealingKey),
          };
        });
      },
      ...parameters.query,
    },
  }) as UseFhenixReadContractsReturnType<contracts, allowFailure, selectData>;
};
