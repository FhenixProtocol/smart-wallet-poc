import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { FhenixPermitNftInfo } from "fhenix-utils";
import { HTMLAttributes } from "react";

const truncateAddress = (address: string) => `${address.slice(0, 5)}...${address.slice(-4)}`;
const creditcardifyAddress = (address: string) => `${address.slice(0, 4)} **** **** ${address.slice(-4)}`;

const formatDate = (timestamp: bigint) => {
  const date = new Date(Number(timestamp * 1000n));
  return date.toLocaleDateString();
};

export const PermitV2Card: React.FC<{
  permitNft: FhenixPermitNftInfo;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}> = ({ permitNft, className }) => {
  return (
    <div
      className={`card bg-base-100 w-96 shadow-xl rounded-box flex flex-col items-start relative overflow-hidden px-4 py-2 ${className}`}
    >
      <svg
        className={`absolute inset-0 w-full h-full  ${permitNft.revoked ? "opacity-50 z-20" : "opacity-50 z-0"}`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`hatch-${Number(permitNft.id)}`}
            patternUnits="userSpaceOnUse"
            width="9.5"
            height="9.5"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y="0"
              x2="0"
              y2="9.5"
              className={`${permitNft.revoked ? "stroke-red-600" : "stroke-primary"} stroke-1`}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hatch-${Number(permitNft.id)})`} />
      </svg>

      <div className="z-10 flex flex-col gap-2 w-full">
        {permitNft.revoked && (
          <div className="text-lg font-bold absolute text-red-600 bottom-0 right-2 z-20">REVOKED</div>
        )}

        <div className="card-title flex-row items-start w-full justify-between">
          <span>{permitNft.name}</span>
          <code className="italic text-slate-400 font-normal">
            <span className="text-xs">permitV2 #</span>
            {Number(permitNft.id)}
          </code>
        </div>
        <div className="text-md flex flex-row w-full gap-6 items-center justify-start tracking-widest">
          <code className="text-lg drop-shadow">{creditcardifyAddress(permitNft.issuer)}</code>
        </div>
        <div className="flex flex-row w-full gap-2 items-center justify-between">
          <div className="flex flex-row gap-2 items-center justify-center">
            <span>
              <b className="text-sm">Exp</b>:
            </span>
            <code className="text-sm">{formatDate(permitNft.expiresAt)}</code>
            {/* TODO Update to depend on expiration date relative to current date */}
            <span>
              {permitNft.revoked ? (
                <XCircleIcon className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              )}
            </span>
          </div>
          <span>
            <b>Holder</b>: <code className="text-sm">{truncateAddress(permitNft.holder)}</code>
          </span>
        </div>
        {permitNft.fineGrained && (
          <div>
            <h4 className="font-semibold mb-2">Contracts:</h4>
            <div className="flex flex-wrap gap-2">
              {permitNft.contracts.map((contract, index) => (
                <div className="badge badge-ghost" key={index}>
                  {truncateAddress(contract)}
                </div>
              ))}
              {permitNft.contracts.length === 0 && "None"}
            </div>
          </div>
        )}
        {!permitNft.fineGrained && (
          <div>
            <h4 className="font-semibold mb-2">Projects:</h4>
            <div className="flex flex-wrap gap-2">
              {permitNft.projects.map((project, index) => (
                <div className="badge badge-ghost" key={index}>
                  {project}
                </div>
              ))}
              {permitNft.projects.length === 0 && "None"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
