"use client";

import { useAccount, useAuthModal, useSendUserOperation, useSmartAccountClient } from "@account-kit/react";
import type { NextPage } from "next";
import { encodeFunctionData } from "viem";
import { ConfidentialityRatioHeader } from "~~/components/ConfidentialityRatioHeader";
import { PortfolioTotalHeader } from "~~/components/PortfolioTotalHeader";
import { SortedTokens } from "~~/components/SortedTokens";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useFhenixPermit } from "~~/permits/hooks";

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

// 0xD8F06f1Ad272D19483000785f1F04FC54445E2E5

const ConnectedAccount = () => {
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

const TokensTableConnectButton = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <div className="absolute inset-0 -top-10 bg-base-100 bg-opacity-50 flex items-center justify-center pointer-events-auto">
      <button onClick={openAuthModal} className="btn btn-primary">
        CONNECT WALLET
      </button>
    </div>
  );
};

const TokensTableBody = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return (
    <tbody className={`relative ${address == null && "pointer-events-none"}`}>
      <SortedTokens />
      {address == null && <TokensTableConnectButton />}
    </tbody>
  );
};

const Home: NextPage = () => {
  return (
    <div className="flex flex-col max-w-[975px] gap-12 mx-auto p-8 pt-12 w-full">
      <ConnectedAccount />

      {/* <DeployLightAccountButton /> */}
      <div className="flex flex-col gap-6 justify-center items-center">
        <div className="flex flex-row flex-wrap flex-1 w-full gap-12 justify-between items-start">
          <PortfolioTotalHeader />
          <ConfidentialityRatioHeader />
        </div>
      </div>

      <div className="flex flex-col w-full text-start gap-4">
        <div className="text-2xl font-bold">Tokens</div>
        <div className="bg-base-300 bg-opacity-30">
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
            <TokensTableBody />
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
