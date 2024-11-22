import { useRef } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useFhenixPermitNft, useSetFhenixPermitNft } from "fhenix-utils";
import Link from "next/link";
import { UserPermits } from "./UserPermits";

const PermitSelectedIndicator = () => {
  const { address } = useAccount();
  const selectedPermitNft = useFhenixPermitNft(address);

  if (address == null || selectedPermitNft != null) return null;
  return <span className="indicator-item badge badge-xs bg-red-600 mt-[2px] mr-[2px] aspect-square"></span>;
};

const SelectableUserPermits = () => {
  const { address } = useAccount();
  const setFhenixPermitNft = useSetFhenixPermitNft();
  const selectedPermitNft = useFhenixPermitNft(address);

  return (
    <ul className="menu p-2 -m-1 rounded-box gap-2 bg-base-300 bg-opacity-30 shadow-inner">
      <UserPermits selectedPermitNftId={selectedPermitNft?.id} onClick={nft => setFhenixPermitNft(address, nft)} />
    </ul>
  );
};

export const FhenixPermitV2Dropdown = () => {
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary
          tabIndex={0}
          className="btn btn-secondary indicator btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto rounded-full"
        >
          <CreditCardIcon className="h-6 w-4 ml-2" />
          <PermitSelectedIndicator />
        </summary>
        <div
          tabIndex={0}
          className="dropdown-content card card-compact z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1 min-w-[300px]"
        >
          <div className="card-body">
            <h3 className="card-title">Fhenix Permit V2!</h3>
            <p>PermitV2s are NFTs that are used to verify your identity, select or create a permit below:</p>
          </div>
          <ul className="menu p-0 mt-2 rounded-box gap-1">
            <h2 className="menu-title py-0">Permits:</h2>

            <SelectableUserPermits />

            <h2 className="menu-title pb-0">New:</h2>
            <li>
              <Link href="/permit" className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
                Edit Permits
              </Link>
            </li>
            <li>
              <Link href="/permit/create" className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
                Create a new Permit V2
              </Link>
            </li>
          </ul>
        </div>
      </details>
    </>
  );
};
