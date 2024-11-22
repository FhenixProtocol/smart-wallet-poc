"use client";

import { BeakerIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth";
import { IntegerInput } from "../scaffold-eth";
import { useAccount } from "wagmi";
import { useFhenixScaffoldReadContract } from "~~/hooks/fhenix/useFhenixScaffoldReadContract";
import { useFhenixScaffoldWriteContract } from "~~/hooks/fhenix/useFhenixScaffoldWriteContract";
import { Encryptable } from "fhenix-utils/encryption/input";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useFhenixReadContracts } from "~~/hooks/fhenix/useFhenixReadContracts";

const CONTRACT_NAME = "Counter";

const CounterForm = () => {
  const [newValue, setNewValue] = useState<string | bigint>(0n);
  const { chain: connectedChain, address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedCounter } = useDeployedContractInfo("Counter");

  const { data: multiData } = useFhenixReadContracts(
    deployedCounter == null || address == null
      ? {}
      : {
          contracts: [
            {
              abi: deployedCounter.abi,
              address: deployedCounter.address,
              functionName: "getCounter",
              args: [address],
            },
            {
              abi: deployedCounter.abi,
              address: deployedCounter.address,
              functionName: "getCounterPermitSealed",
              args: ["populate-fhenix-permission"],
            },
          ],
        },
  );

  const { data: counterValue, permitted: counterPermitted } = useFhenixScaffoldReadContract({
    contractName: CONTRACT_NAME,
    functionName: "getCounterPermitSealed",
    watch: true,
    args: ["populate-fhenix-permission"],
  });

  const { writeContractAsync: writeCounter, isMining: isMiningAddValue } = useFhenixScaffoldWriteContract("Counter");

  const handleWrite = async () => {
    const value = Number(newValue);
    if (value === 0) {
      notification.warning("The value should not be 0");
      return;
    }

    try {
      await writeCounter({
        functionName: "add",
        args: [Encryptable.uint32(newValue)],
      });
    } catch (e: any) {
      console.error("⚡️ ~ file: CounterForm.tsx:handleWrite ~ error", e);
    }
  };

  const writeDisabled = !connectedChain || connectedChain?.id !== targetNetwork.id;

  return (
    <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
      <div className="flex flex-col justify-center items-center">
        <BeakerIcon className="h-8 w-8 fill-secondary" />
        <p>Counter demo</p>
      </div>

      <div className="flex flex-row justify-center items-center gap-4">
        <div>Count:</div>
        {counterPermitted && <div className="p-2">{counterValue != null ? Number(counterValue) : "..."}</div>}
        {!counterPermitted && (
          <label className="btn btn-sm btn-primary" htmlFor="fhenix-permit-dropdown">
            <CreditCardIcon className="h-4 w-4" />
          </label>
        )}
      </div>

      <div className="py-5 space-y-3 first:pt-0 last:pb-1">
        <div className="flex gap-3 flex-col">
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">add to counter</span>
              <span className="block text-xs font-extralight leading-none">num</span>
            </div>
            <IntegerInput
              value={newValue}
              onChange={setNewValue}
              placeholder="number"
              disableMultiplyBy1e18={true}
              disabled={isMiningAddValue}
            />
          </div>

          <div className="flex justify-between gap-2">
            <div
              className={`flex ${
                writeDisabled &&
                "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
              }`}
              data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
            >
              <button
                className="btn btn-secondary btn-sm"
                disabled={writeDisabled || isMiningAddValue}
                onClick={handleWrite}
              >
                {isMiningAddValue && <span className="loading loading-spinner loading-xs" />}
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterForm;
