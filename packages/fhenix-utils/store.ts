import { BrowserProvider, Eip1193Provider } from "ethers";
import { FhenixClientSync, Permit } from "fhenixjs";
import { Client } from "viem";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { SupportedProvider } from "fhenixjs";
import { extractPermissionV2, FhenixJsPermitV2, FhenixPermitNftInfo, generatePermitV2 } from "./permitV2";

export type ContractAccountKey = `${string}_${string}`;
export type FhenixState = {
  initializedAccount: string | undefined;
  client: FhenixClientSync | undefined;
  provider: SupportedProvider | undefined;
  contractAccountPermits: Record<ContractAccountKey, Permit>;
  accountSelectedPermitNft: Record<string, FhenixPermitNftInfo | undefined>;
  permitNftPermit: Record<number, FhenixJsPermitV2 | undefined>;
};

export const useFhenixState = create<FhenixState>()(
  immer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get): FhenixState => ({
      initializedAccount: undefined,
      client: undefined,
      provider: undefined,
      contractAccountPermits: {},
      accountSelectedPermitNft: {},
      permitNftPermit: {},
    }),
  ),
);

export const initFhenixClient = async (walletClient: Client<any, any>) => {
  // Exit if account hasn't changed (no need to update)
  const account = walletClient.account?.address;
  if (account === useFhenixState.getState().initializedAccount) return;

  // const wagmiToEthersProvider = clientToProvider(walletClient);
  // @ts-expect-error .ethereum doesn't exist on window type
  const provider = new BrowserProvider(window.ethereum as Eip1193Provider);

  const client = await FhenixClientSync.create({ provider: provider as SupportedProvider });

  const loadedPermits = account == null ? null : client.loadAllPermitsFromLocalStorage(account);

  const loadedPermitsWithAccount: Record<ContractAccountKey, Permit> = {};
  if (loadedPermits != null && account != null) {
    Object.entries(loadedPermits).forEach(([contractAddress, permit]) => {
      const key: ContractAccountKey = `${contractAddress}_${account}`;
      loadedPermitsWithAccount[key] = permit;
    });
  }

  useFhenixState.setState({
    initializedAccount: account,
    client,
    provider: provider as SupportedProvider,
    contractAccountPermits: loadedPermitsWithAccount,
  });
};

export const getOrCreateFhenixPermit = async (contractAddress?: string, account?: string) => {
  if (contractAddress == null || account == null) return;

  const client = useFhenixState.getState().client;
  if (client == null || contractAddress == null || account == null) return;

  let permit = client.getPermit(contractAddress, account);
  if (permit == null) {
    permit = await client.generatePermit(contractAddress);
  }

  useFhenixState.setState(draft => {
    draft.contractAccountPermits[`${contractAddress}_${account}`] = permit;
  });
};

export const getFhenixPermit = (contractAddress: string, account: string) => {
  const key: ContractAccountKey = `${contractAddress}_${account}`;
  return useFhenixState.getState().contractAccountPermits[key];
};

// read

export const getFhenixClientPermit = (contractAddress: string | undefined, account: string | undefined) => {
  if (contractAddress == null || account == null) return { permit: undefined, permission: undefined };

  const state = useFhenixState.getState();

  const key: ContractAccountKey = `${contractAddress}_${account}`;
  const permit = state.contractAccountPermits[key];

  if (permit == null || state.client == null) return { permit: undefined, permission: undefined };

  return {
    permit,
    permission: state.client?.extractPermitPermission(permit),
  };
};

// Permit NFT

export const getFhenixPermitNft = (account: string) => {
  return useFhenixState.getState().accountSelectedPermitNft[account];
};

export const setFhenixPermitNft = async (account: string, permitNft: FhenixPermitNftInfo | undefined) => {
  useFhenixState.setState(state => {
    state.accountSelectedPermitNft[account] = permitNft;
  });

  if (permitNft == null) return;

  // Exit if permitNft already has an associated permitV2
  if (useFhenixState.getState().permitNftPermit[Number(permitNft.id)] != null) return;

  const permitV2 = await generatePermitV2(permitNft.id);

  useFhenixState.setState(draft => {
    draft.permitNftPermit[Number(permitNft.id)] = permitV2;
  });
};

export const _getFhenixPermissionV2 = (state: FhenixState, account: string | undefined) => {
  if (account == null) return { sealingKey: undefined, permissionV2: undefined };

  const permitNft = state.accountSelectedPermitNft[account];
  if (permitNft == null) return { sealingKey: undefined, permissionV2: undefined };

  const permitV2 = state.permitNftPermit[Number(permitNft.id)];
  if (permitV2 == null) return { sealingKey: undefined, permissionV2: undefined };

  return { sealingKey: permitV2.sealingKey, permissionV2: extractPermissionV2(permitV2) };
};
export const getFhenixPermissionV2 = (account: string | undefined) => {
  return _getFhenixPermissionV2(useFhenixState.getState(), account);
};
