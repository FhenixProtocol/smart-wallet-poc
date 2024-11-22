import {
  TFHE_UTYPE,
  FhenixMappedOutputTypes,
  BrandedSealedOutputAddress,
  BrandedSealedOutputUint,
  BrandedSealedOutputBool,
} from "./types";
import { SealingKey } from "fhenixjs";

const isFhenixSealedAddress = (item: any): item is BrandedSealedOutputAddress => {
  return item && typeof item === "object" && item._utype === TFHE_UTYPE.EADDRESS;
};

const isFhenixSealedBool = (item: any): item is BrandedSealedOutputBool => {
  return item && typeof item === "object" && item._utype === TFHE_UTYPE.EBOOL;
};

const isFhenixSealedUint = (item: any): item is BrandedSealedOutputUint => {
  return item && typeof item === "object" && TFHE_UTYPE.EUINT.includes(item._utype);
};

export function unsealFhenixSealedItems<T extends any[]>(
  item: [...T],
  sealingKey: SealingKey,
): [...FhenixMappedOutputTypes<T, false>];
export function unsealFhenixSealedItems<T>(item: T, sealingKey: SealingKey): FhenixMappedOutputTypes<T, false>;
export function unsealFhenixSealedItems<T>(item: T, sealingKey: SealingKey) {
  if (isFhenixSealedAddress(item)) {
    // return fhenixClient.unseal(item.data)
    return `0xFILL_ME_OUT_IN_UNSEAL_ITEM` as string;
  }
  if (isFhenixSealedUint(item)) {
    return sealingKey.unseal(item.data);
  }
  if (isFhenixSealedBool(item)) {
    const unsealed = sealingKey.unseal(item.data);
    return unsealed === 1n;
  }

  if (typeof item === "object" && item !== null) {
    // Handle array
    if (Array.isArray(item)) {
      return item.map(nestedItem => unsealFhenixSealedItems(nestedItem, sealingKey));
    } else {
      // Handle object
      const result: any = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          result[key] = unsealFhenixSealedItems(item[key], sealingKey);
        }
      }
      return result;
    }
  }

  return item;
}
