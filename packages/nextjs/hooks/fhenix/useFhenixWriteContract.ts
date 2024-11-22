import { MutateOptions } from "@tanstack/react-query";
import { Abi } from "abitype";
import { UseWriteContractParameters, useAccount, useWriteContract, Config } from "wagmi";
import { WriteContractVariables } from "wagmi/query";
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions";
import { transformFhenixInputArgs } from "./utils";
import { useFhenixClient } from "./store";
import { FhenixWriteContractOptions, FhenixWriteContractVariables, getFhenixPermissionV2 } from "fhenix-utils";
import { ContractFunctionName } from "viem";

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param parameters - wagmi's useWriteContract parameters
 */
export const useFhenixWriteContract = (parameters?: UseWriteContractParameters) => {
  const { address } = useAccount({ config: parameters?.config });
  const wagmiContractWrite = useWriteContract(parameters);
  const fhenixClient = useFhenixClient();

  const sendContractWriteAsyncTx = async <
    TAbi extends Abi,
    TFunctionName extends ContractFunctionName<TAbi, "nonpayable" | "payable">,
  >(
    { args, ...variables }: FhenixWriteContractVariables<TAbi, TFunctionName, true>,
    options?: FhenixWriteContractOptions,
  ) => {
    try {
      const { permissionV2 } = getFhenixPermissionV2(address);
      const transformedArgs = transformFhenixInputArgs<TAbi, TFunctionName>(args, fhenixClient, permissionV2);

      const writeTxResult = await wagmiContractWrite.writeContractAsync(
        {
          args: transformedArgs,
          ...variables,
        } as WriteContractVariables<Abi, string, any[], Config, number>,
        options as
          | MutateOptions<
              WriteContractReturnType,
              WriteContractErrorType,
              WriteContractVariables<Abi, string, any[], Config, number>,
              unknown
            >
          | undefined,
      );

      return writeTxResult;
    } catch (e: any) {
      throw e;
    }
  };

  const sendContractWriteTx = <
    TAbi extends Abi,
    TFunctionName extends ContractFunctionName<TAbi, "nonpayable" | "payable">,
  >(
    { args, ...variables }: FhenixWriteContractVariables<TAbi, TFunctionName, true>,
    options?: FhenixWriteContractOptions,
  ) => {
    try {
      const { permissionV2 } = getFhenixPermissionV2(address);
      const transformedArgs = transformFhenixInputArgs<TAbi, TFunctionName>(args, fhenixClient, permissionV2);

      wagmiContractWrite.writeContract(
        {
          args: transformedArgs,
          ...variables,
        } as WriteContractVariables<Abi, string, any[], Config, number>,
        options as
          | MutateOptions<
              WriteContractReturnType,
              WriteContractErrorType,
              WriteContractVariables<Abi, string, any[], Config, number>,
              unknown
            >
          | undefined,
      );
    } catch (e: any) {
      throw e;
    }
  };

  return {
    ...wagmiContractWrite,
    writeContractAsync: sendContractWriteAsyncTx,
    writeContract: sendContractWriteTx,
  };
};
