import './Dashboard.css';
import { Outlet } from 'react-router-dom';
import Navigation from 'components/common/Dashboard/Navigation/Navigation';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <Navigation />
            <div className="dashboard-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
