// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContextAwareAccessControl {
    struct ContextConstraint {
        string constraintType; // e.g., "time", "location"
        string value; // e.g., "9-17", "latitude:40.7128,longitude:-74.0060"
    }

    struct Policy {
        uint256 id;
        string description;
        address[] authorizedUsers;
        string[] authorizedResources;
        bool isActive;
    }

    mapping(uint256 => Policy) public policies; // Stores policies
    mapping(uint256 => ContextConstraint[]) public policyConstraints; // Maps policy ID to context constraints
    mapping(address => string) public userRoles; // Maps user addresses to roles
    uint256 public policyCount;

    address public owner;

    // Events
    event PolicyAdded(uint256 policyId, string description);
    event PolicyUpdated(uint256 policyId, string newDescription);
    event PolicyRemoved(uint256 policyId);
    event AccessGranted(address user, string resource);
    event AccessDenied(address user, string resource);

    constructor() {
        owner = msg.sender; // Set the deployer as the owner/admin
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Add a policy (Admin only)
    function addPolicy(
        string memory _description,
        address[] memory _users,
        string[] memory _resources,
        ContextConstraint[] memory _constraints
    ) public onlyOwner {
        // Store the basic policy details
        policies[policyCount] = Policy({
            id: policyCount,
            description: _description,
            authorizedUsers: _users,
            authorizedResources: _resources,
            isActive: true
        });

        // Store context constraints separately in the mapping
        for (uint256 i = 0; i < _constraints.length; i++) {
            policyConstraints[policyCount].push(_constraints[i]);
        }

        emit PolicyAdded(policyCount, _description);
        policyCount++;
    }

    // Update a policy's description (Admin only)
    function updatePolicyDescription(uint256 policyId, string memory newDescription) public onlyOwner {
        require(policyId < policyCount, "Invalid policy ID");
        policies[policyId].description = newDescription;

        emit PolicyUpdated(policyId, newDescription);
    }

    // Remove a policy (Admin only)
    function removePolicy(uint256 policyId) public onlyOwner {
        require(policyId < policyCount, "Invalid policy ID");
        policies[policyId].isActive = false;

        emit PolicyRemoved(policyId);
    }

    // Assign user roles (Admin only)
    function setUserRole(address user, string memory role) public onlyOwner {
        userRoles[user] = role;
    }

    // Enforce policy to check access
    function enforcePolicy(
        uint256 policyId,
        address user,
        string memory resource,
        string memory contextType,
        string memory contextValue
    ) public view returns (bool) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy is not active");
       
        // Check if the user is authorized
        bool userAuthorized = false;
        for (uint256 i = 0; i < policy.authorizedUsers.length; i++) {
            if (policy.authorizedUsers[i] == user) {
                userAuthorized = true;
                break;
            }
        }
        require(userAuthorized,"user not authorised");
        if(userAuthorized==false){
          return false;
        }

        // Check if the resource is authorized
        bool resourceAuthorized = false;
        for (uint256 i = 0; i < policy.authorizedResources.length; i++) {
            if (keccak256(abi.encodePacked(policy.authorizedResources[i])) == keccak256(abi.encodePacked(resource))) {
                resourceAuthorized = true;
                break;
            }
        }
        require(resourceAuthorized, "resource_not_authorised");
        if(resourceAuthorized==false){
          return false;
        }

        // Check context constraints
        ContextConstraint[] storage constraints = policyConstraints[policyId];
        for (uint256 i = 0; i < constraints.length; i++) {
            if (
                keccak256(abi.encodePacked(constraints[i].constraintType)) ==
                keccak256(abi.encodePacked(contextType))
            ) {
                require(
                    keccak256(abi.encodePacked(constraints[i].value)) == keccak256(abi.encodePacked(contextValue)),
                    "constraints not satsified"
                );
                if(keccak256(abi.encodePacked(constraints[i].value)) != keccak256(abi.encodePacked(contextValue))){
                  return false;
                     }
            }
        }

        //emit AccessGranted(user, resource);
        return true; // Access granted
    }
}
