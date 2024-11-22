/* eslint-disable @typescript-eslint/no-unused-vars */
import { L2TransactionReceipt } from "@arbitrum/sdk";
import {
  L1EthDepositTransactionReceipt,
  L1ContractCallTransactionReceipt,
} from "@arbitrum/sdk/dist/lib/message/L1Transaction";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BridgeTxBase = {
  amount: bigint;
  txHash: string;
};

export type BridgeTx = (
  | {
      type: "eth-deposit";
      tx: L1EthDepositTransactionReceipt;
    }
  | {
      type: "eth-withdraw";
      tx: L2TransactionReceipt;
    }
  | {
      type: "erc20-deposit";
      tx: L1ContractCallTransactionReceipt;
    }
  | {
      type: "erc20-withdraw";
      tx: L2TransactionReceipt;
    }
) &
  BridgeTxBase;

export type BridgeTxType = BridgeTx["type"];

const TransactionReceiptFields = [
  "to",
  "from",
  "contractAddress",
  "transactionIndex",
  "root",
  "gasUsed",
  "logsBloom",
  "blockHash",
  "transactionHash",
  "logs",
  "blockNumber",
  "confirmations",
  "cumulativeGasUsed",
  "effectiveGasPrice",
  "byzantium",
  "type",
  "status",
];

const extractInterfaceFields = <T>(obj: T, keys: (keyof T)[]): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
};

const extractTransactionReceipt = <T, K extends (keyof T)[]>(obj: T) => {
  return extractInterfaceFields(obj, TransactionReceiptFields as K);
};

type PersistState = {
  bridgeTxs: BridgeTx[];
};

const hasTypeField = (value: unknown): value is { type: string; value: string } => {
  return typeof value === "object" && value !== null && "type" in value;
};

export const usePersistStore = create<PersistState>()(
  persist(
    set => ({
      bridgeTxs: [],
    }),
    {
      name: "encrypto",
      partialize: state => ({ bridgeTxs: state.bridgeTxs }),
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (hasTypeField(value)) {
            switch (value.type) {
              case "bigint":
                return BigInt(value.value);
              case "L1EthDepositTransactionReceipt":
                return new L1EthDepositTransactionReceipt(JSON.parse(value.value));
              case "L1ContractCallTransactionReceipt":
                return new L1ContractCallTransactionReceipt(JSON.parse(value.value));
              case "L2TransactionReceipt":
                return new L2TransactionReceipt(JSON.parse(value.value));
            }
          }
          return value;
        },
        replacer: (key, value) => {
          if (value instanceof BigInt) {
            return { type: "bigint", value: value.toString() };
          }
          if (value instanceof L1EthDepositTransactionReceipt) {
            return { type: "L1EthDepositTransactionReceipt", value: extractTransactionReceipt(value) };
          }
          if (value instanceof L1ContractCallTransactionReceipt) {
            return { type: "L1ContractCallTransactionReceipt", value: extractTransactionReceipt(value) };
          }
          if (value instanceof L2TransactionReceipt) {
            return { type: "L2TransactionReceipt", value: extractTransactionReceipt(value) };
          }
          return value;
        },
      }),
    },
  ),
);
