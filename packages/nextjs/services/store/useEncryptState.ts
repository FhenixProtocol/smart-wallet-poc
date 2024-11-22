import { bigintToFloat, bigintFixed } from "~~/utils/scaffold-eth/bigint";
import { useEncryptoState } from "./encryptoStore";

export const useEncryptState = () => {
  return useEncryptoState(state => {
    const selectedTokenAddress = state.encryptState.tokenAddress;
    const token = state.tokens.find(token => token.address === selectedTokenAddress);

    if (token == null || !token.encBalance.unsealed)
      return { token: undefined, currPerc: undefined, amount: undefined, targetPerc: undefined };

    const encBal = token.encBalance.data;
    const totalBal = token.balance + encBal;
    const currPerc = bigintToFloat(encBal, token.decimals) / bigintToFloat(totalBal, token.decimals);

    if (state.encryptState.inputPriority === "amount") {
      const amount = state.encryptState.amount;

      const targetPerc =
        ((bigintToFloat(encBal, token.decimals) + parseFloat(amount ?? "0")) * 100) /
        bigintToFloat(totalBal, token.decimals);

      return {
        token,
        currPerc,
        amount,
        targetPerc,
      };
    } else {
      const targetPerc = state.encryptState.perc;

      const currPerc = (bigintToFloat(encBal, token.decimals) * 100) / bigintToFloat(totalBal, token.decimals);
      const percOffset = targetPerc == null ? 0 : targetPerc - currPerc;

      const raw = (percOffset / 100) * bigintToFloat(totalBal, token.decimals);
      let amount = raw.toFixed(token.decimals);

      // If at min or max perc, use true numbers to get exact value instead of using perc converted to amount
      if (targetPerc === 0) {
        amount = bigintFixed(-1n * token.encBalance.data, token.decimals);
      }
      if (targetPerc === 100) {
        amount = bigintFixed(token.balance, token.decimals);
      }

      return {
        token,
        currPerc,
        amount,
        targetPerc,
      };
    }
  });
};
