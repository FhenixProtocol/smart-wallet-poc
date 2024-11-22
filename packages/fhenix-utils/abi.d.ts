import {
  BrandedEncryptedInputTypes,
  BrandedSealedOutputTypes,
  BrandedFhenixPermission,
  BrandedFHEInternalPrimitives,
} from "./encryption/types";

declare module "abitype" {
  export interface Register {
    AddressType: string;

    internalTypePrimitives: {
      ebool: BrandedFHEInternalPrimitives["bool"];
      euint8: BrandedFHEInternalPrimitives["uint8"];
      euint16: BrandedFHEInternalPrimitives["uint16"];
      euint32: BrandedFHEInternalPrimitives["uint32"];
      euint64: BrandedFHEInternalPrimitives["uint64"];
      euint128: BrandedFHEInternalPrimitives["uint128"];
      euint256: BrandedFHEInternalPrimitives["uint256"];
      eaddress: BrandedFHEInternalPrimitives["address"];
    };

    internalTypeStructs: {
      inBool: BrandedEncryptedInputTypes["bool"];
      inEuint8: BrandedEncryptedInputTypes["uint8"];
      inEuint16: BrandedEncryptedInputTypes["uint16"];
      inEuint32: BrandedEncryptedInputTypes["uint32"];
      inEuint64: BrandedEncryptedInputTypes["uint64"];
      inEuint128: BrandedEncryptedInputTypes["uint128"];
      inEuint256: BrandedEncryptedInputTypes["uint256"];
      inAddress: BrandedEncryptedInputTypes["address"];

      PermissionV2: BrandedFhenixPermission;

      SealedBool: BrandedSealedOutputTypes["bool"];
      SealedUint: BrandedSealedOutputTypes["uint"];
      SealedAddress: BrandedSealedOutputTypes["address"];
    };
  }
}
