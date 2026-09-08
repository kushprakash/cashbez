import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import BbpsTopNav from './BbpsTopNav';
import MobileRecharge from './mobilerecharge';
import DTHRecharge from './dth-recharge';
import MobileRechargeReport from './bill-payment-report';
import BillSearchTransaction from './bill-search-transaction';
import BillPaymentInvoice from './BillPaymentInvoice';
import { getBbpsCache, setBbpsCache, preloadIcons } from './bbpsCache';
import {
    TbDeviceMobile,
    TbSatellite,
    TbBulb,
    TbCreditCard,
    TbWifi,
    TbBarrierBlock,
    TbDeviceTv,
    TbReceipt,
    TbGasStation,
    TbDroplet
} from 'react-icons/tb';

const formatCategoryTitle = (categoryObj) => {
    const raw = categoryObj?.category_name || categoryObj?.name || categoryObj?.category || '';
    if (!raw) return '';
    return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatCategorySubtitle = (categoryObj) => {
    if (categoryObj?.subtitle) return categoryObj.subtitle;
    if (categoryObj?.description) return categoryObj.description;

    const clean = (categoryObj?.category || '').toLowerCase();
    if (clean.includes('mobile') || clean.includes('dth')) return '0 FEE';
    if (clean.includes('subscription') || clean.includes('ott')) return 'Zee5, HotStar, more';
    if (clean.includes('pay bill') || clean.includes('all')) return 'All Services';
    return 'Bill Payment';
};

const getCategoryIconFallback = (categoryStr) => {
    const clean = (categoryStr || '').toLowerCase();

    if (clean.includes('pay bill') || clean.includes('pay_bill') || clean.includes('bill payment') || clean.includes('all services') || clean.includes('bbps')) {
        return (
            <img
                src="/assets/b-icon.png"
                alt="Pay Bill Payments"
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
        );
    }

    let IconComponent = TbReceipt;
    if (clean.includes('mobile')) IconComponent = TbDeviceMobile;
    else if (clean.includes('dth')) IconComponent = TbSatellite;
    else if (clean.includes('electricity') || clean.includes('power')) IconComponent = TbBulb;
    else if (clean.includes('credit')) IconComponent = TbCreditCard;
    else if (clean.includes('broadband') || clean.includes('wifi') || clean.includes('internet')) IconComponent = TbWifi;
    else if (clean.includes('fastag') || clean.includes('fasttag') || clean.includes('toll')) IconComponent = TbBarrierBlock;
    else if (clean.includes('subscription') || clean.includes('ott') || clean.includes('tv')) IconComponent = TbDeviceTv;
    else if (clean.includes('gas')) IconComponent = TbGasStation;
    else if (clean.includes('water')) IconComponent = TbDroplet;

    return <IconComponent size={34} style={{ color: '#2563eb', strokeWidth: 1.5 }} />;
};

const getDynamicFieldLabel = (categoryObj, billerObj) => {
    // 1. Check biller custom label from DB
    if (billerObj?.label && String(billerObj.label).trim() !== '') return billerObj.label;
    if (billerObj?.param_name && String(billerObj.param_name).trim() !== '') return billerObj.param_name;

    // 2. Check category label column directly from bbps_category table in DB
    if (categoryObj?.label && String(categoryObj.label).trim() !== '') {
        return categoryObj.label;
    }

    // 3. Smart fallbacks if label column in DB is null or empty
    const raw = (categoryObj?.name || categoryObj?.category || categoryObj?.category_name || '').trim();
    if (raw) {
        const lower = raw.toLowerCase();
        if (lower.includes('mobile') || lower.includes('recharge')) return 'Mobile Number';
        if (lower.includes('electricity') || lower.includes('power')) return 'Consumer Number';
        if (lower.includes('dth') || lower.includes('tv')) return 'Subscriber ID';
        if (lower.includes('water')) return 'Connection ID';
        if (lower.includes('gas')) return 'Customer ID';
        if (lower.includes('number') || lower.includes('id') || lower.includes('code')) return raw;
        return `${raw} Number`;
    }

    return 'Consumer Number';
};

const getDynamicFieldPlaceholder = (categoryObj, billerObj) => {
    if (billerObj?.placeholder && String(billerObj.placeholder).trim() !== '') return billerObj.placeholder;
    if (categoryObj?.placeholder && String(categoryObj.placeholder).trim() !== '') return categoryObj.placeholder;

    const label = getDynamicFieldLabel(categoryObj, billerObj);
    return `Enter ${label}`;
};

const renderCategoryIcon = (categoryObj) => {
    const categoryName = categoryObj?.category || categoryObj?.category_name || categoryObj?.name || '';
    const cleanName = String(categoryName).toLowerCase().trim();
    const iconUrl = categoryObj?.biller_icon || categoryObj?.icon;

    if (cleanName.includes('pay bill') || cleanName.includes('pay_bill') || cleanName.includes('bill payment') || cleanName.includes('all services') || cleanName.includes('bbps')) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                <img
                    src="/assets/b-icon.png"
                    alt="Pay Bill Payments"
                    style={{ maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                />
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
            {iconUrl ? (
                <img
                    src={iconUrl}
                    alt={categoryName}
                    style={{ maxWidth: '38px', maxHeight: '38px', objectFit: 'contain' }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex';
                        }
                    }}
                />
            ) : null}
            <div
                className="align-items-center justify-content-center"
                style={{ display: iconUrl ? 'none' : 'flex' }}
            >
                {getCategoryIconFallback(categoryName)}
            </div>
        </div>
    );
};

const shouldHideMobileField = (categoryObj) => {
    if (!categoryObj) return false;

    // Database column property checks from bbps_category table
    if (categoryObj.mobile_required !== undefined && categoryObj.mobile_required !== null) {
        return Number(categoryObj.mobile_required) === 0;
    }
    if (categoryObj.is_mobile_required !== undefined && categoryObj.is_mobile_required !== null) {
        return Number(categoryObj.is_mobile_required) === 0;
    }
    if (categoryObj.show_mobile !== undefined && categoryObj.show_mobile !== null) {
        return Number(categoryObj.show_mobile) === 0;
    }
    if (categoryObj.has_mobile !== undefined && categoryObj.has_mobile !== null) {
        return Number(categoryObj.has_mobile) === 0;
    }

    return false;
};

const StepHeader = ({ title, subtitle, icon, onBack, onClose, showBack = true }) => {
    return (
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white rounded-top-3">
            <div className="d-flex align-items-center flex-grow-1 me-3">
                {showBack && onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="btn btn-sm btn-icon btn-outline-secondary me-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        title="Back"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}
                {icon && <div className="me-3 flex-shrink-0">{icon}</div>}
                <div className="flex-grow-1 overflow-hidden">
                    <h5 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '1.1rem' }}>
                        {title}
                    </h5>
                    {subtitle && (
                        <p className="mb-0 text-muted small text-truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="d-flex align-items-center flex-shrink-0 gap-3">
                <img
                    src="/assets/bharat-connect.PNG"
                    alt="Bharat Connect"
                    style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                />
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-icon btn-light text-dark d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        title="Close"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};



const BbpsComplaintView = () => {
    const { userData, user } = useContext(AuthContext);
    const userRole = parseInt(userData?.role || user?.role || 0);

    const [regTxnId, setRegTxnId] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [subject, setSubject] = useState('Transaction successful, account not updated');
    const [description, setDescription] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    const [trackId, setTrackId] = useState('');
    const [trackLoading, setTrackLoading] = useState(false);
    const [complaintStatus, setComplaintStatus] = useState(null);

    // Search and Status Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState('ALL'); // ALL, PENDING, OPEN, RESOLVED, CLOSED

    // Modal state for Super Admin Solve Ticket
    const [solveModalOpen, setSolveModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [solveStatus, setSolveStatus] = useState('RESOLVED');
    const [solveRemark, setSolveRemark] = useState('');
    const [solveLoading, setSolveLoading] = useState(false);

    const defaultComplaintsList = [
        {
            complaint_id: 'CC1713966509',
            transaction_id: 'MockoxS9liY3Ls',
            subject: 'Transaction successful, account not updated',
            created_at: '2026-07-30 12:45:10',
            status: 'UNRESOLVED',
            assigned_to: 'BBPS Resolution Team',
            customer_remark: 'Transaction successful, account not updated: Bill payment was completed but status not updated.',
            admin_remark: 'Complaint registered. Under investigation by BBPS Team.',
            user_mid: 'MID1001',
            user_name: 'Sample Merchant'
        }
    ];

    const [complaints, setComplaints] = useState(() => getBbpsCache('bbps_complaints_list') || defaultComplaintsList);

    const apiService = ApiService();

    useEffect(() => {
        fetchComplaintsFromDb();
    }, []);

    const fetchComplaintsFromDb = async () => {
        try {
            const res = await apiService.vGet('/api/get-bbps-complaints');
            if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
                setComplaints(res.data.data);
                setBbpsCache('bbps_complaints_list', res.data.data);
            }
        } catch (e) {
            console.log('Using cached complaints list');
        }
    };

    const subjectOptions = [
        'Transaction successful, account not updated',
        'Amount deducted, biller account credited but transaction id not received',
        'Amount deducted, biller account not credited and transaction ID not received',
        'Amount deducted multiple times',
        'Double payment updated',
        'Erroneously paid in wrong amount',
        'Others, Provide details in description'
    ];

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regTxnId && !regMobile) {
            toast.error('Please enter Transaction Reference ID or Mobile Number');
            return;
        }

        setRegLoading(true);
        try {
            const response = await apiService.vPost('/api/register-bbps-complain', {
                bbps_transaction_id: regTxnId,
                mobile: regMobile,
                subject: subject,
                description: description,
                customer_remark: `${subject}: ${description}`
            });

            if (response.data && response.data.status === 1) {
                toast.success('Complaint registered successfully in database!');
                fetchComplaintsFromDb();
                const compData = response.data.data || {};
                const cId = compData.complaint_id || ('CC' + (compData.id || Date.now()));
                setTrackId(cId);
                setComplaintStatus({
                    complaint_id: cId,
                    complaint_assigned: 'BBPS Resolution Team',
                    customer_remark: `${subject}: ${description}`,
                    admin_remark: 'Complaint registered. Under review by support team.',
                    status: compData.status || 'UNRESOLVED'
                });
            } else {
                toast.error(response.data?.message || 'Failed to register complaint');
            }
            setRegTxnId('');
            setRegMobile('');
            setDescription('');
        } catch (error) {
            toast.error('Error registering complaint');
        } finally {
            setRegLoading(false);
        }
    };

    const handleTrack = async (e, searchId = null) => {
        if (e) e.preventDefault();
        const idToSearch = searchId || trackId;
        if (!idToSearch) {
            toast.error('Please enter Complaint Id');
            return;
        }

        setTrackLoading(true);
        try {
            const response = await apiService.vPost('/api/track-bbps-complain', {
                complaint_id: idToSearch
            });

            if (response.data && response.data.status === 1) {
                setComplaintStatus(response.data.data);
                setTrackId(response.data.data.complaint_id || idToSearch);
                toast.success('Complaint status fetched from database');
            } else {
                toast.error(response.data?.message || 'Complaint not found');
            }
        } catch (error) {
            toast.error('Failed to track complaint');
        } finally {
            setTrackLoading(false);
        }
    };

    const handleOpenSolveModal = (item) => {
        setSelectedTicket(item);
        setSolveStatus(item.status || 'RESOLVED');
        setSolveRemark(item.admin_remark || 'Issue resolved by support admin.');
        setSolveModalOpen(true);
    };

    const handleSaveTicketStatus = async (e) => {
        e.preventDefault();
        if (!selectedTicket) return;
        setSolveLoading(true);
        try {
            const response = await apiService.vPost('/api/update-bbps-complain-status', {
                complaint_id: selectedTicket.complaint_id || selectedTicket.id,
                status: solveStatus,
                admin_remark: solveRemark
            });

            if (response.data && response.data.status === 1) {
                toast.success(`Complaint Ticket ${selectedTicket.complaint_id} updated successfully!`);
                setSolveModalOpen(false);
                setSelectedTicket(null);
                fetchComplaintsFromDb();
            } else {
                toast.error(response.data?.message || 'Failed to update ticket status');
            }
        } catch (error) {
            toast.error('Error updating complaint ticket');
        } finally {
            setSolveLoading(false);
        }
    };

    // Filtered Complaints based on Status Tab & Search Query
    const filteredComplaints = useMemo(() => {
        return complaints.filter((item) => {
            const s = (item.status || 'UNRESOLVED').toUpperCase();

            if (statusTab === 'PENDING' && !(s === 'UNRESOLVED' || s === 'PENDING')) return false;
            if (statusTab === 'OPEN' && s !== 'OPEN') return false;
            if (statusTab === 'RESOLVED' && s !== 'RESOLVED') return false;
            if (statusTab === 'CLOSED' && s !== 'CLOSED') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchId = (item.complaint_id || '').toLowerCase().includes(q);
                const matchTxn = (item.transaction_id || '').toLowerCase().includes(q);
                const matchMobile = (item.mobile || '').toLowerCase().includes(q);
                const matchSubject = (item.subject || item.customer_remark || '').toLowerCase().includes(q);
                const matchMid = (item.user_mid || '').toLowerCase().includes(q);
                const matchName = (item.user_name || '').toLowerCase().includes(q);

                if (!matchId && !matchTxn && !matchMobile && !matchSubject && !matchMid && !matchName) {
                    return false;
                }
            }

            return true;
        });
    }, [complaints, statusTab, searchQuery]);

    const pendingCount = useMemo(() => {
        return complaints.filter(c => {
            const s = (c.status || '').toUpperCase();
            return s === 'UNRESOLVED' || s === 'PENDING';
        }).length;
    }, [complaints]);

    return (
        <div className="w-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold text-secondary mb-0">COMPLAINT & TRACKING</h5>
                    <small className="text-muted">Register, track & manage BBPS utility complaint tickets</small>
                </div>
                <img
                    src="/assets/bharat-connect.PNG"
                    alt="Bharat Connect"
                    style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
                />
            </div>

            <div className="row g-4">
                {/* Register Complaint Card */}
                <div className="col-lg-6 col-md-12">
                    <div className="card border shadow-sm rounded-3 overflow-hidden bg-white h-100">
                        <div className="card-header bg-white border-bottom p-3">
                            <h6 className="fw-bold text-dark mb-0">Register Complaint</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleRegister}>
                                <div className="form-check mb-3">
                                    <input className="form-check-input" type="radio" checked readOnly id="txnRadio" />
                                    <label className="form-check-label fw-semibold text-dark" htmlFor="txnRadio">
                                        Transaction
                                    </label>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-medium">Transaction Reference Id</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="MockntCK1U1sw2"
                                        value={regTxnId}
                                        onChange={(e) => setRegTxnId(e.target.value)}
                                        style={{ borderRadius: '6px', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div className="text-center text-muted fw-bold small my-2">OR</div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-medium">Mobile Number</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-light text-muted" style={{ fontSize: '0.95rem' }}>+91</span>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="Mobile Number"
                                            value={regMobile}
                                            onChange={(e) => setRegMobile(e.target.value)}
                                            style={{ borderRadius: '0 6px 6px 0', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label text-secondary small fw-medium">From Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-secondary small fw-medium">To Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-medium">Select Subject</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        style={{ borderRadius: '6px', fontSize: '0.9rem' }}
                                    >
                                        {subjectOptions.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-secondary small fw-medium">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Write Complaint Description Here"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ borderRadius: '6px' }}
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2"
                                        disabled={regLoading}
                                        style={{ borderRadius: '6px', fontWeight: '600' }}
                                    >
                                        {regLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Registering...
                                            </>
                                        ) : (
                                            <>
                                                <iconify-icon icon="material-symbols:edit-document-outline" width="18" height="18"></iconify-icon>
                                                Register Complaint
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Track Complaint Card */}
                <div className="col-lg-6 col-md-12">
                    <div className="card border shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h6 className="fw-bold text-dark mb-0">Track Complaint</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleTrack}>
                                <div className="form-check mb-3">
                                    <input className="form-check-input" type="radio" checked readOnly id="trackRadio" />
                                    <label className="form-check-label fw-semibold text-dark" htmlFor="trackRadio">
                                        Transaction
                                    </label>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-medium">Complaint Id</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        placeholder="Complaint Id"
                                        value={trackId}
                                        onChange={(e) => setTrackId(e.target.value)}
                                        style={{ borderRadius: '6px', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2"
                                        disabled={trackLoading}
                                        style={{ borderRadius: '6px', fontWeight: '600' }}
                                    >
                                        {trackLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <iconify-icon icon="material-symbols:visibility-outline" width="18" height="18"></iconify-icon>
                                                Track Complaint Status
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {complaintStatus && (
                        <div className="card border border-primary border-opacity-25 shadow-sm rounded-3 overflow-hidden bg-white">
                            <div className="card-header bg-primary bg-opacity-10 border-bottom p-3">
                                <h6 className="fw-bold text-primary mb-0">Complaint Status Details</h6>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-6">
                                        <small className="text-muted d-block fw-semibold mb-1">Complaint Id</small>
                                        <span className="fw-bold text-dark">{complaintStatus.complaint_id || complaintStatus.id}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block fw-semibold mb-1">Assigned To</small>
                                        <span className="fw-bold text-dark">{complaintStatus.complaint_assigned || complaintStatus.assigned_to || 'BBPS Resolution Team'}</span>
                                    </div>
                                    <div className="col-12">
                                        <small className="text-muted d-block fw-semibold mb-1">Customer Remark</small>
                                        <span className="fw-medium text-dark">{complaintStatus.customer_remark || complaintStatus.subject || 'Complaint registered'}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block fw-semibold mb-1">Resolution Remark</small>
                                        <span className="fw-medium text-dark">{complaintStatus.admin_remark || 'Under review by BBPS Resolution Team.'}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block fw-semibold mb-1">Complaint Status</small>
                                        <span className={`badge ${complaintStatus.status === 'RESOLVED' ? 'bg-success text-white' : complaintStatus.status === 'OPEN' ? 'bg-info text-white' : complaintStatus.status === 'CLOSED' ? 'bg-secondary text-white' : 'bg-warning text-dark'}`}>
                                            {complaintStatus.status || 'UNRESOLVED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Registered Complaints History Table */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border shadow-sm rounded-3 overflow-hidden bg-white">
                        <div className="card-header bg-white border-bottom p-3 px-4 flex-wrap d-flex justify-content-between align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="fw-bold text-dark mb-0 fs-6">Registered Complaints History</h6>
                                <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '0.75rem' }}>{complaints.length} Total</span>
                                {pendingCount > 0 && (
                                    <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: '0.75rem' }}>{pendingCount} Pending</span>
                                )}
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                {/* Search input */}
                                <div className="input-group input-group-sm" style={{ width: '240px' }}>
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa fa-search text-muted" style={{ fontSize: '11px' }}></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Search by ID, Txn, User, Mobile..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                    {searchQuery && (
                                        <button className="btn btn-outline-secondary border-start-0 px-2" onClick={() => setSearchQuery('')}>
                                            <i className="fa fa-times" style={{ fontSize: '10px' }}></i>
                                        </button>
                                    )}
                                </div>

                                {/* Status Filter Tabs */}
                                <div className="btn-group btn-group-sm" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('ALL')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'PENDING' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('PENDING')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Pending ({pendingCount})
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'PROCESSING' ? 'btn-info text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('PROCESSING')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Processing
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'RESOLVED' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('RESOLVED')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Resolved
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'REJECTED' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('REJECTED')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Rejected
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${statusTab === 'CLOSED' ? 'btn-dark' : 'btn-outline-secondary'}`}
                                        onClick={() => setStatusTab('CLOSED')}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Closed
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                                    <thead className="table-light">
                                        <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th className="py-3 px-4">#</th>
                                            <th className="py-3 px-4">COMPLAINT ID</th>
                                            <th className="py-3 px-4">USER / AGENT</th>
                                            <th className="py-3 px-4">TRANSACTION REF ID</th>
                                            <th className="py-3 px-4">CUSTOMER REMARK</th>
                                            <th className="py-3 px-4">ADMIN REMARK</th>
                                            <th className="py-3 px-4">DATE & TIME</th>
                                            <th className="py-3 px-4">STATUS</th>
                                            <th className="py-3 px-4 text-end">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredComplaints.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center py-4 text-muted">
                                                    <i className="fa fa-inbox me-2"></i>No complaints found for current filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredComplaints.map((item, idx) => {
                                                const s = (item.status || 'UNRESOLVED').toUpperCase();
                                                const badgeClass =
                                                    s === 'RESOLVED' ? 'bg-success text-white' :
                                                    s === 'OPEN' ? 'bg-info text-white' :
                                                    s === 'CLOSED' ? 'bg-secondary text-white' : 'bg-warning text-dark';

                                                return (
                                                    <tr key={idx} className="border-bottom">
                                                        <td className="py-3 px-4 text-secondary">{idx + 1}</td>
                                                        <td className="py-3 px-4 fw-bold text-primary">{item.complaint_id}</td>
                                                        <td className="py-3 px-4">
                                                            {item.user_name || item.user_mid ? (
                                                                <div>
                                                                    <span className="badge bg-primary-subtle text-primary fw-bold font-monospace" style={{ fontSize: '10px' }}>
                                                                        {item.user_mid || 'USER'}
                                                                    </span>
                                                                    <div className="fw-semibold text-dark small">{item.user_name || '—'}</div>
                                                                    <small className="text-muted">{item.user_mobile || item.mobile || ''}</small>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted small">{item.mobile || '—'}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 font-monospace text-secondary" style={{ fontSize: '0.8rem' }}>
                                                            {item.transaction_id || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-dark fw-medium" style={{ maxWidth: '200px' }}>
                                                            <div className="text-truncate" title={item.customer_remark || item.subject}>
                                                                {item.customer_remark || item.subject || 'Bill Payment Issue'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-secondary" style={{ maxWidth: '200px' }}>
                                                            <div className="text-truncate" title={item.admin_remark}>
                                                                {item.admin_remark || '—'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                                            {item.created_at || 'Just now'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`badge ${badgeClass} px-2 py-1`}>
                                                                {s}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-end" style={{ whiteSpace: 'nowrap' }}>
                                                            <div className="d-inline-flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                                                                    onClick={() => handleTrack(null, item.complaint_id)}
                                                                    style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                                                                    title="Track status details"
                                                                >
                                                                    <iconify-icon icon="material-symbols:visibility-outline" width="14" height="14"></iconify-icon>
                                                                    Track
                                                                </button>

                                                                {(userRole === 1 || userRole === 2) && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success px-2 py-1 fw-semibold text-white d-inline-flex align-items-center gap-1"
                                                                        onClick={() => handleOpenSolveModal(item)}
                                                                        style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                                                                        title="Solve ticket & update remarks"
                                                                    >
                                                                        <iconify-icon icon="material-symbols:task-alt" width="14" height="14"></iconify-icon>
                                                                        Solve Ticket
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Solve Ticket Modal for Super Admin */}
            {solveModalOpen && selectedTicket && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-3">
                            <div className="modal-header bg-primary text-white p-3">
                                <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
                                    <iconify-icon icon="material-symbols:task-alt" width="20" height="20"></iconify-icon>
                                    Solve / Update Complaint Ticket #{selectedTicket.complaint_id}
                                </h6>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setSolveModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveTicketStatus}>
                                <div className="modal-body p-4">
                                    {/* Ticket Context Box */}
                                    <div className="p-3 bg-light rounded-3 border mb-4">
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <small className="text-muted d-block fw-semibold">Complaint ID</small>
                                                <span className="fw-bold text-primary font-monospace">{selectedTicket.complaint_id}</span>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted d-block fw-semibold">Txn Reference ID</small>
                                                <span className="fw-semibold text-dark font-monospace">{selectedTicket.transaction_id || 'N/A'}</span>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted d-block fw-semibold">User / Mobile</small>
                                                <span className="fw-semibold text-dark">
                                                    {selectedTicket.user_name || selectedTicket.user_mid ? `${selectedTicket.user_name || ''} (${selectedTicket.user_mid || ''})` : selectedTicket.mobile}
                                                </span>
                                            </div>
                                            <div className="col-12">
                                                <small className="text-muted d-block fw-semibold">Customer Remark / Issue</small>
                                                <span className="fw-medium text-dark">{selectedTicket.customer_remark || selectedTicket.subject}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Selector */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark">Select Complaint Status</label>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {[
                                                { key: 'PENDING', label: '⏳ PENDING', color: 'btn-outline-warning', activeColor: 'btn-warning text-dark' },
                                                { key: 'PROCESSING', label: '⚙️ PROCESSING', color: 'btn-outline-info', activeColor: 'btn-info text-white' },
                                                { key: 'RESOLVED', label: '✓ RESOLVED (Solved)', color: 'btn-outline-success', activeColor: 'btn-success text-white' },
                                                { key: 'REJECTED', label: '❌ REJECTED', color: 'btn-outline-danger', activeColor: 'btn-danger text-white' },
                                                { key: 'CLOSED', label: '🔒 CLOSED', color: 'btn-outline-secondary', activeColor: 'btn-secondary text-white' }
                                            ].map(st => (
                                                <button
                                                    key={st.key}
                                                    type="button"
                                                    className={`btn ${solveStatus === st.key ? st.activeColor : st.color} fw-bold px-3 py-2`}
                                                    onClick={() => setSolveStatus(st.key)}
                                                    style={{ borderRadius: '6px', fontSize: '0.85rem' }}
                                                >
                                                    {st.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resolution Remarks */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark">Admin Resolution Remarks</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Enter detailed resolution remarks (e.g., Transaction status verified with BBPS operator, refund issued, or issue solved)."
                                            value={solveRemark}
                                            onChange={(e) => setSolveRemark(e.target.value)}
                                            style={{ borderRadius: '6px', fontSize: '0.9rem' }}
                                            required
                                        ></textarea>
                                        <small className="text-muted mt-1 d-block">
                                            This remark will be visible to the merchant/user when tracking their ticket.
                                        </small>
                                    </div>
                                </div>

                                <div className="modal-footer bg-light p-3 border-top d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        onClick={() => setSolveModalOpen(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success px-4 fw-bold text-white d-inline-flex align-items-center gap-2"
                                        disabled={solveLoading}
                                    >
                                        {solveLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Updating Ticket...
                                            </>
                                        ) : (
                                            <>
                                                <iconify-icon icon="material-symbols:check-circle-outline" width="18" height="18"></iconify-icon>
                                                Update Status & Solve Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BillPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const getTabFromLocation = (loc) => {
        const path = (loc?.pathname || '').toLowerCase();
        if (path.includes('/mobile/recharge') || path.includes('/mobilerecharge') || path.includes('/mobile-recharge')) {
            return 'recharge';
        }
        if (path.includes('/dth/recharge') || path.includes('/dthrecharge') || path.includes('/dth-recharge')) {
            return 'dth';
        }
        if (path.includes('/payment-report')) {
            return 'history';
        }
        if (path.includes('/search-transaction')) {
            return 'search';
        }
        if (path.includes('/payment-invoice') || path.includes('/bill-payment-invoice')) {
            return 'invoice';
        }
        if (loc?.state?.tab === 'complaint') {
            return 'complaint';
        }
        return 'home';
    };

    const [activeTab, setActiveTab] = useState(() => getTabFromLocation(location));
    const [categories, setCategories] = useState(() => getBbpsCache('categories_popular') || []);
    const [allCategories, setAllCategories] = useState(() => getBbpsCache('all_categories') || []);
    const [billers, setBillers] = useState([]);
    const [filteredBillers, setFilteredBillers] = useState([]);
    const [providerFilter, setProviderFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);
    const [loading, setLoading] = useState(!getBbpsCache('categories_popular'));
    const [billersLoading, setBillersLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Sync activeTab when location path changes
    useEffect(() => {
        const tab = getTabFromLocation(location);
        setActiveTab(tab);
    }, [location.pathname, location.state]);

    // Modal states
    const [showBillersModal, setShowBillersModal] = useState(false);
    const [showBillForm, setShowBillForm] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const apiService = ApiService();
    // Form states
    const [formData, setFormData] = useState({
        customer_id: '',
        mobile_number: '',
        amount: '',
        mpin: ''
    });

    const [billDetails, setBillDetails] = useState(null);
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [fetchErrorMsg, setFetchErrorMsg] = useState('');

    // Payment modal states
    const [accounts, setAccounts] = useState(() => getBbpsCache('user_accounts') || []);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [mpin, setMpin] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Create account states
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountMpin, setNewAccountMpin] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createAccountErrors, setCreateAccountErrors] = useState({});

    const { user } = useContext(AuthContext);

    // Fetch bill categories on component mount
    useEffect(() => {
        fetchBillCategories(true); // Popular categories for Home Page grid
        fetchAllCategories();      // ALL categories for SELECT SERVICE dropdown
        fetchAccounts();
    }, []);

    const fetchAllCategories = async () => {
        const cached = getBbpsCache('all_categories');
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setAllCategories(cached);
            return;
        }
        try {
            const response = await apiService.vGet('/api/v2/bill-categories');
            if (response.data && response.data.status === 1) {
                const cats = response.data.categories || [];
                setAllCategories(cats);
                setBbpsCache('all_categories', cats);
            }
        } catch (error) {
            console.error('Error fetching all categories:', error);
        }
    };

    // Utility Wallet Account (primary_status == 0 / false) or fallback to first account
    const utilityAccount = accounts.find(acc =>
        acc.primary_status === 0 ||
        acc.primary_status === false ||
        acc.primary_status === '0' ||
        acc.primary_status === 'false' ||
        acc.is_primary === false
    ) || accounts[0];

    const activeAccount = utilityAccount || accounts[0];

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            const util = accounts.find(acc =>
                acc.primary_status === 0 ||
                acc.primary_status === false ||
                acc.primary_status === '0' ||
                acc.primary_status === 'false' ||
                acc.is_primary === false
            ) || accounts[0];
            if (util && util.id) {
                setSelectedAccount(util.id);
            }
        }
    }, [accounts]);

    // Fetch accounts from API
    const fetchAccounts = async () => {
        const cached = getBbpsCache('user_accounts');
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setAccounts(cached);
        }
        try {
            const response = await apiService.vGet('/api/accounts');
            if (response.data && response.data.status === 1) {
                const accs = response.data.data.accounts || [];
                setAccounts(accs);
                setBbpsCache('user_accounts', accs);
                const util = accs.find(acc =>
                    acc.primary_status === 0 ||
                    acc.primary_status === false ||
                    acc.primary_status === '0' ||
                    acc.primary_status === 'false' ||
                    acc.is_primary === false
                ) || accs[0];
                if (util) setSelectedAccount(util.id);
            }
        } catch (error) {
            if (!cached) setAccounts([]);
        }
    };

    const isPayBillCategory = (cat) => {
        const title = formatCategoryTitle(cat).toLowerCase().trim();
        const raw = (cat?.category || cat?.category_name || cat?.name || '').toLowerCase().trim();
        return title.includes('pay bill payment') || raw.includes('pay_bill_payment') || title === 'pay bill payments' || raw === 'pay_bill_payments';
    };

    const [isPopularFilter, setIsPopularFilter] = useState(true);

    const fetchBillCategories = async (popularOnly = true) => {
        const cacheKey = popularOnly ? 'categories_popular' : 'categories_all';
        const cached = getBbpsCache(cacheKey);
        if (cached && Array.isArray(cached) && cached.length > 0) {
            setCategories(cached);
            setLoading(false);
            setIsPopularFilter(popularOnly);
            return;
        }
        try {
            setLoading(true);
            setIsPopularFilter(popularOnly);
            const url = popularOnly ? '/api/v2/bill-categories?popular=1' : '/api/v2/bill-categories';
            const response = await apiService.vGet(url);

            if (response.data.status === 1) {
                const cats = response.data.categories || [];
                setCategories(cats);
                setBbpsCache(cacheKey, cats);
                preloadIcons(cats.map(c => c.biller_icon || c.icon).filter(Boolean));
            } else {
                toast.error(response.data.message || 'Failed to fetch bill categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch bill categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchBillersByCategory = async (category, categoryObj) => {
        try {
            setLoading(true);
            setBillersLoading(true);
            setBillers([]);
            setShowBillersModal(false);
            setShowBillForm(true);

            const { token } = retrieveTokenAndUserData() || {};

            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                return;
            }

            const response = await apiService.vPost('/api/v2/billers-by-category', {
                category: category
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.status === 1) {
                const billersData = response.data.billers || [];
                setBillers(billersData);
                setFilteredBillers(billersData);
                setProviderFilter('');
                setSelectedCategory(categoryObj);

                if (billersData.length === 0) {
                    toast.info('No billers available for this category');
                }
            } else {
                toast.error(response.data?.message || 'Failed to fetch billers');
            }
        } catch (error) {
            console.error('Error fetching billers:', error);
            toast.error(`Failed to fetch billers: ${error.message || 'Network error'}`);
        } finally {
            setLoading(false);
            setBillersLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const catValue = e.target.value;
        if (!catValue) {
            setSelectedCategory(null);
            setSelectedBiller(null);
            setBillers([]);
            setFilteredBillers([]);
            return;
        }
        const catList = allCategories.length > 0 ? allCategories : categories;
        const foundCat = catList.find(
            c => (c.category === catValue || c.category_name === catValue || c.name === catValue)
        );
        const catObj = foundCat || { category: catValue, name: catValue };
        setSelectedCategory(catObj);
        setSelectedBiller(null);
        setFormData({ customer_id: '', mobile_number: '', amount: '', mpin: '' });
        setErrors({});
        fetchBillersByCategory(catValue, catObj);
    };

    const handleBillerDropdownChange = (e) => {
        const billerCode = e.target.value;
        if (!billerCode) {
            setSelectedBiller(null);
            return;
        }
        const foundBiller = billers.find(b => String(b.code) === String(billerCode) || String(b.id) === String(billerCode));
        if (foundBiller) {
            setSelectedBiller(foundBiller);
            setFormData({ customer_id: '', mobile_number: '', amount: '', mpin: '' });
            setErrors({});
        }
    };

    const handleBillerSelect = (biller) => {
        setSelectedBiller(biller);
        setShowBillersModal(false);
        setShowBillForm(true);
        setFormData({ customer_id: '', mobile_number: '', amount: '', mpin: '' });
        setErrors({});
    };

    const handleProviderFilter = (filterValue) => {
        setProviderFilter(filterValue);
        if (filterValue === '') {
            setFilteredBillers(billers);
        } else {
            const filtered = billers.filter(biller =>
                biller.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                biller.code.toLowerCase().includes(filterValue.toLowerCase())
            );
            setFilteredBillers(filtered);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const fetchBill = async () => {
        try {
            if (!selectedCategory) {
                toast.error('Please select a bill category');
                return;
            }
            if (!selectedBiller) {
                toast.error('Please select a biller');
                return;
            }
            // Validate required fields
            const newErrors = {};
            if (!formData.customer_id) {
                newErrors.customer_id = `${selectedBiller?.label || 'Consumer Number'} is required`;
            }
            if (formData.mobile_number && formData.mobile_number.length > 0 && formData.mobile_number.length !== 10) {
                newErrors.mobile_number = 'Please enter a valid 10-digit Mobile Number';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            setFetchErrorMsg('');
            setLoading(true);
            const { token } = retrieveTokenAndUserData() || {};

            const catName = selectedCategory?.category || selectedCategory?.name || selectedCategory?.category_name || '';
            const billerId = selectedBiller?.code || selectedBiller?.id || selectedBiller?.biller_id || '';

            const response = await apiService.vPost('/api/v2/fetch-bill', {
                category: catName,
                billerid: billerId,
                biller_code: billerId,
                customer_id: formData.customer_id,
                mobile_number: formData.mobile_number || '',
                mobile: formData.mobile_number || '',
                amount: formData.amount
            });

            if (response.data.status === 1) {
                setFetchErrorMsg('');
                setBillDetails(response.data.data);
                // Initialize amount in formData with the due amount
                setFormData(prev => ({
                    ...prev,
                    amount: response.data.data.dueAmount || response.data.data.amount
                }));
                setShowBillForm(false);
                setShowBillModal(true);
            } else {
                const errMsg = response.data?.message || response.data?.data?.msg || response.data?.data?.message || 'Failed to fetch bill details';
                setFetchErrorMsg(errMsg);
                toast.error(errMsg);
            }
        } catch (error) {
            console.error('Error fetching bill:', error);
            const errMsg = error.response?.data?.message || error.response?.data?.data?.msg || error.message || 'Failed to fetch bill details';
            setFetchErrorMsg(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        // Validate amount
        const payAmount = parseFloat(formData.amount);
        if (!payAmount || payAmount <= 0) {
            setErrors(prev => ({ ...prev, amount: 'Please enter a valid amount' }));
            return;
        }
        if (payAmount < 10) {
            setErrors(prev => ({ ...prev, amount: 'Minimum payment amount is ₹10' }));
            return;
        }

        // Clear any amount errors
        setErrors(prev => ({ ...prev, amount: '' }));

        // Ensure active account ID is set in state if not present
        if (!selectedAccount && activeAccount?.id) {
            setSelectedAccount(activeAccount.id);
        }

        // Open Payment / MPIN Confirmation modal to proceed with real API payment
        setShowBillModal(false);
        setShowPaymentModal(true);
    };

    const handleMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
        if (value.length <= 4) {
            setMpin(value);
        }
    };

    const handleFinalPayment = async () => {
        const accountIdToUse = selectedAccount || activeAccount?.id || (accounts && accounts[0] ? accounts[0].id : null);
        if (!accountIdToUse) {
            toast.error('Please select an account');
            return;
        }
        if (!mpin || mpin.length !== 4) {
            toast.error('Please enter 4-digit MPIN');
            return;
        }

        // Validate amount
        const payAmount = parseFloat(formData.amount);
        if (!payAmount || payAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (payAmount < 10) {
            toast.error('Minimum payment amount is ₹10');
            return;
        }

        setProcessingPayment(true);
        try {
            // Create payment transaction for bill
            const paymentResponse = await apiService.vPost('/api/v2/mobile-recharge', {
                account_id: accountIdToUse,
                details: billDetails,
                number: formData.customer_id,
                operator: selectedBiller?.code,
                circal: '',
                transaction_id: String(Date.now()),
                type: 3,
                amount: formData.amount,
                mpin: mpin,
            });

            if (paymentResponse.data && paymentResponse.data.status === 1) {
                toast.success('Bill payment successful!');

                // Navigate to bill payment invoice with payment details
                navigate('/bill-payment-invoice', {
                    state: {
                        transaction: paymentResponse.data.transaction,
                        validation: paymentResponse.data.validation,
                        billDetails: billDetails,
                        billerDetails: selectedBiller,
                        customerDetails: {
                            customer_id: formData.customer_id,
                            mobile_number: formData.mobile_number
                        },
                        paymentMode: paymentMode,
                        timestamp: new Date().toISOString()
                    }
                });

                // Close modal and reset states
                setShowPaymentModal(false);
                closeAllModals();

                // Refresh accounts to show updated balance
                await fetchAccounts();

            } else {
                toast.error(paymentResponse.data?.message || 'Payment failed');
            }

        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } finally {
            setProcessingPayment(false);
        }
    };

    const closeAllModals = () => {
        setShowBillersModal(false);
        setShowBillForm(false);
        setShowBillModal(false);
        setShowPaymentModal(false);
        setShowCreateAccountModal(false);
        setSelectedCategory(null);
        setSelectedBiller(null);
        setBillDetails(null);
        setFormData({ customer_id: '', mobile_number: '', amount: '', mpin: '' });
        setErrors({});
        setProviderFilter('');
        setFilteredBillers([]);
        setSelectedAccount('');
        setMpin('');
        setNewAccountName('');
        setNewAccountMpin('');
        setCreateAccountErrors({});
    };

    // Create account functions
    const handleCreateAccount = async () => {
        // Validate inputs
        const errors = {};
        if (!newAccountName.trim()) {
            errors.name = 'Account name is required';
        }
        if (!newAccountMpin || newAccountMpin.length !== 4) {
            errors.mpin = 'MPIN must be 4 digits';
        }
        if (!/^[0-9]{4}$/.test(newAccountMpin)) {
            errors.mpin = 'MPIN must contain only numbers';
        }

        if (Object.keys(errors).length > 0) {
            setCreateAccountErrors(errors);
            return;
        }

        setCreatingAccount(true);
        try {
            // Generate unique account number
            const accountNumber = Date.now().toString();

            // Get current user data from auth
            const { token, user } = retrieveTokenAndUserData() || {};

            const response = await apiService.vPost('/api/accounts', {
                name: newAccountName.trim(),
                number: accountNumber,
                mpin: newAccountMpin,
                user_id: user?.id || 1, // Fallback to 1 if user id not found
                initial_balance: 0
            });

            if (response.data && response.data.status === 1) {
                toast.success('Account created successfully!');

                // Refresh accounts list
                await fetchAccounts();

                // Close create account modal and open payment modal
                setShowCreateAccountModal(false);
                setNewAccountName('');
                setNewAccountMpin('');
                setCreateAccountErrors({});

                // Open payment modal since we were coming from bill payment
                setShowPaymentModal(true);
            } else {
                toast.error(response.data?.message || 'Failed to create account');
            }
        } catch (error) {
            if (error.response?.data?.error) {
                // Handle validation errors from server
                setCreateAccountErrors(error.response.data.error);
            } else {
                toast.error(error.response?.data?.message || 'Failed to create account');
            }
        } finally {
            setCreatingAccount(false);
        }
    };

    const handleNewAccountNameChange = (e) => {
        setNewAccountName(e.target.value);
        if (createAccountErrors.name) {
            setCreateAccountErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleNewAccountMpinChange = (e) => {
        const value = (e.target.value || '').replace(/\D/g, ''); // Only digits
        if (value.length <= 4) {
            setNewAccountMpin(value);
            if (createAccountErrors.mpin) {
                setCreateAccountErrors(prev => ({ ...prev, mpin: '' }));
            }
        }
    };

    const hasActiveStep = showBillersModal || showBillForm || showBillModal || showPaymentModal || showCreateAccountModal;

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />

            <div className="page-content-box bg-transparent border-0 p-0 shadow-none mt-0 pt-0">
                <BbpsTopNav activeTab={activeTab} setActiveTab={setActiveTab} onHomeClick={closeAllModals} />
                <div className="page-content-box-inner p-0">
                    <div className="row">
                        <div className="col-md-12">
                            {activeTab === 'recharge' && <MobileRecharge hideNav={true} />}
                            {activeTab === 'dth' && <DTHRecharge hideNav={true} />}
                            {activeTab === 'history' && <MobileRechargeReport hideNav={true} />}
                            {activeTab === 'search' && <BillSearchTransaction hideNav={true} />}
                            {activeTab === 'complaint' && <BbpsComplaintView />}
                            {activeTab === 'invoice' && <BillPaymentInvoice hideNav={true} />}
                            {activeTab === 'home' && (
                                <>
                                    {/* Categories Grid (Shown when no active step) */}
                                    {!hasActiveStep && (
                                        <div className="bg-transparent border-0 shadow-none p-0">
                                            <div className="pt-0">
                                                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                                                    <div className="text-muted fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                                        {isPopularFilter ? 'POPULAR CATEGORIES' : 'ALL CATEGORIES'}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link btn-sm text-primary text-decoration-none fw-semibold p-0"
                                                        onClick={() => fetchBillCategories(!isPopularFilter)}
                                                    >
                                                        {isPopularFilter ? 'View All Categories →' : '← View Popular Categories'}
                                                    </button>
                                                </div>

                                                {loading && categories.length === 0 ? (
                                                    <div className="text-center py-5">
                                                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="mt-3 text-muted">Loading bill categories...</p>
                                                    </div>
                                                ) : (
                                                    <div className="row g-3">
                                                        {categories.map((category, index) => (
                                                            <div key={index} className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
                                                                <div
                                                                    className="card border-1 cursor-pointer position-relative p-3 h-100 shadow-sm"
                                                                    onClick={() => {
                                                                        if (!billersLoading) {
                                                                            const catName = category.name || category.category || category.category_name || '';
                                                                            const cleanName = String(catName).toLowerCase().trim();
                                                                            if (cleanName.includes('mobile') || cleanName.includes('prepaid')) {
                                                                                setActiveTab('recharge');
                                                                                navigate('/banking/mobile/recharge');
                                                                                return;
                                                                            }
                                                                            if (cleanName.includes('dth')) {
                                                                                setActiveTab('dth');
                                                                                navigate('/banking/dth/recharge');
                                                                                return;
                                                                            }
                                                                            fetchBillersByCategory(catName, category);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        backgroundColor: '#ffffff',
                                                                        borderColor: '#e2e8f0',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s ease-in-out',
                                                                        opacity: billersLoading ? 0.7 : 1,
                                                                        pointerEvents: billersLoading ? 'none' : 'auto'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.borderColor = '#2563eb';
                                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.12)';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                                        e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                    }}
                                                                >
                                                                    {billersLoading && (
                                                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded-3" style={{ zIndex: 10 }}>
                                                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                                <span className="visually-hidden">Loading...</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="flex-shrink-0 me-3 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                                                            {renderCategoryIcon(category)}
                                                                        </div>
                                                                        <div className="flex-grow-1 overflow-hidden">
                                                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.925rem', color: '#1e293b', lineHeight: '1.3' }}>
                                                                                {formatCategoryTitle(category)}
                                                                            </h6>
                                                                            <span className="text-muted fw-medium text-truncate d-block" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                                                                {formatCategorySubtitle(category)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 1: Billers / Providers List (Full-Width Card View) */}
                                    {showBillersModal && selectedCategory && (
                                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden w-100 mb-4 bg-white">
                                            <StepHeader
                                                title={`${formatCategoryTitle(selectedCategory)} Providers`}
                                                subtitle={`Pay ${formatCategoryTitle(selectedCategory)} Bill`}
                                                icon={renderCategoryIcon(selectedCategory)}
                                                onBack={() => setShowBillersModal(false)}
                                                onClose={closeAllModals}
                                            />
                                            <div className="card-body p-4">
                                                <div className="row align-items-center mb-4">
                                                    <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text border-0 bg-light">
                                                                <iconify-icon icon="material-symbols:search" width="18" height="18" className="text-muted"></iconify-icon>
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className="form-control border-0 bg-light"
                                                                placeholder="Search providers..."
                                                                value={providerFilter}
                                                                onChange={(e) => handleProviderFilter(e.target.value)}
                                                                style={{ borderRadius: '0 8px 8px 0' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 text-end">
                                                        <small className="text-muted">
                                                            {filteredBillers.length} of {billers.length} providers
                                                        </small>
                                                    </div>
                                                </div>

                                                {filteredBillers.length > 0 ? (
                                                    <div className="row g-3">
                                                        {filteredBillers.map((biller, index) => (
                                                            <div key={index} className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                                                                <div
                                                                    className="card border cursor-pointer h-100 p-3 shadow-sm"
                                                                    onClick={() => handleBillerSelect(biller)}
                                                                    style={{
                                                                        borderColor: '#e2e8f0',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s ease-in-out'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.borderColor = '#2563eb';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                    }}
                                                                >
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-3 flex-shrink-0">
                                                                            {biller.icon || biller.biller_icon ? (
                                                                                <img
                                                                                    src={biller.icon || biller.biller_icon}
                                                                                    alt={biller.name}
                                                                                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                                                />
                                                                            ) : (
                                                                                <div className="avatar avatar-md rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold">
                                                                                    {biller.name.charAt(0)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-grow-1 overflow-hidden">
                                                                            <h6 className="mb-0 fw-semibold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{biller.name}</h6>
                                                                            <small className="text-muted text-truncate d-block">{biller.code}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <p className="text-muted">No providers found matching "{providerFilter}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Bill Form (Unified View as shown in screenshot) */}
                                    {showBillForm && (
                                        <div className="w-100 mb-4">
                                            <div className="text-uppercase text-secondary fw-bold small mb-3" style={{ letterSpacing: '0.5px' }}>
                                                SELECT SERVICE
                                            </div>
                                            <div className="card border shadow-sm rounded-3 overflow-hidden w-100 bg-white">
                                                <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowBillForm(false);
                                                                setSelectedCategory(null);
                                                                setSelectedBiller(null);
                                                            }}
                                                            className="btn btn-sm btn-icon btn-outline-secondary me-2 d-inline-flex align-items-center justify-content-center"
                                                            title="Back to Categories"
                                                            style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                                                <polyline points="12 19 5 12 12 5"></polyline>
                                                            </svg>
                                                        </button>
                                                        <h5 className="fw-bold text-dark mb-0">Bill Payment</h5>
                                                    </div>
                                                    <img
                                                        src="/assets/bharat-connect.PNG"
                                                        alt="Bharat Connect"
                                                        style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div className="card-body p-3 p-md-4">
                                                    <div className="row">
                                                        <div className="col-lg-7 col-md-9 col-sm-12">
                                                            {fetchErrorMsg && (
                                                                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 rounded-3 shadow-sm py-2 px-3">
                                                                    <iconify-icon icon="material-symbols:error-outline" width="22" height="22" className="text-danger flex-shrink-0"></iconify-icon>
                                                                    <div className="fw-semibold text-danger" style={{ fontSize: '0.875rem' }}>
                                                                        {fetchErrorMsg}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* 1. Select Bill Category Dropdown */}
                                                            <div className="mb-3">
                                                                <label className="form-label text-muted small fw-medium mb-1">Select Bill Category</label>
                                                                <select
                                                                    className="form-select"
                                                                    value={selectedCategory?.category || selectedCategory?.category_name || selectedCategory?.name || ''}
                                                                    onChange={handleCategoryChange}
                                                                    style={{ borderRadius: '6px', fontSize: '0.875rem', padding: '7px 12px', borderColor: '#e2e8f0' }}
                                                                >
                                                                    <option value="">Select category</option>
                                                                    {(allCategories.length > 0 ? allCategories : categories).filter(cat => !isPayBillCategory(cat)).map((cat, index) => {
                                                                        const val = cat.category || cat.category_name || cat.name;
                                                                        return (
                                                                            <option key={index} value={val}>
                                                                                {formatCategoryTitle(cat)}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>

                                                            {/* 2. Select Biller Dropdown */}
                                                            <div className="mb-3">
                                                                <label className="form-label text-muted small fw-medium mb-1">Select Biller</label>
                                                                <select
                                                                    className="form-select"
                                                                    value={selectedBiller?.code || selectedBiller?.id || ''}
                                                                    onChange={handleBillerDropdownChange}
                                                                    disabled={!selectedCategory || billersLoading}
                                                                    style={{ borderRadius: '6px', fontSize: '0.875rem', padding: '7px 12px', borderColor: '#e2e8f0' }}
                                                                >
                                                                    <option value="">
                                                                        {billersLoading ? 'Loading billers...' : 'Select biller'}
                                                                    </option>
                                                                    {billers.map((biller, index) => (
                                                                        <option key={index} value={biller.code || biller.id}>
                                                                            {biller.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            {/* 3. Consumer / Account Number Field (Dynamic based on selected category & biller) */}
                                                            <div className="mb-3">
                                                                <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                                                    {getDynamicFieldLabel(selectedCategory, selectedBiller)}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${errors.customer_id ? 'is-invalid' : ''}`}
                                                                    name="customer_id"
                                                                    value={formData.customer_id}
                                                                    onChange={handleInputChange}
                                                                    placeholder={getDynamicFieldPlaceholder(selectedCategory, selectedBiller)}
                                                                    style={{ borderRadius: '6px', fontSize: '0.875rem', padding: '7px 12px', borderColor: '#e2e8f0' }}
                                                                />
                                                                {errors.customer_id && (
                                                                    <div className="invalid-feedback">{errors.customer_id}</div>
                                                                )}
                                                            </div>

                                                            {/* 4. Mobile Number Field (Hidden for Mobile, DTH, Broadband, etc.) */}
                                                            {!shouldHideMobileField(selectedCategory) && (
                                                                <div className="mb-3">
                                                                    <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                                                        Mobile Number
                                                                    </label>
                                                                    <div className="input-group">
                                                                        <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '6px 0 0 6px', fontSize: '0.875rem', padding: '7px 12px', borderColor: '#e2e8f0' }}>+91</span>
                                                                        <input
                                                                            type="text"
                                                                            className={`form-control border-start-0 ${errors.mobile_number ? 'is-invalid' : ''}`}
                                                                            name="mobile_number"
                                                                            value={formData.mobile_number || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '');
                                                                                if (val.length <= 10) {
                                                                                    setFormData(prev => ({ ...prev, mobile_number: val }));
                                                                                    if (errors.mobile_number) setErrors(prev => ({ ...prev, mobile_number: '' }));
                                                                                }
                                                                            }}
                                                                            placeholder="Mobile Number"
                                                                            style={{ borderRadius: '0 6px 6px 0', fontSize: '0.875rem', padding: '7px 12px', borderColor: '#e2e8f0' }}
                                                                        />
                                                                        {errors.mobile_number && (
                                                                            <div className="invalid-feedback">{errors.mobile_number}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="card-footer bg-white border-top p-2.5 px-3 d-flex justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-2"
                                                        onClick={fetchBill}
                                                        disabled={loading}
                                                        style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Fetching Bill...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <iconify-icon icon="material-symbols:receipt-long" width="18" height="18"></iconify-icon>
                                                                Fetch Bill
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Bill Details (Full-Width Card View matching screenshot) */}
                                    {showBillModal && billDetails && (
                                        <div className="w-100 mb-4">
                                            <div className="text-muted fw-semibold small mb-2 px-1 text-uppercase">YOUR BILL</div>
                                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                                                {/* Card Header: Biller Name on left, Bharat Connect logo on right */}
                                                <div className="p-3 px-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                                                    <div className="fw-bold text-dark fs-4">
                                                        {selectedBiller?.name || "Biller Name"}
                                                    </div>
                                                    <img
                                                        src="/assets/bharat-connect.PNG"
                                                        alt="Bharat Connect"
                                                        style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain' }}
                                                    />
                                                </div>

                                                <div className="card-body p-3 p-md-4">
                                                    <div className="row g-3">
                                                        {/* Row 1: Customer Name & Bill Number */}
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Customer Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={billDetails.customerName || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Bill Number</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={billDetails.billNumber || formData.customer_id || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>

                                                        {/* Row 2: Customer Mobile & Bill Date */}
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Customer Mobile</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={formData.mobile_number || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Bill Date</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={billDetails.billDate || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>

                                                        {/* Row 3: Consumer ID & Bill Due Date */}
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Consumer ID</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={formData.customer_id || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Bill Due Date</label>
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light text-dark"
                                                                value={billDetails.dueDate || 'N/A'}
                                                                readOnly
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            />
                                                        </div>

                                                        {/* Row 4: Bill Amount (Editable) & Customer Convenience Fee */}
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Bill Amount</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '6px 0 0 6px', fontSize: '0.875rem', border: '1px solid #ced4da', padding: '6px 12px' }}>₹</span>
                                                                <input
                                                                    type="number"
                                                                    className={`form-control border-start-0 ${errors.amount ? 'is-invalid' : ''}`}
                                                                    name="amount"
                                                                    value={formData.amount}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Enter Bill Amount"
                                                                    min="1"
                                                                    style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                                />
                                                                {errors.amount && (
                                                                    <div className="invalid-feedback">{errors.amount}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Customer Convenience Fee</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '6px 0 0 6px', fontSize: '0.875rem', border: '1px solid #ced4da', padding: '6px 12px' }}>₹</span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control bg-light text-dark border-start-0"
                                                                    value="0"
                                                                    readOnly
                                                                    style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Row 5: Payment Mode Select Option */}
                                                        <div className="col-md-6">
                                                            <label className="form-label text-dark fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Payment Mode</label>
                                                            <select
                                                                className="form-select"
                                                                value={paymentMode}
                                                                onChange={(e) => setPaymentMode(e.target.value)}
                                                                style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '6px 12px', fontSize: '0.875rem' }}
                                                            >
                                                                <option value="UPI">UPI</option>
                                                                <option value="Voucher">Voucher</option>
                                                                <option value="CARD">Credit / Debit Card</option>
                                                                <option value="NETBANKING">Net Banking</option>
                                                                <option value="PAYMENT_GATEWAY">Payment Gateway</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer: Payable Amount on Left, Fetch Bill Button on Right */}
                                                <div className="card-footer bg-white border-top p-2.5 px-3 d-flex justify-content-between align-items-center">
                                                    <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
                                                        Payable Amount: <span className="text-primary">₹{formData.amount || '0'}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-2"
                                                        onClick={handlePayment}
                                                        disabled={paymentLoading || !formData.amount || parseFloat(formData.amount) < 1}
                                                        style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                                    >
                                                        {paymentLoading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <iconify-icon icon="material-symbols:account-balance-wallet" width="18" height="18"></iconify-icon>
                                                                Pay Now
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Payment Confirmation (Full-Width Card View) */}
                                    {showPaymentModal && (
                                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden w-100 mb-4 bg-white">
                                            <StepHeader
                                                title="Complete Payment"
                                                subtitle={`Pay ₹${formData.amount || '0'} for ${selectedBiller?.name}`}
                                                icon={<iconify-icon icon="material-symbols:lock" width="28" height="28" className="text-success"></iconify-icon>}
                                                        onBack={() => { setShowPaymentModal(false); setShowBillModal(true); }}
                                                onClose={closeAllModals}
                                            />
                                            <div className="card-body p-4">
                                                <div className="row justify-content-center">
                                                    <div className="col-lg-6 col-md-8">
                                                        <div className="bg-light border rounded-3 p-3 mb-4 shadow-sm">
                                                            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                                <span className="text-muted fw-semibold" style={{ fontSize: '0.875rem' }}>Total Pay Amount</span>
                                                                <span className="fw-bold h4 mb-0 text-primary">₹{formData.amount || '0'}</span>
                                                            </div>
                                                            {billDetails?.customerName && (
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Customer Name</span>
                                                                    <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{billDetails.customerName}</span>
                                                                </div>
                                                            )}
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Consumer / Customer ID</span>
                                                                <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{formData.customer_id}</span>
                                                            </div>
                                                            {formData.mobile_number && (
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Mobile Number</span>
                                                                    <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{formData.mobile_number}</span>
                                                                </div>
                                                            )}
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Biller</span>
                                                                <span className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{selectedBiller?.name}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Payment Mode</span>
                                                                <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '0.8rem' }}>{paymentMode === 'Voucher' ? 'Voucher (Wallet Pay)' : paymentMode}</span>
                                                            </div>
                                                            {/* Utility Wallet Account Card (primary_status = 0 / non-primary) */}
                                                            <div className="card border border-primary-subtle rounded-3 bg-white p-3 mb-4 shadow-sm">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className="rounded-circle p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                                                                            <i className="fas fa-wallet fa-lg"></i>
                                                                        </div>
                                                                        <div>
                                                                            <h6 className="mb-0 fw-bold text-dark">{activeAccount?.name || 'Utility Wallet'}</h6>
                                                                            <small className="text-muted font-monospace">{activeAccount?.number || activeAccount?.account_number || 'Utility Account'}</small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Available Balance</small>
                                                                        <span className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>
                                                                            ₹{activeAccount?.balance ?? activeAccount?.amount ?? activeAccount?.available_balance ?? 0}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold">Enter 4-digit MPIN <span className="text-danger">*</span></label>
                                                            <input
                                                                type="password"
                                                                className="form-control form-control-lg text-center"
                                                                placeholder="••••"
                                                                value={mpin}
                                                                onChange={handleMpinChange}
                                                                maxLength="4"
                                                                style={{ letterSpacing: '8px', fontSize: '1.2rem', borderRadius: '12px' }}
                                                            />
                                                        </div>

                                                        <div className="d-grid">
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-lg fw-bold"
                                                                onClick={handleFinalPayment}
                                                                disabled={processingPayment || (!selectedAccount && !activeAccount?.id) || mpin.length !== 4}
                                                                style={{ borderRadius: '12px', padding: '12px' }}
                                                            >
                                                                {processingPayment ? 'Processing Payment...' : `Confirm & Pay ₹${formData.amount || '0'}`}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Create Account (Full-Width Card View) */}
                                    {showCreateAccountModal && (
                                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden w-100 mb-4 bg-white">
                                            <StepHeader
                                                title="Create New Account"
                                                subtitle="Add a new account to proceed with bill payments"
                                                icon={<iconify-icon icon="material-symbols:add-circle-outline" width="28" height="28" className="text-primary"></iconify-icon>}
                                                onBack={() => { setShowCreateAccountModal(false); setShowPaymentModal(true); }}
                                                onClose={closeAllModals}
                                            />
                                            <div className="card-body p-4">
                                                <div className="row justify-content-center">
                                                    <div className="col-lg-6 col-md-8">
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold">Account Name <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control form-control-lg ${createAccountErrors.name ? 'is-invalid' : ''}`}
                                                                placeholder="Enter account name"
                                                                value={newAccountName}
                                                                onChange={handleNewAccountNameChange}
                                                                style={{ borderRadius: '12px' }}
                                                            />
                                                            {createAccountErrors.name && (
                                                                <div className="invalid-feedback">{createAccountErrors.name}</div>
                                                            )}
                                                        </div>

                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold">4-digit MPIN <span className="text-danger">*</span></label>
                                                            <input
                                                                type="password"
                                                                className={`form-control form-control-lg text-center ${createAccountErrors.mpin ? 'is-invalid' : ''}`}
                                                                placeholder="••••"
                                                                value={newAccountMpin}
                                                                onChange={handleNewAccountMpinChange}
                                                                maxLength="4"
                                                                style={{ letterSpacing: '8px', fontSize: '1.2rem', borderRadius: '12px' }}
                                                            />
                                                            {createAccountErrors.mpin && (
                                                                <div className="invalid-feedback">{createAccountErrors.mpin}</div>
                                                            )}
                                                        </div>

                                                        <div className="d-grid mt-4">
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-lg fw-bold"
                                                                onClick={handleCreateAccount}
                                                                disabled={creatingAccount}
                                                                style={{ borderRadius: '12px', padding: '12px' }}
                                                            >
                                                                {creatingAccount ? 'Creating Account...' : 'Create Account'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillPayment;
