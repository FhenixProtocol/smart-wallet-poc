import { MutateOptions } from "@tanstack/react-query";
import { Abi } from "abitype";
import { ContractFunctionName, TransactionReceipt } from "viem";
import { FhenixContractFunctionArgs } from "../multicall/multicall";
import { Compute } from "@wagmi/core/internal";
import { Config, WriteContractErrorType, WriteContractParameters, WriteContractReturnType } from "@wagmi/core";
import { WriteContractVariables } from "@wagmi/core/query";
import { UseReadContractParameters } from "wagmi";

type AbiStateMutability = "pure" | "view" | "nonpayable" | "payable";
export type ReadAbiStateMutability = "view" | "pure";
export type WriteAbiStateMutability = "nonpayable" | "payable";

export type FunctionNamesWithInputs<
  TAbi extends Abi,
  TAbiStateMutability extends AbiStateMutability = AbiStateMutability,
> = Exclude<
  Extract<
    TAbi[number],
    {
      type: "function";
      stateMutability: TAbiStateMutability;
    }
  >,
  {
    inputs: readonly [];
  }
>["name"];

export type FhenixWriteContractVariables<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, WriteAbiStateMutability>,
  TFhenixTransformable extends boolean = false,
> = Compute<
  {
    abi: TAbi;
    functionName: TFunctionName;
    args?: FhenixContractFunctionArgs<TAbi, WriteAbiStateMutability, TFunctionName, TFhenixTransformable>;
  } & Omit<WriteContractParameters, "abi" | "functionName" | "args">
>;

export type UseFhenixReadConfig<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, ReadAbiStateMutability>,
  TFhenixTransformable extends boolean = false,
  TArgs = FhenixContractFunctionArgs<TAbi, ReadAbiStateMutability, TFunctionName, TFhenixTransformable>,
> = {
  functionName: TFunctionName;
  args?: TArgs;
  watch?: boolean;
} & Omit<UseReadContractParameters, "abi" | "functionName" | "args">;

type WriteVariables = WriteContractVariables<Abi, string, any[], Config, number>;

export type FhenixWriteContractOptions = MutateOptions<
  WriteContractReturnType,
  WriteContractErrorType,
  WriteVariables,
  unknown
>;

export type TransactorFuncOptions = {
  onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
  blockConfirmations?: number;
};
