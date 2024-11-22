"use client";

import { useAccount, useChain } from "@account-kit/react";
import type { NextPage } from "next";
import { ConfidentialityRatioHeader } from "~~/components/ConfidentialityRatioHeader";
import { PortfolioTotalHeader } from "~~/components/PortfolioTotalHeader";
import { SortedTokens } from "~~/components/SortedTokens";
import { PermitV2 } from "~~/permits/permitV2";
import { AbstractSigner } from "~~/permits/types";

const CreatePermitV2Button = () => {
  const { chain } = useChain();
  const { account } = useAccount({ type: "LightAccount" });

  const createPermitV2 = async () => {
    if (account == null || chain == null) return;

    const abstractSigner: AbstractSigner = {
      getAddress: async () => account.address,
      // Should probably add the primaryType to this in the abstract signer to make it easier to interact with via viem
      signTypedData: (domain, types, value: Record<string, unknown>) =>
        account.signTypedData({ domain, types, primaryType: Object.keys(types)[0], message: value }),
    };

    const permit = await PermitV2.createAndSign(
      {
        type: "self",
        issuer: account.address,
        projects: ["FHERC20"],
      },
      chain.id.toString(),
      abstractSigner,
    );

    console.log({
      permit,
      permission: permit.getPermission(),
    });
  };
  return (
    <div className="btn" onClick={createPermitV2}>
      Create Permit V2
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className="flex flex-col max-w-[975px] gap-12 mx-auto p-8 pt-32 w-full">
      <CreatePermitV2Button />

      <div className="flex flex-col gap-6 justify-center items-center">
        <div className="flex flex-row flex-wrap flex-1 w-full gap-12 justify-between items-start">
          <PortfolioTotalHeader />
          <ConfidentialityRatioHeader />
        </div>
      </div>

      <div className="flex flex-col w-full text-start gap-4">
        <div className="text-2xl font-bold">Tokens</div>
        <div className="overflow-x-auto rounded-xl bg-base-300 bg-opacity-30">
          <table className="table">
            <thead>
              <tr className="border-b-base-content">
                <th>Token</th>
                <th>Balance</th>
                <th>Encrypted Ratio</th>
                <th>Portfolio %</th>
                <th>Price (24h)</th>
              </tr>
            </thead>
            <tbody>
              <SortedTokens />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
