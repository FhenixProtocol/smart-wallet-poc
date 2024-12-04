Smart Wallet POC

Relevant Links:

- https://accountkit.alchemy.com/react/quickstart#existing-project
- https://viem.sh/account-abstraction/accounts/smart/signTypedData
- https://docs.pimlico.io/

Defaults that should be changed:

- Google oauth in Alchemy Account Kit config
- Arch Alchemy Api Key
- Need a WalletConnect api key
- Add deployed site url to alchemy account kit config

Current issues

- Handles **only** smart accounts, no support for eoa accounts
- Deployed site at https://smart-wallet-poc-nine.vercel.app/
  - Not able to login with oauth - Error: enablePopupOauth must be set in configuration or signer.preparePopupOauth must be called before using popup-based OAuth login
  - Not able to login with email - 400 Bad Request / https://api.g.alchemy.com/signer/v1/lookup
    / error: You have not signed the Alchemy Accounts terms of service. Please sign at https://dashboard.alchemy.com/accounts before using this API.

Task List

- [x] Remove standard wallet connection
- [x] Add Alchemy's `account-kit` sdk
- [x] Login / logout with `account-kit`
  - [x] Email
  - [x] Oauth (Google)
  - [x] EOA
- [x] UI for login / logout
- [x] Add PermitV2 class from fhenix.js PermitV2 PR
- [x] Sign PermitV2 with smart wallet
- [x] Deploy Mock FHERC20s with encryption removed on Sepolia
- [x] Fetch smart wallet data from Sepolia
- [x] Pass PermissionV2 from user's permit to fetch mock encrypted balances
  - Current bug: `PermissionInvalid_IssuerSignature`
  - Bug Fixed: viem's `hashTypedData` will only return the correct value if chainId is a number.
- [x] Minting FHERC20 balance or encBalance (forces deployment of wallet)
- [x] Indicator in permit modal that it is invalid because not deployed
- [x] PermitV2 Modal for create / import permit
  - [x] Permit explanation and link to docs
  - [x] Create permit option (for me / for sharing)
  - [x] Importing shared permit - sign and populate `recipientSignature`
  - [x] Selecting permit from list of available permits
  - [x] Checking satisfies project requirements
  - [x] Add status indicator row to modal
- [x] Add status indicator to permit button
- [x] Hook PermitV2 Modal into UnsealableDisplay
- [x] Focused Permit Display
  - [x] Update name
  - [x] Copy permit data
    - [x] Button
    - [x] Copy only relevant data in JSON format
  - [x] See full info of permit
- [x] Import permit blob
  - [x] Validate (check issuer / recipient matches user address)
  - [x] Sign if necessary (recipientSignature)
