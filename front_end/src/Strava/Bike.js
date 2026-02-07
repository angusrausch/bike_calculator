import { useNavigate } from 'react-router-dom';

const Bike = () => {
    const navigate = useNavigate();

    return (
        <div>
            BIKE PAGE<br/>
            <button type="button" onClick={() => navigate(`/strava`)}>Back</button>
        </div>
    );
};

export default Bike;