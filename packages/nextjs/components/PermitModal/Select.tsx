import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useFhenixActivePermitHash, useFhenixAllPermits } from "~~/permits/hooks";
import { PermitV2 } from "~~/permits/permitV2";
import { usePermitModalFocusedPermitHash, usePermitSatisfiesRequirements } from "~~/services/store/permitV2ModalStore";
import truncateAddress from "~~/utils/truncate-address";
import { PermitUseButton } from "./PermitUseButton";
import { PermitOpenButton } from "./PermitOpenButton";
import { getTimestamp, timeUntilTimestamp } from "./utils";

const PermitRow: React.FC<{ permit: PermitV2; children?: React.ReactNode; className?: string }> = ({
  permit,
  children,
  className,
}) => {
  const timestamp = getTimestamp();
  const satisfies = usePermitSatisfiesRequirements(permit);

  return (
    <tr className={`${className}`}>
      <td className="p-2 text-sm">
        {permit.name != null && permit.name.length > 0 ? permit.name : "Unnamed Permit"}
        <br />
        <span className="text-xs font-bold">{truncateAddress(permit.issuer)}</span>
      </td>
      <td className="p-2 text-sm place-items-center">
        {permit.type === "self" && <ArrowDownTrayIcon className="w-4 h-4" />}
        {permit.type === "sharing" && <ArrowUpTrayIcon className="w-4 h-4 rotate-90" />}
        {permit.type === "recipient" && <ArrowDownTrayIcon className="w-4 h-4 rotate-90" />}
      </td>
      <td className="p-2 text-sm place-items-center text-center">
        {permit.expiration > timestamp && timeUntilTimestamp(permit.expiration)}
        {permit.expiration <= timestamp && <div className="w-[12px] h-[12px] rounded-full bg-bg-surface-error" />}
      </td>
      <td className="p-2 text-sm place-items-center">
        <div
          className={`w-[12px] h-[12px] rounded-full ${satisfies ? "bg-bg-surface-success" : "bg-bg-surface-error"}`}
        />
      </td>
      <td className="p-2">
        <div className="flex flex-row items-center justify-end gap-1">{children}</div>
      </td>
    </tr>
  );
};

const SelectedPermitRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  const { setFocusedPermitHash } = usePermitModalFocusedPermitHash();

  return (
    <PermitRow permit={permit} className="bg-base-200">
      <button className="btn btn-sm btn-secondary btn-ghost" onClick={() => setFocusedPermitHash(permit.getHash())}>
        Open
      </button>
    </PermitRow>
  );
};

const SelectPermitRow: React.FC<{ permit: PermitV2 }> = ({ permit }) => {
  return (
    <PermitRow permit={permit}>
      <PermitOpenButton permit={permit} />
      <PermitUseButton permit={permit} className="btn-sm" />
    </PermitRow>
  );
};

export const PermitV2ModalSelect = () => {
  // List of permits
  // If active permit selected, highlight at top
  // Each permit row has buttons <expand, use>
  // Expand opens sub page with action buttons <back, use>

  const permits = useFhenixAllPermits();
  const activePermitHash = useFhenixActivePermitHash();

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th className="p-2">Name/Issuer</th>
            <th className="p-2 text-center">Type</th>
            <th className="p-2 text-center">Exp.</th>
            <th className="p-2 text-center">Access</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* <div className="flex w-full flex-col items-start justify-start">
            <div className="text-sm font-bold">Selected:</div> */}

          <div className="text-xs font-bold mt-4">Selected:</div>
          {activePermitHash != null && permits[activePermitHash] != null && (
            <SelectedPermitRow permit={permits[activePermitHash]} />
          )}
          {/* </div>
          <div className="flex flex-col w-full gap-0.5">
            <div className="text-sm font-bold">Available:</div> */}

          <div className="text-xs font-bold mt-4">Available:</div>
          {Object.entries(permits)
            .filter(([hash]) => hash !== activePermitHash)
            .map(([hash, permit]) => {
              return <SelectPermitRow key={hash} permit={permit} />;
            })}
          {/* </div> */}
        </tbody>
      </table>
    </>
  );
};
