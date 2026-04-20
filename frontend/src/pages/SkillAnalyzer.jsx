import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SkillAnalyzer = () => {
    const { jobId } = useParams();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode'); // 'seeker' or null (recruiter)
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Recruiter state
    const [applications, setApplications] = useState([]);
    
    // Seeker state
    const [jobDetails, setJobDetails] = useState(null);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        if (mode === 'seeker' && user.role === 'seeker') {
            fetchSeekerAnalysis();
        } else if (user.role === 'recruiter' || user.role === 'admin') {
            fetchApplications();
        }
    }, [jobId, mode]);

    const fetchSeekerAnalysis = async () => {
        try {
            const jobRes = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
            setJobDetails(jobRes.data);
            
            const analysisRes = await axios.post('http://localhost:5000/api/analyze-skills', {
                requiredSkills: jobRes.data.requiredSkills
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAnalysis(analysisRes.data);
        } catch (e) { console.error(e); }
    };

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setApplications(res.data);
        } catch(e) { console.error(e); }
    };

    const updateStatus = async (appId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/applications/${appId}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchApplications();
        } catch(err) { console.error(err); }
    };

    const handleApply = async () => {
        try {
            await axios.post('http://localhost:5000/api/applications', { jobId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Applied successfully!');
            navigate('/dashboard');
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to apply');
        }
    };

    if (mode === 'seeker') {
        return (
            <div>
                <button onClick={() => navigate('/jobs')} className="btn btn-outline" style={{ padding: '8px 16px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Back to Jobs
                </button>
                
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Pre-Application Analysis</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Analyze your skill gap for <strong>{jobDetails?.title}</strong> at {jobDetails?.companyName}</p>

                {analysis && (
                    <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '48px', padding: '48px' }}>
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: analysis.matchPercentage > 75 ? 'var(--success)' : 'var(--accent-primary)', color: 'white', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 700 }}>{analysis.matchPercentage}%</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Overall Match</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
                                {analysis.matchPercentage > 75 ? "You're a great fit!" : "You might need to upskill bits."}
                            </p>
                        </div>
                        
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--success)', fontWeight: 600 }}>
                                    <CheckCircle size={20} /> Matched Skills
                                </h4>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {analysis.matchedSkills.length > 0 ? analysis.matchedSkills.map(s => <span key={s} className="tag tag-success" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{s}</span>) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--danger)', fontWeight: 600 }}>
                                    <AlertCircle size={20} /> Missing Skills (Gap)
                                </h4>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {analysis.missingSkills.length > 0 ? analysis.missingSkills.map(s => <span key={s} className="tag tag-danger" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{s}</span>) : <span className="tag tag-success">100% Match!</span>}
                                </div>
                            </div>

                            <button onClick={handleApply} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                                Apply for this position anyway
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (user.role !== 'recruiter' && user.role !== 'admin') {
        return <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--danger)', padding: '48px' }}>Access Denied. Recruiters only.</div>;
    }

    return (
        <div>
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '8px 16px', marginBottom: '24px' }}>
                <ArrowLeft size={16} /> Dashboard
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px' }}>Applicant Analysis</h1>
            
            {applications.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No applications for this job yet.</div>
            ) : (
                <div className="grid">
                    {applications.map(app => (
                        <div key={app._id} className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{app.applicantId?.name || 'Unknown'}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>{app.applicantId?.email}</p>
                                
                                <div style={{ fontSize: '3rem', fontWeight: 700, color: app.matchPercentage > 75 ? 'var(--success)' : 'var(--accent-primary)', marginBottom: '4px' }}>
                                    {app.matchPercentage}%
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Skill Match Score</p>
                                
                                <div style={{ marginTop: '24px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                                    <div style={{ marginTop: '4px', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>{app.status}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ marginBottom: '12px', color: 'var(--text-main)', fontSize: '0.95rem' }}>Applicant Skills</h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {app.applicantId?.skills.map(s => <span key={s} className="tag tag-success">{s}</span>)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ marginBottom: '12px', color: 'var(--danger)', fontSize: '0.95rem' }}>Missing Skills</h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {app.missingSkills.length > 0 ? app.missingSkills.map(s => <span key={s} className="tag tag-danger">{s}</span>) : <span className="tag tag-success">100% Match!</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                                    <button onClick={() => updateStatus(app._id, 'shortlisted')} className="btn btn-outline" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669', flex: 1 }}>Shortlist Applicant</button>
                                    <button onClick={() => updateStatus(app._id, 'rejected')} className="btn btn-outline" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', flex: 1 }}>Reject Applicant</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillAnalyzer;
