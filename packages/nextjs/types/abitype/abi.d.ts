import "abitype";
import "~~/node_modules/viem/node_modules/abitype";

type AddressType = string;

declare module "~~/node_modules/viem/node_modules/abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}
