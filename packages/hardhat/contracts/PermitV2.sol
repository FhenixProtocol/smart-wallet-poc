// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { IERC721, ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { JSON } from "./JSON.sol";

struct PermissionV2 {
	uint256 permitId;
	bytes32 publicKey;
}

struct PermitV2Info {
	uint256 id;
	address issuer;
	string name;
	uint64 createdAt;
	uint64 validityDur;
	uint64 expiresAt;
	bool fineGrained;
	bool revoked;
}

struct ProjectAndContract {
	string project;
	address addr;
}

struct PermitV2FullInfo {
	uint256 id;
	address issuer;
	string name;
	address holder;
	uint64 createdAt;
	uint64 validityDur;
	uint64 expiresAt;
	bool fineGrained;
	bool revoked;
	ProjectAndContract[] contracts;
	string[] projects;
	address[] routers;
}

interface IFhenixPermitV2 {
	function validateProjectId(bytes32 _projectId) external view;
	function checkPermitSatisfies(
		uint256 _permitId,
		address _contract,
		bytes32 _projectId
	) external view returns (bool);
	function validatePermission(
		PermissionV2 calldata _permission,
		address _sender,
		address _contract,
		bytes32 _projectId
	) external view;
	function getPermitIssuer(uint256 _permitId) external view returns (address);
}

interface IFhenixPermissionedV2 {
	function PROJECT_ID() external view returns (bytes32);
}

contract PermitV2 is ERC721Enumerable, IFhenixPermitV2 {
	using JSON for string;

	using EnumerableSet for EnumerableSet.Bytes32Set;
	using EnumerableSet for EnumerableSet.AddressSet;

	string public version = "v2.0.0";

	uint256 private _pid = 0;
	mapping(uint256 => PermitV2Info) private permitInfo;
	mapping(uint256 => EnumerableSet.AddressSet) private approvedContracts;
	mapping(uint256 => EnumerableSet.Bytes32Set) private approvedProjects;
	mapping(uint256 => EnumerableSet.AddressSet) private approvedRouters;

	EnumerableSet.Bytes32Set private projectIds;

	constructor()
		ERC721(
			string.concat("Fhenix Permit ", version),
			string.concat("fhenix-permit-", version)
		)
	{
		projectIds.add(bytes32(abi.encodePacked("FHERC20")));
	}

	event PermitV2Created(address indexed user, uint256 indexed permitId);

	error Unauthorized();
	error InvalidProjectId();
	error InvalidContractAddress();
	error PermitIsFineGrained();
	error PermitIsCoarseGrained();

	error UnauthorizedPermitUsage();
	error PermitRevoked();
	error PermitExpired();
	error PermitOwnerUnauthorized();
	error PermitCategoryUnauthorized();
	error PermitContractUnauthorized();

	error SignerNotMessageSender();

	modifier permitIssuedBySender(uint256 _permitId) {
		if (permitInfo[_permitId].issuer != msg.sender) revert Unauthorized();
		_;
	}
	modifier permitIsActive(uint256 _permitId) {
		if (permitInfo[_permitId].revoked) revert PermitRevoked();
		if (permitInfo[_permitId].expiresAt < block.timestamp)
			revert PermitExpired();
		_;
	}
	modifier permitIsFineGrained(uint256 _permitId) {
		if (permitInfo[_permitId].fineGrained) revert PermitIsCoarseGrained();
		_;
	}
	modifier permitIsCoarseGrained(uint256 _permitId) {
		if (!permitInfo[_permitId].fineGrained) revert PermitIsFineGrained();
		_;
	}
	modifier projectIdIsValid(bytes32 _projectId) {
		if (!projectIds.contains(_projectId)) revert InvalidProjectId();
		_;
	}
	modifier contractIsValid(address _contract) {
		if (_contract == address(0)) revert InvalidContractAddress();
		_;
	}

	function createNewProject(string calldata _projectName) external {
		if (bytes(_projectName).length > 32) revert InvalidProjectId();
		bytes32 _projectId = bytes32(abi.encodePacked(_projectName));
		if (projectIds.contains(_projectId)) revert InvalidProjectId();
		projectIds.add(_projectId);
	}

	function createNewPermit(
		string calldata _name,
		uint64 _validityDur,
		bool _fineGrained,
		address[] calldata _contracts,
		string[] calldata _projects
	) external {
		_pid += 1;

		permitInfo[_pid] = PermitV2Info({
			id: _pid,
			issuer: msg.sender,
			name: _name,
			createdAt: uint64(block.timestamp),
			validityDur: _validityDur,
			expiresAt: uint64(block.timestamp) + _validityDur,
			fineGrained: _fineGrained,
			revoked: false
		});

		// Add specific contracts to fine grained permit
		if (_fineGrained) {
			for (uint256 i = 0; i < _contracts.length; i++) {
				approvedContracts[_pid].add(_contracts[i]);
			}
		}

		// Add categories to coarse permit
		if (!_fineGrained) {
			for (uint256 i = 0; i < _projects.length; i++) {
				approvedProjects[_pid].add(
					bytes32(abi.encodePacked(_projects[i]))
				);
			}
		}

		_safeMint(msg.sender, _pid);

		emit PermitV2Created(msg.sender, _pid);
	}

	function renewPermit(
		uint256 _permitId
	) external permitIssuedBySender(_permitId) {
		permitInfo[_permitId].expiresAt =
			uint64(block.timestamp) +
			permitInfo[_permitId].validityDur;
	}

	function revokePermit(
		uint256 _permitId
	) external permitIssuedBySender(_permitId) {
		permitInfo[_permitId].revoked = true;
	}

	function updateApprovedProjects(
		uint256 _permitId,
		bytes32[] calldata _projectsToAdd,
		bytes32[] calldata _projectsToRemove
	)
		external
		permitIssuedBySender(_permitId)
		permitIsCoarseGrained(_permitId)
	{
		for (uint256 i = 0; i < _projectsToAdd.length; i++) {
			approvedProjects[_permitId].add(
				bytes32(abi.encodePacked(_projectsToAdd[i]))
			);
		}

		for (uint256 i = 0; i < _projectsToRemove.length; i++) {
			approvedProjects[_permitId].remove(
				bytes32(abi.encodePacked(_projectsToRemove[i]))
			);
		}
	}

	function updateApprovedContracts(
		uint256 _permitId,
		address[] calldata _contractsToAdd,
		address[] calldata _contractsToRemove
	) external permitIssuedBySender(_permitId) permitIsFineGrained(_permitId) {
		for (uint256 i = 0; i < _contractsToAdd.length; i++) {
			if (_contractsToAdd[i] == address(0))
				revert InvalidContractAddress();
			approvedContracts[_permitId].add(_contractsToAdd[i]);
		}

		for (uint256 i = 0; i < _contractsToRemove.length; i++) {
			if (_contractsToRemove[i] == address(0))
				revert InvalidContractAddress();
			approvedContracts[_permitId].remove(_contractsToRemove[i]);
		}
	}

	function updateApprovedRouters(
		uint256 _permitId,
		address[] calldata _routersToAdd,
		address[] calldata _routersToRemove
	) external permitIssuedBySender(_permitId) {
		for (uint256 i = 0; i < _routersToAdd.length; i++) {
			if (_routersToAdd[i] == address(0)) revert InvalidContractAddress();
			approvedRouters[_permitId].add(_routersToAdd[i]);
		}

		for (uint256 i = 0; i < _routersToRemove.length; i++) {
			if (_routersToRemove[i] == address(0))
				revert InvalidContractAddress();
			approvedRouters[_permitId].remove(_routersToRemove[i]);
		}
	}

	function validateProjectId(bytes32 _projectId) external view {
		if (!projectIds.contains(_projectId)) revert InvalidProjectId();
	}

	function checkPermitSatisfies(
		uint256 _permitId,
		address _contract,
		bytes32 _projectId
	) external view returns (bool) {
		if (permitInfo[_permitId].fineGrained) {
			if (_contract == address(0)) return false;
			if (!approvedContracts[_permitId].contains(_contract)) return false;
		}

		if (!permitInfo[_permitId].fineGrained) {
			if (!projectIds.contains(_projectId)) return false;
			if (!approvedProjects[_permitId].contains(_projectId)) return false;
		}

		return true;
	}

	function validatePermission(
		PermissionV2 calldata _permission,
		address _sender,
		address _contract,
		bytes32 _projectId
	) external view permitIsActive(_permission.permitId) {
		uint256 permitId = _permission.permitId;
		address holder = ownerOf(permitId);

		// Sender is holder of permit, or an approved router
		if (_sender != holder && !approvedRouters[permitId].contains(_sender)) {
			revert UnauthorizedPermitUsage();
		}

		// Fine grained permit contract approved
		if (
			permitInfo[permitId].fineGrained &&
			!approvedContracts[permitId].contains(_contract)
		) {
			revert PermitContractUnauthorized();
		}

		// Coarse grained permit project approved
		if (
			!permitInfo[permitId].fineGrained &&
			!approvedProjects[permitId].contains(_projectId)
		) {
			revert PermitCategoryUnauthorized();
		}
	}

	function _contractProjectId(
		address _contract
	) internal view returns (bytes32) {
		// Coarse grained
		(bool success, bytes memory result) = _contract.staticcall(
			abi.encodeWithSelector(IFhenixPermissionedV2.PROJECT_ID.selector)
		);

		if (!success || result.length == 0) return bytes32(0);

		return abi.decode(result, (bytes32));
	}

	function permitSatisfiesContract(
		uint256 _permitId,
		address _contract
	) external view returns (bool) {
		PermitV2Info memory _permit = permitInfo[_permitId];

		// Fine grained
		if (_permit.fineGrained) {
			return approvedContracts[_permitId].contains(_contract);
		}

		// Coarse grained
		bytes32 projectId = _contractProjectId(_contract);
		return approvedProjects[_permitId].contains(projectId);
	}

	function permitSatisfiesRouter(
		uint256 _permitId,
		address _router
	) external view returns (bool) {
		return approvedRouters[_permitId].contains(_router);
	}

	function _getPermitApprovedContracts(
		uint256 _permitId
	) internal view returns (ProjectAndContract[] memory contracts) {
		contracts = new ProjectAndContract[](
			approvedContracts[_permitId].length()
		);
		for (uint256 i = 0; i < approvedContracts[_permitId].length(); i++) {
			contracts[i].addr = approvedContracts[_permitId].at(i);
			contracts[i].project = JSON.bytes32ToString(
				_contractProjectId(contracts[i].addr)
			);
		}
	}

	function _getPermitApprovedContractsJson(
		uint256 _permitId
	) internal view returns (string[] memory contracts) {
		contracts = new string[](approvedContracts[_permitId].length());
		for (uint256 i = 0; i < approvedContracts[_permitId].length(); i++) {
			address addr = approvedContracts[_permitId].at(i);
			contracts[i] = JSON
				.obj()
				.kv("project", _contractProjectId(addr))
				.kv("addr", addr)
				.end();
		}
	}

	function tokenURI(
		uint256 _permitId
	) public view override returns (string memory) {
		PermitV2Info memory _permit = permitInfo[_permitId];

		string memory attributes = JSON.obj();
		attributes = attributes.kv("id", _permit.id);
		attributes = attributes.kv("issuer", _permit.issuer);
		attributes = attributes.kv("name", _permit.name);
		attributes = attributes.kv("holder", ownerOf(_permit.id));
		attributes = attributes.kv("createdAt", _permit.createdAt);
		attributes = attributes.kv("validityDur", _permit.validityDur);
		attributes = attributes.kv("expiresAt", _permit.expiresAt);
		attributes = attributes.kv("fineGrained", _permit.fineGrained);
		attributes = attributes.kv("revoked", _permit.revoked);

		attributes = attributes.kv(
			"contracts",
			_getPermitApprovedContractsJson(_permitId)
		);
		attributes = attributes.kv(
			"projects",
			approvedProjects[_permitId].values()
		);
		attributes = attributes.kv(
			"routers",
			approvedRouters[_permitId].values()
		);
		attributes = attributes.end();

		return
			JSON
				.obj()
				.kv("name", symbol())
				.kv("description", name())
				.kv("attributes", attributes, false)
				.end()
				.toBase64();
	}

	function _bytes32ArrToStringArr(
		bytes32[] memory values
	) internal pure returns (string[] memory bytes32Strings) {
		bytes32Strings = new string[](values.length);
		for (uint i = 0; i < values.length; i++) {
			bytes32Strings[i] = JSON.bytes32ToString(values[i]);
		}
	}

	function getPermitInfo(
		uint256 _permitId
	) external view returns (PermitV2FullInfo memory) {
		PermitV2Info memory _permit = permitInfo[_permitId];
		return
			PermitV2FullInfo({
				id: _permit.id,
				issuer: _permit.issuer,
				name: _permit.name,
				holder: ownerOf(_permitId),
				createdAt: _permit.createdAt,
				validityDur: _permit.validityDur,
				expiresAt: _permit.expiresAt,
				fineGrained: _permit.fineGrained,
				revoked: _permit.revoked,
				contracts: _getPermitApprovedContracts(_permitId),
				projects: _bytes32ArrToStringArr(
					approvedProjects[_permitId].values()
				),
				routers: approvedRouters[_permitId].values()
			});
	}

	function getPermitIssuer(
		uint256 _permitId
	) external view returns (address) {
		return permitInfo[_permitId].issuer;
	}
}
