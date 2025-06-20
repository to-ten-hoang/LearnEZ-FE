import './Dashboard.css';
import { Outlet} from 'react-router-dom';
import Navigation from 'components/Dashboard/Navigation/Navigation';

const Dashboard = () => {
  return (
    <div className='dashboard'>
      <Navigation />
      <Outlet />
    </div>
  );
};

export default Dashboard;