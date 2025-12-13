import './Dashboard.css';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from 'components/common/Dashboard/Navigation/Navigation';

const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Auto collapse on mobile
            if (mobile) {
                setCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`dashboard ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <Navigation
                collapsed={collapsed}
                onToggle={toggleCollapsed}
                isMobile={isMobile}
            />
            {/* Mobile overlay when sidebar is open */}
            {isMobile && !collapsed && (
                <div className="sidebar-overlay" onClick={toggleCollapsed} />
            )}
            <div className="dashboard-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
