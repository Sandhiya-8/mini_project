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
const contractAddress = "0xC95c1FCb9073DA6728BC0499FEDE6Afc3404ED13"; // Replace with your deployed contract address
const contract = new web3.eth.Contract(contractData.abi, contractAddress);

app.use(bodyParser.json());

// Admin Ethereum account
const adminAccount = "0x16Cf2B6aB0B723f83Fdf6d89622f78A14c6ca6d8"; // Replace with admin address

// Add a policy
/*
app.post("/addPolicy", async (req, res) => {
  const { description, users, resources, constraints } = req.body;

  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await contract.methods
      .addPolicy(description, users, resources, constraints)
      .send({ from: adminAccount ,gas: 5000000});
    res.json({ message: "Policy added successfully", transactionHash: tx.transactionHash });
  } catch (error) {
    console.error("Error adding policy:", error);
    res.status(500).json({ error: "Failed to add policy" });
  }
});*/
app.post("/addPolicy", async (req, res) => {
    const { description, users, resources, constraints } = req.body;
    console.log(req.body)
    console.log(toString(constraints));
    console.log(description);

    try {
        const accounts = await web3.eth.getAccounts();
        console.log("helo");

        // Encode constraints as an array of structs
        const encodedConstraints = constraints.map(constraint => ({
            constraintType: constraint.constraintType,
            value: constraint.value
        }));
        console.log("helo");

        // Call the smart contract method
        const tx = await contract.methods
            .addPolicy(description, users, resources, encodedConstraints)
            .send({ from: adminAccount,gas: 5000000 });

        res.json({ message: "Policy added successfully", transactionHash: tx.transactionHash });
    } catch (error) {
        console.error("Error adding policy:", error);
        res.status(500).json({ error: "Failed to add policy" });
    }
});


// Enforce a policy
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
});

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
