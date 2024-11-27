import React from "react";
import { PermitV2Tab, usePermitModalOpen, usePermitModalTab } from "~~/services/store/permitV2ModalStore";
import { PermitV2ActivePermitStatus } from "./StatusIndicator";
import { PermitV2ModalTabs } from "./Tabs";
import { PermitV2TabInstructions } from "./TabInstructions";
import { PermitV2ModalCreate } from "./Create/Create";
import { PermitV2ModalSelect } from "./Select/Select";

const PermitV2ModalImport = () => {
  return <div>PERMIT V2 MODAL IMPORT CONTENT</div>;
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

        <PermitV2ActivePermitStatus />

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
