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
import { useUser, useAuthModal, useSignerStatus, useLogout, useAccount } from "@account-kit/react";

export const HeaderButtonsSection = () => {
  return (
    <div className="flex flex-row gap-4">
      <FaucetButton />
      <AccountKitConnectButton />
    </div>
  );
};

const AccountKitConnectButton = () => {
  const user = useUser();
  const { account } = useAccount({ type: "LightAccount" });
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();

  console.log({
    signerStatus,
    user,
    account,
  });

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
