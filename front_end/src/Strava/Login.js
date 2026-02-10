import { useEffect, useState, useRef } from "react";

const Strava_Login = () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [clientId, setClientId] = useState("");
    const [status, setStatus] = useState("Not connected");
    const [accessToken, setAccessToken] = useState(null); 
    const hasProcessedCode = useRef(false); 

    const authorizeWithStrava = () => {
        const redirectUri = window.location.href;
        const scope = 'activity:read_all,profile:read_all';
        const state = Math.random().toString(36).substring(2);
        localStorage.setItem('strava_state', state);
        const authorizationUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
        window.location.href = authorizationUrl;
    }

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/get-strava-client-id`)
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setClientId(data.strava_client_id);
            })
            .catch(err => {
                console.error("CORS or Fetch error:", err);
                setStatus("Failed to load Strava client ID");
            });
    }, [API_BASE_URL]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get("code") && !accessToken) {
            checkSession();
        }
    }, [accessToken]);

    const checkSession = () => {
        fetch(`${API_BASE_URL}/api/strava-refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' 
        })
        .then(res => {
            if (!res.ok) throw new Error("Session expired or invalid");
            return res.json();
        })
        .then(data => {
            setAccessToken(data.access_token);
            setStatus("Connected (Session Restored)");
        })
        .catch(() => {
            setStatus("Please connect to Strava");
        });
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");

        const login = () => {
            hasProcessedCode.current = true;
            const storedState = localStorage.getItem('strava_state');
            
            if (storedState !== returnedState) {
                setStatus("State mismatch, possible security issue");
                window.history.replaceState({}, '', window.location.pathname);
                return;
            }

            setStatus("Exchanging code for token...");

            fetch(`${API_BASE_URL}/api/strava-login?code=${encodeURIComponent(code)}`, {
                method: 'POST',
                credentials: 'include'
            })
            .then(res => {
                if (!res.ok) return res.text().then(text => { throw new Error(text); });
                return res.json();
            })
            .then(data => {
                setAccessToken(data.access_token);
                localStorage.removeItem('strava_state');
                setStatus("Successfully connected to Strava!");

                window.history.replaceState({}, '', window.location.pathname);
                window.location.reload();
            })
            .catch(err => {
                console.error("Error:", err);
                setStatus("Failed to connect: " + err.message);
                window.history.replaceState({}, '', window.location.pathname);
            });
        }

        if (code && !hasProcessedCode.current) {
            login();
        }
    }, [API_BASE_URL]);

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-full">
                        <i className="fa-brands fa-strava text-white text-2xl"></i>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect to Strava</h1>
                <p className="text-gray-600">Access your cycling data and performance metrics</p>
                
                {/* Visual Status Indicator */}
                <div className={`mt-4 text-sm font-semibold ${accessToken ? 'text-green-600' : 'text-blue-600'}`}>
                    {status}
                </div>
            </div>

            {!accessToken ? (
                <button 
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
                            text-white px-8 py-4 rounded-xl transition-all duration-300 font-bold text-lg shadow-lg 
                            hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3"
                        onClick={authorizeWithStrava}>
                    <i className="fa-brands fa-strava text-xl"></i>
                    <span>Connect with Strava</span>
                </button>
            ) : (
                <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Logged In! </strong>
                    <span className="block sm:inline">You can now access your data.</span>
                </div>
            )}

            <div className="mt-8 space-y-3">
                <div className="text-sm text-gray-600 text-center mb-4 font-medium">What you'll get access to:</div>
                <div className="flex items-center text-sm text-gray-700">
                    <div className="bg-green-100 p-1 rounded-full mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <span>View your cycling activities and performance data</span>
                </div>
            </div>
        </div>
    );
};

export default Strava_Login;