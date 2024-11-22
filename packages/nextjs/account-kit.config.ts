import { AlchemyAccountsUIConfig, cookieStorage, createConfig as createAccountKitConfig } from "@account-kit/react";
import { alchemy, sepolia } from "@account-kit/infra";
// TODO: Re-introduce fhenix nitrogen once it is added to alchemy account-kit

const accountKitUiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [{ type: "passkey" }, { type: "social", authProviderId: "google", mode: "popup" }],
      [
        {
          type: "external_wallets",
          walletConnect: { projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string },
        },
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const accountKitConfig = createAccountKitConfig(
  {
    // if you don't want to leak api keys, you can proxy to a backend and set the rpcUrl instead here
    // get this from the app config you create at https://dashboard.alchemy.com/accounts?utm_source=demo_alchemy_com&utm_medium=referral&utm_campaign=demo_to_dashboard
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string }),
    // TODO: Update rpcBaseUrl
    chain: sepolia, // defineAlchemyChain({ chain: fhenixNitrogen, rpcBaseUrl: "https://eth-sepolia.g.alchemy.com/v2" }),
    ssr: true, // set to false if you're not using server-side rendering
    storage: cookieStorage, // persist the account state using cookies (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
    enablePopupOauth: true,
  },
  accountKitUiConfig,
);
