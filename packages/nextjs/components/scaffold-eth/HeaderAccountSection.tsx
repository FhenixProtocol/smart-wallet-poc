"use client";

import { AccountKitUserConnectionAvatar } from "~~/components/account-kit-connect/AccountKitConnectionAvatar";
import { FaucetButton } from "./FaucetButton";
import { PermitModalButton } from "./PermitButton";

export const HeaderButtonsSection = () => {
  return (
    <div className="flex flex-row gap-4">
      <FaucetButton />
      <PermitModalButton />
      <AccountKitUserConnectionAvatar />
    </div>
  );
};
