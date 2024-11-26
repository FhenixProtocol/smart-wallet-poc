"use client";

import { RenderUserConnectionAvatar } from "~~/components/user-connection-avatar/RenderUserConnectionAvatar";
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
import { PermitButton } from "../PermitButton";

export const HeaderButtonsSection = () => {
  return (
    <div className="flex flex-row gap-4">
      <FaucetButton />
      <PermitButton />
      <RenderUserConnectionAvatar />
    </div>
  );
};
