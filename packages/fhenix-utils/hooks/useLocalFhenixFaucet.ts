export const FHENIX_LOCAL_FAUCET_URL = "http://127.0.0.1:42000/faucet";

type RequestFunc = (to: string) => Promise<string | undefined>;

/**
 * Runs Request passed in to returned function showing UI feedback.
 * @param _walletClient - Optional wallet client to use. If not provided, will use the one from useWalletClient.
 * @returns function that takes in transaction function as callback, shows UI feedback for transaction and returns a promise of the transaction hash
 */
export const useLocalFhenixFaucet = (): RequestFunc => {
  const result: RequestFunc = async (to: string) => {
    const faucetResult = "";

    await fetch(
      FHENIX_LOCAL_FAUCET_URL +
        "?" +
        new URLSearchParams({
          address: to,
        }),
      {
        method: "GET",
        headers: new Headers({ "Content-Type": "application/json" }),
        mode: "no-cors",
      },
    );

    return faucetResult;
  };

  return result;
};
