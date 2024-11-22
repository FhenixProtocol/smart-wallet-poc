import { useAccount, useReadContract } from "wagmi";
import { useFhenixPermitNft } from "fhenix-utils";

export const usePermitNftSatisfiesContract = (contract: string | undefined) => {
  const { address } = useAccount();
  const permitNft = useFhenixPermitNft(address);

  const { data: permissionCategory } = useReadContract({
    abi: [
      {
        inputs: [],
        name: "PERMISSION_CATEGORY",
        outputs: [
          {
            internalType: "enum PermissionCategories",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "PERMISSION_CATEGORY",
    address: contract,
    query: {
      enabled: contract != null && permitNft != null,
    },
  });

  if (contract == null || permitNft == null) return false;
  if (permitNft.fineGrained) return permitNft.contracts.includes(contract);
  if (permissionCategory == null) return false;
  return permitNft.categories.includes(BigInt(permissionCategory));
};
