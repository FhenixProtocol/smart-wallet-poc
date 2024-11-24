"use client";

import { useAccount, useChain, useSendUserOperation, useSmartAccountClient } from "@account-kit/react";
import type { NextPage } from "next";
import { encodeFunctionData } from "viem";
import { ConfidentialityRatioHeader } from "~~/components/ConfidentialityRatioHeader";
import { PortfolioTotalHeader } from "~~/components/PortfolioTotalHeader";
import { SortedTokens } from "~~/components/SortedTokens";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { PermitV2 } from "~~/permits/permitV2";
import { setActivePermitHash, setPermit } from "~~/permits/store";
import { AbstractSigner } from "~~/permits/types";

// If the lightAccount isn't deployed, send 0.01 ETH to itself to force a deployment
const DeployLightAccountButton = () => {
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const { data: usdcContract } = useDeployedContractInfo("USDC");

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash, request }) => {
      console.log("Success deploying smart wallet", hash, request);
    },
    onError: error => {
      console.log("Error deploying smart wallet", error);
    },
  });

  const mintUsdc = () => {
    if (client == null) return;
    if (usdcContract == null) return;
    sendUserOperation({
      uo: {
        target: usdcContract.address,
        data: encodeFunctionData({
          abi: usdcContract.abi,
          functionName: "mint",
          args: [client.getAddress(), 10_000_000n],
        }),
      },
    });
  };

  return (
    <div className="btn" onClick={() => mintUsdc()}>
      {isSendingUserOperation ? "Deploying..." : "Force Smart Wallet Deployment"}
    </div>
  );
};

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

    setPermit(account.address, permit);
    setActivePermitHash(account.address, permit.getHash());

    console.log("Created and Stored PermitV2", {
      permit,
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
      <DeployLightAccountButton />
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
