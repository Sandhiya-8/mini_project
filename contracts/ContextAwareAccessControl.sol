// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContextAwareAccessControl {
    struct DatePeriod {
        string startDate;
        string endDate;
    }

    struct TimePeriod {
        string startTime;
        string endTime;
    }

    struct LocationRange {
        int256 latitude;
        int256 longitude;
        uint256 radius;
    }

    struct Device {
        string id;
        string deviceType;
    }

    struct ContextConstraints {
        string[] userRoles;
        DatePeriod datePeriod;
        TimePeriod timePeriod;
        string[] weekdays;
        LocationRange locationRange;
        string[] places;
        //Device[] devices;
        string[] authorizedIPs;
    }

    struct PolicyRule {
        string ruleId;
        string effect; // "enable" or "disable"
        string[] authorizedUsers;
        string[] resources;
        ContextConstraints contextConstraints;
        string[] actions;
        string permissions; // "allow" or "deny"
    }

    struct Policy {
        string policyId;
        string description;
        string version;
        PolicyRule rule; // Single PolicyRule object
    }

    mapping(string => Policy) public policies; // Maps policy ID to Policy
    address public owner;

    event PolicyAdded(string policyId, string description);
    // Events
    event AccessGranted(string policyId, string resourceName, string action);
    event AccessDenied(string policyId, string resourceName, string action, string reason);

    // Events for debugging
    event DebugLog(string message, string policyId);
    event AccessResult(string policyId, string resourceName, string action, string reason);


    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender; // Set the deployer as the owner/admin
    }

    string[] public policyIds; // Stores all policy IDs for easy retrieval

    // Add a policy (Admin only)
    function addPolicy(
        string memory _policyId,
        string memory _description,
        string memory _version,
        PolicyRule memory _rule
    ) public onlyOwner {
        require(bytes(_policyId).length > 0, "Policy ID cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_version).length > 0, "Version cannot be empty");

        //adding the policy ids into the policy id list
        policyIds.push(_policyId);

        Policy storage newPolicy = policies[_policyId];
        newPolicy.policyId = _policyId;
        newPolicy.description = _description;
        newPolicy.version = _version;

        // Copy rule data to storage
        newPolicy.rule.ruleId = _rule.ruleId;
        newPolicy.rule.effect = _rule.effect;
        newPolicy.rule.authorizedUsers = _rule.authorizedUsers;
        newPolicy.rule.resources = _rule.resources;
        newPolicy.rule.contextConstraints.userRoles = _rule.contextConstraints.userRoles;
        newPolicy.rule.contextConstraints.datePeriod = _rule.contextConstraints.datePeriod;
        newPolicy.rule.contextConstraints.timePeriod = _rule.contextConstraints.timePeriod;
        newPolicy.rule.contextConstraints.weekdays = _rule.contextConstraints.weekdays;
        newPolicy.rule.contextConstraints.locationRange = _rule.contextConstraints.locationRange;
        newPolicy.rule.contextConstraints.places = _rule.contextConstraints.places;
        newPolicy.rule.contextConstraints.authorizedIPs = _rule.contextConstraints.authorizedIPs;

      

        newPolicy.rule.actions = _rule.actions;
        newPolicy.rule.permissions = _rule.permissions;

        emit PolicyAdded(_policyId, _description);
    }

     // Function to retrieve all policy IDs
    function getAllPolicyIds() public view returns (string[] memory) {
        return policyIds;
    }

     // Retrieve a policy by ID
    function getPolicy(string memory policyId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            PolicyRule memory
        )
    {
        Policy storage policy = policies[policyId];
        require(bytes(policy.policyId).length > 0, "Policy does not exist");

        return (
            policy.policyId,
            policy.description,
            policy.version,
            policy.rule
        );
    }

    //converting the time to minutes

    // Helper: Parse time from string (HH:mm) and return total minutes
    function parseTime(string memory time) internal pure returns (uint256) {
        bytes memory timeBytes = bytes(time);

        require(timeBytes.length == 5 && timeBytes[2] == ":", "Invalid time format");
        //converting the hours and min string to numbers
        uint256 hrs = (uint8(timeBytes[0]) - 48) * 10 + (uint8(timeBytes[1]) - 48); // HH
        uint256 mins = (uint8(timeBytes[3]) - 48) * 10 + (uint8(timeBytes[4]) - 48); // mm
        return hrs * 60 + mins;
    }
    function enforcePolicy(
        string memory policyId,
        string memory userId,
        string memory resourceName,
        string memory action,
        string memory userRole,
        string memory currentTime,
        string memory currentDay,
        int256 latitude,
        int256 longitude,
        string memory place
    ) public view returns (bool, string memory) {
        // Fetch the policy using policyId
        Policy storage policy = policies[policyId];
        PolicyRule storage rule = policy.rule;

        // Check resource
        bool resourceMatch = false;
        for (uint256 i = 0; i < rule.resources.length; i++) {
            if (
                keccak256(abi.encodePacked(rule.resources[i])) ==
                keccak256(abi.encodePacked(resourceName))
            ) {
                resourceMatch = true;
                break;
            }
        }
        if (!resourceMatch) {
            return (false, "Resource not authorized");
        }

        // Check user
        bool userMatch = false;
        for (uint256 i = 0; i < rule.authorizedUsers.length; i++) {
            if (
                keccak256(abi.encodePacked(rule.authorizedUsers[i])) ==
                keccak256(abi.encodePacked(userId))
            ) {
                userMatch = true;
                break;
            }
        }
        if (!userMatch) {
            return (false, "User not authorized");
        }

        // Check user role if specified
        if (keccak256(abi.encodePacked(rule.contextConstraints.userRoles[0])) != keccak256(abi.encodePacked("None"))) {
            bool roleMatch = false;
            for (uint256 i = 0; i < rule.contextConstraints.userRoles.length; i++) {
                if (
                    keccak256(abi.encodePacked(rule.contextConstraints.userRoles[i])) ==
                    keccak256(abi.encodePacked(userRole))
                ) {
                    roleMatch = true;
                    break;
                }
            }
            if (!roleMatch) {
                return (false, "User role not authorized");
            }
        }

        // Check time constraint if specified
        if (
            keccak256(abi.encodePacked(rule.contextConstraints.timePeriod.startTime)) != keccak256(abi.encodePacked("None")) &&
            keccak256(abi.encodePacked(rule.contextConstraints.timePeriod.endTime)) != keccak256(abi.encodePacked("None"))
        ) {
            uint256 currentMinutes = parseTime(currentTime);
            uint256 startMinutes = parseTime(rule.contextConstraints.timePeriod.startTime);
            uint256 endMinutes = parseTime(rule.contextConstraints.timePeriod.endTime);
            if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
                return (false, "Time constraint not satisfied");
            }
        }

        // Check weekdays if specified
        if (keccak256(abi.encodePacked(rule.contextConstraints.weekdays[0])) != keccak256(abi.encodePacked("None"))) {
            bool dayMatch = false;
            for (uint256 i = 0; i < rule.contextConstraints.weekdays.length; i++) {
                if (
                    keccak256(abi.encodePacked(rule.contextConstraints.weekdays[i])) ==
                    keccak256(abi.encodePacked(currentDay))
                ) {
                    dayMatch = true;
                    break;
                }
            }
            if (!dayMatch) {
                return (false, "Weekday constraint not satisfied");
            }
        }

        // Check_location if specified
        if (
            rule.contextConstraints.locationRange.radius != 0 &&
            (rule.contextConstraints.locationRange.latitude != 0 || rule.contextConstraints.locationRange.longitude != 0)
        ) {
            int256 lat1 = rule.contextConstraints.locationRange.latitude;
            int256 lon1 = rule.contextConstraints.locationRange.longitude;
            uint256 radius = rule.contextConstraints.locationRange.radius;

            // Haversine formula check (to implement the isWithinDistance function in smart contract)
            // Skipping actual implementation as Solidity has limitations on floating-point operations
            // Placeholder logic: assume location matches for simplicity
            if (false) {
                return (false, "Location constraint not satisfied");
            }
        }
       //check place
       
       if (keccak256(abi.encodePacked(rule.contextConstraints.places[0])) != keccak256(abi.encodePacked("None"))) {
            bool placeMatch = false;
            for (uint256 i = 0; i < rule.contextConstraints.places.length; i++) {
                if (
                    keccak256(abi.encodePacked(rule.contextConstraints.places[i])) ==
                    keccak256(abi.encodePacked(place))
                ) {
                    placeMatch = true;
                    break;
                }
            }
            if (!placeMatch) {
                return (false, place);
            }
        }


        // Check action
        for (uint256 i = 0; i < rule.actions.length; i++) {
            if (
                keccak256(abi.encodePacked(rule.actions[i])) ==
                keccak256(abi.encodePacked(action))
            ) {
                return (true, "Access granted");
            }
        }

        return (false, "Action not authorized");
    }
}

    




   




