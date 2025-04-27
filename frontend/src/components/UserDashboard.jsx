import React, { useState, useEffect } from "react";
import axios from "axios";

const UserDashboard = () => {
    const [resources, setResources] = useState([]); // State to store fetched resources
    const [actionStatus, setActionStatus] = useState(""); // State to display action status

    // Fetch resources from the backend on component mount
    useEffect(() => {
        axios.get("http://localhost:5000/api/resources")
            .then((response) => setResources(response.data))
            .catch((error) => console.error("Error fetching resources:", error));
    }, []);

      const [users, setUsers] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    

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

   /*const handleAction = (resourceName, action) => {
    //Get current time in HH:mm format
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    // Get the current day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[currentDate.getDay()];

    // Use Geolocation API to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const payload = {
                    user_id: "u1", // Assuming user ID is hardcoded or fetched elsewhere
                    resource_name: resourceName,
                    action: action,
                    current_time: currentTime, // Add current time to the payload
                    current_day: currentDay, // Add current day to the payload
                    location: {
                        latitude: latitude,
                        longitude: longitude,
                    }, // Add location to the payload
                };

                // Send request to the backend
                axios.post("http://localhost:5000/api/enforcePolicy", payload)
                    .then((response) => {
                        setActionStatus(`Action Successful: ${response.data.message}`);
                          
                    //this is the place for iot integration and changing the state of the iot system.
                    })
                    .catch((error) => {
                        console.error("Error enforcing policy:", error);
                        setActionStatus("Access denied or error occurred.");
                    });
            },
            (error) => {
                console.error("Error getting location:", error);
                setActionStatus("Location access denied or error occurred.");
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        setActionStatus("Geolocation not supported.");
    }
};*/
    const handleAction = (resourceName, action) => {
    // Get current time in HH:mm format
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hours}:${minutes}`;

    // Get the current day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[currentDate.getDay()]; // Returns the current day name

    // Predefined locations
    const predefinedLocations = [
        { name: "Home", latitude: 12.4500, longitude: 9.0800 },
        { name: "School", latitude: 12.4700, longitude: 9.1200 },
        { name: "Office", latitude: 12.4800, longitude: 9.1000 },
    ];

    // Function to find nearest place
    const isWithinDistance = (lat1, lon1, lat2, lon2, distance) => {
        const toRadians = (degree) => (degree * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d <= distance;
    };
        

    const findNearestPlace = (currentLat, currentLon, threshold = 0.1) => {
        for (const location of predefinedLocations) {
            if (isWithinDistance(currentLat, currentLon, location.latitude, location.longitude, threshold)) {
                return location.name;
            }
        }
        return "Other Place"; // If no match is found
    };
        const currentLat = 0;
        const currentLon = 0;
        
        
            // Derive the place based on location
            let place = findNearestPlace(currentLat, currentLon, 0.1); // 0.1 km = 100 meters
             //place = "Home";

            // Create the payload with all necessary attributes
            const payload = {
                user_id: users[0], // Assuming user ID is hardcoded or fetched elsewhere
                resource_name: resourceName,
                action: action,
                user_role:userRoles[0],
                current_time: currentTime, // Add current time to the payload
                current_day: currentDay, // Add current day to the payload
                location: { latitude: currentLat, longitude: currentLon }, // Current location
                place:place, // Derived place
            };

            // Send request to the backend
            axios.post("http://localhost:5000/api/enforcePolicy", payload)
                .then((response) => {
                    alert(`Policy Enforcement Result: ${response.data.message} ${response.data.reason}`);
                    setActionStatus(`Action Successful: ${response.data.message} ${response.data.reason}`);
                })
                .catch((error) => {
                    console.error("Error enforcing policy:", error);

                    setActionStatus("Access denied or error occurred.");
                });
            console.log(payload);
        
        // Get user's current location
    /*
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const currentLat = position.coords.latitude;
            const currentLon = position.coords.longitude;

            // Derive the place based on location
            let place = findNearestPlace(currentLat, currentLon, 0.1); // 0.1 km = 100 meters
             //place = "Home";

            // Create the payload with all necessary attributes
            const payload = {
                user_id: users[0], // Assuming user ID is hardcoded or fetched elsewhere
                resource_name: resourceName,
                action: action,
                user_role:userRoles[0],
                current_time: currentTime, // Add current time to the payload
                current_day: currentDay, // Add current day to the payload
                location: { latitude: currentLat, longitude: currentLon }, // Current location
                place:place, // Derived place
            };

            // Send request to the backend
            axios.post("http://localhost:5000/api/enforcePolicy", payload)
                .then((response) => {
                    setActionStatus(`Action Successful: ${response.data.message}`);
                })
                .catch((error) => {
                    console.error("Error enforcing policy:", error);
                    setActionStatus("Access denied or error occurred.");
                });
            console.log(payload);
        } ,
        (error) => {
            console.error("Error fetching location:", error);
            alert("Unable to fetch location. Please enable location access.");
        }
    );
    */
};



    return (
        <div>
            <h2>User Dashboard</h2>
            <div>
                {resources.map((resource) => (
                    <div key={resource.id} style={{ marginBottom: "20px" }}>
                        <h4>{resource.name}</h4>
                        {resource.actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleAction(resource.name, action)}
                                style={{ margin: "5px" }}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            {actionStatus && <p>Action Status: {actionStatus}</p>}
        </div>
    );
};

export default UserDashboard;
