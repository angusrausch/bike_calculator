import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Activity = ({ token }) => {
    const navigate = useNavigate();
    const [activity, setActivity] = useState({});
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const stravaUrl = 'https://www.strava.com/api/v3';
    const mapRef = useRef(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const fetcher = (path) => {
        return fetch(`${stravaUrl}/${path}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json());
    };

    useEffect(() => {
        async function fetchActivityData() {
            setIsLoading(true);
            try {
                const activityData = await fetcher(`/activities/${id}`);
                setActivity(activityData);
            } catch (error) {
                console.error('Error fetching activity data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchActivityData();
    }, [stravaUrl, id]);

    useEffect(() => {
        if (activity.id) {
            fetch(`${API_BASE_URL}/api/get-google-maps-key`)
                .then(res => {
                    if (!res.ok) throw new Error("Network response was not ok");
                    return res.json();
                })
                .then(data => {
                    const scriptId = 'google-maps-api-script';
                    if (!document.getElementById(scriptId)) {
                        const script = document.createElement('script');
                        script.id = scriptId;
                        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.google_maps_key}&libraries=geometry`;
                        script.async = true;
                        script.onload = () => initMap();
                        document.body.appendChild(script);
                    } else if (window.google && window.google.maps) {
                        initMap();
                    }
                })
                .catch(err => {
                    console.error("CORS or Fetch error:", err);
                });
        }

        const initMap = () => {
            if (!mapRef.current || !activity.start_latlng) return;
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 14,
                center: { lat: activity.start_latlng[0], lng: activity.start_latlng[1] },
                streetViewControl: false
            });

            if (activity.map && activity.map.summary_polyline) {
                const path = window.google.maps.geometry.encoding.decodePath(activity.map.summary_polyline);
                const polyline = new window.google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                polyline.setMap(map);

                // Fit map to polyline bounds
                const bounds = new window.google.maps.LatLngBounds();
                path.forEach(latLng => bounds.extend(latLng));
                map.fitBounds(bounds);
            }
        };
    }, [activity, API_BASE_URL]);

    function secondsToHR(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Function to add a leading zero if the number is less than 10
        const pad = (num) => String(num).padStart(2, '0');

        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }


    if (isLoading) {
        return (
            <div className="text-center p-5">
                <h2>Loading Activity Data...</h2>
                <progress className="w-full" value={undefined}></progress>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[90vh] bg-gray-400/80 rounded-xl m-5">
            <div className="p-[20px]">
                <div className="text-left mb-4 mt-8">
                    <button className="bg-[#050A44] min-w-[150px] text-white px-5 py-2.5 border-0 cursor-pointer rounded text-base shadow-lg transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md" 
                            type="button" 
                            onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>

                <h2 className="text-2xl font-bold mb-4">
                    <a href={`https://www.strava.com/activities/${activity.id}`} className="text-black hover:text-blue-800 transition-colors">
                        {activity.name}
                    </a>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-6">
                    <div className="space-y-2">
                        <div><strong>Time:</strong> <span id="activity-start-date">{new Date(activity.start_date_local).toLocaleString()}</span></div>
                        <div className="to-convert"><strong>Distance: </strong> 
                            { activity.distance < 2000 ? (
                                <span>{activity.distance} m</span>
                            ) : (
                                <span>{(activity.distance / 1000).toFixed(2)} Km</span>
                            )}
                        </div>
                        <div><strong>Moving Time:</strong> <span className="time-convert">{secondsToHR(activity.moving_time)}</span></div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg shadow">
                            <div className="text-gray-800">{activity.description}</div>
                        </div>
                        
                        {/* <div className="flex gap-4 justify-center">
                            <button id="kudos-link" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition-colors">
                                Kudos: {kudos|length}
                            </button>
                            <button id="comments-link" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors">
                                Comments: {comments|length}
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
            
            <div className='p-2 flex-1'>
                <div id="map" ref={mapRef} className="w-full h-full rounded-lg"></div>
            </div>
        </div>
    );
}

export default Activity;