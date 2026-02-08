import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const StravaDashboard = () => {
    const [athlete, setAthlete] = useState(() => {
        const stored = localStorage.getItem("strava_athlete_data");
        return stored ? JSON.parse(stored) : {};
    });
    const [athleteStats, setAthleteStats] = useState(() => {
        const stored = localStorage.getItem("strava_athlete_stats");
        return stored ? JSON.parse(stored) : {};
    });
    const [athleteActivities, setAthleteActivities] = useState(() => {
        const stored = localStorage.getItem("strava_athlete_activities");
        return stored ? JSON.parse(stored) : {};
    });
    const stravaUrl = 'https://www.strava.com/api/v3';
    const navigate = useNavigate();

    const fetchAndSet = (path, setter, localStorageKey = null) => {
        const token = localStorage.getItem('strava_access_token');
        fetch(`${stravaUrl}/${path}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                setter(data)
                if (localStorageKey) {
                    localStorage.setItem(localStorageKey, JSON.stringify(data));
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const token = localStorage.getItem('strava_access_token');
        if (token) {
            fetchAndSet("/athlete", setAthlete, "strava_athlete_data");
            fetchAndSet(`/athlete/activities`, setAthleteActivities, "strava_athlete_activities");
        }
    }, [stravaUrl]);

    useEffect(() => {
        if (athlete && athlete.id) {
            fetchAndSet(`/athletes/${athlete.id}/stats`, setAthleteStats, "strava_athlete_stats");
        }
    }, [athlete?.id, stravaUrl]);

    return (
        <div className="text-center p-[20px] bg-gray-400/80 rounded-xl m-5">
            <h3 className="text-6xl flex items-center justify-center gap-4 pb-4">
                Welcome {athlete.firstname} {athlete.lastname}
            </h3>
            <h4>Profile Type:
                {athlete.premium ? (
                <span>Premium</span>
                ) : (
                    <span>Free</span>
                )}
            </h4>
            Followers: {athlete.follower_count}<br/>
            Following: {athlete.friend_count}<br/>
            <br/>
            { athleteStats.recent_ride_totals && (
                <div>
                    Total Ridden: {athleteStats.all_ride_totals.distance < 2000 ? (
                        <span>{athleteStats.all_ride_totals.distance} m</span>
                    ) : (
                        <span>{(athleteStats.all_ride_totals.distance / 1000).toFixed(2)} Km</span>
                    )}
                    <br/>
                    4 Weeks: {athleteStats.recent_ride_totals.distance < 2000 ? (
                        <span>{athleteStats.recent_ride_totals.distance} m</span>
                    ) : (
                        <span>{(athleteStats.recent_ride_totals.distance / 1000).toFixed(2)} Km</span>
                    )}
                    <br/>
                    Year to Date: {athleteStats.ytd_ride_totals.distance < 2000 ? (
                        <span>{athleteStats.ytd_ride_totals.distance} m</span>
                    ) : (
                        <span>{(athleteStats.ytd_ride_totals.distance / 1000).toFixed(2)} Km</span>
                    )}
                </div>
            )}
            <br/>
            { athlete.bikes && (
                <div className="bg-[rgba(44,46,58,0.9)] p-2 text-white inline-block whitespace-nowrap rounded-md m-4">
                    <h3 className="text-3xl pb-2 font-bold">Bikes</h3>
                    {athlete.bikes.map((bike) => (
                        <div key={bike.id} className="flex justify-between items-center py-1">
                            <button className="bg-[#050A44] min-w-[150px] text-white px-5 py-2.5 border-0 cursor-pointer rounded text-base shadow-lg transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md w-full" 
                                    type="button"
                                    onClick={() => navigate(`bike/${bike.id}`)}
                                    >
                                <div className="flex justify-between items-center w-full">
                                    <span className="pr-5">{bike.name}</span>
                                    <small className="text-sm text-white"><span>Distance: </span>
                                        {bike.distance < 2000 ? (
                                            <span>{bike.distance} m</span>
                                        ) : (
                                            <span>{(bike.distance / 1000).toFixed(2)} Km</span>
                                        )}
                                    </small>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <br/><br/><br/>
            { athleteActivities[0] && (
                <div className="text-center p-5 bg-[rgba(179,180,189,0.8)] rounded-2xl mx-4 text-black">
                    <h2 className="text-4xl pb-3">Activities</h2>
                    <table className="w-full border-spacing-2.5 overflow-hidden">
                        <thead>
                            <tr>
                                <th className="px-4 py-2.5 text-center text-lg"></th>
                                <th className="px-4 py-2.5 text-center text-lg">Distance</th>
                                <th className="px-4 py-2.5 text-center text-lg">Elevation</th>
                                <th className="px-4 py-2.5 text-center text-lg">Date</th>
                                <th className="px-4 py-2.5 text-center text-lg">Kudos</th>
                                <th className="px-4 py-2.5 text-center text-lg">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {athleteActivities.map((activity) => (
                                <tr key={activity.id}>
                                    <td className="px-4 py-2.5 text-center">
                                        <button type="button" 
                                                className="bg-[#050A44] min-w-[150px] text-white px-5 py-2.5 border-0 cursor-pointer rounded text-base shadow-lg transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md"
                                                onClick={() => navigate(`activity/${activity.id}`)}>
                                            {activity.name}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2.5 text-center to-convert">
                                        { activity.distance < 2000 ? (
                                            <span>{activity.distance} m</span>
                                        ) : (
                                            <span>{(activity.distance / 1000).toFixed(2)} Km</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">{activity.total_elevation_gain}m</td>
                                    <td className="px-4 py-2.5 text-center">{new Date(activity.start_date_local).toLocaleString()}</td>
                                    <td className="px-4 py-2.5 text-center">{activity.kudos_count}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        {activity.commute ? (
                                            <span>Commute</span>
                                        ) : (
                                            <span>Workout</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <br/><br/><br/>
            <button onClick={() => { localStorage.removeItem('strava_access_token'); window.location.reload(); }}>Logout</button>
        </div>
    );
};

export default StravaDashboard;
