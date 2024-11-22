import { TokenData } from "~~/services/store/encryptoStore";
import { useFhenixClient } from "../fhenix/store";
import { Config, useBalance, useConnectorClient, useReadContract, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { addCustomNetwork, Erc20Bridger, EthBridger, getL2Network, L2Network } from "@arbitrum/sdk";
import { fhenixNitrogen } from "~~/utils/fhenix/networks";
import { sepolia } from "viem/chains";
import { IArbTokenAbi } from "./IArbTokenAbi";
import { IErc20Abi } from "./IErc20Abi";

import { providers } from "ethers";
import type { Account, Chain, Client, Transport } from "viem";
import { useAccount } from "@account-kit/react";

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

const initializeArbSdkNetworks = () => {
  const fhenixNetwork: L2Network = {
    chainID: fhenixNitrogen.id,
    explorerUrl: fhenixNitrogen.blockExplorers.default.url,
    name: fhenixNitrogen.name,
    confirmPeriodBlocks: 20,
    isArbitrum: true,
    isCustom: true,
    partnerChainID: sepolia.id,
    partnerChainIDs: [],
    retryableLifetimeSeconds: 604800,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    blockTime: 0.25,
    ethBridge: {
      bridge: "0xbae4d0f2b685452450bfc29a920a82e1dbdcfdd1",
      inbox: "0xf993e10c83fe26dddfc6cb5e82444c44201e8a9c",
      outbox: "0x2635a570f9ae308618D0A340DCd1118fBF73B2E8",
      rollup: "0x6b9e804b8ee92832695415019d923dff094e755f",
      sequencerInbox: "0x240a078c3c0582a43fc7d250c67cdb4eb3ef8686",
    },
    tokenBridge: {
      l1CustomGateway: "0x78bf7c69101C17ec8ed21Af7df12312564c38d0F",
      l1ERC20Gateway: "0x8253017d67AaaB8fa1E9f212EeDcc0C5586A0fB3",
      l1GatewayRouter: "0x98fb385c6BDCEa9f0399BF4c2a6aE4F199E71182",
      l1MultiCall: "0xDf4791eFcB7CeE64a3cE59dA316C1D011ea6A6b0",
      l1ProxyAdmin: "0x613AAd549280ce0C72e2d7E850f019868C86302A",
      l1Weth: "0xf531B8F309Be94191af87605CfBf600D71C2cFe0",
      l1WethGateway: "0x169CC45E2cF1037257b7841583542bE95bdC9b83",
      l2CustomGateway: "0xf76b1E3d480f039f6c76CBD1694289580BbEc910",
      l2ERC20Gateway: "0xC407AfdC46f9D099D6a8BBAA5460498b876996eF",
      l2GatewayRouter: "0x80493fB198525b6DC705170F2e517a5C1a3A4341",
      l2Multicall: "0x97415eba5e091a3eC24c9147AC439AA2c0Fbe138",
      l2ProxyAdmin: "0x901e38632BA022E117EBd202d4fEe8CbE6474e2E",
      l2Weth: "0x14B546cFf7459F1d858cd5032db3aF7c4437F8F3",
      l2WethGateway: "0xd3d5AeE76ED56E3f56C0386368EA70371495e60f",
    },
  };

  try {
    addCustomNetwork({
      customL1Network: undefined,
      customL2Network: fhenixNetwork,
    });
  } catch (err) {
    console.log(err);
  }
};

export const useInitializeArbBridge = () => {
  const [ethBridger, setEthBridger] = useState<EthBridger>();
  const [erc20Bridger, setErc20Bridger] = useState<Erc20Bridger>();

  const { data: sepoliaEthBalance } = useBalance({ chainId: sepolia.id });
  const { data: fhenixEthBalance } = useBalance({ chainId: fhenixNitrogen.id });

  useEffect(() => {
    const initBridgers = async () => {
      const l2Network = await getL2Network(fhenixNitrogen.id);
      setEthBridger(new EthBridger(l2Network));
      setErc20Bridger(new Erc20Bridger(l2Network));
    };
    initializeArbSdkNetworks();
    initBridgers();
  }, []);
};

export const useTokenBridgeBalances = (tokenL2Address: string) => {
  const { address } = useAccount({ type: "LightAccount " });

  // L2 Balance
  const { data: tokenL2Balance } = useReadContract({
    chainId: fhenixNitrogen.id,
    abi: IErc20Abi,
    address: tokenL2Address,
    functionName: "balanceOf",
    args: address == null ? undefined : [address],
  });

  // L1 Address
  const { data: tokenL1Address } = useReadContract({
    chainId: fhenixNitrogen.id,
    abi: IArbTokenAbi,
    address: tokenL2Address,
    functionName: "l1Address",
  });

  // L1 Balance
  const { data: tokenL1Balance } = useReadContract({
    chainId: sepolia.id,
    abi: IErc20Abi,
    address: tokenL1Address,
    functionName: "balanceOf",
    args: address == null ? undefined : [address],
  });

  return { tokenL1Address, tokenL2Address, tokenL1Balance, tokenL2Balance };
};

export const useSelectBridgeChain = () => {
  const { switchChain } = useSwitchChain();

  return useCallback(
    (chainId: number) => {
      switchChain({ chainId });
    },
    [switchChain],
  );
};

// TODO:
// [ ] Type for bridgeable token - l1 bal, l2 bal, l1 approval, l2 approval, l1 address, l2 address, decimals
// [ ] Bridge store - bridgeToken data, bridge direction, bridge amount
//     [ ] List of bridge txs
// [ ] Saved tokens store - input address into token select, add to stored list

type;

export const useErc20Bridger = () => {};

export const useErc20L1Approved = () => {};
export const useErc20L2Approved = () => {};
export const useErc20BridgeL1toL2 = () => {};
export const useErc20BridgeL2toL1 = () => {};

export const useEthBridgeL1toL2 = () => {};
export const useEthBridgeL2toL1 = () => {};

export const useBridgeErc20 = (token: TokenData, amount: string) => {
  // Add networks to sdk
  const fhenixClient = useFhenixClient();
};
