import { useReadContracts } from "wagmi";
import { useFhenixClient } from "./store";
import { transformFhenixInputArgs } from "./utils";
import {
  FhenixMulticallReturnType,
  UseFhenixReadContractsParameters,
  UseFhenixReadContractsReturnType,
} from "fhenix-utils/multicall/multicall";
import { useAccount } from "@account-kit/react";
import { useFhenixPermit } from "~~/permits/hooks";

export const useFhenixReadContracts = <
  const contracts extends readonly unknown[],
  allowFailure extends boolean = true,
  selectData = FhenixMulticallReturnType<contracts, allowFailure>,
>(
  parameters: UseFhenixReadContractsParameters<contracts, allowFailure, true>,
): UseFhenixReadContractsReturnType<contracts, allowFailure, selectData> => {
  const { address } = useAccount({ type: "LightAccount" });
  const fhenixClient = useFhenixClient();
  const permit = useFhenixPermit();

  const transformedContracts = parameters?.contracts?.map((contract: any) => {
    if (contract.args == null) return contract;
    return {
      ...contract,
      args: transformFhenixInputArgs(contract.args, fhenixClient, permit?.getPermission()),
      account: address,
    };
  });

  return useReadContracts({
    ...(parameters as any),
    contracts: transformedContracts,
    query: {
      select: data => {
        return data.map(item => {
          if (item.status === "failure") return item;
          return {
            ...item,
            result: permit == null ? item.result : permit.unseal(item.result),
          };
        });
      },
      ...parameters.query,
    },
  }) as UseFhenixReadContractsReturnType<contracts, allowFailure, selectData>;
};
