import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from './Dashboard';
import Bike from './Bike';
import Activity from "./Activity";
import Strava_Login from './Login';

const StravaRoutes = () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    
    const [status, setStatus] = useState("loading"); 
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/strava-refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) throw new Error("No valid session");
            return res.json();
        })
        .then(data => {
            setAccessToken(data.access_token);
            setStatus("authenticated");
        })
        .catch(() => {
            setStatus("unauthenticated");
        });
    }, [API_BASE_URL]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return <Strava_Login />;
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard token={accessToken} />} />
            <Route path="bike/:id" element={<Bike token={accessToken} />} />
            <Route path="activity/:id" element={<Activity token={accessToken} />} />
        </Routes>
    );
};

export default StravaRoutes;