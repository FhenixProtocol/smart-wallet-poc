"use client";

import { useAccount, useAuthModal } from "@account-kit/react";
import { SortedTokens } from "./SortedTokens";

const TokensTableConnectButton = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <div className="absolute inset-0 -top-10 bg-base-100 bg-opacity-50 flex items-center justify-center pointer-events-auto">
      <button onClick={openAuthModal} className="btn btn-primary">
        CONNECT WALLET
      </button>
    </div>
  );
};

const TokensTableBody = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <tbody className={`relative ${address == null && "pointer-events-none"}`}>
      <SortedTokens />
      {address == null && <TokensTableConnectButton />}
    </tbody>
  );
};

export const EncryptoTokensTable = () => {
  return (
    <table className="table">
      <thead>
        <tr className="border-b-base-content">
          <th>Token</th>
          <th>Balance</th>
          <th>Encrypted Ratio</th>
          <th>Portfolio %</th>
          <th>Price (24h)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <TokensTableBody />
    </table>
  );
};
