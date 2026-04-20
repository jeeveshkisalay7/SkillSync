import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Briefcase } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'seeker',
        skills: '' // comma separated
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
            
            const payload = { ...formData };
            if (!isLogin && payload.role === 'seeker') {
                payload.skills = payload.skills.split(',').map(s => s.trim());
            }

            const res = await axios.post(endpoint, payload);
            login(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication Failed');
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', maxWidth: '900px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: 'var(--accent-primary)' }}>
                    <Briefcase size={28} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Skill Sync</h2>
                </div>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                    {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    {isLogin ? 'Enter your details to access your account.' : 'Join the most intelligent job portal today.'}
                </p>

                {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" className="form-input" placeholder="John Doe" onChange={handleChange} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" className="form-input" placeholder="john@example.com" onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Account Type</label>
                            <select name="role" className="form-input" onChange={handleChange} style={{ cursor: 'pointer' }}>
                                <option value="seeker">Job Seeker</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                    )}

                    {!isLogin && formData.role === 'seeker' && (
                        <div className="form-group">
                            <label>Your Skills (Comma Separated)</label>
                            <input type="text" name="skills" className="form-input" placeholder="e.g. React, Node.js, Python" onChange={handleChange} required />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }}>
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span 
                        style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} 
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up for free' : 'Log in here'}
                    </span>
                </p>
            </div>
            <div style={{ flex: 1, background: 'var(--accent-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px', color: 'white' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}>Find your dream job<br/>with AI.</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>
                    Skill Sync bridges the gap between your capabilities and industry requirements using intelligent skill matching.
                </p>
                <div style={{ marginTop: '48px', display: 'flex', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', flex: 1 }}>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>10k+</h4>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Active Jobs</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', flex: 1 }}>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>98%</h4>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Match Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
