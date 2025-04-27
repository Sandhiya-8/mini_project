import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDashboard from "./components/UserDashboard";
import Admin from "./components/Admin";

function App() {
    return (
        <Router>
            <Routes>
                {/* User Dashboard Route */}
                <Route path="/" element={<UserDashboard />} />

                {/* Admin Dashboard Route */}
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

export default App;
