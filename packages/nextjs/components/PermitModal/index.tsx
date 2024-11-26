import React, { useState } from "react";
import {
  PermitV2CreateType,
  PermitV2Tab,
  usePermitCreateOptions,
  usePermitModalOpen,
  usePermitModalTab,
} from "~~/services/store/permitV2ModalStore";
import { AddressInput, InputBase } from "../scaffold-eth";
import { getAddress, isAddress } from "viem";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PermitV2TabOptions = [PermitV2Tab.Create, PermitV2Tab.Import, PermitV2Tab.Select];
const PermitV2ModalTabs = () => {
  const { tab, setTab } = usePermitModalTab();
  return (
    <div className="flex flex-row gap-2 items-center justify-start">
      {PermitV2TabOptions.map((option, i) => (
        <React.Fragment key={option}>
          <button
            className={`btn btn-sm ${tab === option ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(option)}
          >
            {option}
          </button>
          {i < PermitV2TabOptions.length - 1 && "/"}
        </React.Fragment>
      ))}
    </div>
  );
};

const PermitV2TabInstructions = () => {
  const { tab } = usePermitModalTab();

  return (
    <div className="text-sm">
      {tab === PermitV2Tab.Create && (
        <>
          Select the type of Permit you wish to create and select your options.
          <br />
          <span className="italic">- If you are connected with an EOA, you will be prompted for a signature.</span>
          <br />
          <span className="italic">- The created Permit will be set as your default.</span>
        </>
      )}
      {tab === PermitV2Tab.Import && (
        <>
          Import a fully-formed Permit and set it as your default. Imported Permits cannot be edited.
          <br />
          <span className="italic">
            - You may import either your own Permit, or a Permit that has been shared with you.
          </span>
          <br />
          <span className="italic">
            - If you are connected with an EOA, you may be prompted for a signature if necessary.
          </span>
        </>
      )}
      {tab === PermitV2Tab.Select && <>Select an existing Permit from your list of available Permits below:</>}
    </div>
  );
};

const DeadlineOptions = [
  {
    label: "24h",
    offset: 24 * 60 * 60,
  },
  {
    label: "48h",
    offset: 48 * 60 * 60,
  },
  {
    label: "1w",
    offset: 7 * 24 * 60 * 60,
  },
  {
    label: "1m",
    offset: 30 * 24 * 60 * 60,
  },
  {
    label: "Inf",
    offset: 365 * 24 * 60 * 60,
  },
];
const PermitV2ModalCreate = () => {
  const {
    type,
    deadlineOffset,
    contracts,
    projects,
    setType,
    setDeadlineOffset,
    addContract,
    removeContract,
    addProject,
    removeProject,
    reset,
  } = usePermitCreateOptions();

  const [addingRecipientAddress, setAddingRecipientAddress] = useState<string>("");
  const addingRecipientAddressValid = isAddress(addingRecipientAddress);

  const [addingContractAddress, setAddingContractAddress] = useState<string>("");
  const addingContractAddressValid =
    isAddress(addingContractAddress) && !contracts.includes(getAddress(addingContractAddress));

  const [addingProject, setAddingProject] = useState<string>("");
  const addingProjectValid = !projects.includes(addingProject);

  return (
    <>
      {/* Type */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Type:</div>
        <button
          className={`btn btn-sm ${type === PermitV2CreateType.Using ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setType(PermitV2CreateType.Using)}
        >
          For Using
        </button>
        /
        <button
          className={`btn btn-sm ${type === PermitV2CreateType.Sharing ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setType(PermitV2CreateType.Sharing)}
        >
          For Sharing
        </button>
      </div>

      {/* (Sharing) Recipient */}
      {type === PermitV2CreateType.Sharing && (
        <div className="flex flex-row items-center justify-start gap-4">
          <div className="text-sm font-bold">Recipient:</div>
          <AddressInput
            name="add-recipient"
            value={addingRecipientAddress}
            placeholder="recipient address"
            onChange={(value: any) => setAddingRecipientAddress(value)}
            useENS={false}
            useBlo={false}
          />
          {/* TODO: Add validity indicator */}
        </div>
      )}

      {/* Deadline */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Deadline:</div>
        <div className="flex flex-row gap-2 items-center">
          {DeadlineOptions.map((option, index) => (
            <React.Fragment key={index}>
              <button
                className={`btn btn-sm ${option.offset === deadlineOffset ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setDeadlineOffset(option.offset)}
              >
                {option.label}
              </button>
              {index < DeadlineOptions.length - 1 && "/"}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Access */}
      <div className="text-sm font-bold">
        Access
        <span className="italic font-normal">
          {" "}
          - grant access to individual contracts or full projects, defaults to this dApp's requirements.
        </span>
      </div>

      {/* Contracts */}
      <div className="flex flex-row items-center justify-start">
        <div className="text-sm font-bold ml-4 mr-4">Contracts:</div>
        <AddressInput
          name="add-contract"
          value={addingContractAddress}
          placeholder="add contract"
          onChange={(value: any) => setAddingContractAddress(value)}
          useENS={false}
          useBlo={false}
        />
        <button
          className={`btn btn-sm btn-secondary ${addingContractAddressValid ? "" : "btn-disabled"}`}
          onClick={() => {
            if (!addingContractAddressValid) return;
            addContract(addingContractAddress);
            setAddingContractAddress("");
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Projects */}
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-row items-center justify-start">
          <div className="text-sm font-bold ml-4 mr-4">Projects:</div>
          <InputBase
            name="project-idt"
            value={addingProject}
            placeholder="project id"
            onChange={(value: any) => setAddingProject(value)}
          />
          <div
            className={`btn btn-secondary btn-sm ${addingProjectValid ? "" : "btn-disabled"}`}
            onClick={() => {
              if (!addingProjectValid) return;
              addProject(addingProject);
              setAddingProject("");
            }}
          >
            <PlusIcon className="w-4 h-4" />
          </div>
        </div>
        {projects.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap ml-8">
            {projects.map(project => (
              <button key={project} className="btn btn-sm btn-primary" onClick={() => removeProject(project)}>
                {project} <XMarkIcon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <button className="btn btn-error flex-[1]" onClick={reset}>
          Reset
        </button>
        <button className="btn btn-primary flex-[3]">Create</button>
      </div>
    </>
  );
};
const PermitV2ModalImport = () => {
  return <div>PERMIT V2 MODAL IMPORT CONTENT</div>;
};
const PermitV2ModalSelect = () => {
  return <div>PERMIT V2 MODAL SELECT CONTENT</div>;
};

const PermitV2Content = () => {
  const { tab } = usePermitModalTab();

  switch (tab) {
    case PermitV2Tab.Create:
      return <PermitV2ModalCreate />;
    case PermitV2Tab.Import:
      return <PermitV2ModalImport />;
    case PermitV2Tab.Select:
      return <PermitV2ModalSelect />;
  }
};

export const PermitV2Modal = () => {
  const { open, setOpen } = usePermitModalOpen();

  return (
    <dialog className="modal" open={open}>
      <div className="modal-box flex flex-col gap-4">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setOpen(false)}>
          ✕
        </button>
        <h3 className="font-bold text-lg">Fhenix Permits</h3>
        <div className="text-sm">
          Fhenix Permits grant private access to your encrypted on-chain data. Read more about Permits{" "}
          <button className="btn btn-sm btn-link !shadow-none p-0">in the Docs</button>.
        </div>

        {/* TODO: Status row, Green - permit exists and valid, Yellow - expired, Red - doesn't exist */}

        <div className="divider -my-1" />

        <PermitV2ModalTabs />
        <PermitV2TabInstructions />

        <div className="divider -my-1" />

        <PermitV2Content />
      </div>
      <div className="modal-backdrop bg-slate-600 bg-opacity-40" onClick={() => setOpen(false)} />
    </dialog>
  );
};
