"use client";

// @refresh reset
// import { Balance } from "../Balance";
// import { AddressInfoDropdown } from "./AddressInfoDropdown";
// import { AddressQRCodeModal } from "./AddressQRCodeModal";
// import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { Address } from "viem";
// import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";
// import { FhenixPermitV2Dropdown } from "../fhenix/PermitV2/FhenixPermitV2Dropdown";
import { FaucetButton } from "../FaucetButton";
import { useUser, useAuthModal, useSignerStatus, useLogout } from "@account-kit/react";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const AccountKitCustomConnectButton = () => {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();

  return (
    <div className="flex flex-row gap-4">
      <FaucetButton />
      {signerStatus.isInitializing && <div className="btn btn-disabled">Loading...</div>}

      {(user == null || signerStatus.isDisconnected) && (
        <div className="btn" onClick={openAuthModal}>
          LOGIN
        </div>
      )}

      {user != null && signerStatus.isConnected && (
        <div
          className="btn"
          onClick={() => {
            console.log("logout");
            logout();
          }}
        >
          {user.email ?? "anon"}
        </div>
      )}
    </div>
  );
};
