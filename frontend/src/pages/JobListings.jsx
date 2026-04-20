import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Briefcase } from 'lucide-react';

const JobListings = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchJobs = async (query = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/external-jobs?search=${query}`);
            setJobs(res.data);
        } catch(e) { 
            console.error(e); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = () => {
        fetchJobs(searchTerm);
    };

    const handleApply = async (jobId) => {
        try {
            await axios.post('http://localhost:5000/api/applications', {
                jobId,
                resumeUrl: 'https://example.com/resume.pdf'
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Applied successfully!');
            navigate('/dashboard');
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to apply');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Find your next role</h1>
                <p style={{ color: 'var(--text-muted)' }}>Explore thousands of job opportunities with all the information you need.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ marginBottom: '32px', display: 'flex', gap: '16px', padding: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Job title, company, or skills..." 
                        className="form-input" 
                        style={{ paddingLeft: '44px', border: 'none', background: '#f1f5f9' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button onClick={handleSearch} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-2">
                {jobs.map(job => (
                    <div key={job._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                    {job.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{job.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{job.companyName}</p>
                                </div>
                            </div>
                            <span className="tag tag-success">Active</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Briefcase size={16} /> Remote
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <MapPin size={16} /> Worldwide
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <DollarSign size={16} /> Competitive
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 500 }}>Required Skills:</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {job.requiredSkills.map((skill, idx) => (
                                    <span key={idx} className="tag tag-neutral">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            {user?.role === 'seeker' ? (
                                <>
                                    <button onClick={() => navigate(`/analyzer/${job._id}?mode=seeker`)} className="btn btn-outline" style={{ flex: 1 }}>
                                        Analyze Match
                                    </button>
                                    <button onClick={() => handleApply(job._id)} className="btn btn-primary" style={{ flex: 1 }}>
                                        Apply Now
                                    </button>
                                </>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>
                                    Sign in as a Job Seeker to apply online.
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && !loading && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        No jobs found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListings;
