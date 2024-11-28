import { useAccount } from "@account-kit/react";
import { useFhenixActivePermitHash } from "~~/permits/hooks";
import { PermitV2 } from "~~/permits/permitV2";
import { setActivePermitHash } from "~~/permits/store";

export const PermitUseButton: React.FC<{ permit: PermitV2; className?: string }> = ({ permit, className }) => {
  const { address } = useAccount({ type: "LightAccount" });
  const activePermitHash = useFhenixActivePermitHash();
  const hash = permit.getHash();

  const onUsePermit = () => {
    if (hash == activePermitHash) return;
    if (address == null) return;
    setActivePermitHash(address, permit.getHash());
  };

  return (
    <button className={`btn btn-primary ${className}`} disabled={hash == activePermitHash} onClick={onUsePermit}>
      {hash == activePermitHash ? "Already Active Permit" : "Use"}
    </button>
  );
};
