import { BigNumber, ethers } from "ethers";
import { type TransactionReceipt } from "@ethersproject/abstract-provider";

import { FhenixClient } from "fhenixjs";
import type { SupportedProvider } from "fhenixjs";
import {
  EthBridger,
  Erc20Bridger,
  getL2Network,
  EthDepositStatus,
  L1ToL2MessageStatus,
  addCustomNetwork,
  L2TransactionReceipt,
  L2ToL1MessageStatus,
  type L2Network,
  L2ContractTransaction,
} from "@arbitrum/sdk";

import {
  L1EthDepositTransaction,
  L1EthDepositTransactionReceipt,
  L1ContractCallTransaction,
  L1ContractCallTransactionReceipt,
} from "@arbitrum/sdk/dist/lib/message/L1Transaction";

type ExtendedProvider = SupportedProvider & {
  getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
  send(method: string, params: any[] | Record<string, any>): Promise<any>;
  getSigner(): Promise<any>;
  getBalance(address: string): Promise<any>;
};

enum ActionType {
  Deposit = 0,
  Withdrawal = 1,
}

type TxInfo = {
  action: ActionType;
  amount: number;
};

enum BridgeStatusEnum {
  None = 0,
  WaitingForApproval,
  WaitingForConfirmation,
  WaitingForBalance,
}

const pendingTxs = ref(new Map<string, TxInfo>());

const config = useRuntimeConfig();

const ERROR_CHAIN_DOES_NOT_EXIST = 4902;

const SEPOLIA_USDC_CONTRACT = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

let sepoliaProvider = null as ExtendedProvider | ethers.providers.Web3Provider | null;
const fheClient = ref<FhenixClient | null>(null);
const fnxChainId = config.public.NETWORK_CHAIN_ID;
const networkRPC = config.public.NETWORK_RPC_URL;
const explorerURL = config.public.NETWORK_EXPLORER_URL;
const mmChainId = ref<number>(-1);
const isItFhenixNetwork = ref<boolean>(false);
const isItSepoliaNetwork = ref<boolean>(false);

const eventWasAdded = ref<boolean>(false);
const balance = ref<string>("");
const USDCbalance = ref<string>("");
const address = ref<string>("");
const FHEbalance = ref<string>("");
const bridgeStatus = ref<BridgeStatusEnum>(0);

export default function useChain() {
  return {
    isItFhenixNetwork,
    isItSepoliaNetwork,
    getFhenixBalance,
    balance,
    getBalance,
    FHEbalance,
    address,
    sepoliaConnect,
    initFHEClient,
    getFheClient,
    USDCbalance,
    getUSDCBalance,
    bridgeFunds,
    bridgeERC20Funds,
    BridgeStatusEnum,
    bridgeStatus,
    withdrawFunds,
    withdrawStatusCheck,
    claimFunds,
    pendingTxs,
    ActionType,
    actionName,
    loadTxs,
    saveTxs,
    checkTxStatus,
  };
}

function actionName(type: ActionType) {
  switch (type) {
    case ActionType.Deposit: {
      return "Deposit";
    }
    case ActionType.Withdrawal: {
      return "Withdrawal";
    }
  }
  return "";
}

function initFHEClient() {
  fheClient.value = new FhenixClient({ provider: sepoliaProvider as SupportedProvider });
}

function getFheClient() {
  return fheClient.value;
}

async function sepoliaConnect() {
  try {
    if (sepoliaProvider === null) {
      sepoliaProvider = new ethers.providers.Web3Provider(window.ethereum);
      await sepoliaProvider.send("eth_requestAccounts", []);
    }

    if (sepoliaProvider === null) return;

    //  const chainId = await sepoliaProvider.send('eth_chainId', []);
    //  if (Number(chainId) !== Number(config.public.SEPOLIA_CHAIN_ID)) {
    //      //await addFhenixChain();
    //      console.log("sepoliaConnect: Switching to ", config.public.SEPOLIA_CHAIN_ID);
    //      await switchEthereumChain(Number(config.public.SEPOLIA_CHAIN_ID));
    //  }
    mmChainId.value = Number(config.public.SEPOLIA_CHAIN_ID);

    //  console.log("sepoliaConnect 2: Switching to ", Number(chainId));
    await switchEthereumChain(Number(config.public.SEPOLIA_CHAIN_ID));
    if (!eventWasAdded.value) {
      eventWasAdded.value = true;
      setupMetaMaskListeners();
    }
    localStorage.setItem("isConnected", "1");

    console.log("--- SEPOLIA ---");
    balance.value = await getBalance(sepoliaProvider);
    console.log("--- SEPOLIA ---");
    console.log("--- FHE ---");
    FHEbalance.value = await getFhenixBalance();
    console.log("--- FHE ---");
    isItSepoliaNetwork.value = true;

    USDCbalance.value = await getUSDCBalance(sepoliaProvider);

    pendingTxs.value.set("0xsadadada", {
      amount: Number(10),
      action: ActionType.Deposit,
    });

    pendingTxs.value.set("0xsadadaaaa", {
      amount: Number(10),
      action: ActionType.Deposit,
    });

    pendingTxs.value.set("0xsadadaa2aa", {
      amount: Number(123),
      action: ActionType.Withdrawal,
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

async function getFhenixBalance() {
  const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);
  return await getBalance(fhenixProvider, address.value);
}

async function addFhenixChain() {
  try {
    if (sepoliaProvider !== null) {
      const chainData = [
        {
          chainId: "0x" + Number(fnxChainId).toString(16),
          chainName: "Fhenix Network",
          nativeCurrency: { name: "FHE Token", symbol: "FHE", decimals: 18 },
          rpcUrls: [networkRPC],
          blockExplorerUrls: [explorerURL],
        },
      ];
      await sepoliaProvider.send("wallet_addEthereumChain", chainData);
      console.log("Custom network added");
    }
  } catch (addError) {
    console.error("Error adding custom network:", addError);
  }
}

async function claimFunds(txHash: string) {
  const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);
  const receipt = await fhenixProvider.getTransactionReceipt(txHash);
  const l2Receipt = new L2TransactionReceipt(receipt);
  if (sepoliaProvider) {
    const signer = await sepoliaProvider.getSigner();

    const messages = await l2Receipt.getL2ToL1Messages(signer);
    const l2ToL1Msg = messages[0];

    if ((await l2ToL1Msg.status(fhenixProvider)) == L2ToL1MessageStatus.EXECUTED) {
      console.log(`Message already executed! Nothing else to do here`);
      process.exit(1);
    }

    /**
     * before we try to execute out message, we need to make sure the l2 block it's included in is confirmed! (It can only be confirmed after the dispute period; Arbitrum is an optimistic rollup after-all)
     * waitUntilReadyToExecute() waits until the item outbox entry exists
     */
    const timeToWaitMs = 1000 * 60;
    console.log(
      "Waiting for the outbox entry to be created. This only happens when the L2 block is confirmed on L1, ~1 week after it's creation.",
    );
    await l2ToL1Msg.waitUntilReadyToExecute(fhenixProvider, timeToWaitMs);
    console.log("Outbox entry exists! Trying to execute now");

    /**
     * Now that its confirmed and not executed, we can execute our message in its outbox entry.
     */
    const res = await l2ToL1Msg.execute(fhenixProvider);
    const rec = await res.wait();
    console.log("Done! Your transaction is executed", rec);
  }
}

async function withdrawStatusCheck(txHash: string) {
  try {
    addNetworksToSDK();
  } catch (err) {
    console.log(err);
  }

  const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);

  const receipt = await fhenixProvider.getTransactionReceipt(txHash);
  const l2Receipt = new L2TransactionReceipt(receipt);

  if (sepoliaProvider) {
    const signer = await sepoliaProvider.getSigner();

    const messages = await l2Receipt.getL2ToL1Messages(signer);
    const l2ToL1Msg = messages[0];

    console.log(fhenixProvider);
    const msgStatus = await l2ToL1Msg.status(fhenixProvider);
    console.log("---- msgStatus ----");
    console.log(msgStatus);
    console.log("---- msgStatus ----");

    if (msgStatus == L2ToL1MessageStatus.EXECUTED) {
      console.log(`Message already executed! Nothing else to do here`);
    } else {
      const timeToWaitMs = 1000 * 60;
      console.log(
        "Waiting for the outbox entry to be created. This only happens when the L2 block is confirmed on L1, ~1 week after it's creation.",
      );
      await l2ToL1Msg.waitUntilReadyToExecute(fhenixProvider, timeToWaitMs);
      console.log("Outbox entry exists! Trying to execute now");
    }
  }
}

// ===========
// Eth L2 -> L1 (withdraw)
// ===========

// const withdrawTx = await ethBridger.withdraw({
//   amount: ethers.utils.parseEther(amount),
//   l2Signer: signer,
//   destinationAddress: address,
// });
// console.log(withdrawTx);
// const withdrawRec = await withdrawTx.wait();
// const withdrawEventsData = await withdrawRec.getL2ToL1Events();

// ===========
// Eth L1 -> L2 (deposit)
// ===========

// const depositTx = await ethBridger.deposit({
//   amount: ethers.utils.parseEther(amount),
//   l1Signer: signer,
//   l2Provider: fhenixProvider,
// });
// const depositRec = await depositTx.wait();
// pendingTxs.value.set(depositRec.transactionHash, {
//   amount: Number(amount),
//   action: ActionType.Deposit,
// });
// saveTxs(pendingTxs.value);

// WAIT FOR L2 SIDE
// const l2Result = await depositRec.waitForL2(fhenixProvider);

// if (l2Result.complete) {
//   const tmpBalance = await getFhenixBalance();
//   FHEbalance.value = tmpBalance;
//   bridgeStatus.value = BridgeStatusEnum.None;
//   balance.value = await getBalance(sepoliaProvider);
//   console.log(`L2 message successful: status: ${EthDepositStatus[await l2Result.message.status()]}`);
//   pendingTxs.value.delete(depositRec.transactionHash);
//   saveTxs(pendingTxs.value);
// } else {
//   console.log(`L2 message failed: status ${EthDepositStatus[await l2Result.message.status()]}`);
// }

// ==============
// ERC20 L1 -> L2
// ===========

// const ercContract = new ethers.Contract(SEPOLIA_USDC_CONTRACT, erc20Abi, sepoliaProvider);
// const tokenDecimals = await ercContract.decimals();

// const transferAmount = BigNumber.from(amount);
// const tokenDepositAmount = transferAmount.mul(BigNumber.from(10).pow(tokenDecimals));

// const approveTx = await erc20Bridger.approveToken({
//   l1Signer: signer,
//   erc20L1Address: SEPOLIA_USDC_CONTRACT,
// });

// const approveRec = await approveTx.wait();
// console.log(`You successfully allowed the Arbitrum Bridge to spend DappToken ${approveRec.transactionHash}`);

// console.log("Transferring DappToken to L2:");
// const depositTx = await erc20Bridger.deposit({
//   amount: tokenDepositAmount,
//   erc20L1Address: SEPOLIA_USDC_CONTRACT,
//   l1Signer: signer,
//   l2Provider: fhenixProvider,
// });

// console.log(
//   `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `,
// );
// const depositRec = await depositTx.wait();
// const l2Result = await depositRec.waitForL2(fhenixProvider);

// l2Result.complete
//   ? console.log(`L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`)
//   : console.log(`L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`);

// const l2TokenAddress = await erc20Bridger.getL2ERC20Address(SEPOLIA_USDC_CONTRACT, sepoliaProvider);

// console.log("--- l2TokenAddress ---");
// console.log(l2TokenAddress);
// console.log("--- l2TokenAddress ---");

// const l2Token = erc20Bridger.getL2TokenContract(fhenixProvider, l2TokenAddress);
// const myAddress = await signer.getAddress();
// const testWalletL2Balance = (await l2Token.functions.balanceOf(myAddress))[0];

// console.log("testWalletL2Balance");
// console.log(testWalletL2Balance);
// console.log("testWalletL2Balance");

async function withdrawFunds(amount: string) {
  try {
    addNetworksToSDK();
  } catch (err) {
    console.log(err);
  }

  await switchEthereumChain(Number(fnxChainId));
  if (sepoliaProvider) {
    const l2Network = await getL2Network(Number(fnxChainId));
    const ethBridger = new EthBridger(l2Network);

    const signer = await sepoliaProvider.getSigner();
    const address = await signer.getAddress();
    const withdrawTx = await ethBridger.withdraw({
      amount: ethers.utils.parseEther(amount),
      l2Signer: signer,
      destinationAddress: address,
    });

    console.log("----- 1 ----");
    console.log(withdrawTx);
    console.log("----- 1 ----");

    const withdrawRec = await withdrawTx.wait();
    console.log(`Ether withdrawal initiated! 🥳 ${withdrawRec.transactionHash}`);
    const withdrawEventsData = await withdrawRec.getL2ToL1Events();

    console.log("----- 2----");
    console.log(withdrawRec);
    console.log("----- 2 ----");

    console.log("----- 3----");
    console.log(withdrawEventsData);
    console.log("----- 3 ----");

    console.log("Withdrawal data:", withdrawEventsData);
    console.log(`To claim funds (after dispute period), see outbox-execute repo 🫡`);

    //isTxClaimable
  }
}
async function bridgeERC20Funds(amount: string) {
  try {
    addNetworksToSDK();
  } catch (err) {
    console.log(err);
  }

  try {
    if (sepoliaProvider) {
      const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);
      const l2Network = await getL2Network(fhenixProvider);
      const erc20Bridger = new Erc20Bridger(l2Network);

      const ercContract = new ethers.Contract(SEPOLIA_USDC_CONTRACT, erc20Abi, sepoliaProvider);
      const tokenDecimals = await ercContract.decimals();

      const transferAmount = BigNumber.from(amount);
      const tokenDepositAmount = transferAmount.mul(BigNumber.from(10).pow(tokenDecimals));

      const signer = await sepoliaProvider.getSigner();
      const approveTx = await erc20Bridger.approveToken({
        l1Signer: signer,
        erc20L1Address: SEPOLIA_USDC_CONTRACT,
      });

      const approveRec = await approveTx.wait();
      console.log(`You successfully allowed the Arbitrum Bridge to spend DappToken ${approveRec.transactionHash}`);

      console.log("Transferring DappToken to L2:");
      const depositTx = await erc20Bridger.deposit({
        amount: tokenDepositAmount,
        erc20L1Address: SEPOLIA_USDC_CONTRACT,
        l1Signer: signer,
        l2Provider: fhenixProvider,
      });

      const withdrawTx = await erc20Bridger.withdraw();
      const receipt = await withdrawTx.wait();

      console.log(
        `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `,
      );
      const depositRec = await depositTx.wait();
      const l2Result = await depositRec.waitForL2(fhenixProvider);

      l2Result.complete
        ? console.log(`L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`)
        : console.log(`L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`);

      const l2TokenAddress = await erc20Bridger.getL2ERC20Address(SEPOLIA_USDC_CONTRACT, sepoliaProvider);

      console.log("--- l2TokenAddress ---");
      console.log(l2TokenAddress);
      console.log("--- l2TokenAddress ---");

      const l2Token = erc20Bridger.getL2TokenContract(fhenixProvider, l2TokenAddress);
      const myAddress = await signer.getAddress();
      const testWalletL2Balance = (await l2Token.functions.balanceOf(myAddress))[0];

      console.log("testWalletL2Balance");
      console.log(testWalletL2Balance);
      console.log("testWalletL2Balance");
    }
  } catch (err) {
    console.log(err);
  }
}

async function bridgeFunds(amount: string) {
  try {
    addNetworksToSDK();
  } catch (err) {
    console.log(err);
  }

  try {
    if (sepoliaProvider) {
      const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);
      const l2Network = await getL2Network(Number(fnxChainId));
      const ethBridger = new EthBridger(l2Network);

      bridgeStatus.value = BridgeStatusEnum.WaitingForApproval;
      const signer = await sepoliaProvider.getSigner();

      const depositTx = await ethBridger.deposit({
        amount: ethers.utils.parseEther(amount),
        l1Signer: signer,
        l2Provider: fhenixProvider,
      });

      bridgeStatus.value = BridgeStatusEnum.WaitingForConfirmation;

      const depositRec = await depositTx.wait();
      console.warn("deposit L1 receipt is:", depositRec.transactionHash);
      pendingTxs.value.set(depositRec.transactionHash, {
        amount: Number(amount),
        action: ActionType.Deposit,
      });
      saveTxs(pendingTxs.value);

      bridgeStatus.value = BridgeStatusEnum.WaitingForBalance;

      console.warn("Now we wait for L2 side of the transaction to be executed ⏳");
      const l2Result = await depositRec.waitForL2(fhenixProvider);

      if (l2Result.complete) {
        const tmpBalance = await getFhenixBalance();
        FHEbalance.value = tmpBalance;
        bridgeStatus.value = BridgeStatusEnum.None;
        balance.value = await getBalance(sepoliaProvider);
        console.log(`L2 message successful: status: ${EthDepositStatus[await l2Result.message.status()]}`);
        pendingTxs.value.delete(depositRec.transactionHash);
        saveTxs(pendingTxs.value);
      } else {
        console.log(`L2 message failed: status ${EthDepositStatus[await l2Result.message.status()]}`);
      }
    }
  } catch (err) {
    bridgeStatus.value = BridgeStatusEnum.None;
  }
}

const saveTxs = (txs: any) => {
  const jsonData = JSON.stringify(Object.fromEntries(txs));
  console.log("---- saveTxs ----");
  console.log(jsonData);
  console.log("---- saveTxs ----");
  localStorage.setItem("fnx-txs", jsonData);
};

const loadTxs = () => {
  const data = localStorage.getItem("fnx-txs");

  if (data) {
    const tmp = JSON.parse(data);
    pendingTxs.value.clear();
    for (const tx of Object.keys(tmp)) {
      pendingTxs.value.set(tx, tmp[tx]);
    }

    if (pendingTxs.value.size > 0) {
      addNetworksToSDK();
      for (const [key, value] of pendingTxs.value) {
        checkTxStatus(key);
      }
    }
  }
};

const checkTxStatus = async (txHash: string) => {
  console.log("=== checkTxStatus ===");
  const fhenixProvider = new ethers.providers.JsonRpcProvider(config.public.NETWORK_RPC_URL);
  if (sepoliaProvider) {
    const tx = await sepoliaProvider.getTransactionReceipt(txHash);
    console.log(tx);
    if (tx) {
      const l1TxReceipt = new L1EthDepositTransactionReceipt(tx);
      console.log(`Checking ${txHash}...`);
      const l2Result = await l1TxReceipt.waitForL2(fhenixProvider);
      if (l2Result.complete) {
        console.log(`L2 message successful: status: ${EthDepositStatus[await l2Result.message.status()]}`);
        const tmpBalance = await getFhenixBalance();
        FHEbalance.value = tmpBalance;
        balance.value = await getBalance(sepoliaProvider);
        pendingTxs.value.delete(txHash);
        saveTxs(pendingTxs.value);
      } else {
        console.log(`L2 message failed: status ${EthDepositStatus[await l2Result.message.status()]}`);
      }
    } else {
      console.log(":(");
    }
  }
};
