import { useState, useEffect, act } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Bike = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [bike, setBike] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [bikeActivities, setBikeActivities] = useState([]);
    const stravaUrl = 'https://www.strava.com/api/v3';

    const fetcher = (path) => {
        const token = localStorage.getItem('strava_access_token');
        return fetch(`${stravaUrl}/${path}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json());
    };

    useEffect(() => {
        async function fetchBikeData() {
            const token = localStorage.getItem('strava_access_token');
            setIsLoading(true);
            try {
                const bikeData = await fetcher(`/gear/${id}`);
                setBike(bikeData);
            } catch (error) {
                console.error('Error fetching bike data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        async function fetchBikeActivities() {
            const token = localStorage.getItem('strava_access_token');
            try {
                const allActivities = await fetcher(`/athlete/activities?per_page=100`);
                const filteredActivities = allActivities.filter(activity => activity.gear_id == id);
                setBikeActivities(filteredActivities);
            } catch (error) {
                console.error('Error fetching bike data activities:', error);
            }
        }

        fetchBikeData();
        fetchBikeActivities();
    }, [stravaUrl, id]);

    if (isLoading) {
        return (
            <div className="text-center p-5">
                <h2>Loading Bike Data...</h2>
                <progress className="w-full" value={undefined}></progress>
            </div>
        );
    }

    return (
        <div>
            <div className="ml-12 mb-4 mt-8">
                <button className="bg-[#050A44] min-w-[150px] text-white px-5 py-2.5 border-0 cursor-pointer rounded text-base shadow-lg transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md" 
                        type="button" 
                        onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>

            <div className="text-center p-5 bg-[rgba(179,180,189,0.8)] rounded-lg mx-4">
                <h2>{bike.name}</h2>
                <h4>
                    {bike.brand_name} {bike.model_name}
                </h4>
                {bike.description}<br/><br/>
                Distance: <span id="distance">{bike.converted_distance}</span>Km<br/>
                Alleged Weight: {bike.weight}Kg      
            </div>
            <br/><br/><br/>
            { bikeActivities[0] && (
                <div className="text-center p-5 bg-[rgba(179,180,189,0.8)] rounded-2xl mx-4 text-black">
                    <h2 className="text-4xl pb-3">Recent Activities</h2>
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
                            {bikeActivities.map((activity) => (
                                <tr key={activity.id}>
                                    <td className="px-4 py-2.5 text-center">
                                        <button type="button" 
                                                className="bg-[#050A44] min-w-[150px] text-white px-5 py-2.5 border-0 cursor-pointer rounded text-base shadow-lg transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md"
                                                onClick={() => navigate(`/strava/activity/${activity.id}`)}>
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
        </div>
    );
};

export default Bike;