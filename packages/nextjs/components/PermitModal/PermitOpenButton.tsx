import { PermitV2 } from "~~/permits/permitV2";
import { usePermitModalFocusedPermitHash } from "~~/services/store/permitV2ModalStore";

export const PermitOpenButton: React.FC<{ permit: PermitV2; className?: string }> = ({ permit, className }) => {
  const { setFocusedPermitHash } = usePermitModalFocusedPermitHash();

  const onOpenPermit = () => {
    setFocusedPermitHash(permit.getHash());
  };

  return (
    <button className={`btn btn-sm btn-secondary btn-ghost ${className}`} onClick={onOpenPermit}>
      Open
    </button>
  );
};
