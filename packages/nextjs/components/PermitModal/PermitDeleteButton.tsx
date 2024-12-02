import { useAccount } from "@account-kit/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PermitV2 } from "~~/permits/permitV2";
import { removePermit } from "~~/permits/store";
import { PermitV2Tab, usePermitModalTab } from "~~/services/store/permitV2ModalStore";

export const PermitDeleteButton: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { address } = useAccount({ type: "LightAccount" });
  const { setTab } = usePermitModalTab();
  const onRemovePermit = () => {
    if (address == null) return;
    removePermit(address, permit.getHash());
    setTab(PermitV2Tab.Select);
  };

  return (
    <button className="btn btn-error aspect-square" onClick={onRemovePermit}>
      <TrashIcon />
    </button>
  );
};
