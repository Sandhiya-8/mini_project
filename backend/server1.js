const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const fs = require("fs");

const app = express();
const port = 5000;

// Use Ganache's RPC URL
const web3 = new Web3("http://127.0.0.1:7545");

// Load the contract ABI and bytecode 
const contractData = JSON.parse(fs.readFileSync("../build/contracts/ContextAwareAccessControl.json", "utf-8"));

// Set contract address after deployment
const contractAddress = "0x2892d271B53F114941De54A04F1b27aAd364f48B"; // Replace with the actual deployed contract address
const contract = new web3.eth.Contract(contractData.abi, contractAddress);

// Middleware
app.use(bodyParser.json());

// Endpoint: Add Policy
/*app.post("/addPolicy", async (req, res) => {
    console.log("giri");
    const { description, users, resources, constraints } = req.body;
    console.log("giri");

    try {
        const accounts = await web3.eth.getAccounts();

        // Call smart contract's addPolicy method
        const tx = await contract.methods
            .addPolicy(description, users, resources, constraints)
            .send({ from: accounts[0] });

        res.json({ message: "Policy added successfully", transactionHash: tx.transactionHash });
    } catch (error) {
        console.error("Error adding policy:", error);
        res.status(500).json({ error: "Failed to add policy" });
    }
});
*/
app.post("/addPolicy", async (req, res) => {
    console.log("Received request to add policy");
    console.log("Request body:", req.body);

    const { description, users, resources, constraints } = req.body;

    try {
        // Log the parsed data to ensure it's being passed correctly
        console.log("Parsed data:", { description, users, resources, constraints });

        // Check if any required field is missing
        if (!description || !users || !resources || !constraints) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get accounts from Ganache
        const accounts = await web3.eth.getAccounts();
        console.log("Accounts fetched:", accounts);

        if (!accounts || accounts.length === 0) {
            return res.status(500).json({ error: "No accounts found in Ganache" });
        }

       
            const gasLimit = 500000; // You can increase this if needed

            // Call smart contract's addPolicy method with a custom gas limit
            const tx = await contract.methods
                .addPolicy(description, users, resources, constraints)
                .send({ from: accounts[0], gas: gasLimit });

        console.log("Transaction hash:", tx.transactionHash);

        res.json({ message: "Policy added successfully", transactionHash: tx.transactionHash });
    } catch (error) {
        console.error("Error adding policy:", error);
        res.status(500).json({ error: "Failed to add policy", details: error.message });
    }
});


// Endpoint: Enforce Policy
app.post("/enforcePolicy", async (req, res) => {
    const { policyId, user, resource } = req.body;

    try {
        // Call smart contract's enforcePolicy method
        const isAccessGranted = await contract.methods
            .enforcePolicy(policyId, user, resource)
            .call();

        const message = isAccessGranted ? "Access granted" : "Access denied";
        res.json({ message });
    } catch (error) {
        console.error("Error enforcing policy:", error);
        res.status(500).json({ error: "Failed to enforce policy" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
