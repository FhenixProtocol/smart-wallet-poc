"use client";

import { useState } from "react";
import { useLocalFhenixFaucet } from "fhenix-utils";
import { Address as AddressType } from "viem";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { fhenixLocal } from "~~/utils/fhenix/networks";
import { useChain } from "@account-kit/react";

/**
 * Faucet modal which lets you send ETH to any address.
 */
export const Faucet = () => {
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState<AddressType>();
  const [sendValue, setSendValue] = useState("");

  const { chain: ConnectedChain } = useChain();

  const faucetFn = useLocalFhenixFaucet();

  const sendETH = async () => {
    if (!inputAddress) {
      return;
    }
    let notificationId: string | undefined;
    try {
      setLoading(true);
      notificationId = notification.loading("Requesting funds from the faucet");
      await faucetFn(inputAddress);
      notification.remove(notificationId);
      notification.success("Funds arrived successfully. Wait for a few more seconds for the interface to update.", {
        icon: "🎉",
      });
      setLoading(false);
      setInputAddress(undefined);
      setSendValue("");
    } catch (error) {
      if (notificationId != null) notification.remove(notificationId);
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
    <div>
      <label htmlFor="faucet-modal" className="btn btn-primary btn-sm font-normal gap-1">
        <BanknotesIcon className="h-4 w-4" />
        <span>Faucet</span>
      </label>
      <input type="checkbox" id="faucet-modal" className="modal-toggle" />
      <label htmlFor="faucet-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3">Local Faucet</h3>
          <label htmlFor="faucet-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col space-y-3">
              <AddressInput
                placeholder="Destination Address"
                value={inputAddress ?? ""}
                onChange={value => setInputAddress(value as AddressType)}
              />
              <EtherInput placeholder="Amount to send" value={sendValue} onChange={value => setSendValue(value)} />
              <button className="h-10 btn btn-primary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
                {!loading ? (
                  <BanknotesIcon className="h-6 w-6" />
                ) : (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                <span>Send</span>
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
