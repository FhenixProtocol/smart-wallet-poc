import { useAccount } from "@account-kit/react";
import { PermitV2 } from "~~/permits/permitV2";
import { setActivePermitHash } from "~~/permits/store";

export const PermitUseButton: React.FC<{ permit: PermitV2; className?: string }> = ({ permit, className }) => {
  const { address } = useAccount({ type: "LightAccount" });

  const onUsePermit = () => {
    if (address == null) return;
    setActivePermitHash(address, permit.getHash());
  };

  return (
    <button className={`btn btn-primary ${className}`} onClick={onUsePermit}>
      Use
    </button>
  );
};
