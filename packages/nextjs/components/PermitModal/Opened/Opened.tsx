import { useAccount } from "@account-kit/react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { InputBase } from "~~/components/scaffold-eth";
import { useFhenixPermitWithHash } from "~~/permits/hooks";
import { PermitV2 } from "~~/permits/permitV2";
import { updatePermitName } from "~~/permits/store";
import { usePermitModalFocusedPermitHash, usePermitSatisfiesRequirements } from "~~/services/store/permitV2ModalStore";
import truncateAddress from "~~/utils/truncate-address";

const PurposeIcon: React.FC<{ type: PermitV2["type"] }> = ({ type }) => {
  switch (type) {
    case "self":
      return <ArrowDownTrayIcon className="w-4 h-4" />;
    case "sharing":
      return <ArrowUpTrayIcon className="w-4 h-4 rotate-90" />;
    case "recipient":
      return <ArrowDownTrayIcon className="w-4 h-4 rotate-90" />;
  }
};

export const PermitV2ModalOpened = () => {
  const { address } = useAccount({ type: "LightAccount" });
  const { focusedPermitHash } = usePermitModalFocusedPermitHash();
  const permit = useFhenixPermitWithHash(focusedPermitHash);
  const satisfies = usePermitSatisfiesRequirements(permit);
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyToClipboard] = useCopyToClipboard();

  if (permit == null) {
    return <div>PERMIT NOT FOUND</div>;
  }

  const copyPermitData = () => {
    setCopied(true);
    copyToClipboard(permit.export());
  };

  const { type, name, recipient, expiration, projects, contracts, issuerSignature, recipientSignature } = permit;

  return (
    <>
      {/* Type */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="text-sm font-bold">Purpose:</div>
        <div className="flex flex-row items-center justify-center gap-2 text-sm">
          <PurposeIcon type={type} />
          {type === "self" && "Self Usage"}
          {type === "sharing" && "To Share"}
          {type === "recipient" && "Shared with You"}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Name: (editable)</div>
        <InputBase
          name="permit-name"
          value={name}
          placeholder="Unnamed Permit"
          onChange={(value: string) => updatePermitName(address, permit.getHash(), value)}
          inputClassName="text-right"
        />
      </div>

      {/* (Sharing) Recipient */}
      {type === "sharing" && (
        <div className="flex flex-row items-center justify-start gap-4">
          <div className={`text-sm font-bold`}>Recipient:</div>
          <div className="text-sm">{truncateAddress(recipient)}</div>
        </div>
      )}

      {/* Expiration */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="text-sm font-bold">Expires in:</div>
        <div className="text-sm">TODO</div>
      </div>

      {/* Access */}
      <div className="flex flex-col w-full">
        <div className={`text-sm font-bold`}>Access:</div>

        {/* Access requirements not satisfied */}
        {!satisfies && <span className="italic text-sm text-error"> ! dApp{"'"}s access requirements not met !</span>}

        {/* Contracts */}
        {contracts.length > 0 && (
          <div className="flex flex-row items-center justify-between flex-wrap">
            <div className={`text-sm font-bold ml-4 mr-4`}>Contracts:</div>
            {contracts.map(contract => (
              <div key={contract} className="text-sm px-2 border-primary border-2">
                {truncateAddress(contract)}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="flex flex-row items-center justify-between">
            <div className={`text-sm font-bold ml-4 mr-4`}>Projects:</div>
            {projects.map(project => (
              <button key={project} className="text-sm px-2 border-primary border-2">
                {project}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Issuer Signature */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="text-sm font-bold">{type === "recipient" && "Issuer "}Signature:</div>
        <div className="flex flex-row gap-2 items-center justify-center text-sm">
          <div
            className={`w-3 h-3 rounded-full ${
              issuerSignature !== "0x" ? "bg-bg-surface-success" : "bg-bg-surface-error"
            }`}
          />
          {issuerSignature !== "0x" ? "Valid" : "Missing"}
        </div>
      </div>

      {/* Recipient Signature */}
      {type === "recipient" && (
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold">Recipient Signature:</div>
          <div className="flex flex-row gap-2 items-center justify-center text-sm">
            <div
              className={`w-3 h-3 rounded-full ${
                recipientSignature !== "0x" ? "bg-bg-surface-success" : "bg-bg-surface-error"
              }`}
            />
            {issuerSignature !== "0x" ? "Valid" : "Missing"}
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <button className="btn btn-secondary" onClick={copyPermitData}>
          {copied ? "Copied " : "Copy Permit Data "}
          {copied ? (
            <ClipboardDocumentCheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardDocumentListIcon className="w-4 h-4" />
          )}
        </button>
        <button className="btn btn-primary flex-[1]">Use</button>
      </div>
    </>
  );
};
