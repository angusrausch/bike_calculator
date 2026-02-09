import { useNavigate } from 'react-router-dom';

const Activity = () => {
    const navigate = useNavigate();

    return (
        <div>
            Activity PAGE<br/>
            <button type="button" onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

export default Activity;