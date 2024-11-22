"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";
import { FhenixPermitV2Dropdown } from "../fhenix/PermitV2/FhenixPermitV2Dropdown";
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

  console.log({ signerStatus, user });

  if (signerStatus.isInitializing) return <div className="btn btn-disabled">Loading...</div>;

  if (user == null || signerStatus.isDisconnected)
    return (
      <div className="btn" onClick={openAuthModal}>
        LOGIN
      </div>
    );

  return (
    <div
      className="btn"
      onClick={() => {
        console.log("logout");
        logout();
      }}
    >
      {user.email ?? "anon"}
    </div>
  );
};
