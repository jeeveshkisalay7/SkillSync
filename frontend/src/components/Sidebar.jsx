import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Search, Users, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Skill Sync</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/jobs" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Search size={20} />
                    <span>Find Jobs</span>
                </NavLink>
                {user.role === 'admin' && (
                    <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Users size={20} />
                        <span>Manage Users</span>
                    </NavLink>
                )}
            </nav>
            <div className="sidebar-footer">
                <button onClick={logout} className="nav-item logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
