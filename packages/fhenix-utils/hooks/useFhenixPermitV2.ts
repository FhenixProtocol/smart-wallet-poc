import { useCallback } from "react";
import { _getFhenixPermissionV2, setFhenixPermitNft, useFhenixState } from "../store";
import { FhenixPermitNftInfo } from "../permitV2";

export const useFhenixPermitNft = (account: string | undefined) => {
  return useFhenixState(state => (account == null ? undefined : state.accountSelectedPermitNft[account]));
};
export const useSetFhenixPermitNft = () => {
  return useCallback(async (account: string | undefined, nft: FhenixPermitNftInfo | undefined) => {
    if (account == null) return;
    await setFhenixPermitNft(account, nft);
  }, []);
};

export const useFhenixPermissionV2 = (account: string | undefined) => {
  return useFhenixState(state => _getFhenixPermissionV2(state, account));
};
