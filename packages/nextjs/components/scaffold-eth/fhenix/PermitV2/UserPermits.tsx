"use client";

import { FhenixPermitNftInfo } from "fhenix-utils";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { PermitV2Card } from "./PermitV2Card";

const UserPermit: React.FC<{
  index: number;
  selectedPermitNftId: bigint | undefined;
  excludePermitNftIds?: bigint[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick?: (nft: FhenixPermitNftInfo | undefined) => void;
}> = ({ index, selectedPermitNftId, excludePermitNftIds, onClick }) => {
  const { address } = useAccount();

  const { data: permitId } = useScaffoldReadContract({
    contractName: "PermitV2",
    functionName: "tokenOfOwnerByIndex",
    args: [address as `0x${string}` | undefined, BigInt(index)],
  });

  const { data: permitNft } = useScaffoldReadContract({
    contractName: "PermitV2",
    functionName: "getPermitInfo",
    args: [permitId],
  });

  if (permitNft == null) return null;
  if (excludePermitNftIds?.includes(permitNft.id)) return;

  const selected = selectedPermitNftId === permitId;

  return (
    <>
      {selected && (
        <div className="px-4 pt-2 pb-4 -mb-4 w-min bg-base-300 rounded-t-2xl pointer-events-none">Selected</div>
      )}
      <li onClick={() => onClick?.(permitNft as FhenixPermitNftInfo)}>
        <PermitV2Card permitNft={permitNft as FhenixPermitNftInfo} className={selected ? "active" : ""} />
      </li>
    </>
  );
};

export const NoPermits = () => {
  return (
    <div className="card w-96 h-24 flex flex-col items-center justify-center relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-50 z-0"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="hatch-empty"
            patternUnits="userSpaceOnUse"
            width="9.5"
            height="9.5"
            patternTransform="rotate(45)"
          >
            <line x1="0" y="0" x2="0" y2="9.5" className="stroke-slate-500 stroke-1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hatch-empty)" />
      </svg>
      <span className="italic text-sm">NONE</span>
    </div>
  );
};

export const UserPermits: React.FC<{
  selectedPermitNftId?: bigint | undefined;
  excludePermitNftIds?: bigint[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick?: (nft: FhenixPermitNftInfo | undefined) => void;
}> = ({ selectedPermitNftId, excludePermitNftIds, onClick }) => {
  const { address } = useAccount();

  const { data: balance } = useScaffoldReadContract({
    contractName: "PermitV2",
    functionName: "balanceOf",
    args: [address as `0x${string}` | undefined],
  });

  if (balance == null) return <p>Loading Permits....</p>;

  return (
    <>
      {Array.from({ length: Number(balance) }, (_, index) => (
        <UserPermit
          key={index}
          index={index}
          selectedPermitNftId={selectedPermitNftId}
          excludePermitNftIds={excludePermitNftIds}
          onClick={onClick}
        />
      ))}
      {balance === 0n && <NoPermits />}
    </>
  );
};
