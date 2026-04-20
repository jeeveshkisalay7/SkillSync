import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import JobListings from './pages/JobListings';
import SkillAnalyzer from './pages/SkillAnalyzer';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className={user ? "app-layout" : "auth-layout"}>
        <Sidebar />
        <div className="main-content">
          <TopNav />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} />} />
              <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
              <Route path="/jobs" element={<PrivateRoute><JobListings /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              {/* Added admin route below */}
              <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/analyzer/:jobId" element={<PrivateRoute><SkillAnalyzer /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
