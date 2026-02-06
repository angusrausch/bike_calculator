import { useEffect, useState } from "react";
import Strava_Login from './Login';

const Strava = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('strava_access_token');
        setIsLoggedIn(!!token);
    }, []);

    if (! isLoggedIn) {
        return <Strava_Login />;
    }

    return (
        <div className="text-center">
            <h1>Welcome to Strava Integration!</h1>
            <p>You are logged in. Add your Strava features here.</p>
            <button onClick={() => { localStorage.removeItem('strava_access_token'); setIsLoggedIn(false); }}>Logout</button>
        </div>
    );
};

export default Strava;
