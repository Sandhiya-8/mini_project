import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard"; // Component to add policies
import ViewPolicies from "./ViewPolicies"; // Component to view policies

const Admin = () => {
    const [activeComponent, setActiveComponent] = useState(""); // Tracks the active component

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <div className="button-container" style={{width:"100%",display:"flex",justifyContent:"center"}}>
                <button 
                    className={activeComponent === "addPolicy" ? "active" : ""}
                    onClick={() => setActiveComponent("addPolicy")}
                style={{marginRight:"2%"}} >
                    Add Policy
                </button>
                <button
                    className={activeComponent === "viewPolicies" ? "active" : ""}
                    onClick={() => setActiveComponent("viewPolicies")}
                    style={{marginLeft:"2%"}}
                >
                    View Policies
                </button>
            </div>

            <div className="component-container">
                {activeComponent === "addPolicy" && <AdminDashboard />}
                {activeComponent === "viewPolicies" && <ViewPolicies />}
            </div>
        </div>
    );
};

export default Admin;
