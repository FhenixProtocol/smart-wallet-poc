Smart Wallet POC

Relevant Links:

- https://accountkit.alchemy.com/react/quickstart#existing-project
- https://viem.sh/account-abstraction/accounts/smart/signTypedData
- https://docs.pimlico.io/

Defaults that should be changed:

- Google oauth in Alchemy Account Kit config
- Arch Alchemy Api Key
- Need a WalletConnect api key

Questions for Alchemy

- What infrastructure needs to be deployed on Nitrogen to enable the smart wallet sdk
- How can we add nitrogen to the account-kit sdk chains

TODO

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
- [ ] Pass PermissionV2 from user's permit to fetch mock encrypted balances
  - Current bug: `PermissionInvalid_IssuerSignature`
- [ ] Minting FHERC20 balance or encBalance
- [ ] PermitV2 Modal for create / import permit
  - [ ] Permit explanation and link to docs
  - [ ] Create permit option (for me / for sharing)
  - [ ] Importing shared permit - sign and populate `recipientSignature`
- [ ] Hook PermitV2 Modal into UnsealableDisplay
