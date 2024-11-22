// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";
import { PermissionedV2, PermissionV2 } from "./PermissionedV2.sol";
import { FHETypedSealedEuint32, SealedUint } from "fhenix-utils/contracts/FHETypedSealed.sol";

contract Counter is PermissionedV2 {
	mapping(address => euint32) private userCounter;

	constructor(address _permitV2) PermissionedV2(_permitV2, "COUNTER") {}

	function add(inEuint32 calldata encryptedValue) public {
		euint32 value = FHE.asEuint32(encryptedValue);
		userCounter[msg.sender] = userCounter[msg.sender] + value;
	}

	function getCounter(address user) public view returns (uint256) {
		return FHE.decrypt(userCounter[user]);
	}

	function getCounterPermit(
		PermissionV2 memory permission
	) public view withPermission(permission) returns (uint256) {
		address issuer = getPermitIssuer(permission.permitId);
		return FHE.decrypt(userCounter[issuer]);
	}

	function getCounterPermitSealed(
		PermissionV2 memory permission
	) public view withPermission(permission) returns (SealedUint memory) {
		address issuer = getPermitIssuer(permission.permitId);
		return
			FHETypedSealedEuint32.sealTyped(
				userCounter[issuer],
				permission.publicKey
			);
	}
}
