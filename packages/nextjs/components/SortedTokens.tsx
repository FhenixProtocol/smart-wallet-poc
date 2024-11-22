"use client";

import { usePortfolioSummaryData, useDerivedTokens } from "~~/services/store/encryptoStore";
import { TokenRow } from "./TokenRow";

export const SortedTokens = () => {
  const { totalValue: portfolioValue } = usePortfolioSummaryData();
  const derivedFherc20s = useDerivedTokens();

  if (derivedFherc20s == null)
    return (
      <tr>
        <th>loading....</th>
      </tr>
    );
  return (
    <>
      {derivedFherc20s
        .sort((a, b) =>
          (b.totalValue?.data ?? b.visValue ?? 0) - (a.totalValue?.data ?? b.visValue ?? 0) > 0 ? 1 : -1,
        )
        .map(fherc20 => {
          return <TokenRow key={fherc20.address} token={fherc20} portfolioValue={portfolioValue} />;
        })}
    </>
  );
};
