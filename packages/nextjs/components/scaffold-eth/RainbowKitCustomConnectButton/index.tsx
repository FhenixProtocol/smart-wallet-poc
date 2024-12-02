"use client";

import { AccountKitUserConnectionAvatar } from "~~/components/account-kit-connect/AccountKitConnectionAvatar";
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
import { PermitModalButton } from "../PermitButton";

export const HeaderButtonsSection = () => {
  return (
    <div className="flex flex-row gap-4">
      <FaucetButton />
      <PermitModalButton />
      <AccountKitUserConnectionAvatar />
    </div>
  );
};
