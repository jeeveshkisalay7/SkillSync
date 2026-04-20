import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const TopNav = () => {
    const { user } = useContext(AuthContext);

    if (!user) return (
        <header className="topnav auth-nav">
            <h2>Skill Sync</h2>
        </header>
    );

    return (
        <header className="topnav">
            <div className="search-bar">
                <input type="text" placeholder="Search everywhere..." className="form-input" style={{maxWidth: '300px'}} />
            </div>
            <div className="user-profile">
                <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role" style={{textTransform: 'capitalize'}}>{user.role}</span>
                </div>
                <div className="avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default TopNav;
