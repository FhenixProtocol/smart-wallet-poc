import {
  type EncryptedBool,
  type EncryptedUint8,
  type EncryptedUint16,
  type EncryptedUint32,
  type EncryptedUint64,
  type EncryptedUint128,
  type EncryptedUint256,
  type EncryptedAddress,
  FhenixClientSync,
  EncryptedNumber,
} from "fhenixjs";
import { Primitive } from "type-fest";
import { FhenixPermissionV2 } from "../permitV2/types";

// FHE contract internal primitives

export type FHE_ebool = bigint & {
  __fheEBool: void;
};
export type FHE_euint8 = bigint & {
  __fheEuint8: void;
};
export type FHE_euint16 = bigint & {
  __fheEuint16: void;
};
export type FHE_euint32 = bigint & {
  __fheEuint32: void;
};
export type FHE_euint64 = bigint & {
  __fheEuint64: void;
};
export type FHE_euint128 = bigint & {
  __fheEuint128: void;
};
export type FHE_euint256 = bigint & {
  __fheEuint256: void;
};
export type FHE_eaddress = bigint & {
  __fheEAddress: void;
};

export type BrandedFHEInternalPrimitives = {
  [EncryptablePrimitive.Bool]: FHE_ebool;
  [EncryptablePrimitive.Uint8]: FHE_euint8;
  [EncryptablePrimitive.Uint16]: FHE_euint16;
  [EncryptablePrimitive.Uint32]: FHE_euint32;
  [EncryptablePrimitive.Uint64]: FHE_euint64;
  [EncryptablePrimitive.Uint128]: FHE_euint128;
  [EncryptablePrimitive.Uint256]: FHE_euint256;
  [EncryptablePrimitive.Address]: FHE_eaddress;
};

// Permission

export type BrandedFhenixPermission = FhenixPermissionV2 & {
  __fhenixPermission: void;
};

/**
 * Used as a placeholder to be replaced with a Fhenix `Permission` signed object.
 *
 * _For use with utility fhenix call hooks (eg. useFhenixScaffoldContractWrite)._
 */
type UnbrandFhenixPermission<TFhenixTransformable extends boolean = false> = TFhenixTransformable extends true
  ? "populate-fhenix-permission"
  : FhenixPermissionV2;

// Encryptable Primitives

export const EncryptablePrimitive = {
  Uint8: "uint8",
  Uint16: "uint16",
  Uint32: "uint32",
  Uint64: "uint64",
  Uint128: "uint128",
  Uint256: "uint256",
  Address: "address",
  Bool: "bool",
} as const;

export type EncryptFunction<T extends EncryptedNumber> = <C extends FhenixClientSync | undefined>(
  fhenixClient: C,
) => C extends undefined ? undefined : T;

export type EncryptableBase = {
  __fhenixEncryptableInput: void;
  securityZone?: number;
};

export type EncryptableBool = EncryptableBase & {
  __inBool: void;
  value: boolean;
  /**
   * Encrypt this **SealableBool** into an **EncryptedBool (inEbool)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedBool (FHE.sol :: inEbool)**
   */
  encrypt: EncryptFunction<EncryptedBool>;
};

export type EncryptableUint8 = EncryptableBase & {
  __inUint8: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint8** into an **EncryptedUint8 (inEuint8)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint8 (FHE.sol :: inEuint8)**
   */
  encrypt: EncryptFunction<EncryptedUint8>;
};

export type EncryptableUint16 = EncryptableBase & {
  __inUint16: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint16** into an **EncryptedUint16 (inEuint16)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint16 (FHE.sol :: inEuint16)**
   */
  encrypt: EncryptFunction<EncryptedUint16>;
};

export type EncryptableUint32 = EncryptableBase & {
  __inUint32: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint32** into an **EncryptedUint32 (inEuint32)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint32 (FHE.sol :: inEuint32)**
   */
  encrypt: EncryptFunction<EncryptedUint32>;
};

export type EncryptableUint64 = EncryptableBase & {
  __inUint64: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint64** into an **EncryptedUint64 (inEuint64)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint64 (FHE.sol :: inEuint64)**
   */
  encrypt: EncryptFunction<EncryptedUint64>;
};

export type EncryptableUint128 = EncryptableBase & {
  __inUint128: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint128** into an **EncryptedUint128 (inEuint128)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint128 (FHE.sol :: inEuint128)**
   */
  encrypt: EncryptFunction<EncryptedUint128>;
};

export type EncryptableUint256 = EncryptableBase & {
  __inUint256: void;
  value: bigint | number | string;
  /**
   * Encrypt this **SealableUint256** into an **EncryptedUint256 (inEuint32)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedUint256 (FHE.sol :: inEuint32)**
   */
  encrypt: EncryptFunction<EncryptedUint256>;
};

export type EncryptableAddress = EncryptableBase & {
  __inAddress: void;
  value: `0x${string}`;
  /**
   * Encrypt this **SealableAddress** into an **EncryptedAddress (inAddress)**
   * to be passed securely into Fhenix FHE powered contracts.
   * @param {FhenixClientSync | undefined } fhenixClient - Client performing the encryption
   * @returns **EncryptedAddress (FHE.sol :: inAddress)**
   */
  encrypt: EncryptFunction<EncryptedAddress>;
};

export type EncryptableItem =
  | EncryptableBool
  | EncryptableUint8
  | EncryptableUint16
  | EncryptableUint32
  | EncryptableUint64
  | EncryptableUint128
  | EncryptableUint256
  | EncryptableAddress;

export type EncryptableToEncrypted<T> = T extends EncryptableBool
  ? EncryptedBool
  : T extends EncryptableUint8
  ? EncryptedUint8
  : T extends EncryptableUint16
  ? EncryptedUint16
  : T extends EncryptableUint32
  ? EncryptedUint32
  : T extends EncryptableUint64
  ? EncryptedUint64
  : T extends EncryptableUint128
  ? EncryptedUint128
  : T extends EncryptableUint256
  ? EncryptedUint256
  : T extends EncryptableAddress
  ? EncryptedAddress
  : T;

export type EncryptableToEncryptedTransformer<type> =
  | ([unknown] extends [type] ? unknown : never)
  | (type extends EncryptableItem ? EncryptableToEncrypted<type> : never)
  | (type extends readonly [] ? readonly [] : never)
  | (type extends Record<string, unknown> ? { [K in keyof type]: EncryptableToEncryptedTransformer<type[K]> } : never)
  | (type extends { length: number }
      ? {
          [K in keyof type]: EncryptableToEncryptedTransformer<type[K]>;
        } extends infer Val extends readonly unknown[]
        ? readonly [...Val]
        : never
      : never);

// Branded versions

type BrandedEncryptedBool = EncryptedBool & {
  __inBool: void;
};
type BrandedEncryptedUint8 = EncryptedUint8 & {
  __inUint8: void;
};
type BrandedEncryptedUint16 = EncryptedUint16 & {
  __inUint16: void;
};
type BrandedEncryptedUint32 = EncryptedUint32 & {
  __inUint32: void;
};
type BrandedEncryptedUint64 = EncryptedUint64 & {
  __inUint64: void;
};
type BrandedEncryptedUint128 = EncryptedUint128 & {
  __inUint128: void;
};
type BrandedEncryptedUint256 = EncryptedUint256 & {
  __inUint256: void;
};
type BrandedEncryptedAddress = EncryptedAddress & {
  __inAddress: void;
};

type BrandedEncryptedItem =
  | BrandedEncryptedBool
  | BrandedEncryptedUint8
  | BrandedEncryptedUint16
  | BrandedEncryptedUint32
  | BrandedEncryptedUint64
  | BrandedEncryptedUint128
  | BrandedEncryptedUint256
  | BrandedEncryptedAddress;

export type BrandedEncryptedInputTypes = {
  [EncryptablePrimitive.Bool]: BrandedEncryptedBool;
  [EncryptablePrimitive.Uint8]: BrandedEncryptedUint8;
  [EncryptablePrimitive.Uint16]: BrandedEncryptedUint16;
  [EncryptablePrimitive.Uint32]: BrandedEncryptedUint32;
  [EncryptablePrimitive.Uint64]: BrandedEncryptedUint64;
  [EncryptablePrimitive.Uint128]: BrandedEncryptedUint128;
  [EncryptablePrimitive.Uint256]: BrandedEncryptedUint256;
  [EncryptablePrimitive.Address]: BrandedEncryptedAddress;
};

type UnbrandEncryptedInputType<T, TFhenixTransformable extends boolean = false> = T extends BrandedEncryptedBool
  ? TFhenixTransformable extends true
    ? EncryptableBool
    : EncryptedBool
  : T extends BrandedEncryptedUint8
  ? TFhenixTransformable extends true
    ? EncryptableUint8
    : EncryptedUint8
  : T extends BrandedEncryptedUint16
  ? TFhenixTransformable extends true
    ? EncryptableUint16
    : EncryptedUint16
  : T extends BrandedEncryptedUint32
  ? TFhenixTransformable extends true
    ? EncryptableUint32
    : EncryptedUint32
  : T extends BrandedEncryptedUint64
  ? TFhenixTransformable extends true
    ? EncryptableUint64
    : EncryptedUint64
  : T extends BrandedEncryptedUint128
  ? TFhenixTransformable extends true
    ? EncryptableUint128
    : EncryptedUint128
  : T extends BrandedEncryptedUint256
  ? TFhenixTransformable extends true
    ? EncryptableUint256
    : EncryptedUint256
  : T extends BrandedEncryptedAddress
  ? TFhenixTransformable extends true
    ? EncryptableAddress
    : EncryptedAddress
  : T;
// };

export type FhenixMappedInputTypes<T, TFhenixTransformable extends boolean = false> = T extends Primitive
  ? T
  : T extends BrandedFhenixPermission
  ? UnbrandFhenixPermission<TFhenixTransformable>
  : T extends BrandedEncryptedItem
  ? UnbrandEncryptedInputType<T, TFhenixTransformable>
  : {
      [K in keyof T]: FhenixMappedInputTypes<T[K], TFhenixTransformable>;
    };

// Branded Sealed Values

const TFHE_EUINT8 = 0;
const TFHE_EUINT16 = 1;
const TFHE_EUINT32 = 2;
const TFHE_EUINT64 = 3;
const TFHE_EUINT128 = 4;
const TFHE_EUINT256 = 5;
const TFHE_EADDRESS = 12;
const TFHE_EBOOL = 13;

export const TFHE_UTYPE = {
  EUINT8: TFHE_EUINT8,
  EUINT16: TFHE_EUINT16,
  EUINT32: TFHE_EUINT32,
  EUINT64: TFHE_EUINT64,
  EUINT128: TFHE_EUINT128,
  EUINT256: TFHE_EUINT256,
  EADDRESS: TFHE_EADDRESS,
  EBOOL: TFHE_EBOOL,
  EUINT: [TFHE_EUINT8, TFHE_EUINT16, TFHE_EUINT32, TFHE_EUINT64, TFHE_EUINT128, TFHE_EUINT256],
  ALL: [TFHE_EBOOL, TFHE_EUINT8, TFHE_EUINT16, TFHE_EUINT32, TFHE_EUINT64, TFHE_EUINT128, TFHE_EUINT256, TFHE_EADDRESS],
} as const;

export type SealedOutputBool = {
  data: string;
  _utype: typeof TFHE_UTYPE.EBOOL;
};
export type SealedOutputUint = {
  data: string;
  _utype: (typeof TFHE_UTYPE.EUINT)[number];
};
export type SealedOutputAddress = {
  data: string;
  _utype: typeof TFHE_UTYPE.EADDRESS;
};

export type BrandedSealedOutputBool = SealedOutputBool & { __fhenixSealedOutput: void };
export type BrandedSealedOutputUint = SealedOutputUint & { __fhenixSealedOutput: void };
export type BrandedSealedOutputAddress = SealedOutputAddress & { __fhenixSealedOutput: void };

export type BrandedSealedOutputItem = BrandedSealedOutputBool | BrandedSealedOutputUint | BrandedSealedOutputAddress;

export type BrandedSealedOutputTypes = {
  bool: BrandedSealedOutputBool;
  uint: BrandedSealedOutputUint;
  address: BrandedSealedOutputAddress;
};

export type SealedToUnsealedOutput<T> = T extends SealedOutputBool
  ? boolean
  : T extends SealedOutputUint
  ? bigint
  : T extends SealedOutputAddress
  ? `0x${string}`
  : T;

export type UnbrandSealedOutputType<T, TFhenixTransformable extends boolean = false> = T extends BrandedSealedOutputBool
  ? TFhenixTransformable extends true
    ? SealedOutputBool
    : boolean
  : T extends BrandedSealedOutputUint
  ? TFhenixTransformable extends true
    ? SealedOutputUint
    : bigint
  : T extends BrandedSealedOutputAddress
  ? TFhenixTransformable extends true
    ? SealedOutputAddress
    : `0x${string}`
  : T;

export type FhenixMappedOutputTypes<T, TFhenixTransformable extends boolean = false> = T extends Primitive
  ? T
  : T extends BrandedSealedOutputItem
  ? UnbrandSealedOutputType<T, TFhenixTransformable>
  : {
      [K in keyof T]: FhenixMappedOutputTypes<T[K], TFhenixTransformable>;
    };

export type FhenixMappedTypes<T, TFhenixTransformable extends boolean = false> = T extends Primitive
  ? T
  : // Permission
  T extends BrandedFhenixPermission
  ? UnbrandFhenixPermission<TFhenixTransformable>
  : // Input
  T extends BrandedEncryptedItem
  ? UnbrandEncryptedInputType<T, TFhenixTransformable>
  : // Output
  T extends BrandedSealedOutputItem
  ? UnbrandSealedOutputType<T, TFhenixTransformable>
  : {
      [K in keyof T]: FhenixMappedTypes<T[K], TFhenixTransformable>;
    };

// SEALABLES

export type Unsealable<T> = { data: T; unsealed: true } | { data: undefined; unsealed: false };

export type Unsealed<R> = R extends Unsealable<infer T> ? NonNullable<T> : NonNullable<R>;

export type UnsealedArray<T extends Array<Unsealable<any> | any>> = { [K in keyof T]: Unsealed<T[K]> };

export const NullUnsealed = { unsealed: false, data: undefined } as const;

export function processUnsealables<T extends any[], C extends any>(
  items: [...T],
  callback: (...args: UnsealedArray<[...T]>) => C,
): { unsealed: true; data: C } | { unsealed: false; data: undefined } {
  const defArr = [];

  for (const item of items) {
    if (item == null) return NullUnsealed;

    if (isUnsealable(item)) {
      if (!(item as Unsealable<any>).unsealed) return NullUnsealed;
      defArr.push((item as Unsealable<any>).data);
      continue;
    }

    defArr.push(item);
  }

  return unsealed(callback(...(defArr as UnsealedArray<[...T]>)));
}

export function unsealed<T>(data: T): { unsealed: true; data: T } {
  return { unsealed: true, data };
}

// Type guard to check if an item is Unsealable
export function isUnsealable<T>(item: any): item is Unsealable<T> {
  return typeof item === "object" && "unsealed" in item;
}

export function unsealableVal<T>(unsealable: Unsealable<T> | undefined, fallback: T): T {
  if (unsealable == null || !unsealable.unsealed) return fallback;
  return unsealable.data;
}
