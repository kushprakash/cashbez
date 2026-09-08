import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PanAddFund = () => {
    const [amount, setAmount] = useState('');
    const [couponQty, setCouponQty] = useState('1');
    const [mpin, setMpin] = useState('');
    const [agentId, setAgentId] = useState('');
    const [agentInfo, setAgentInfo] = useState(null);
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);
    const [wallets, setWallets] = useState([]);
    const [utilityWallet, setUtilityWallet] = useState(null);
    const [refreshingBalance, setRefreshingBalance] = useState(false);

    // History state
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const apiService = ApiService();

    // Fetch Agent Status Function
    const fetchAgentStatus = useCallback(async () => {
        try {
            const res = await apiService.vGet('/api/pan-card/agent-status');
            if (res?.data?.status === 1 && res?.data?.data) {
                setAgentInfo(res.data.data);
                if (res.data.data.agent_id) {
                    setAgentId(res.data.data.agent_id);
                }
            }
        } catch (err) {
            console.error('Error fetching agent status:', err);
        }
    }, []);

    // Fetch Wallets Function
    const fetchWallets = useCallback(async () => {
        setRefreshingBalance(true);
        try {
            const res = await apiService.vGet('/api/accounts');
            let fetchedWallets = [];
            if (res.data && res.data.data && res.data.data.accounts) {
                fetchedWallets = res.data.data.accounts;
            } else if (res.data && res.data.accounts) {
                fetchedWallets = res.data.accounts;
            } else if (res.data && Array.isArray(res.data)) {
                fetchedWallets = res.data;
            }
            setWallets(fetchedWallets);

            // Auto select Utility Wallet (primary_status == false / 0)
            const util = fetchedWallets.find(
                acc => acc.primary_status === false || acc.primary_status === 0 || acc.primary_status === '0' || acc.primary_status === 'false'
            ) || fetchedWallets[0];

            setUtilityWallet(util);
        } catch (err) {
            console.error('Error fetching wallets:', err);
            toast.error('Failed to load wallet balance');
        } finally {
            setRefreshingBalance(false);
        }
    }, []);

    // Fetch Fund Request History
    const fetchHistory = useCallback(async (page = 1) => {
        setHistoryLoading(true);
        try {
            const res = await apiService.vGet(`/api/pan-card/fund-requests?page=${page}`);
            if (res?.data?.status === 1 && res?.data?.data) {
                const dataObj = res.data.data;
                setHistory(dataObj.data || []);
                setPagination({
                    current_page: dataObj.current_page || 1,
                    last_page: dataObj.last_page || 1,
                    total: dataObj.total || 0
                });
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWallets();
        fetchHistory(1);
        fetchAgentStatus();
    }, [fetchWallets, fetchHistory, fetchAgentStatus]);

    // Handle Submit Fund Request
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!utilityWallet) {
            toast.error('Utility wallet not found');
            return;
        }

        if (!amount || parseFloat(amount) < 1) {
            toast.error('Please enter a valid amount (Minimum ₹1)');
            return;
        }

        if (!agentId) {
            toast.error('Please enter or select a valid PSA Agent ID');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                mpin: mpin,
                agent_id: agentId
            };

            const response = await apiService.vPost('/api/pan-card/fund-request/create', payload);

            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'PAN Fund Request submitted successfully!');
                setAmount('');
                setMpin('');
                setRemark('');
                setCouponQty('1');
                fetchWallets(); // Refresh wallet balance
                fetchHistory(1); // Refresh history table
            } else {
                toast.error(response?.data?.message || 'Failed to submit fund request');
            }
        } catch (error) {
            console.error('Fund Request Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to submit fund request');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(num);
    };

    return (
        <>
            <Pageheader
                mainheading="PAN CARD Service"
                parentfolder="Online Services"
                activepage="PAN Add Fund"
            />

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="page-content-box p-3">
                <div className="container-fluid">
                    <div className="row g-4">

                        {/* LEFT COLUMN: ADD FUND FORM WITH AUTO UTILITY WALLET */}
                        <div className="col-lg-5 col-md-12">
                            <div className="card border-0 rounded-4 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-wallet2 text-primary me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                            Add Fund Request (UTI PSA)
                                        </h5>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-light border btn-sm rounded-circle p-0 shadow-xs"
                                        onClick={fetchWallets}
                                        disabled={refreshingBalance}
                                        title="Reload Balance"
                                        style={{ width: '28px', height: '28px' }}
                                    >
                                        <i className={`fa fa-refresh text-primary ${refreshingBalance ? 'fa-spin' : ''}`} style={{ fontSize: '12px' }}></i>
                                    </button>
                                </div>

                                <div className="card-body p-4">
                                    {/* UTILITY WALLET AUTO SELECTED DISPLAY BOX */}
                                    <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                        <div className="d-flex justify-content-between align-items-baseline">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '10px' }}>
                                                        UTILITY WALLET (AUTO SELECTED)
                                                    </span>
                                                </div>

                                                <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.6rem', color: '#0F172A' }}>
                                                    {formatCurrency(utilityWallet?.raw_available_balance ?? utilityWallet?.available_balance ?? utilityWallet?.balance)}
                                                </h3>
                                            </div>

                                            {utilityWallet?.number && (
                                                <div className="text-end">
                                                    <small className="text-muted d-block" style={{ fontSize: '10px' }}>Acc No.</small>
                                                    <span className="font-monospace fw-bold text-dark" style={{ fontSize: '12px' }}>
                                                        {utilityWallet.number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FORM */}
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                UTI PSA Agent ID <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control font-monospace fw-bold bg-light text-primary"
                                                value={agentId}
                                                readOnly
                                                placeholder="Agent ID"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Amount (₹) <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white fw-bold text-muted">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg fw-bold"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="Enter amount to request"
                                                    step="0.01"
                                                    min="1"
                                                    required
                                                    style={{ fontSize: '1.1rem' }}
                                                />
                                            </div>
                                        </div>


                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Transaction MPIN <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control font-monospace fw-bold"
                                                value={mpin}
                                                onChange={(e) => setMpin(e.target.value)}
                                                placeholder="Enter MPIN"
                                                maxLength="6"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm"
                                            disabled={loading}
                                            style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', border: 'none' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Processing Debit & Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-paper-plane me-2"></i>
                                                    Submit Fund Request
                                                </>
                                            )}
                                        </button>
                                    </form>

                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FUND REQUEST HISTORY TABLE */}
                        <div className="col-lg-7 col-md-12">
                            <div className="card border-0 rounded-4 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                        Fund Request History
                                    </h5>
                                    <small className="text-muted">Total Requests: {pagination.total}</small>
                                </div>

                                <div className="card-body p-0 table-responsive">
                                    {historyLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Loading history...</p>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fa fa-history fs-2 mb-2 text-secondary"></i>
                                            <p className="mb-0">No fund requests found.</p>
                                        </div>
                                    ) : (
                                        <table className="table align-middle table-hover mb-0" style={{ fontSize: '13px' }}>
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="py-2.5 px-3">TXN ID</th>
                                                    <th className="py-2.5 px-3">Amount</th>
                                                    <th className="py-2.5 px-3">Status</th>
                                                    <th className="py-2.5 px-3">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3">
                                                            <span className="fw-bold font-monospace text-dark d-block">
                                                                {item.txn_id}
                                                            </span>
                                                            {item.remark && (
                                                                <small className="text-muted d-block">{item.remark}</small>
                                                            )}
                                                        </td>


                                                        <td className="px-3 fw-bold text-primary">
                                                            {formatCurrency(item.amount)}
                                                        </td>

                                                        <td className="px-3">
                                                            {item.status === 0 && (
                                                                <span className="badge bg-warning text-dark px-2 py-1">
                                                                    Pending
                                                                </span>
                                                            )}
                                                            {item.status === 1 && (
                                                                <span className="badge bg-success px-2 py-1">
                                                                    Approved
                                                                </span>
                                                            )}
                                                            {item.status === 2 && (
                                                                <span className="badge bg-danger px-2 py-1" title={item.admin_remark || 'Refunded'}>
                                                                    Rejected (Refunded)
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-3 text-muted" style={{ fontSize: '11.5px' }}>
                                                            {new Date(item.created_at).toLocaleString('en-IN')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* PAGINATION FOOTER */}
                                {pagination.last_page > 1 && (
                                    <div className="card-footer bg-white border-top p-2.5 d-flex justify-content-between align-items-center">
                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                            disabled={pagination.current_page === 1}
                                            onClick={() => fetchHistory(pagination.current_page - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span className="text-muted" style={{ fontSize: '12px' }}>
                                            Page {pagination.current_page} of {pagination.last_page}
                                        </span>
                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                            disabled={pagination.current_page === pagination.last_page}
                                            onClick={() => fetchHistory(pagination.current_page + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default PanAddFund;
