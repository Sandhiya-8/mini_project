import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewPolicies.css";

const ViewPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all policies from the backend
        const fetchPolicies = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getAllPolicies");
                setPolicies(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching policies:", error);
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    if (loading) {
        return <p>Loading policies...</p>;
    }

    if (policies.length === 0) {
        return <p>No policies found.</p>;
    }

    return (
        <div>
            <h3>All Policies</h3>
            <div className="policies-container">
                {policies.map((policy, index) => (
                    <div key={index} className="policy-card">
                        <h4>Policy ID: {policy.policy_id}</h4>
                        <p><strong>Description:</strong> {policy.description}</p>
                        <p><strong>Version:</strong> {policy.version}</p>
                        <p><strong>Rule ID:</strong> {policy.rule.rule_id}</p>
                        <p><strong>Effect:</strong> {policy.rule.effect}</p>
                        <p><strong>Authorized Users:</strong> {policy.rule.authorized_users.join(", ")}</p>
                        <p><strong>Resources:</strong> {policy.rule.resources.join(", ")}</p>
                        <p><strong>Actions:</strong> {policy.rule.actions.join(", ")}</p>
                        <p><strong>Permissions:</strong> {policy.rule.permissions}</p>
                        <h5>Context Constraints:</h5>
                        <ul>
                            <li><strong>User Roles:</strong> {policy.rule.context_constraints.user_roles.join(", ")}</li>
                            <li>
                                <strong>Date Period:</strong>{" "}
                                <p>{policy.rule.context_constraints.date_period.start_date} to{" "}
                                    {policy.rule.context_constraints.date_period.end_date}
                                    </p>
                            </li>
                            <li>
                                <strong>Time Period:</strong>{" "}
                                {policy.rule.context_constraints.time_period[0]} to{" "}
                                {policy.rule.context_constraints.time_period[1]}
                            </li>
                            <li><strong>Weekdays:</strong> {policy.rule.context_constraints.weekdays.join(", ")}</li>
                            <li>
                                <strong>Location Range:</strong>{" "}
                                Lat: {policy.rule.context_constraints.location_range.latitude},{" "}
                                Lon: {policy.rule.context_constraints.location_range.longitude},{" "}
                                Radius: {policy.rule.context_constraints.location_range.radius} meters
                            </li>
                            <li><strong>Places:</strong> {policy.rule.context_constraints.places.join(", ")}</li>
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewPolicies;
