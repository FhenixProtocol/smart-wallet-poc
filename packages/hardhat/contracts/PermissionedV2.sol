// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity >=0.8.19 <0.9.0;

import { IFhenixPermitV2, PermissionV2, IFhenixPermissionedV2 } from "./PermitV2.sol";

abstract contract PermissionedV2 is IFhenixPermissionedV2 {
	IFhenixPermitV2 public PERMIT_V2;
	bytes32 public PROJECT_ID;
	string public PROJECT_NAME;

	error ProjectNameTooLong();

	constructor(address _permitV2, string memory _projectName) {
		if (bytes(_projectName).length > 32) revert ProjectNameTooLong();

		PERMIT_V2 = IFhenixPermitV2(_permitV2);
		PROJECT_ID = bytes32(abi.encodePacked(_projectName));

		PERMIT_V2.validateProjectId(PROJECT_ID);
	}

	function checkPermitSatisfies(
		uint256 _permitId
	) public view returns (bool) {
		return
			PERMIT_V2.checkPermitSatisfies(
				_permitId,
				address(this),
				PROJECT_ID
			);
	}

	/**
	 * @dev Validates that sender has the permit and permission to view `issuers` data
	 * Validates that the PermitNFT is in the senders wallet and has access to read this contract (via address, project, or category).
	 */
	modifier withPermission(PermissionV2 memory permission) {
		PERMIT_V2.validatePermission(
			permission,
			msg.sender,
			address(this),
			PROJECT_ID
		);
		_;
	}

	/**
	 * @dev Gets and returns the issuer of a permit
	 */
	function getPermitIssuer(
		uint256 _permitId
	) internal view returns (address) {
		return PERMIT_V2.getPermitIssuer(_permitId);
	}
}
