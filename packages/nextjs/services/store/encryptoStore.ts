import { processUnsealables, Unsealable } from "fhenix-utils/encryption/types";
import { create } from "zustand";
import { bigintToFloat } from "~~/utils/scaffold-eth/bigint";

export type TokenData = {
  address: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  encBalance: Unsealable<bigint>;
};

export type DerivedTokenData = TokenData & {
  totalBalance: Unsealable<bigint> | undefined;
  price: number | undefined;
  visValue: number | undefined;
  encValue: Unsealable<number> | undefined;
  totalValue: Unsealable<number> | undefined;
  encPerc: Unsealable<number> | undefined;
};

type EncryptState = {
  tokenAddress: string | undefined;
  inputPriority: "amount" | "perc";
  amount: string | undefined;
  perc: number | undefined;
};

export type BridgeDirection = "to-fhenix" | "to-eth";
type BridgeState = {
  tokenAddress: string | undefined;
  useEncBalance: boolean;
  direction: BridgeDirection;
  amount: string;
};

type EncryptoState = {
  refetchKey: number;
  refetchTokens: () => void;

  loadingPrices: boolean;
  setLoadingPrices: (loading: boolean) => void;

  tokenPrices: Record<string, number>;
  setTokenPrices: (prices: Record<string, number>) => void;

  tokensLoading: boolean;
  setTokensLoading: (loading: boolean) => void;

  tokens: TokenData[];
  setTokens: (tokens: TokenData[]) => void;

  // Encrypt
  encryptState: EncryptState;
  resetEncryptState: () => void;
  setEncryptToken: (tokenAddress: string) => void;
  setEncryptAmountText: (amount: string) => void;
  setEncryptAmountPerc: (perc: number) => void;

  // Bridge
  bridgeState: BridgeState;
  resetBridgeState: () => void;
  setBridgeToken: (tokenAddress: string) => void;
  setBridgeUseEncBalance: (useEncBalance: boolean) => void;
  setBridgeDirection: (direction: BridgeDirection) => void;
  setBridgeAmount: (amount: string) => void;
};

export const useEncryptoState = create<EncryptoState>(set => ({
  refetchKey: 0,
  refetchTokens: () => set(state => ({ refetchKey: state.refetchKey + 1 })),

  loadingPrices: true,
  setLoadingPrices: loadingPrices => set({ loadingPrices }),

  tokenPrices: {},
  setTokenPrices: tokenPrices => set({ tokenPrices, loadingPrices: false }),

  tokensLoading: true,
  setTokensLoading: tokensLoading => set({ tokensLoading }),

  tokens: [],
  setTokens: tokens => set({ tokens, tokensLoading: false }),

  encryptState: { tokenAddress: undefined, inputPriority: "amount" as const, amount: undefined, perc: undefined },
  resetEncryptState: () => {
    set(state => ({
      encryptState: { ...state.encryptState, inputPriority: "amount", amount: undefined, perc: undefined },
    }));
  },
  setEncryptToken: tokenAddress =>
    set({
      encryptState: {
        tokenAddress,
        inputPriority: "amount",
        amount: "0",
        perc: undefined,
      },
    }),
  setEncryptAmountText: amount =>
    set(state => ({
      encryptState: {
        ...state.encryptState,
        inputPriority: "amount",
        amount,
        perc: undefined,
      },
    })),
  setEncryptAmountPerc: perc =>
    set(state => ({
      encryptState: {
        ...state.encryptState,
        inputPriority: "perc",
        amount: undefined,
        perc,
      },
    })),

  // Bridge
  bridgeState: {
    tokenAddress: undefined,
    useEncBalance: false,
    direction: "to-fhenix" as const,
    amount: "0",
  },
  resetBridgeState: () => {
    set({ bridgeState: { tokenAddress: undefined, useEncBalance: false, direction: "to-fhenix", amount: "0" } });
  },
  setBridgeToken: tokenAddress => {
    set({ bridgeState: { tokenAddress, useEncBalance: false, direction: "to-fhenix", amount: "0" } });
  },
  setBridgeUseEncBalance: useEncBalance => {
    set(state => ({ bridgeState: { ...state.bridgeState, useEncBalance } }));
  },
  setBridgeDirection: direction => {
    set(state => ({ bridgeState: { ...state.bridgeState, direction } }));
  },
  setBridgeAmount: amount => {
    set(state => ({ bridgeState: { ...state.bridgeState, amount } }));
  },
}));

export const deriveTokenData = (token: TokenData, price: number): DerivedTokenData => {
  const totalBalance = processUnsealables([token.balance, token.encBalance], (bal, encBal) => bal + encBal);

  const encValue =
    price == null
      ? undefined
      : processUnsealables([token.encBalance, token.decimals], (encBal, dec) => bigintToFloat(encBal, dec) * price);

  const visValue = price == null ? undefined : bigintToFloat(token.balance, token.decimals) * price;

  const totalValue =
    price == null
      ? undefined
      : processUnsealables([totalBalance, token.decimals], (totalBal, dec) => bigintToFloat(totalBal, dec) * price);

  const encPerc =
    encValue == null || totalValue == null
      ? undefined
      : processUnsealables([encValue, totalValue], (encVal, totalVal) => (100 * encVal) / totalVal);

  return {
    ...token,
    totalBalance,
    price,
    visValue,
    encValue,
    totalValue,
    encPerc,
  };
};

export const useDerivedTokens = () => {
  return useEncryptoState(state => {
    return state.tokens.map((token): DerivedTokenData => {
      const price = state.tokenPrices[token.symbol];
      return deriveTokenData(token, price);
    });
  });
};

export const useEncryptSelectedTokenData = () => {
  return useEncryptoState(state => {
    const selectedTokenAddress = state.encryptState.tokenAddress;
    if (selectedTokenAddress == null) return;

    const token = state.tokens.find(token => token.address === selectedTokenAddress);
    if (token == null) return;

    const price = state.tokenPrices[token.symbol];
    return deriveTokenData(token, price);
  });
};

export const usePortfolioSummaryData = () => {
  const derivedFherc20s = useDerivedTokens();

  const totalValue = processUnsealables(
    derivedFherc20s.map(token => token.totalValue),
    (...values) => {
      return values.reduce((acc, val) => acc + val, 0);
    },
  );
  const visValue = derivedFherc20s.reduce((acc, token) => acc + (token.visValue ?? 0), 0);
  const encValue = processUnsealables(
    derivedFherc20s.map(token => token.encValue),
    (...values) => {
      return values.reduce((acc, val) => acc + val, 0);
    },
  );

  const encPerc = processUnsealables([totalValue, encValue], (totalVal, encVal) =>
    totalVal === 0 ? 0 : (encVal * 100) / totalVal,
  );

  return {
    totalValue,
    visValue,
    encValue,
    encPerc,
  };
};
