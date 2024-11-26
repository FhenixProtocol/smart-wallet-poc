"use client";

import { useUser } from "@account-kit/react";
import { WalletIcon } from "@heroicons/react/24/outline";
import { usePermitModalOpen } from "~~/services/store/permitV2ModalStore";

export const PermitButton = () => {
  const user = useUser();
  const { setOpen } = usePermitModalOpen();

  // if (user == null) return null;

  return (
    <button className="btn " onClick={() => setOpen(true)}>
      <WalletIcon className="h-4 w-4" />
    </button>
  );
};
