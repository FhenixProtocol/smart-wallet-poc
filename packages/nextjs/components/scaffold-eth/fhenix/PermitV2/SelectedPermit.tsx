"use client";

import { FhenixPermitNftInfo, useFhenixPermitNft } from "fhenix-utils";
import { useAccount } from "wagmi";
import { NoPermits, UserPermits } from "./UserPermits";
import { PermitV2Card } from "./PermitV2Card";

export const SelectedPermit = () => {
  const { address } = useAccount();
  const selectedPermitNft = useFhenixPermitNft(address);

  if (selectedPermitNft == null) return <NoPermits />;

  return (
    <>
      <div className="px-4 pt-2 pb-4 -mb-4 w-min bg-base-300 rounded-t-2xl pointer-events-none">Selected</div>
      <PermitV2Card className="bg-neutral text-accent-content" permitNft={selectedPermitNft} />
    </>
  );
};

export const UserNonSelectedPermits: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick?: (nft: FhenixPermitNftInfo | undefined) => void;
}> = ({ onClick }) => {
  const { address } = useAccount();
  const selectedPermitNft = useFhenixPermitNft(address);

  return (
    <UserPermits
      onClick={onClick}
      selectedPermitNftId={selectedPermitNft?.id}
      excludePermitNftIds={selectedPermitNft == null ? undefined : [selectedPermitNft.id]}
    />
  );
};
