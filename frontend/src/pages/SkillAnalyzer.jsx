import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Download, Copy, PlayCircle, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';

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
    const [animPercent, setAnimPercent] = useState(0);

    useEffect(() => {
        if (mode === 'seeker' && user.role === 'seeker') {
            fetchSeekerAnalysis();
        } else if (user.role === 'recruiter' || user.role === 'admin') {
            fetchApplications();
        }
    }, [jobId, mode]);

    useEffect(() => {
        if (analysis) {
            setTimeout(() => {
                setAnimPercent(analysis.matchPercentage);
            }, 100);
        }
    }, [analysis]);

    const fetchSeekerAnalysis = async () => {
        try {
            const jobRes = await api.get(`/jobs/${jobId}`);
            setJobDetails(jobRes.data);
            
            const analysisRes = await api.post('/analyze-skills', {
                requiredSkills: jobRes.data.requiredSkills
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAnalysis(analysisRes.data);
        } catch (e) { console.error(e); }
    };

    const fetchApplications = async () => {
        try {
            const res = await api.get(`/applications/job/${jobId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setApplications(res.data);
        } catch(e) { console.error(e); }
    };

    const updateStatus = async (appId, status) => {
        try {
            await api.put(`/applications/${appId}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchApplications();
        } catch(err) { console.error(err); }
    };

    const handleApply = async () => {
        try {
            await api.post('/applications', { jobId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Applied successfully!');
            navigate('/dashboard');
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to apply');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const downloadPDF = () => {
        if (!analysis || !jobDetails) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`Skill Gap Report: ${jobDetails.title}`, 20, 20);
        doc.setFontSize(16);
        doc.text(`Match Percentage: ${analysis.matchPercentage}%`, 20, 30);
        
        doc.setFontSize(14);
        doc.text("Matched Skills:", 20, 45);
        doc.setFontSize(12);
        doc.text(analysis.matchedSkills.join(', ') || 'None', 20, 55);
        
        doc.setFontSize(14);
        doc.text("Missing Skills (To Learn):", 20, 70);
        let y = 80;
        doc.setFontSize(12);
        if (analysis.learningPath && analysis.learningPath.length > 0) {
            analysis.learningPath.forEach(path => {
                doc.text(`- ${path.skill}: ${path.whyItMatters}`, 20, y);
                y += 10;
            });
        } else {
            doc.text('None', 20, y);
        }
        
        doc.save(`${jobDetails.title}_Gap_Report.pdf`);
    };

    // SVG Animation details
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animPercent / 100) * circumference;

    if (mode === 'seeker') {
        return (
            <div>
                <button onClick={() => navigate('/jobs')} className="btn btn-outline" style={{ padding: '8px 16px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Back to Jobs
                </button>
                
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Pre-Application Analysis</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Analyze your skill gap for <strong>{jobDetails?.title}</strong> at {jobDetails?.companyName}</p>

                {analysis && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', padding: '48px', position: 'relative' }}>
                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '200px' }}>
                                <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '24px' }}>
                                    <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle stroke="#e2e8f0" strokeWidth="12" fill="transparent" r={radius} cx="80" cy="80" />
                                        <circle 
                                            stroke={analysis.matchPercentage > 75 ? 'var(--success)' : 'var(--accent-primary)'} 
                                            strokeWidth="12" 
                                            fill="transparent" 
                                            r={radius} 
                                            cx="80" 
                                            cy="80" 
                                            style={{
                                                strokeDasharray: circumference,
                                                strokeDashoffset: strokeDashoffset,
                                                transition: 'stroke-dashoffset 1.5s ease-in-out',
                                                strokeLinecap: 'round'
                                            }}
                                        />
                                    </svg>
                                    <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{animPercent}%</span>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Overall Match</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
                                    {analysis.matchPercentage > 75 ? "You're a great fit!" : "You might need to upskill bits."}
                                </p>
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ animation: 'slideIn 0.5s ease forwards' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--success)', fontWeight: 600 }}>
                                        <CheckCircle size={20} /> You already have
                                    </h4>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {analysis.matchedSkills?.length > 0 ? analysis.matchedSkills?.map(s => <span key={s} className="tag tag-success" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{s}</span>) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                                    </div>
                                </div>

                                <div style={{ animation: 'slideIn 0.7s ease forwards' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--danger)', fontWeight: 600 }}>
                                        <AlertCircle size={20} /> You're missing
                                    </h4>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {analysis.missingSkills?.length > 0 ? analysis.missingSkills?.map(s => <span key={s} className="tag tag-danger" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{s}</span>) : <span className="tag tag-success">100% Match!</span>}
                                    </div>
                                </div>

                                {analysis.bonusSkills && analysis.bonusSkills?.length > 0 && (
                                    <div style={{ animation: 'slideIn 0.9s ease forwards' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                            <CheckCircle size={20} /> Bonus skills you have
                                        </h4>
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            {analysis.bonusSkills?.map(s => <span key={s} className="tag" style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.9rem', padding: '8px 16px' }}>{s}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Smart CV Tips Panel */}
                        {analysis.learningPath && analysis.learningPath?.length > 0 && (
                            <div className="glass-panel" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>How to upgrade your CV for this role</h3>
                                    <button onClick={downloadPDF} className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Download size={18} /> Download Full Gap Report as PDF
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {analysis.learningPath?.map(lp => (
                                        <div key={lp.skill} style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>{lp.skill}</h4>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><strong>Why it matters:</strong> {lp.whyItMatters}</p>
                                            
                                            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px dashed var(--accent-primary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontStyle: 'italic', color: 'var(--text-main)', margin: 0 }}>"{lp.cvTip}"</p>
                                                <button onClick={() => copyToClipboard(lp.cvTip)} className="btn btn-outline" style={{ padding: '8px', marginLeft: '16px' }} title="Copy CV Bullet">
                                                    <Copy size={16} />
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                <strong style={{ alignSelf: 'center', marginRight: '8px' }}>Learning Resources:</strong>
                                                {lp.links?.map((link, idx) => (
                                                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 12px', fontSize: '0.85rem' }}>
                                                        {link.type === 'video' ? <PlayCircle size={14} /> : <BookOpen size={14} />}
                                                        {link.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={handleApply} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                                Apply for this position anyway
                            </button>
                        </div>
                        
                        <style>{`
                            @keyframes slideIn {
                                from { opacity: 0; transform: translateX(-20px); }
                                to { opacity: 1; transform: translateX(0); }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        );
    }

    if (user?.role !== 'recruiter' && user?.role !== 'admin') {
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
                    {applications?.map(app => (
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
                                        {app.applicantId?.skills?.map(s => <span key={s} className="tag tag-success">{s}</span>)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ marginBottom: '12px', color: 'var(--danger)', fontSize: '0.95rem' }}>Missing Skills</h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {app.missingSkills?.length > 0 ? app.missingSkills?.map(s => <span key={s} className="tag tag-danger">{s}</span>) : <span className="tag tag-success">100% Match!</span>}
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'white', color: 'red' }}>
          <h2>Something went wrong in SkillAnalyzer.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

const SkillAnalyzerWithBoundary = (props) => (
    <ErrorBoundary>
        <SkillAnalyzer {...props} />
    </ErrorBoundary>
);

export default SkillAnalyzerWithBoundary;
