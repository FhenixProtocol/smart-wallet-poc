"use client";

import { useState } from "react";
import { useLocalFhenixFaucet } from "fhenix-utils";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useWatchBalance } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { fhenixLocal } from "~~/utils/fhenix/networks";
import { useAccount, useChain } from "@account-kit/react";

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address } = useAccount({ type: "LightAccount" });
  const { chain: ConnectedChain } = useChain();
  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);
  const faucetFn = useLocalFhenixFaucet();

  const sendETH = async () => {
    if (!address) {
      return;
    }

    try {
      setLoading(true);
      await faucetFn(address);
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }

    try {
      setLoading(true);
      await faucetFn(address);
      notification.success("Funds arrived successfully. Wait for a few more seconds for the interface to update.", {
        icon: "🎉",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error);
      const message = getParsedError(error);
      notification.error(message);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== fhenixLocal.id) {
    return null;
  }

  return (
    <div
      className={`${
        !balance &&
        "tooltip tooltip-bottom tooltip-secondary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:right-0"
      }`}
      data-tip="Grab funds from faucet"
    >
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
