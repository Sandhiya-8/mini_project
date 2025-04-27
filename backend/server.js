const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const fs = require("fs");
const cors = require("cors");



const app = express();
app.use(cors());
const port = 5000;

// Ganache RPC URL
const web3 = new Web3("http://127.0.0.1:7545");

// Smart contract details
const contractData = JSON.parse(
  fs.readFileSync("../build/contracts/ContextAwareAccessControl.json", "utf-8")
);
const contractAddress = "0x755D05e950d03A5cd10d4Df7F5D12E8E1a815fA7"; // Replace with your deployed contract address
const contract = new web3.eth.Contract(contractData.abi, contractAddress);

app.use(bodyParser.json());

// Admin Ethereum account
const adminAccount = "0x16Cf2B6aB0B723f83Fdf6d89622f78A14c6ca6d8"; // Replace with admin address

//storing the policies important values like resources used ,
//this is primarily for finding the correct policy id when the access request is given from the user end 
//to enforce the policy... 
const policy_finding_attributes=[]


//for dealing with the frontEnd

// Sample resource data
const resources = [
    {
        id: "01",
        name: "Hall Smart Light",
        actions: ["getCurrentStatus()", "turnOnLight", "turnOffLight"],
    },
    {
        id: "02",
        name: "Bedroom Smart Fan",
        actions: ["getCurrentSpeed()", "setFanSpeed(1)", "setFanSpeed(2)"],
    },
    {
        id: "03",
        name: "Kitchen Smart Heater",
        actions: ["getCurrentTemperature()", "setTemperature(75)", "turnOffHeater()"],
    },
];

const users = ["u1", "u2", "u3", "u4"];
 
const userRoles=["admin","adult","child","house-help"]
// Route to fetch resources
app.get("/api/resources", (req, res) => {
  try {
    
    res.json(resources); // Send resources as JSON response
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: "Failed to fetch resources." });
    }
});
app.get("/api/users", (req, res) => { 
try {
    
  res.json({ users ,userRoles}); // Send resources as JSON response
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: "Failed to fetch resources." });
    }

});






  // Endpoint to add a policy
  app.post("/addPolicy", async (req, res) => {
    try {

        const policy = req.body;

        const policyId = policy.policy_id || "";
        const description = policy.policy_desc || "";
        const version = policy.policy_version || "1.0";

        const rule = {
            ruleId: policy.policy_rule.rule_id || "",
            effect: policy.policy_rule.effect || "enable",
            authorizedUsers: policy.policy_rule.authorized_users || [],
            resources: policy.policy_rule.resources || [],
            contextConstraints: {
                userRoles: policy.policy_rule.context_constraints.user_role || ["None"],
                datePeriod: {
                    startDate: policy.policy_rule.context_constraints.date_period?.start_date || "None",
                    endDate: policy.policy_rule.context_constraints.date_period?.end_date || "None",
                },
                timePeriod: {
                    startTime: policy.policy_rule.context_constraints.time_period?.start_time || "None",
                    endTime: policy.policy_rule.context_constraints.time_period?.end_time || "None",
                },
                weekdays: policy.policy_rule.context_constraints.weekdays || ["None"],
                locationRange: {
                    latitude: Math.round(policy.policy_rule.context_constraints.location_range?.latitude * 1e6 || 0),
                    longitude: Math.round(policy.policy_rule.context_constraints.location_range?.longitude * 1e6 || 0),
                    radius: policy.policy_rule.context_constraints.location_range?.radius || 0,
                },
                places: policy.policy_rule.context_constraints.place || ["None"],
                //devices: policy.policy_rule.context_constraints.device || [],
                authorizedIPs: ["None"],
            },
            actions: policy.policy_rule.actions || ["getIoTData()"],
            permissions: policy.policy_rule.permissions || "allow",
        };
      console.log(rule);

      // we could check the current policy is already exist or not
      //if it exists already, show them to the user,"the policy for this resource is already wriiten "
      //"do you want to update it"
      

        const accounts = await web3.eth.getAccounts();

        const tx = await contract.methods
            .addPolicy(policyId, description, version, rule)
          .send({ from: accounts[0], gas: 5000000 });
          
      
     // Policies attributes get stored here for further use
const policy_attributes = {
  policy_id: policyId,
  resources: rule.resources,
  actions: rule.actions,
  authorized_users: rule.authorizedUsers,
  
};
policy_finding_attributes.push(policy_attributes);
      
res.json({ message: "Policy added successfully", transactionHash: tx.transactionHash });
} catch (error) {
        console.error("Error adding policy:", error);
        res.status(500).json({ error: "Failed to add policy" });
    }
});


/* Getting the policy ids
app.get("/getAllPolicyIds", async (req, res) => {
  try {
    // Call the smart contract to fetch all policy IDs
    const policyIds = await contract.methods.getAllPolicyIds().call();
    res.json({ policyIds });
  } catch (error) {
    console.error("Error retrieving policy IDs:", error);
    res.status(500).json({ error: "Failed to retrieve policy IDs" });
  }
});*/


app.get("/getAllPolicies", async (req, res) => {
  try {
    const policyIds = await contract.methods.getAllPolicyIds().call();
    const policies = await Promise.all(
      policyIds.map(async (id) => {
        const policy = await contract.methods.getPolicy(id).call();
        console.log(policy[3].contextConstraints);
        return {
          policy_id: policy[0],
          description: policy[1],
          version: policy[2],
          rule: {
            rule_id: policy[3].ruleId,
            effect: policy[3].effect,
            authorized_users: policy[3].authorizedUsers,
            resources: policy[3].resources,
            context_constraints: {
              user_roles: policy[3].contextConstraints.userRoles,
              date_period: policy[3].contextConstraints.datePeriod,
              time_period: policy[3].contextConstraints.timePeriod,
              weekdays: policy[3].contextConstraints.weekdays,
              location_range: policy[3].contextConstraints.locationRange,
              places: policy[3].contextConstraints.places,
              authorized_ips: policy[3].contextConstraints.authorizedIPs,
            },
            actions: policy[3].actions,
            permissions: policy[3].permissions,
          },
        };
      })
    );
    console.log(policies);
    res.json(policies);
  } catch (error) {
    console.error("Error retrieving policies:", error);
    res.status(500).json({ error: "Failed to retrieve policies" });
  }
});



  /*try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods
          .addPolicy(policyId, description, version, rules, proof)
          .send({ from: accounts[0] });

      res.json({ message: "Policy added successfully!" });
  } catch (error) {
      console.error("Error adding policy:", error);
      res.status(500).json({ error: "Failed to add policy" }); 
  }*/

      // Endpoint to check if a policy exists
app.get("/policyExists/:policyId", async (req, res) => {
  try {
    const { policyId } = req.params;
    const exists = await contract.methods.policyExists(policyId).call();
    res.json({ policyId, exists });
  } catch (error) {
    console.error("Error checking policy existence:", error);
    res.status(500).json({ error: "Failed to check policy existence" });
  }
});
/*
app.post("/api/enforcePolicy", (req, res) => {
    const { user_id, resource_name, action } = req.body;

    console.log("User Action Request:");
    console.log("User ID:", user_id);
    console.log("Resource Name:", resource_name);
  console.log("Action:", action);
  
  // location,current time
  // 
  

    // Placeholder response for now
    res.json({ message: `Action '${action}' on '${resource_name}' is being processed.` });
});
*/
function findPolicyId(user_id, 
        resource_name, 
        action,
        user_role,
        current_time, 
        current_day, 
      latitude,
        longitude,
        place) {
  
  
  console.log(policy_finding_attributes);
  console.log(user_id);
  for (const policy of policy_finding_attributes) {
    // Check if the resource matches
    if (!policy.resources.includes(resource_name)) continue;
console.log("rnga irku");
   
    // Check if the action matches
    if (!policy.actions.includes(action)) continue;
    console.log("anga irku");
   

    // Check if the user matches
    if (!policy.authorized_users.includes(user_id)) continue;
    console.log("inga irku");
   
    return policy.policy_id;
  }

  // No matching policy found
  return null;
}



// Endpoint to enforce policy
// Endpoint to enforce policy
app.post("/api/enforcePolicy", async (req, res) => {
  try {
    // Extracting request attributes
    const { 
      user_id, 
        resource_name, 
        action,
        user_role,
        current_time, 
        current_day, 
        location,
        place
    } = req.body;

    // Logging the payload for debugging
    console.log("Enforce Policy Request:", req.body);
   

    //finding the correct policy
    // Find the matching policy ID
    const policyId = findPolicyId(user_id, 
        resource_name, 
        action,
        user_role,
        current_time, 
        current_day, 
      location.latitude,
        location.longitude,
        place);
    if (!policyId) {
      return res.json({ message: "Access denied due to no policy", reason: "No matching policy found" });
    }
    console.log(policyId);
    
    const result = await contract.methods
      .enforcePolicy(
        policyId, 
        user_id, 
        resource_name, 
        action,
        user_role,
        current_time, 
        current_day, 
        Math.round(location.latitude*1e6 ), 
        Math.round(location.longitude*1e6 ),
        place
      )
      .call();

      

   
    if (result[0]) {
      res.json({ 
        message: "Access granted", 
        policyId, 
        resource_name, 
        action 
      });
    } else {
      console.log(result[1]);
      res.json({ 
        message: "Access denied", 
        reason: result[1], 
        policyId, 
        resource_name, 
        action 
      });
    }
  } catch (error) {
    console.error("Error enforcing policy:", error);
    res.status(500).json({ error: "Failed to enforce policy" });
  }
    
});



// Enforce a policy
/*
app.post("/enforcePolicy", async (req, res) => {
  const { policyId, user, resource, contextType, contextValue } = req.body;

  try {
    const isAccessGranted = await contract.methods
      .enforcePolicy(policyId, user, resource, contextType, contextValue)
      .call();
    const message = isAccessGranted ? "Access granted" : "Access denied";
    res.json({ message });
  } catch (error) {
    console.error("Error enforcing policy:", error);
    res.json({message:"Access denied"})
    //res.status(500).json({ error: "Failed to enforce policy" });
  }
});*/



// Assign a user role
app.post("/assignRole", async (req, res) => {
  const { user, role } = req.body;

  try {
    const tx = await contract.methods
      .setUserRole(user, role)
      .send({ from: adminAccount });
    res.json({ message: "Role assigned successfully", transactionHash: tx.transactionHash });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ error: "Failed to assign role" });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
