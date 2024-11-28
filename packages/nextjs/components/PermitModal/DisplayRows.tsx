import { updatePermitName } from "~~/permits/store";
import { InputBase } from "../scaffold-eth";
import { PermitTypeIcon, PermitTypeText } from "./PermitTypeComponents";
import { PermitV2 } from "~~/permits/permitV2";
import { useAccount } from "@account-kit/react";
import truncateAddress from "~~/utils/truncate-address";
import { usePermitSatisfiesRequirements } from "~~/services/store/permitV2ModalStore";
import { formattedTimestamp, getTimestamp, timeUntilTimestamp } from "./utils";

const ValidityIndicator: React.FC<{ valid: boolean; validLabel?: string; invalidLabel?: string }> = ({
  valid,
  validLabel,
  invalidLabel,
}) => {
  return (
    <div className="flex flex-row gap-2 items-center justify-center text-sm">
      <div className={`w-3 h-3 rounded-full ${valid ? "bg-bg-surface-success" : "bg-bg-surface-error"}`} />
      {valid ? validLabel : invalidLabel}
    </div>
  );
};

export const PermitTypeDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">Purpose:</div>
      <div className="flex flex-row items-center justify-center gap-2 text-sm">
        <PermitTypeIcon type={permit.type} />
        <PermitTypeText type={permit.type} />
      </div>
    </div>
  );
};

export const PermitNameDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <div className="flex flex-row items-center justify-start gap-4">
      <div className="text-sm font-bold">Name: (editable)</div>
      <InputBase
        name="permit-name"
        value={permit.name}
        placeholder="Unnamed Permit"
        onChange={(value: string) => updatePermitName(address, permit.getHash(), value)}
        inputClassName="text-right"
      />
    </div>
  );
};

export const PermitRecipientDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.type === "self") return;

  return (
    <div className="flex flex-row items-center justify-start gap-4">
      <div className={`text-sm font-bold`}>Recipient:</div>
      <div className="text-sm">{truncateAddress(permit.recipient)}</div>
    </div>
  );
};

export const PermitExpirationDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const timestamp = getTimestamp();
  const expired = permit.expiration <= timestamp;

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">Expiration:</div>
      <ValidityIndicator
        valid={!expired}
        validLabel={`${formattedTimestamp(permit.expiration)} (in ${timeUntilTimestamp(permit.expiration)})`}
        invalidLabel={`Expired on ${formattedTimestamp(permit.expiration)}`}
      />
    </div>
  );
};

const AccessItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-sm px-2 border-primary border-2">{children}</div>;
};

const PermitContractsDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.contracts.length === 0) return;

  return (
    <div className="flex flex-row items-center justify-between flex-wrap">
      <div className={`text-sm font-bold ml-4 mr-4`}>Contracts:</div>
      {permit.contracts.map(contract => (
        <AccessItem key={contract}>{truncateAddress(contract)}</AccessItem>
      ))}
    </div>
  );
};

const PermitProjectsDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.projects.length === 0) return;

  return (
    <div className="flex flex-row items-center justify-between flex-wrap">
      <div className={`text-sm font-bold ml-4 mr-4`}>Projects:</div>
      {permit.projects.map(project => (
        <AccessItem key={project}>{project}</AccessItem>
      ))}
    </div>
  );
};

export const PermitAccessDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const satisfies = usePermitSatisfiesRequirements(permit);

  return (
    <div className="flex flex-col w-full">
      <div className={`text-sm font-bold`}>Access:</div>

      {/* Access requirements not satisfied */}
      {!satisfies && <span className="italic text-sm text-error"> ! dApp{"'"}s access requirements not met !</span>}

      <PermitContractsDisplayRow permit={permit} />
      <PermitProjectsDisplayRow permit={permit} />
    </div>
  );
};

const SignatureValidityIndicator: React.FC<{ valid: boolean }> = ({ valid }) => {
  return <ValidityIndicator valid={valid} validLabel="Valid" invalidLabel="Missing" />;
};

export const PermitIssuerSignatureDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">{permit.type === "recipient" && "Issuer "}Signature:</div>
      <SignatureValidityIndicator valid={permit.issuerSignature !== "0x"} />
    </div>
  );
};

export const PermitRecipientSignatureDisplayRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.type !== "recipient") return;

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">Recipient Signature:</div>
      <SignatureValidityIndicator valid={permit.recipientSignature !== "0x"} />
    </div>
  );
};
