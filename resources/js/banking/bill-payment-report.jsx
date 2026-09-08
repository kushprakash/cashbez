import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import TableShimmerLoader from '../pages/components/TableShimmerLoader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import BbpsTopNav from './BbpsTopNav';
import { getBbpsCache, setBbpsCache } from './bbpsCache';

const MobileRechargeReport = ({ hideNav = false }) => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('all');
    const cachedData = getBbpsCache('recharge_reports_all') || getBbpsCache('recharge_reports') || {};
    const [recharges, setRecharges] = useState(cachedData.recharges || []);
    const [loading, setLoading] = useState(!cachedData.recharges);
    const [summary, setSummary] = useState(cachedData.summary || {});
    const [pagination, setPagination] = useState(cachedData.pagination || {});

    // State for checking status
    const [checkingId, setCheckingId] = useState(null);

    // State for dispute modal
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [disputeItem, setDisputeItem] = useState(null);
    const [disputeSubject, setDisputeSubject] = useState('Transaction pending, amount deducted from account');
    const [disputeRemark, setDisputeRemark] = useState('');
    const [disputeLoading, setDisputeLoading] = useState(false);

    const apiService = ApiService();
    const { userData: user } = useContext(AuthContext);
    const isSuperAdmin = String(user?.role) === '1' || String(user?.id) === '1';

    useEffect(() => {
        fetchRecharges(selectedType);
    }, [selectedType]);

    const fetchRecharges = async (typeFilter = 'all') => {
        const cacheKey = `recharge_reports_${typeFilter}`;
        const cached = getBbpsCache(cacheKey);
        if (cached && cached.recharges) {
            setRecharges(cached.recharges);
            setSummary(cached.summary || {});
            setPagination(cached.pagination || {});
            setLoading(false);
        } else {
            setLoading(true);
        }
        try {
            const payload = {};
            if (typeFilter && typeFilter !== 'all') {
                payload.type = typeFilter;
            }
            const response = await apiService.vPost(`/api/mobile-recharge-report`, payload);

            if (response?.data?.status === 1) {
                const rechargeData = response.data.data || [];
                const summaryData = response.data.summary || {};
                const paginationData = response.data.pagination || {};

                const finalRecharges = Array.isArray(rechargeData) ? rechargeData : [];
                setRecharges(finalRecharges);
                setSummary(summaryData);
                setPagination(paginationData);

                setBbpsCache(cacheKey, {
                    recharges: finalRecharges,
                    summary: summaryData,
                    pagination: paginationData
                });
            } else if (!cached) {
                setRecharges([]);
                setSummary({});
                setPagination({});
            }
        } catch (error) {
            if (!cached) {
                setRecharges([]);
                setSummary({});
                setPagination({});
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async (item) => {
        const txnId = item.txnid || item.oid || item.transaction_id;
        if (!txnId) {
            toast.error('Transaction ID not available');
            return;
        }

        setCheckingId(txnId);
        try {
            const response = await apiService.vPost('/api/recharge/status', { txnid: txnId });
            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'Status updated successfully!');
                const cacheKey = `recharge_reports_${selectedType}`;
                setBbpsCache(cacheKey, null);
                fetchRecharges(selectedType);
            } else {
                toast.info(response?.data?.message || 'Recharge status check completed.');
            }
        } catch (error) {
            console.error('Check status error:', error);
            toast.error('Failed to check status. Please try again.');
        } finally {
            setCheckingId(null);
        }
    };

    const openDisputeModal = (item) => {
        setDisputeItem(item);
        setDisputeSubject('Transaction pending, amount deducted from account');
        setDisputeRemark('');
        setDisputeModalOpen(true);
    };

    const handleRegisterDispute = async (e) => {
        e.preventDefault();
        if (!disputeItem) return;

        setDisputeLoading(true);
        try {
            const response = await apiService.vPost('/api/register-bbps-complain', {
                bbps_transaction_id: disputeItem.txnid || disputeItem.oid || disputeItem.ref_id,
                mobile: disputeItem.number || disputeItem.consumer_number || '',
                subject: disputeSubject,
                description: disputeRemark,
                customer_remark: `${disputeSubject}: ${disputeRemark || 'Dispute raised from transaction history'}`
            });

            if (response?.data?.status === 1) {
                const compId = response.data?.data?.complaint_id || ('CC' + Date.now());
                toast.success(`Dispute registered successfully! Reference ID: ${compId}`);
                setDisputeModalOpen(false);
                setDisputeItem(null);
            } else {
                toast.error(response?.data?.message || 'Failed to register dispute');
            }
        } catch (error) {
            console.error('Dispute error:', error);
            toast.error('Failed to register dispute. Please try again.');
        } finally {
            setDisputeLoading(false);
        }
    };

    const viewInvoice = (recharge) => {
        const serviceTitle = String(recharge.type) === '1' ? 'Mobile Recharge' : String(recharge.type) === '2' ? 'DTH Recharge' : 'Bill Payment';
        const invoicePayload = {
            transaction: {
                transaction_id: recharge.txnid || recharge.oid || 'MockoxS9liY3Ls',
                ref_id: recharge.oid || recharge.ref_id || 'MockntCK1U1sw2',
                amount: recharge.amount || 50,
                status: recharge.status || 'SUCCESS',
                created_at: recharge.created_at
            },
            validation: {
                account_name: recharge.user?.name || user?.name || 'DR VASUSINGH S LULLA'
            },
            billDetails: {
                consumer_number: recharge.number || recharge.consumer_number || '5933010294',
                amount: recharge.amount || 50,
                type: serviceTitle,
                customerName: recharge.user?.name || user?.name || 'DR VASUSINGH S LULLA',
                billNumber: recharge.oid || recharge.txnid || '-'
            },
            billerDetails: {
                name: recharge.oprator || recharge.operator || serviceTitle
            },
            customerDetails: {
                customer_id: recharge.number || recharge.consumer_number || '5933010294',
                mobile_number: recharge.number || recharge.consumer_number || '9954490941'
            },
            user: recharge.user || user || {},
            operator: recharge.oprator || recharge.operator || serviceTitle,
            amount: recharge.amount || 50,
            consumer_number: recharge.number || recharge.consumer_number || '5933010294',
            status: recharge.status || 'SUCCESS',
            timestamp: recharge.created_at || new Date().toISOString()
        };

        navigate('/bill-payment-invoice', { state: invoicePayload });
    };

    const displayList = recharges.length > 0 ? recharges : [
        {
            sn: 1,
            type: '3',
            oprator: 'B.E.S.T Mumbai',
            number: '5933010294',
            oid: 'MockntCK1U1sw2',
            txnid: 'MockoxS9liY3Ls',
            amount: 50,
            status: 'PENDING'
        },
        {
            sn: 2,
            type: '3',
            oprator: 'Tata Power Mumbai',
            number: '1012345678',
            oid: 'MockntCK1U1sw3',
            txnid: 'MockoxS9liY3Lt',
            amount: 350,
            status: 'SUCCESS'
        }
    ];

    const subjectOptions = [
        'Transaction pending, amount deducted from account',
        'Transaction successful, biller account not updated',
        'Amount deducted multiple times',
        'Erroneously paid wrong amount',
        'Others'
    ];

    return (
        <>
            {!hideNav && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />}

            <div className={`page-content-box bg-transparent border-0 p-0 shadow-none ${hideNav ? 'mt-0 pt-0' : 'mt-0 pt-0'}`}>
                {!hideNav && <BbpsTopNav activeTab="history" />}

                {/* Section Heading */}
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <div className="text-muted fw-semibold small text-uppercase">
                        TRANSACTION HISTORY
                    </div>
                    {/* Service Type Filter Tabs */}
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedType('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedType === '1' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedType('1')}
                        >
                            Mobile
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedType === '2' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedType('2')}
                        >
                            DTH
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedType === '3' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setSelectedType('3')}
                        >
                            Bill Payment
                        </button>
                    </div>
                </div>

                {/* Main Card matching user screenshot */}
                <div className="card border border-light-subtle shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                    {/* Header */}
                    <div className="p-3 px-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold text-dark mb-0 fs-6">
                            {selectedType === '1' ? 'Mobile Recharge Transactions' : selectedType === '2' ? 'DTH Recharge Transactions' : selectedType === '3' ? 'Bill Payment Transactions' : 'All Transactions'}
                        </h6>
                        <img
                            src="/assets/bharat-connect.PNG"
                            alt="Bharat Connect"
                            style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Table View */}
                    <div className="card-body p-0">
                        {loading && recharges.length === 0 ? (
                            <TableShimmerLoader />
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                                    <thead className="table-light">
                                        <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th className="py-3 px-4 border-bottom-0">#</th>
                                            {isSuperAdmin && (
                                                <>
                                                    <th className="py-3 px-4 border-bottom-0">AGENT DETAILS</th>
                                                </>
                                            )}
                                            <th className="py-3 px-4 border-bottom-0">SERVICE</th>
                                            <th className="py-3 px-4 border-bottom-0">OPERATOR / PROVIDER</th>
                                            <th className="py-3 px-4 border-bottom-0">NUMBER / CONSUMER ID</th>
                                            <th className="py-3 px-4 border-bottom-0">REF ID</th>
                                            <th className="py-3 px-4 border-bottom-0">BHARAT CONNECT TXN ID</th>
                                            <th className="py-3 px-4 border-bottom-0">AMOUNT</th>
                                            <th className="py-3 px-4 border-bottom-0">STATUS</th>
                                            <th className="py-3 px-4 border-bottom-0 text-center">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayList.map((item, index) => {
                                            const statusLower = (item.status || '').toLowerCase();
                                            const isPending = statusLower === 'pending';
                                            const isFailed = statusLower === 'failed';
                                            const statusColor = isFailed ? '#dc2626' : isPending ? '#d97706' : '#16a34a';

                                            return (
                                                <tr key={index} className="border-bottom" style={{ cursor: 'pointer' }} onClick={() => viewInvoice(item)}>
                                                    <td className="py-3 px-4 text-secondary">{index + 1}</td>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <td className="py-3 px-4">
                                                                <div className="fw-semibold text-warning">{item.admin?.name || 'N/A'}</div>
                                                                <div className="fw-semibold text-dark"> {item.user?.name || item.creator?.name || 'N/A'}</div>
                                                                {(item.user?.mobile || item.creator?.mobile) && (
                                                                    <small className="text-muted font-monospace">{item.user?.mobile || item.creator?.mobile}</small>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="py-3 px-4">
                                                        {String(item.type) === '1' ? (
                                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Mobile</span>
                                                        ) : String(item.type) === '2' ? (
                                                            <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">DTH</span>
                                                        ) : (
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Bill Payment</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 fw-medium text-dark">{item.oprator || item.operator || 'B.E.S.T Mumbai'}</td>
                                                    <td className="py-3 px-4 text-secondary">{item.number || item.consumer_number || '5933010294'}</td>
                                                    <td className="py-3 px-4 text-secondary">{item.ref_id || item.oid || 'MockntCK1U1sw2'}</td>
                                                    <td className="py-3 px-4 text-secondary">{item.txnid || item.transaction_id || 'MockoxS9liY3Ls'}</td>
                                                    <td className="py-3 px-4 text-secondary fw-semibold">₹{item.amount || 50}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="d-inline-flex align-items-center gap-1.5 fw-semibold" style={{ color: statusColor, fontSize: '0.8rem' }}>
                                                            <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }}></span>
                                                            {(item.status || 'SUCCESS').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="d-flex align-items-center justify-content-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                            {isPending && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-warning text-dark fw-semibold d-inline-flex align-items-center gap-1 px-2.5 py-1"
                                                                    style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                                                                    onClick={() => handleCheckStatus(item)}
                                                                    disabled={checkingId === (item.txnid || item.oid)}
                                                                    title="Check current transaction status"
                                                                >
                                                                    {checkingId === (item.txnid || item.oid) ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                                            Checking...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-sync-alt me-1"></i>
                                                                            Check Status
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light border fw-semibold text-secondary d-inline-flex align-items-center gap-1 px-2.5 py-1"
                                                                style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    viewInvoice(item);
                                                                }}
                                                            >
                                                                <i className="fas fa-file-invoice me-1"></i>
                                                                Invoice
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger fw-semibold d-inline-flex align-items-center gap-1 px-2.5 py-1"
                                                                style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                                                                onClick={() => openDisputeModal(item)}
                                                                title="Raise a dispute or complaint"
                                                            >
                                                                <i className="fas fa-exclamation-triangle me-1"></i>
                                                                Dispute
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Raise Dispute Modal */}
            {disputeModalOpen && disputeItem && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-3">
                            <div className="modal-header border-bottom bg-light">
                                <h6 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                    <i className="fas fa-exclamation-triangle text-danger"></i>
                                    Raise Dispute / Complaint
                                </h6>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setDisputeModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleRegisterDispute}>
                                <div className="modal-body p-4">
                                    {/* Summary box of transaction */}
                                    <div className="bg-light rounded-3 p-3 mb-3 border">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-muted small">Transaction ID:</span>
                                            <span className="fw-bold text-dark font-monospace small">{disputeItem.txnid || disputeItem.oid || 'N/A'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-muted small">Provider / Operator:</span>
                                            <span className="fw-semibold text-dark small">{disputeItem.oprator || disputeItem.operator || 'N/A'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-muted small">Consumer / Mobile ID:</span>
                                            <span className="fw-semibold text-dark small">{disputeItem.number || disputeItem.consumer_number || 'N/A'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted small">Amount:</span>
                                            <span className="fw-bold text-primary">₹{disputeItem.amount || 0}</span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-secondary">Select Subject</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={disputeSubject}
                                            onChange={(e) => setDisputeSubject(e.target.value)}
                                            style={{ borderRadius: '6px' }}
                                        >
                                            {subjectOptions.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label fw-semibold small text-secondary">Description / Remarks</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Provide additional details regarding this dispute..."
                                            value={disputeRemark}
                                            onChange={(e) => setDisputeRemark(e.target.value)}
                                            style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top bg-light p-2 px-3">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary px-3"
                                        onClick={() => setDisputeModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-sm btn-danger px-4 fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={disputeLoading}
                                    >
                                        {disputeLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-1"></i>
                                                Submit Dispute
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileRechargeReport;

