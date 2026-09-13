import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const PassbookStatementView = () => {
    const api = ApiService();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [serviceFilter, setServiceFilter] = useState('');
    const [txnTypeFilter, setTxnTypeFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [selectedTxn, setSelectedTxn] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const fetchStatement = async () => {
        try {
            setLoading(true);
            let url = `/api/agent/financial/passbook?service_type=${serviceFilter}&txn_type=${txnTypeFilter}&from_date=${fromDate}&to_date=${toDate}`;
            const res = await api.vGet(url);
            if (res.data && res.data.status === 1) {
                setTransactions(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch passbook statement', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatement();
    }, [serviceFilter, txnTypeFilter, fromDate, toDate]);

    const handlePrintReceipt = (txn) => {
        setSelectedTxn(txn);
        setShowReceiptModal(true);
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-book-open text-primary me-2"></i> Passbook & Financial Statement
                    </h3>
                    <p className="text-muted mb-0">Scoped transaction statement, printable receipts & export tools</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm me-2">
                        <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                    </Link>
                    <button className="btn btn-outline-secondary" onClick={fetchStatement}>
                        <i className="bx bx-refresh me-1"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">Service Type</label>
                            <select className="form-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                                <option value="">All Services</option>
                                <option value="SAVING">SAVING</option>
                                <option value="DD">DD</option>
                                <option value="RD">RD</option>
                                <option value="FD">FD</option>
                                <option value="MIS">MIS</option>
                                <option value="MEMBERSHIP">MEMBERSHIP</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">Transaction Type</label>
                            <select className="form-select" value={txnTypeFilter} onChange={(e) => setTxnTypeFilter(e.target.value)}>
                                <option value="">All Types</option>
                                <option value="DEPOSIT">DEPOSIT</option>
                                <option value="WITHDRAWAL">WITHDRAWAL</option>
                                <option value="MEMBERSHIP_FEE">MEMBERSHIP FEE</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">From Date</label>
                            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">To Date</label>
                            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Statement Table */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Txn ID</th>
                                <th>Member Name</th>
                                <th>Account No</th>
                                <th>Service</th>
                                <th>Txn Type</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                                <th>Date</th>
                                <th className="text-end">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center py-4">Loading statement...</td></tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td className="fw-bold text-primary">{t.transaction_id}</td>
                                        <td className="fw-semibold">{t.member?.name || 'N/A'}</td>
                                        <td>{t.account?.account_number || 'N/A'}</td>
                                        <td><span className="badge bg-info">{t.service_type}</span></td>
                                        <td>
                                            <span className={`badge ${t.txn_type === 'DEPOSIT' ? 'bg-success' : 'bg-danger'}`}>
                                                {t.txn_type}
                                            </span>
                                        </td>
                                        <td className="fw-bold fs-6">₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td><span className="badge bg-secondary">{t.payment_mode}</span></td>
                                        <td className="small text-muted">{new Date(t.created_at).toLocaleString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handlePrintReceipt(t)}>
                                                <i className="bx bx-receipt me-1"></i> Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9" className="text-center py-4 text-muted">No transactions found for selected filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Printable Receipt Modal */}
            {showReceiptModal && selectedTxn && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold"><i className="bx bx-receipt me-2"></i> Financial Transaction Receipt</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReceiptModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-dark">
                                <div className="border border-2 border-primary p-4 rounded-3 text-center bg-light">
                                    <h3 className="fw-bold text-primary mb-1">TRANSACTION RECEIPT</h3>
                                    <p className="text-muted small mb-3">CashBez Financial Services</p>
                                    
                                    <div className="row g-2 text-start mb-3 border-top border-bottom py-2">
                                        <div className="col-6"><span className="text-muted small">Txn ID:</span> <strong className="d-block">{selectedTxn.transaction_id}</strong></div>
                                        <div className="col-6 text-end"><span className="text-muted small">Date:</span> <strong className="d-block">{new Date(selectedTxn.created_at).toLocaleDateString()}</strong></div>
                                        <div className="col-6"><span className="text-muted small">Member Name:</span> <strong className="d-block">{selectedTxn.member?.name}</strong></div>
                                        <div className="col-6 text-end"><span className="text-muted small">Account No:</span> <strong className="d-block">{selectedTxn.account?.account_number || 'N/A'}</strong></div>
                                    </div>

                                    <div className="my-3 py-2 bg-white rounded border">
                                        <span className="text-muted small d-block">Transaction Amount</span>
                                        <h2 className="fw-bold text-success mb-0">₹{parseFloat(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                                        <span className="badge bg-secondary mt-1">{selectedTxn.txn_type} • {selectedTxn.payment_mode}</span>
                                    </div>

                                    <p className="text-muted small mb-0">{selectedTxn.narration}</p>
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowReceiptModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                                    <i className="bx bx-printer me-1"></i> Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassbookStatementView;
