import { useAccount } from "@account-kit/react";
import React from "react";
import { useState } from "react";
import { PermitV2 } from "~~/permits/permitV2";
import { PermitV2Options } from "~~/permits/types";
import { usePermitModalImporting, usePermitModalUpdateImportingPermitName } from "~~/services/store/permitV2ModalStore";
import { TextArea } from "../scaffold-eth/Input/TextArea";
import { stringToJSON } from "./utils";
import { PermitV2ParamsValidator } from "~~/permits/permitV2.z";
import {
  PermitTypeDisplayRow,
  PermitNameEditableDisplayRow,
  PermitRecipientDisplayRow,
  PermitExpirationDisplayRow,
  PermitAccessDisplayRow,
  ValidityIndicator,
} from "./DisplayRows";
import { PermitImportButton } from "./PermitImportButton";

const PermitV2ModalImportEntry = () => {
  const { address } = useAccount({ type: "LightAccount" });
  const { setImportingPermit } = usePermitModalImporting();
  const [imported, setImported] = useState("");

  const importPermitData = async (value: string) => {
    // TODO: validate permit data
    // TODO: Validation: cannot import permit with signingKey
    // TODO: Validation: cannot import permit with signature unless recipient
    setImported(value);

    const { success: jsonParseSuccess, data: jsonParseData, error: jsonParseError } = stringToJSON.safeParse(value);
    if (!jsonParseSuccess) {
      console.log("invalid json value", jsonParseError);
      return;
    }

    // TODO: if type is sharing | recipient, set the type based on whether the user's account matches the issuer (sharing) or recipient (recipient)
    // If it doesn't match either, indicate as an error
    const { success, data: parsed, error } = PermitV2ParamsValidator.safeParse(jsonParseData);
    if (!success) {
      console.log("invalid permit", error);
      return;
    }
    if (parsed.type !== "self") {
      if (parsed.issuer === address) parsed.type = "sharing";
      else if (parsed.recipient === address) parsed.type = "recipient";
      else {
        console.log(`invalid permit, connected address ${address} is not issuer or recipient`);
      }
    }
    const permit = await PermitV2.create(parsed as PermitV2Options);
    setImportingPermit(permit);
  };

  return (
    <>
      <div className="text-sm font-bold">Paste the permit data below to import it:</div>
      <div className="text-sm italic">
        Note: mismatched permit data will invalidate the signature and will not fetch on-chain data successfully.
      </div>
      <TextArea
        name="permit-import"
        value={imported}
        placeholder="Paste Permit Data Here"
        onChange={importPermitData}
      />
    </>
  );
};

const PermitImportClearButton = () => {
  const { setImportingPermit } = usePermitModalImporting();

  return (
    <button className="btn btn-secondary" onClick={() => setImportingPermit(undefined)}>
      Clear
    </button>
  );
};

const NameRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const onUpdateName = usePermitModalUpdateImportingPermitName();
  return <PermitNameEditableDisplayRow name={permit.name} onUpdateName={onUpdateName} />;
};

export const IssuerSignatureRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  if (permit.type !== "recipient") return;

  const validity = permit.issuerSignature !== "0x" ? "success" : "error";

  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="text-sm font-bold">{permit.type === "recipient" && "Issuer "}Signature:</div>
      <ValidityIndicator validity={validity} validLabel="Signed by Issuer" invalidLabel="Not Signed By Issuer" />
    </div>
  );
};

const PermitV2ModalImportConfirm = () => {
  const { importingPermit: permit } = usePermitModalImporting();

  if (permit == null) {
    return <div>PERMIT NOT FOUND</div>;
  }

  return (
    <>
      <div className="text-sm italic">Confirm the imported Permit data:</div>

      <PermitTypeDisplayRow permit={permit} />
      <NameRow permit={permit} />
      <PermitRecipientDisplayRow permit={permit} />
      <PermitExpirationDisplayRow permit={permit} />
      <PermitAccessDisplayRow permit={permit} />
      <IssuerSignatureRow permit={permit} />

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <PermitImportClearButton />
        <PermitImportButton permit={permit} className="flex-[1]" />
      </div>
    </>
  );
};

export const PermitV2ModalImport = () => {
  const { importingPermit } = usePermitModalImporting();

  if (importingPermit == null) return <PermitV2ModalImportEntry />;
  return <PermitV2ModalImportConfirm />;
};
