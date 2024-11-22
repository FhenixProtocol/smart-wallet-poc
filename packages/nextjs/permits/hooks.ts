import { useStore } from "zustand";
import { permitsStore } from "./store";
import { PermitV2 } from "./permitV2";

export const useFhenixPermit = (account?: string) => {
  return useStore(permitsStore, state => {
    if (account == null) return undefined;

    const activePermitHash = state.activePermitHash[account];
    if (activePermitHash == null) return undefined;

    const permit = state.permits[account]?.[activePermitHash];
    if (permit == null) return undefined;

    return PermitV2.deserialize(permit);
  });
};
