import { useState } from "react";
import { UseWriteContractParameters, useAccount } from "wagmi";
import { useDeployedContractInfo, useTargetNetwork, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName } from "~~/utils/scaffold-eth/contract";
import { useFhenixWriteContract } from "./useFhenixWriteContract";
import { FhenixWriteContractOptions, FhenixWriteContractVariables, TransactorFuncOptions } from "fhenix-utils";
import { ContractFunctionName } from "viem";

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export const useFhenixScaffoldWriteContract = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
) => {
  const { chain } = useAccount();
  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const fhenixContractWrite = useFhenixWriteContract(writeContractParams);

  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ContractFunctionName<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    {
      functionName,
      ...variables
    }: Omit<FhenixWriteContractVariables<ContractAbi<TContractName>, TFunctionName, true>, "abi" | "address">,
    options?: FhenixWriteContractOptions & TransactorFuncOptions,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    try {
      setIsMining(true);
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
      const makeWriteWithParams = () =>
        fhenixContractWrite.writeContractAsync<ContractAbi<TContractName>, TFunctionName>(
          {
            abi: deployedContractData.abi as ContractAbi<TContractName>,
            address: deployedContractData.address,
            functionName,
            ...variables,
          },
          mutateOptions,
        );
      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
      throw e;
    } finally {
      setIsMining(false);
    }
  };

  const sendContractWriteTx = <
    TFunctionName extends ContractFunctionName<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    {
      functionName,
      ...variables
    }: Omit<FhenixWriteContractVariables<ContractAbi<TContractName>, TFunctionName, true>, "abi" | "address">,
    options?: Omit<FhenixWriteContractOptions, "blockConfirmations" | "onBlockConfirmation">,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    fhenixContractWrite.writeContract<ContractAbi<TContractName>, TFunctionName>(
      {
        abi: deployedContractData.abi as ContractAbi<TContractName>,
        address: deployedContractData.address,
        functionName,
        ...variables,
      },
      options,
    );
  };

  return {
    ...fhenixContractWrite,
    isMining,
    writeContractAsync: sendContractWriteAsyncTx,
    writeContract: sendContractWriteTx,
  };
};
