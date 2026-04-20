import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, XCircle, Users, Trash2, Edit } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);

    const [newJob, setNewJob] = useState({ title: '', description: '', companyName: '', requiredSkills: '' });

    useEffect(() => {
        if (user.role === 'recruiter') fetchRecruiterData();
        else if (user.role === 'seeker') fetchSeekerData();
        else if (user.role === 'admin') fetchAdminData();
    }, [user]);

    const fetchRecruiterData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            setJobs(res.data.filter(j => j.postedBy?.email === user.email));
        } catch (err) { console.error(err); }
    };

    const fetchSeekerData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/applications/my', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setApplications(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAdminData = async () => {
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            const [usersRes, jobsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/users', { headers }),
                axios.get('http://localhost:5000/api/jobs')
            ]);
            setAllUsers(usersRes.data);
            setAllJobs(jobsRes.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newJob, requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()) };
            const res = await axios.post('http://localhost:5000/api/jobs', payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setJobs([res.data, ...jobs]);
            setNewJob({ title: '', description: '', companyName: '', requiredSkills: '' });
        } catch (err) { console.error(err); }
    };

    const handleDeleteJob = async (id, isAdmin = false) => {
        try {
            await axios.delete(`http://localhost:5000/api/${isAdmin ? 'admin/' : ''}jobs/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (isAdmin) setAllJobs(allJobs.filter(j => j._id !== id));
            else setJobs(jobs.filter(j => j._id !== id));
        } catch (err) { alert(err.response?.data?.error || 'Failed to delete'); }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAllUsers(allUsers.filter(u => u._id !== id));
        } catch (err) { alert('Failed to delete user'); }
    };

    // UI Helper for Status
    const StatusBadge = ({ status }) => {
        const styles = {
            pending: { bg: '#fef3c7', text: '#d97706', icon: <Clock size={14} /> },
            viewed: { bg: '#e0e7ff', text: '#4338ca', icon: <Briefcase size={14} /> },
            shortlisted: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={14} /> },
            rejected: { bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={14} /> }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: s.bg, color: s.text, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {s.icon} {status}
            </span>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                    {user.role === 'recruiter' ? 'Recruiter Dashboard' : user.role === 'admin' ? 'Admin Portal' : 'My Applications'}
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Welcome back, {user.name}!</p>
            </div>

            {/* RECRUITER VIEW */}
            {user.role === 'recruiter' && (
                <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
                    <div className="glass-panel" style={{ height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px' }}>Post a New Job</h3>
                        <form onSubmit={handleCreateJob}>
                            <div className="form-group">
                                <label>Job Title</label>
                                <input type="text" className="form-input" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" className="form-input" value={newJob.companyName} onChange={e => setNewJob({...newJob, companyName: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label>Required Skills (comma separated)</label>
                                <input type="text" className="form-input" value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" rows="4" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Publish Job</button>
                        </form>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '20px' }}>Your Active Postings</h3>
                        <div className="grid">
                            {jobs.map(job => (
                                <div key={job._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{job.title}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{job.companyName}</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link to={`/analyzer/${job._id}`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>View Applicants</Link>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleDeleteJob(job._id)} className="btn btn-danger" style={{ padding: '8px' }} title="Delete Job">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {jobs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* SEEKER VIEW */}
            {user.role === 'seeker' && (
                <div className="grid grid-cols-3">
                    {applications.map(app => (
                        <div key={app._id} className="glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>{app.jobId?.title || 'Job Unavailable'}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{app.jobId?.companyName}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                                    <Briefcase size={20} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: app.matchPercentage > 75 ? 'var(--success)' : 'var(--accent-primary)' }}>
                                    {app.matchPercentage}%
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skill Match Score</div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <StatusBadge status={app.status} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {applications.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't applied to any jobs yet.</p>
                            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                        </div>
                    )}
                </div>
            )}

            {/* ADMIN VIEW */}
            {user.role === 'admin' && (
                <div className="grid" style={{ gap: '32px' }}>
                    <div className="glass-panel">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} className="text-accent-primary" /> Manage Users
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map(u => (
                                        <tr key={u._id}>
                                            <td style={{ fontWeight: 500 }}>{u.name}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                            <td><span className={`tag ${u.role === 'admin' ? 'tag-danger' : u.role === 'recruiter' ? 'tag-success' : 'tag-neutral'}`}>{u.role}</span></td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleDeleteUser(u._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-panel">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Briefcase size={20} className="text-accent-primary" /> Manage All Jobs
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Company</th>
                                        <th>Recruiter</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allJobs.map(j => (
                                        <tr key={j._id}>
                                            <td style={{ fontWeight: 500 }}>{j.title}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{j.companyName}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{j.postedBy?.email || 'Unknown'}</td>
                                            <td>
                                                <button onClick={() => handleDeleteJob(j._id, true)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
