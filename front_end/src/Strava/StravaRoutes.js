import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from './Dashboard';
import Bike from './Bike';
import Activity from "./Activity";
import Strava_Login from './Login';

const StravaRoutes = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('strava_access_token'));
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [status, setStatus] = useState("");

    if (!isLoggedIn || localStorage.getItem("strava_token_expires_at") * 1000 < Date.now()) {
        return <Strava_Login />;

    } else {
        return (
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="bike/:id" element={<Bike />} />
                <Route path="activity/:id" element={<Activity />} />
            </Routes>
        );
    }
};

export default StravaRoutes;
