import { getOrCreateFhenixPermit, useFhenixState, ContractAccountKey, initFhenixClient } from "fhenix-utils";
import { useCallback, useEffect } from "react";
import { Client } from "viem";
import { useWalletClient } from "wagmi";

// TODO: Remove
export const useInitFhenixClient = () => {
  return useCallback((client: Client<any, any>) => {
    // Casts to any to prevent type collision, hopefully fixed in the future
    // TODO: Fix this
    initFhenixClient(client as any);
  }, []);
};

// TODO: Remove
export const useCreateFhenixPermit = (contractAddress?: string, userAddress?: string) => {
  const cb = useCallback(getOrCreateFhenixPermit, []);
  return useCallback(() => cb(contractAddress, userAddress), [cb, contractAddress, userAddress]);
};

// TODO: Remove
export const useFhenixClient = () => {
  return useFhenixState(state => state.client);
};

// TODO: Remove
export const useFhenixPermit = (contractAddress: string | undefined, account: string | undefined) => {
  return useFhenixState(state => {
    if (contractAddress == null || account == null) return { permit: undefined, permission: undefined };

    const key: ContractAccountKey = `${contractAddress}_${account}`;
    const permit = state.contractAccountPermits[key];

    if (permit == null || state.client == null) return { permit: undefined, permission: undefined };

    return {
      permit,
      permission: state.client?.extractPermitPermission(permit),
    };
  });
};

// WAGMI hooks (useAccount)
// TODO: Remove
export const useWagmiInitFhenixClient = () => {
  const initFhenixClient = useInitFhenixClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (walletClient == null) return;
    initFhenixClient(walletClient);
  }, [walletClient, initFhenixClient]);
};
