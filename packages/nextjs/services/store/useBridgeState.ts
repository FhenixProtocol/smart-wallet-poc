import { deriveTokenData, useEncryptoState } from "./encryptoStore";

export const useBridgeState = () => {
  return useEncryptoState(state => {
    const token = state.tokens.find(token => token.address === state.bridgeState.tokenAddress);
    const amount = state.bridgeState.amount;
    return {
      token,
      amount,
    };
  });
};

export const useBridgeDerivedTokenData = () => {
  return useEncryptoState(state => {
    const selectedTokenAddress = state.bridgeState.tokenAddress;
    if (selectedTokenAddress == null) return;

    const token = state.tokens.find(token => token.address === selectedTokenAddress);
    if (token == null) return;

    const price = state.tokenPrices[token.symbol];
    return deriveTokenData(token, price);
  });
};
