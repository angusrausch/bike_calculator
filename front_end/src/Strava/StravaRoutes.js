import { Routes, Route } from "react-router-dom";
import Dashboard from './Dashboard';
import Bike from './Bike';
import Activity from "./Activity";

const StravaRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="bike/:id" element={<Bike />} />
            <Route path="activity/:id" element={<Activity />} />
        </Routes>
    );
};

export default StravaRoutes;
