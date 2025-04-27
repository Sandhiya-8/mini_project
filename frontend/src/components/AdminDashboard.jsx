import React, { useState, useEffect } from "react";
import axios from "axios";
import './AdminDashboard.css';


const AdminDashboard = () => {
    const [resources, setResources] = useState([]); // List of resources from backend
    const [users, setUsers] = useState([]); // List of users from backend
    const [userRoles, setUserRoles] = useState([]); // List of users from backend
    const [selectedResource, setSelectedResource] = useState(""); // Selected resource
    const [actions, setActions] = useState([]); // Actions corresponding to the resource
    const [formData, setFormData] = useState({
        policy_id: "",
        policy_desc: "",
        policy_version: "1.0",
        policy_rule: {
            rule_id: "",
            resources: [],
            authorized_users: [],
            actions: "",
            context_constraints: {
                user_role: [],
                date_period: { start_date: "", end_date: "" },
                time_period: { start_time: "", end_time: "" },
                weekdays: [],
                location_range: { latitude: "", longitude: "", radius: "" },
                place: [],
                authorized_ip: [],
            },
            permissions: "allow",
        },
    });
   const predefinedLocations = [
        { name: "Home", latitude: 12.4500, longitude: 9.0800 },
        { name: "School", latitude: 12.4700, longitude: 9.1200 },
        { name: "Office", latitude: 12.4800, longitude: 9.1000 },
    ];
    // Fetch resources and users from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resourceResponse = await axios.get("http://localhost:5000/api/resources");
                
                console.log(resourceResponse);
                
                
                setResources(resourceResponse.data);
             
                
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, []);
    // Fetch users and roles from the backend
    useEffect(() => {
        const fetchUsersAndRoles = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/users");
                setUsers(response.data.users);
                setUserRoles(response.data.userRoles);
                
            } catch (error) {
                console.error("Error fetching users and roles:", error);
               
            }
        };

        fetchUsersAndRoles();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle resource selection to show corresponding actions
    const handleResourceChange = (e) => {
        const resource = e.target.value;
        setSelectedResource(resource);
        setFormData((prevState) => ({
            ...prevState,
            policy_rule: {
                ...prevState.policy_rule,
                resources: [resource],
            },
        }));

        // Find actions for the selected resource
        const selectedResourceData = resources.find((r) => r.name === resource);
        if (selectedResourceData) {
            setActions(selectedResourceData.actions);
        } else {
            setActions([]);
        }
    };

    // Handle multi-user selection
    const handleUserSelection = (e) => {
        const options = Array.from(e.target.selectedOptions, (option) => option.value);
        setFormData((prevState) => ({
            ...prevState,
            policy_rule: {
                ...prevState.policy_rule,
                authorized_users: options,
            },
        }));
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData);
            const response = await axios.post("http://localhost:5000/addPolicy", formData);
            
            alert("Policy added successfully: " + response.data.message);
        } catch (error) {
            console.error("Error adding policy:", error);
            alert("Failed to add policy");
        }
    };

    return (
        <div>
            <h2>Add Policy</h2>
            
          
            <form id="addPolicyForm" onSubmit={handleSubmit}>
                
                <div><label>Policy ID:</label>
                <input
                    type="text"
                    name="policy_id"
                    value={formData.policy_id}
                    onChange={handleInputChange}
                    required
                    />
                    </div>

                <div>
                <label>Policy Description:</label>
                <input
                    type="text"
                    name="policy_desc"
                    value={formData.policy_desc}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                
                <div>

                <label>Policy Version:</label>
                <input
                    type="text"
                    name="policy_version"
                    value={formData.policy_version}
                    onChange={handleInputChange}
                    />
                    </div>

                <div>
                <label>Resources:</label>
                <select onChange={handleResourceChange} value={selectedResource} required>
                    <option value="">Select a resource</option>
                    {resources.map((resource) => (
                        <option key={resource.id} value={resource.name}>
                            {resource.name}
                        </option>
                    ))}
                    </select>
                    </div>

                <div>
                <label>Actions:</label>
                <select
                    multiple
                    onChange={(e) =>
                        setFormData((prevState) => ({
                            ...prevState,
                            policy_rule: {
                                ...prevState.policy_rule,
                                actions: Array.from(e.target.selectedOptions, (option) => option.value),
                            },
                        }))
                    }
                >
                    {actions.map((action, index) => (
                        <option key={index} value={action}>
                            {action}
                        </option>
                    ))}
                    </select>

                </div>
                
                <div>

                <label>Authorized Users:</label>
                <select multiple onChange={handleUserSelection} required>
                    {users.map((user, index) => (
                        <option key={index} value={user}>
                            {user}
                        </option>
                    ))}
                    </select>
                    </div>

                {/* Add fields for context constraints */}

                <div>
                <label>Start Time:</label>
                <input
                    type="time"
                    name="start_time"
                    onChange={(e) =>
                        setFormData((prevState) => ({
                            ...prevState,
                            policy_rule: {
                                ...prevState.policy_rule,
                                context_constraints: {
                                    ...prevState.policy_rule.context_constraints,
                                    time_period: {
                                        ...prevState.policy_rule.context_constraints.time_period,
                                        start_time: e.target.value,
                                    },
                                },
                            },
                        }))
                    }
                />

                <label>End Time:</label>
                <input
                    type="time"
                    name="end_time"
                    onChange={(e) =>
                        setFormData((prevState) => ({
                            ...prevState,
                            policy_rule: {
                                ...prevState.policy_rule,
                                context_constraints: {
                                    ...prevState.policy_rule.context_constraints,
                                    time_period: {
                                        ...prevState.policy_rule.context_constraints.time_period,
                                        end_time: e.target.value,
                                    },
                                },
                            },
                        }))
                    }
                />
                </div>
                {/* User Role */}
   <div>
    <label>User Roles:</label>
    <select
        multiple
        onChange={(e) =>
            setFormData((prevState) => ({
                ...prevState,
                policy_rule: {
                    ...prevState.policy_rule,
                    context_constraints: {
                        ...prevState.policy_rule.context_constraints,
                        user_role: Array.from(e.target.selectedOptions, (option) => option.value),
                    },
                },
            }))
        }
    >
        <option value="">Select user roles</option>
        {userRoles.map((role, index) => (
            <option key={index} value={role}>
                {role}
            </option>
        ))}
    </select>
   </div>

{/*  Places */}
<div>
    <label>Places:</label>
    <select
        multiple
        onChange={(e) =>
            setFormData((prevState) => ({
                ...prevState,
                policy_rule: {
                    ...prevState.policy_rule,
                    context_constraints: {
                        ...prevState.policy_rule.context_constraints,
                        place: Array.from(e.target.selectedOptions, (option) => option.value),
                    },
                },
            }))
        }
    >
        {predefinedLocations.map((loc, index) => (
            <option key={index} value={loc.name}>
                {loc.name}
            </option>
        ))}
    </select>
</div>

{/* Location Range */}
<div>
    <label>Location Range:</label>
    <select
        onChange={(e) => {
            const selectedLocation = predefinedLocations.find(
                (loc) => loc.name === e.target.value
            );
            setFormData((prevState) => ({
                ...prevState,
                policy_rule: {
                    ...prevState.policy_rule,
                    context_constraints: {
                        ...prevState.policy_rule.context_constraints,
                        location_range: {
                            latitude: selectedLocation?.latitude || "",
                            longitude: selectedLocation?.longitude || "",
                            radius: prevState.policy_rule.context_constraints.location_range.radius,
                        },
                    },
                },
            }));
        }}
    >
        <option value="">Select a predefined location</option>
        {predefinedLocations.map((loc, index) => (
            <option key={index} value={loc.name}>
                {loc.name}
            </option>
        ))}
    </select>
    <label>Radius (meters):</label>
    <input
        type="number"
        name="radius"
        value={formData.policy_rule.context_constraints.location_range.radius}
        onChange={(e) =>
            setFormData((prevState) => ({
                ...prevState,
                policy_rule: {
                    ...prevState.policy_rule,
                    context_constraints: {
                        ...prevState.policy_rule.context_constraints,
                        location_range: {
                            ...prevState.policy_rule.context_constraints.location_range,
                            radius: e.target.value,
                        },
                    },
                },
            }))
        }
    />
</div>
 {/* Weekdays */}
 <div>
    <label>Weekdays:</label>
    <select
        multiple
        onChange={(e) =>
            setFormData((prevState) => ({
                ...prevState,
                policy_rule: {
                    ...prevState.policy_rule,
                    context_constraints: {
                        ...prevState.policy_rule.context_constraints,
                        weekdays: Array.from(e.target.selectedOptions, (option) => option.value),
                    },
                },
            }))
        }
    >
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
    </select>
</div>


        <button type="submit">Add Policy</button>
                </form>
                </div>
        
    );
};

export default AdminDashboard;
