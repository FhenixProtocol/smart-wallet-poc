"use client";

import { useAccount } from "@account-kit/react";
import { useFhenixPermit } from "~~/permits/hooks";

export const ConnectedAccountAndPermitHeader = () => {
  const { address } = useAccount({ type: "LightAccount" });
  const permit = useFhenixPermit();
  const isOverriddenByPermit = permit != null && permit.issuer !== address;
  return (
    <div className="flex flex-col mb-24">
      <div className={`flex flex-row gap-4 ${isOverriddenByPermit ? "opacity-50" : "font-bold"}`}>
        <div>Account:</div>
        <div>{address ?? "Not Connected"}</div>
      </div>
      {isOverriddenByPermit && (
        <div className="flex flex-row gap-4 font-bold">
          <div>Permit Issuer:</div>
          <div>{permit.issuer}</div>
        </div>
      )}
    </div>
  );
};
