import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { Link } from 'react-router-dom';

const AgentFinancialDashboard = () => {
    const api = ApiService();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await api.vGet('/api/agent/financial/dashboard');
            if (res.data && res.data.status === 1) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch agent dashboard summary', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const kpis = summary?.kpis || {};
    const wallet = summary?.utility_wallet;

    return (
        <div className="container-fluid py-4">
            {/* Header Title */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-tachometer text-primary me-2"></i> Agent Financial Portal
                    </h3>
                    <p className="text-muted mb-0">Manage members, accounts, collections, deposits & withdrawals in one place</p>
                </div>

                {/* Utility Wallet Badge */}
                <div className="card shadow-sm border-0 bg-primary text-white p-3 mt-2 mt-md-0 rounded-3" style={{ minWidth: '260px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <span className="text-white-50 small fw-medium">Utility Wallet (primary_status=0)</span>
                            <h4 className="fw-bold text-white mb-0 mt-1">
                                ₹{wallet ? parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                            </h4>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-2 ms-3">
                            <i className="bx bx-wallet fs-3 text-white"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="row g-3 mb-4">
                <div className="col-lg-3 col-md-6">
                    <Link to="/agent/members" className="card border-0 shadow-sm rounded-3 bg-light hover-shadow text-decoration-none p-3 d-flex align-items-center flex-row">
                        <div className="bg-primary text-white rounded-3 p-3 me-3">
                            <i className="bx bx-user-plus fs-3"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold text-dark mb-1">Manage Members</h6>
                            <small className="text-muted">Register member & KYC</small>
                        </div>
                    </Link>
                </div>
                <div className="col-lg-3 col-md-6">
                    <Link to="/agent/saving-accounts" className="card border-0 shadow-sm rounded-3 bg-light hover-shadow text-decoration-none p-3 d-flex align-items-center flex-row">
                        <div className="bg-success text-white rounded-3 p-3 me-3">
                            <i className="bx bx-wallet-alt fs-3"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold text-dark mb-1">Saving Accounts</h6>
                            <small className="text-muted">Open account & deposit</small>
                        </div>
                    </Link>
                </div>
                <div className="col-lg-3 col-md-6">
                    <Link to="/agent/saving-accounts" className="card border-0 shadow-sm rounded-3 bg-light hover-shadow text-decoration-none p-3 d-flex align-items-center flex-row">
                        <div className="bg-danger text-white rounded-3 p-3 me-3">
                            <i className="bx bx-money-withdraw fs-3"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold text-dark mb-1">Mobile OTP Withdrawal</h6>
                            <small className="text-muted">Registered mobile OTP</small>
                        </div>
                    </Link>
                </div>
                <div className="col-lg-3 col-md-6">
                    <Link to="/agent/kyc-pending" className="card border-0 shadow-sm rounded-3 bg-light hover-shadow text-decoration-none p-3 d-flex align-items-center flex-row">
                        <div className="bg-warning text-dark rounded-3 p-3 me-3">
                            <i className="bx bx-id-card fs-3"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold text-dark mb-1">KYC Pending</h6>
                            <small className="text-muted">Review pending KYC</small>
                        </div>
                    </Link>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-primary text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Total Members</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">{loading ? '...' : kpis.total_members ?? 0}</h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-group fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-success text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Active Saving Accounts</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">{loading ? '...' : kpis.saving_accounts ?? 0}</h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-credit-card fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-info text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Today's Total Deposit</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">₹{loading ? '...' : (kpis.today_deposit ?? 0).toLocaleString()}</h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-down-arrow-circle fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 bg-gradient bg-danger text-white">
                        <div className="card-body p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <span className="text-white-50 small fw-medium">Today's Total Withdrawal</span>
                                <h3 className="fw-bold text-white mb-0 mt-1">₹{loading ? '...' : (kpis.today_withdrawal ?? 0).toLocaleString()}</h3>
                            </div>
                            <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                <i className="bx bx-up-arrow-circle fs-2 text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables: Recent Transactions & Recent Members */}
            <div className="row g-4">
                {/* Recent Transactions */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold text-dark">
                                <i className="bx bx-list-ul text-primary me-2"></i> Recent Financial Transactions
                            </h6>
                            <button className="btn btn-sm btn-outline-primary" onClick={fetchSummary}>
                                <i className="bx bx-refresh"></i> Refresh
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Txn ID</th>
                                        <th>Member</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Mode</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-4">Loading transactions...</td></tr>
                                    ) : summary?.recent_transactions?.length > 0 ? (
                                        summary.recent_transactions.map((t) => (
                                            <tr key={t.id}>
                                                <td className="fw-bold text-primary">{t.transaction_id}</td>
                                                <td>{t.member?.name || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${t.txn_type === 'DEPOSIT' ? 'bg-success' : 'bg-danger'}`}>
                                                        {t.txn_type}
                                                    </span>
                                                </td>
                                                <td className="fw-bold">₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                <td><span className="badge bg-secondary">{t.payment_mode}</span></td>
                                                <td className="small text-muted">{new Date(t.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Members */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold text-dark">
                                <i className="bx bx-user text-primary me-2"></i> Recently Joined Members
                            </h6>
                            <Link to="/agent/members" className="btn btn-sm btn-link text-decoration-none">View All</Link>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {loading ? (
                                    <li className="list-group-item text-center py-3 text-muted">Loading members...</li>
                                ) : summary?.recent_members?.length > 0 ? (
                                    summary.recent_members.map((m) => (
                                        <li key={m.id} className="list-group-item p-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0 fw-bold text-dark">{m.name}</h6>
                                                <small className="text-muted">{m.member_id} • {m.mobile}</small>
                                            </div>
                                            <span className={`badge ${m.kyc_status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                KYC: {m.kyc_status}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-center py-3 text-muted">No members registered yet</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentFinancialDashboard;
