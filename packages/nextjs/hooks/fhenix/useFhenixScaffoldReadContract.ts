import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName } from "~~/utils/scaffold-eth/contract";
import { useFhenixReadContract } from "./useFhenixReadContract";
import { UseFhenixReadConfig } from "fhenix-utils";
import { ContractFunctionName } from "viem";

/**
 * Wrapper around wagmi's useContractRead hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useFhenixScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ContractFunctionName<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  functionName,
  args,
  ...readConfig
}: { contractName: TContractName } & UseFhenixReadConfig<ContractAbi<TContractName>, TFunctionName, true>) => {
  const { data: deployedContract } = useDeployedContractInfo(contractName);
  const { targetNetwork } = useTargetNetwork();
  const { query: queryOptions, watch, ...readContractConfig } = readConfig;
  const defaultWatch = watch ?? true;

  const readContractHookRes = useFhenixReadContract<ContractAbi<TContractName>, TFunctionName>({
    chainId: targetNetwork.id,
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    args,
    ...(readContractConfig as any),
    query: {
      enabled: !Array.isArray(args) || !args.some((arg: any) => arg === undefined),
      ...queryOptions,
    },
  });

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: defaultWatch,
    chainId: targetNetwork.id,
    query: {
      enabled: defaultWatch,
    },
  });

  useEffect(() => {
    if (defaultWatch) {
      queryClient.invalidateQueries({ queryKey: readContractHookRes.queryKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return readContractHookRes;
};
