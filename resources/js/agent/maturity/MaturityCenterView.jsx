import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const MaturityCenterView = () => {
    const api = ApiService();
    const [maturities, setMaturities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMaturities = async () => {
        try {
            setLoading(true);
            const res = await api.vGet('/api/agent/financial/maturities');
            if (res.data && res.data.status === 1) {
                setMaturities(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch maturities', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaturities();
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-time-five text-danger me-2"></i> Maturity & Settlement Center
                    </h3>
                    <p className="text-muted mb-0">Track matured DD, RD, FD & MIS accounts and request payout settlements</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-outline-primary" onClick={fetchMaturities}>
                        <i className="bx bx-refresh me-1"></i> Refresh
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Account No</th>
                                <th>Member Name</th>
                                <th>Service</th>
                                <th>Principal</th>
                                <th>Interest Earned</th>
                                <th>Final Amount</th>
                                <th>Maturity Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-4">Loading maturities...</td></tr>
                            ) : maturities.length > 0 ? (
                                maturities.map((m) => (
                                    <tr key={m.id}>
                                        <td className="fw-bold text-primary">{m.account?.account_number || 'N/A'}</td>
                                        <td className="fw-semibold">{m.member?.name || 'N/A'}</td>
                                        <td><span className="badge bg-info">{m.service_type}</span></td>
                                        <td className="fw-bold">₹{parseFloat(m.principal).toFixed(2)}</td>
                                        <td className="fw-bold text-success">₹{parseFloat(m.interest_earned).toFixed(2)}</td>
                                        <td className="fw-bold text-dark fs-6">₹{parseFloat(m.final_amount).toFixed(2)}</td>
                                        <td>{m.maturity_date}</td>
                                        <td><span className="badge bg-warning text-dark">{m.status}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No matured accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MaturityCenterView;
