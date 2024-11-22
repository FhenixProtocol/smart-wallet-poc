import { useCallback, useEffect } from "react";
import { MainnetFherc20s } from "~~/contracts/mainnetFherc20s";
import { useEncryptoState } from "~~/services/store/encryptoStore";
import { fetchTokenPrice } from "~~/utils/encrypto/fetchTokenPrice";

export const useInitializeTokenPrices = () => {
  const setTokenPrices = useEncryptoState(state => state.setTokenPrices);
  const setLoadingPrices = useEncryptoState(state => state.setLoadingPrices);

  const fetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    const fetchedPrices = await Promise.all(
      MainnetFherc20s.map(fherc20 => fetchTokenPrice(fherc20.address, fherc20.symbol, fherc20.decimals)),
    );

    const tokenPrices: Record<string, number> = {};
    for (let i = 0; i < fetchedPrices.length; i++) {
      tokenPrices[MainnetFherc20s[i].symbol] = fetchedPrices[i];
    }

    setTokenPrices(tokenPrices);
  }, [setLoadingPrices, setTokenPrices]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // useInterval(fetchPrices, scaffoldConfig.pollingInterval);
};
