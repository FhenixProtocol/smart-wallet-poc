import React from "react";
import { useFhenixActivePermitHash, useFhenixPermitWithHash } from "~~/permits/hooks";
import { usePermitModalFocusedPermitHash } from "~~/services/store/permitV2ModalStore";
import {
  PermitAccessDisplayRow,
  PermitExpirationDisplayRow,
  PermitIssuerSignatureDisplayRow,
  PermitNameEditableDisplayRow,
  PermitRecipientDisplayRow,
  PermitRecipientSignatureDisplayRow,
  PermitTypeDisplayRow,
} from "./DisplayRows";
import { PermitCopyDataButton } from "./PermitCopyDataButton";
import { PermitUseButton } from "./PermitUseButton";
import { useAccount } from "@account-kit/react";
import { PermitV2 } from "~~/permits/permitV2";
import { updatePermitName } from "~~/permits/store";

const NameRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <PermitNameEditableDisplayRow
      name={permit.name}
      onUpdateName={(value: string) => updatePermitName(address, permit.getHash(), value)}
    />
  );
};

export const PermitV2ModalOpened = () => {
  const { focusedPermitHash } = usePermitModalFocusedPermitHash();
  const permit = useFhenixPermitWithHash(focusedPermitHash);

  if (permit == null) {
    return <div>PERMIT NOT FOUND</div>;
  }

  return (
    <>
      <PermitTypeDisplayRow permit={permit} />
      <NameRow permit={permit} />
      <PermitRecipientDisplayRow permit={permit} />
      <PermitExpirationDisplayRow permit={permit} />
      <PermitAccessDisplayRow permit={permit} />
      <PermitIssuerSignatureDisplayRow permit={permit} />
      <PermitRecipientSignatureDisplayRow permit={permit} />

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <PermitCopyDataButton permit={permit} />
        <PermitUseButton permit={permit} className="flex-[1]" />
      </div>
    </>
  );
};
