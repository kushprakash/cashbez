import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../core/hooks/context';
import { Drawer, Table, Typography, Tabs, Tag, Spin, Modal } from 'antd';

const { Text } = Typography;

const Reports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState({
        payout: { data: [] },
        recharge: { data: [] },
        aepsTransaction: { data: [] },
        summaries: {
            payout: { success: 0, failed: 0, pending: 0 },
            recharge: { success: 0, failed: 0, pending: 0 },
            aeps: { success: 0, failed: 0, pending: 0 }
        },
        slab_stats: null,
        amount_slabs: []
    });

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        payout_page: 1,
        recharge_page: 1,
        aeps_page: 1
    });

    const apiService = ApiService();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.role !== 1 && user.id !== 21) {
            navigate('/');
        }
    }, [user, navigate]);

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [payoutForm, setPayoutForm] = useState({
        id: null,
        status: 'SUCCESS',
        utr: ''
    });
    const [useDateFilter, setUseDateFilter] = useState(false);

    // Passbook/History Drawer States
    const [passbookVisible, setPassbookVisible] = useState(false);
    const [passbookLoading, setPassbookLoading] = useState(false);
    const [passbookData, setPassbookData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeDrawerTab, setActiveDrawerTab] = useState('passbook');

    // Beneficiaries States (lazy loaded)
    const [beneficiariesData, setBeneficiariesData] = useState([]);
    const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
    const [beneficiariesSummary, setBeneficiariesSummary] = useState(null);
    const [beneficiariesLoaded, setBeneficiariesLoaded] = useState(false);

    // AEPS Slab Drawer State
    const [aepsDrawerVisible, setAepsDrawerVisible] = useState(false);

    // Recharge Response Data Modal State
    const [responseModalVisible, setResponseModalVisible] = useState(false);
    const [selectedRechargeData, setSelectedRechargeData] = useState(null);

    const openResponseModal = (report) => {
        setSelectedRechargeData(report);
        setResponseModalVisible(true);
    };

    const openAepsSlabDrawer = () => {
        setAepsDrawerVisible(true);
    };

    // Sound Notification State & References
    const [soundEnabled, setSoundEnabled] = useState(true);
    const prevPayoutMapRef = useRef(new Map());
    const isFirstFetchRef = useRef(true);

    // Audio synthesizer for Move to Bank / Payout notification sounds
    const playTxnSound = (type = 'success') => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;
            const statusKey = (type || 'success').toLowerCase();

            if (statusKey === 'success') {
                // High-pitch 3-tone chime for SUCCESS (523.25Hz -> 659.25Hz -> 783.99Hz)
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.3, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.3);
                });
            } else if (statusKey === 'failed' || statusKey === 'rejected') {
                // Low warning double-beep for FAILED (350Hz -> 220Hz)
                [350, 220].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + i * 0.2);
                    gain.gain.setValueAtTime(0.35, now + i * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.2);
                    osc.stop(now + i * 0.2 + 0.35);
                });
            } else {
                // Loud Telephone Ringing Alarm for PENDING Payouts
                // Dual-tone (853Hz + 960Hz) telephone ringer pattern with loud double-rings
                const ringPattern = [
                    0.0, 0.12, 0.24, 0.36,  // Ring 1
                    0.65, 0.77, 0.89, 1.01, // Ring 2
                    1.35, 1.47, 1.59, 1.71  // Ring 3
                ];

                ringPattern.forEach((timeOffset) => {
                    [853, 960].forEach((freq) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sawtooth'; // Loud piercing telephone ringer waveform
                        osc.frequency.setValueAtTime(freq, now + timeOffset);

                        gain.gain.setValueAtTime(0.45, now + timeOffset);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.1);

                        osc.connect(gain);
                        gain.connect(ctx.destination);

                        osc.start(now + timeOffset);
                        osc.stop(now + timeOffset + 0.1);
                    });
                });
            }
        } catch (e) {
            console.warn('Audio synthesis error:', e);
        }
    };

    useEffect(() => {
        fetchReports(true);

        // Auto-refresh every 10 seconds for real-time sound notifications even in sleep/background
        const interval = setInterval(() => {
            fetchReports(false);
        }, 10000);

        return () => clearInterval(interval);
    }, [filters.payout_page, filters.recharge_page, filters.aeps_page, filters.startDate, filters.endDate]);

    const fetchReports = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate,
                payout_page: filters.payout_page,
                recharge_page: filters.recharge_page,
                aeps_page: filters.aeps_page,
                per_page: 200
            }).toString();

            const response = await apiService.vGet(`/api/banking/reports?${queryParams}`);
            if (response.data && response.data.status === 1) {
                const data = response.data.data;
                setReports(data);

                // Sound Alert Detection for Move to Bank / Payouts
                const currentPayouts = data.payout?.data || [];
                if (!isFirstFetchRef.current && soundEnabled && currentPayouts.length > 0) {
                    let playedOneTimeSound = false;

                    // 1. Check for Status Changes (Pending -> Success / Failed 1-time sound alert)
                    for (const item of currentPayouts) {
                        const id = item.payout_id || item.id;
                        const status = (item.status || 'pending').toLowerCase();
                        const prevStatus = prevPayoutMapRef.current.get(id);

                        if (prevStatus && prevStatus !== status && (status === 'success' || status === 'failed' || status === 'rejected')) {
                            playTxnSound(status);
                            toast.info(`🔊 Payout #${id} Updated: ${prevStatus.toUpperCase()} ➔ ${status.toUpperCase()}`, {
                                autoClose: 5000
                            });
                            playedOneTimeSound = true;
                            break; // 1-time sound on success/failed
                        }
                    }

                    // 2. Regular repeating sound alert while any transaction is PENDING
                    if (!playedOneTimeSound) {
                        const hasPending = currentPayouts.some(item => (item.status || '').toLowerCase() === 'pending');
                        if (hasPending) {
                            playTxnSound('pending');
                        }
                    }
                }

                // Update previous map reference
                const nextMap = new Map();
                currentPayouts.forEach(item => {
                    const id = item.payout_id || item.id;
                    nextMap.set(id, (item.status || 'pending').toLowerCase());
                });
                prevPayoutMapRef.current = nextMap;
                isFirstFetchRef.current = false;
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            if (showLoading) toast.error('Failed to fetch reports');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        setFilters({ ...filters, payout_page: 1, recharge_page: 1, aeps_page: 1 });
    };

    const handleApprovePayout = (report) => {
        setPayoutForm({ id: report.payout_id, status: report.status?.toLowerCase(), utr: '' });
        setShowApproveModal(true);
    };

    const submitPayoutUpdate = async () => {
        setLoading(true);
        try {
            const response = await apiService.vPut(`/api/banking/payout/${payoutForm.id}/status`, {
                status: payoutForm.status,
                utr: payoutForm.utr
            });
            if (response.data && response.data.status === 1) {
                if (soundEnabled) {
                    playTxnSound(payoutForm.status);
                }
                toast.success(response.data.message);
                setShowApproveModal(false);
                fetchReports(true);
            } else {
                const errorMsg = response.data.error || response.data.message || 'Failed to update payout';
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Error updating payout:', error);
            toast.error('Failed to update payout status');
        } finally {
            setLoading(false);
        }
    };

    const downloadTodayTxns = async () => {
        try {
            toast.info('Downloading AEPS CW transactions...');

            // Build URL with optional date parameters
            let url = '/api/banking/download-aeps-cw-txns';
            if (useDateFilter) {
                url += `?start_date=${filters.startDate}&end_date=${filters.endDate}`;
            }

            const response = await apiService.vGet(url, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlObj;

            // Filename based on date filter
            const filename = useDateFilter
                ? `aeps_cw_txns_${filters.startDate}_to_${filters.endDate}.csv`
                : `aeps_cw_txns_${new Date().toISOString().split('T')[0]}.csv`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(urlObj);
            document.body.removeChild(a);

            toast.success('Download completed!');
        } catch (error) {
            console.error('Error downloading transactions:', error);
            toast.error('Failed to download transactions');
        }
    };

    const copyToClipboard = (text, label) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    toast.success(`${label} copied to clipboard!`);
                })
                .catch(() => {
                    toast.error('Failed to copy to clipboard');
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success(`${label} copied to clipboard!`);
            } catch (err) {
                toast.error('Failed to copy to clipboard');
            }
            document.body.removeChild(textArea);
        }
    };

    // Open History/Passbook Drawer
    const openHistory = (user) => {
        setSelectedUser(user);
        setPassbookVisible(true);
        setActiveDrawerTab('passbook');
        // Reset beneficiaries state for new user
        setBeneficiariesLoaded(false);
        setBeneficiariesData([]);
        setBeneficiariesSummary(null);
        // Load passbook immediately
        fetchPassbook(user.user_id);
    };

    // Fetch passbook data
    const fetchPassbook = (userId) => {
        setPassbookLoading(true);
        apiService.vGet(`/api/banking/${userId}/passbook`).then(res => {
            if (res.data.status === 1) {
                setPassbookData(res.data.data || []);
            } else {
                setPassbookData([]);
            }
            setPassbookLoading(false);
        }).catch(() => {
            setPassbookLoading(false);
            toast.error('Failed to load passbook');
        });
    };

    // Fetch beneficiaries (lazy loaded)
    const fetchBeneficiaries = (userId) => {
        if (beneficiariesLoaded) return; // Don't refetch if already loaded

        setBeneficiariesLoading(true);
        apiService.vGet(`/api/banking/${userId}/beneficiaries`).then(res => {
            if (res.data.status === 1) {
                setBeneficiariesData(res.data.data || []);
                setBeneficiariesSummary(res.data.summary || null);
                setBeneficiariesLoaded(true);
            }
            setBeneficiariesLoading(false);
        }).catch(() => {
            setBeneficiariesLoading(false);
            toast.error('Failed to load beneficiaries');
        });
    };

    // Handle drawer tab change - lazy load data
    const handleDrawerTabChange = (key) => {
        setActiveDrawerTab(key);
        if (key === 'beneficiaries' && selectedUser && !beneficiariesLoaded) {
            fetchBeneficiaries(selectedUser.user_id);
        }
    };

    const passbookColumns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: t => new Date(t).toLocaleString(),
            width: 150
        },
        {
            title: 'Remark',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount, record) => (
                <Text type={record.type === 'CR' ? 'success' : 'danger'} strong>
                    {record.type === 'CR' ? '+' : '-'}₹{Number(amount).toLocaleString()}
                </Text>
            )
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            width: 120,
            render: b => <Text strong>₹{Number(b).toLocaleString()}</Text>
        },
    ];

    // Beneficiaries Columns
    const beneficiariesColumns = [
        {
            title: 'Date Added',
            dataIndex: 'created_at',
            key: 'created_at',
            render: t => new Date(t).toLocaleString(),
            width: 140
        },
        {
            title: 'Beneficiary',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{record.mobile || '-'}</div>
                </div>
            )
        },
        {
            title: 'Account Details',
            dataIndex: 'account',
            key: 'account',
            width: 180,
            render: (account, record) => (
                <div>
                    <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{account}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{record.ifsc} • {record.bank}</div>
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: type => {
                const typeText = type === 3 ? 'Move To Bank' : type === 1 ? 'DMT' : 'Other';
                const color = type === 3 ? 'purple' : type === 1 ? 'blue' : 'default';
                return <Tag color={color}>{typeText}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: status => {
                const color = status === 1 ? 'green' : 'red';
                const text = status === 1 ? 'Active' : 'Inactive';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Verified',
            dataIndex: 'account_verified',
            key: 'account_verified',
            width: 80,
            render: verified => (
                <Tag color={verified === 1 ? 'green' : 'orange'}>
                    {verified === 1 ? '✓ Yes' : 'No'}
                </Tag>
            )
        },
    ];

    const renderSummaryCard = (title, summary) => (
        <div className="card custom-card border-0 shadow-sm mb-4">
            <div className="card-header bg-light border-0">
                <h5 className="mb-0">{title} Summary</h5>
            </div>
            <div className="card-body">
                <div className="row text-center mb-3">
                    <div className="col-4">
                        <div className="text-success small fw-bold">Success</div>
                        <div className="h5 mb-0">{summary.success}</div>
                    </div>
                    <div className="col-4">
                        <div className="text-danger small fw-bold">Failed</div>
                        <div className="h5 mb-0">{summary.failed}</div>
                    </div>
                    <div className="col-4">
                        <div className="text-warning small fw-bold">Pending</div>
                        <div className="h5 mb-0">{summary.pending}</div>
                    </div>
                </div>
                <div className="row text-center border-top pt-2">
                    <div className="col-4">
                        <div className="smallest text-muted">Success Amt</div>
                        <div className="small fw-bold text-success">₹{(summary.success_amount || 0).toLocaleString()}</div>
                    </div>
                    <div className="col-4">
                        <div className="smallest text-muted">Failed Amt</div>
                        <div className="small fw-bold text-danger">₹{(summary.failed_amount || 0).toLocaleString()}</div>
                    </div>
                    <div className="col-4">
                        <div className="smallest text-muted">Pending Amt</div>
                        <div className="small fw-bold text-warning">₹{(summary.pending_amount || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPagination = (data, pageKey) => {
        if (!data || data.last_page <= 1) return null;
        return (
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                    Showing {data.from} to {data.to} of {data.total}
                </div>
                <div className="pagination pagination-sm mb-0">
                    <button
                        className="page-link"
                        disabled={data.current_page === 1}
                        onClick={() => setFilters({ ...filters, [pageKey]: data.current_page - 1 })}
                    >
                        Previous
                    </button>
                    <button className="page-link active">{data.current_page}</button>
                    <button
                        className="page-link"
                        disabled={data.current_page === data.last_page}
                        onClick={() => setFilters({ ...filters, [pageKey]: data.current_page + 1 })}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    const navigateToSummary = () => {
        navigate('/banking/summary');
    };

    return (
        <div className="reports-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar theme="light" />
            <Pageheader mainheading="Reports" parentfolder="Banking" activepage="Reports" />

            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Sound Notification Control Banner */}
                    <div className="card border-0 shadow-sm mb-3 bg-white" style={{ borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                        <div className="card-body py-2 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <div className={`p-2 rounded-circle ${soundEnabled ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`fa ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>
                                        Move to Bank / Payout Sound Alerts: <span className={soundEnabled ? 'text-success' : 'text-danger'}>{soundEnabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</span>
                                    </h6>
                                    <small className="text-muted" style={{ fontSize: '11px' }}>
                                        Automatic sound chime on new Payouts & status updates (Success, Pending, Failed). Works in sleepmode / background.
                                    </small>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <div className="btn-group btn-group-sm">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success fw-bold py-1"
                                        onClick={() => playTxnSound('success')}
                                        title="Test Success Chime"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa fa-play me-1"></i>Success Sound
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning text-dark fw-bold py-1"
                                        onClick={() => playTxnSound('pending')}
                                        title="Test Pending Chime"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa fa-play me-1"></i>Pending Sound
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger fw-bold py-1"
                                        onClick={() => playTxnSound('failed')}
                                        title="Test Failed Sound"
                                        style={{ fontSize: '11px' }}
                                    >
                                        <i className="fa fa-play me-1"></i>Failed Sound
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className={`btn btn-sm ${soundEnabled ? 'btn-success' : 'btn-outline-secondary'} fw-bold px-3 py-1`}
                                    onClick={() => {
                                        const next = !soundEnabled;
                                        setSoundEnabled(next);
                                        if (next) playTxnSound('success');
                                    }}
                                    style={{ borderRadius: '6px', fontSize: '12px' }}
                                >
                                    {soundEnabled ? '🔊 Mute Alert' : '🔈 Enable Alert'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="card custom-card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row align-items-end">
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold">From Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold">To Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-primary w-100" onClick={applyFilters}>
                                        <i className="fa fa-filter me-2"></i> Filter
                                    </button>
                                </div>
                                <div className="col-md-2 d-flex align-items-center gap-2">
                                    <div className="form-check form-switch mb-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="dateFilterToggle"
                                            checked={useDateFilter}
                                            onChange={(e) => setUseDateFilter(e.target.checked)}
                                            style={{ cursor: 'pointer', width: '2.5em', height: '1.25em' }}
                                        />
                                        <label
                                            className="form-check-label small"
                                            htmlFor="dateFilterToggle"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Date
                                        </label>
                                    </div>
                                    <button
                                        className={`btn ${useDateFilter ? 'btn-warning' : 'btn-success'} flex-grow-1`}
                                        onClick={downloadTodayTxns}
                                        title={useDateFilter ? `Download ${filters.startDate} to ${filters.endDate}` : 'Download Today'}
                                    >
                                        <i className="fa fa-download me-1"></i>
                                        {useDateFilter ? 'Range' : 'Today'}
                                    </button>
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-primary w-100" onClick={navigateToSummary}>
                                        <i className='fa fa-exchange-alt me-1'></i> Summary
                                    </button>
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-warning w-100" onClick={openAepsSlabDrawer}>
                                        <i className='fa fa-fingerprint me-1'></i> Aeps
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Summary Row */}
                    <div className="row">
                        <div className="col-md-4">
                            {renderSummaryCard("AEPS", reports.summaries.aeps)}
                        </div>
                        <div className="col-md-4">
                            {renderSummaryCard("Utility", reports.summaries.recharge)}
                        </div>
                        <div className="col-md-4">
                            {renderSummaryCard("IMPS", reports.summaries.payout)}
                        </div>
                    </div>

                    {/* AEPS Slab Stats & Amount Slab Table moved to Drawer */}

                    {/* Tables Row */}
                    <div className="row">
                        <div className="col-12 col-xl-4 mb-4">
                            <div className="card custom-card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">AEPS Reports</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Merchant / Shop</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.aepsTransaction.data.length > 0 ? reports.aepsTransaction.data.map((report, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="fw-bold text-danger">({report.company_name || "N/A"})</div>
                                                            <div className="fw-bold">{report.shop_name || "N/A"}</div>
                                                            <div className="text-muted small">{report.user_name} ({report.user_mid})</div>
                                                            <div className="text-muted smallest">{report.created_at}</div>
                                                        </td>
                                                        <td className="fw-bold text-primary">{report.type}- ₹{report.amount}</td>
                                                        <td>
                                                            <span className={`badge bg-${report.status?.toLowerCase() === 'success' ? 'success' : report.status?.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="3" className="text-center py-4">No AEPS records found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-3 pb-3">
                                        {renderPagination(reports.aepsTransaction, 'aeps_page')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-xl-4 mb-4">
                            <div className="card custom-card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Utility Reports</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Merchant / Shop</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.recharge.data.length > 0 ? reports.recharge.data.map((report, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <div className="fw-bold text-danger text-truncate">({report.company_name || "N/A"})</div>
                                                                    <div className="fw-bold text-truncate">{report.shop_name || "N/A"}</div>
                                                                    <div className="text-muted small text-truncate">{report.user_name} ({report.user_mid})</div>

                                                                    {/* Details under Name & Role */}
                                                                    <div className="mt-1 pt-1 border-top" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                                                        <div>
                                                                            <span className="text-muted">API: </span>
                                                                            <span className="fw-semibold text-primary">{report.api_name || "N/A"}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted">Operator: </span>
                                                                            <span className="fw-semibold">{report.operator_name || report.oprator || "N/A"}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted">Recharge No: </span>
                                                                            <span className="fw-bold text-success">{report.number || "N/A"}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-muted smallest mt-1"><i className="fa fa-clock me-1"></i>{report.created_at}</div>
                                                                </div>

                                                                {/* JSON Response Icon Button */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary ms-2"
                                                                    onClick={() => openResponseModal(report)}
                                                                    title="View Response Data JSON"
                                                                    style={{ padding: '3px 7px', fontSize: '11px', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                                                >
                                                                    <i className="fa fa-code me-1"></i>JSON
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="fw-bold text-primary">₹{report.amount}</td>
                                                        <td>
                                                            <span className={`badge bg-${report.status === 'success' ? 'success' : report.status === 'pending' ? 'warning' : 'danger'}`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="3" className="text-center py-4">No Utility records found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-3 pb-3">
                                        {renderPagination(reports.recharge, 'recharge_page')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-xl-4 mb-4">
                            <div className="card custom-card border-0 shadow-sm h-100">
                                <div className="card-header bg-white py-2 d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Payout Reports</h6>
                                    <span className="badge bg-primary" style={{ fontSize: '10px' }}>{reports.payout.data.length} Records</span>
                                </div>
                                <div className="card-body p-2" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                                    {reports.payout.data.length > 0 ? reports.payout.data.map((report, index) => (
                                        <div
                                            key={index}
                                            className="card mb-2 border-0 shadow-sm overflow-hidden"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            {/* Compact Header with Status */}
                                            <div
                                                className={`px-2 py-1 d-flex justify-content-between align-items-center ${report.status?.toLowerCase() === 'success' ? 'bg-success' :
                                                    report.status?.toLowerCase() === 'pending' ? 'bg-warning' : 'bg-danger'
                                                    }`}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <i className={`fa ${report.status?.toLowerCase() === 'success' ? 'fa-check-circle text-white' :
                                                        report.status?.toLowerCase() === 'pending' ? 'fa-clock text-dark' : 'fa-times-circle text-white'
                                                        } me-1`} style={{ fontSize: '11px' }}></i>
                                                    <span className={`fw-semibold ${report.status?.toLowerCase() === 'pending' ? 'text-dark' : 'text-white'}`} style={{ fontSize: '11px' }}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <span className={`badge ${report.status?.toLowerCase() === 'pending' ? 'bg-dark' : 'bg-white'} ${report.status?.toLowerCase() === 'pending' ? 'text-white' : 'text-dark'}`} style={{ fontSize: '9px', padding: '2px 5px' }}>
                                                    {report.bene_type == 3 ? "Move To Bank" : "Money Transfer"}
                                                </span>
                                            </div>

                                            {/* Compact Card Body */}
                                            <div className="p-2">
                                                {/* Merchant + Amount Row */}
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div
                                                            className="fw-bold text-primary text-truncate"
                                                            style={{ fontSize: '12px', cursor: 'pointer' }}
                                                            onClick={() => openHistory(report)}
                                                            title="Click to view transaction history"
                                                        >
                                                            {report.shop_name || "N/A"}
                                                            <i className="fa fa-history ms-1" style={{ fontSize: '10px' }}></i>
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '10px' }}>{report.user_name} • {report.user_mid}</div>
                                                    </div>
                                                    <div
                                                        className="bg-primary text-white px-2 py-1 rounded-2 d-flex align-items-center ms-2"
                                                        onClick={() => copyToClipboard(report.amount, 'Amount')}
                                                        style={{ cursor: 'pointer', fontSize: '12px' }}
                                                        title="Copy amount"
                                                    >
                                                        <span className="fw-bold">₹{Number(report.amount).toLocaleString()}</span>
                                                        <i className="fa fa-copy ms-1 opacity-75" style={{ fontSize: '9px' }}></i>
                                                    </div>
                                                </div>

                                                {/* Bank Details - Compact */}
                                                <div className="bg-light rounded-2 p-1 mb-2">
                                                    <div className="row g-1">
                                                        <div className="col-7">
                                                            <div
                                                                className="bg-white rounded-1 px-2 py-1 d-flex justify-content-between align-items-center"
                                                                onClick={() => copyToClipboard(report.account, 'Account')}
                                                                style={{ cursor: 'pointer', fontSize: '10px' }}
                                                                title="Copy account"
                                                            >
                                                                <div>
                                                                    <span className="text-muted d-block" style={{ fontSize: '9px' }}>A/C</span>
                                                                    <span className="fw-semibold text-dark">{report.account}</span>
                                                                </div>
                                                                <i className="fa fa-copy text-primary" style={{ fontSize: '10px' }}></i>
                                                            </div>
                                                        </div>
                                                        <div className="col-5">
                                                            <div
                                                                className="bg-white rounded-1 px-2 py-1 d-flex justify-content-between align-items-center h-100"
                                                                onClick={() => copyToClipboard(report.ifsc, 'IFSC')}
                                                                style={{ cursor: 'pointer', fontSize: '10px' }}
                                                                title="Copy IFSC"
                                                            >
                                                                <div>
                                                                    <span className="text-muted d-block" style={{ fontSize: '9px' }}>IFSC</span>
                                                                    <span className="fw-semibold text-dark">{report.ifsc}</span>
                                                                </div>
                                                                <i className="fa fa-copy text-primary" style={{ fontSize: '10px' }}></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer - Compact */}
                                                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '10px' }}>
                                                    <div className="text-muted">
                                                        <i className="fa fa-university me-1"></i>{report.bank}
                                                        <span className="mx-1">•</span>
                                                        <i className="fa fa-clock me-1"></i>{report.created_at?.split(' ')[1] || report.created_at}
                                                        <span className="badge bg-warning-transparent text-warning ms-1" style={{ fontSize: '9px', padding: '1px 4px' }}>{report.payout_type}</span>
                                                    </div>
                                                    {report.status?.toLowerCase() === 'pending' && (
                                                        <button
                                                            onClick={() => handleApprovePayout(report)}
                                                            className="btn btn-success py-0 px-2"
                                                            style={{ fontSize: '10px' }}
                                                        >
                                                            <i className="fa fa-check"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4">
                                            <i className="fa fa-inbox text-muted mb-2" style={{ fontSize: '32px' }}></i>
                                            <div className="text-muted small">No Payout records found</div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-white border-top px-2 py-1">
                                    {renderPagination(reports.payout, 'payout_page')}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Approve Payout Modal - Premium Bank-Grade Design */}
            {showApproveModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
                        <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '12px' }}>
                            {/* Compact Premium Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className="fa fa-check-double text-white" style={{ fontSize: '12px' }}></i>
                                    </div>
                                    <span className="text-white fw-semibold" style={{ fontSize: '14px' }}>Update Payout</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fa fa-times text-white" style={{ fontSize: '11px' }}></i>
                                </button>
                            </div>

                            {/* Compact Body */}
                            <div style={{ padding: '14px 16px' }}>
                                {/* Status & UTR in Compact Grid */}
                                <div className="row g-2">
                                    {/* Status Select */}
                                    <div className="col-5">
                                        <label className="text-muted text-uppercase fw-semibold" style={{ fontSize: '9px', letterSpacing: '0.5px', marginBottom: '4px', display: 'block' }}>
                                            Status
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                className="form-select"
                                                value={payoutForm.status}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, status: e.target.value })}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '8px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e0e0e0',
                                                    background: payoutForm.status === 'success' ? '#e8f5e9' : payoutForm.status === 'failed' ? '#ffebee' : '#fff3e0',
                                                    color: payoutForm.status === 'success' ? '#2e7d32' : payoutForm.status === 'failed' ? '#c62828' : '#c6a928ff',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="success">✓ SUCCESS</option>
                                                <option value="failed">✕ FAILED</option>
                                                <option value="pending" disabled>⏳ PENDING</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* UTR Input */}
                                    <div className="col-7">
                                        <label className="text-muted text-uppercase fw-semibold" style={{ fontSize: '9px', letterSpacing: '0.5px', marginBottom: '4px', display: 'block' }}>
                                            UTR / Reference
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="fa fa-hashtag" style={{
                                                position: 'absolute',
                                                left: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '10px',
                                                color: '#9e9e9e'
                                            }}></i>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter UTR"
                                                value={payoutForm.utr}
                                                disabled={payoutForm.status.toLowerCase() === 'pending'}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, utr: e.target.value })}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '8px 10px 8px 28px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e0e0e0',
                                                    fontFamily: 'monospace',
                                                    letterSpacing: '0.5px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compact Footer */}
                            <div style={{
                                padding: '10px 16px 14px',
                                background: '#fafafa',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        background: '#fff',
                                        color: '#666',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={payoutForm.status.toLowerCase() === 'pending' ? null : submitPayoutUpdate}
                                    disabled={loading}
                                    style={{
                                        flex: 2,
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        border: 'none',
                                        borderRadius: '6px',
                                        background: loading || payoutForm.status.toLowerCase() === 'pending' ? '#90caf9' : 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                                        color: '#fff',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: loading ? 'none' : '0 2px 8px rgba(21,101,192,0.25)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '10px' }}></i>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-paper-plane" style={{ fontSize: '10px' }}></i>
                                            <span>Update Status</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Passbook/History Drawer with Tabs */}
            <Drawer
                title={
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Transaction History</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                            {selectedUser?.shop_name || selectedUser?.user_name || 'User'} • ID: {selectedUser?.user_id || selectedUser?.user_mid}
                        </div>
                    </div>
                }
                width={750}
                onClose={() => setPassbookVisible(false)}
                open={passbookVisible}
                styles={{
                    body: { padding: 0 },
                    header: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderBottom: 'none'
                    }
                }}
            >
                <Tabs
                    activeKey={activeDrawerTab}
                    onChange={handleDrawerTabChange}
                    style={{ padding: '0 16px' }}
                    items={[
                        {
                            key: 'passbook',
                            label: (
                                <span>
                                    <i className="fa fa-wallet me-2"></i>
                                    Wallet Passbook
                                </span>
                            ),
                            children: (
                                <Table
                                    columns={passbookColumns}
                                    dataSource={passbookData}
                                    loading={passbookLoading}
                                    rowKey={(record, index) => record.id || index}
                                    pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `Total ${total} transactions` }}
                                    size="small"
                                    scroll={{ y: 'calc(100vh - 280px)' }}
                                />
                            )
                        },
                        {
                            key: 'beneficiaries',
                            label: (
                                <span>
                                    <i className="fa fa-bank me-2"></i>
                                    Beneficiaries
                                    {beneficiariesSummary?.total_count > 0 && (
                                        <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>
                                            {beneficiariesSummary.total_count}
                                        </Tag>
                                    )}
                                </span>
                            ),
                            children: (
                                <div>
                                    {/* Summary Cards */}
                                    {beneficiariesSummary && (
                                        <div style={{
                                            display: 'flex',
                                            gap: 12,
                                            marginBottom: 16,
                                            padding: '12px 0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}>
                                            <div style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                                borderRadius: 8,
                                                padding: '10px 14px',
                                                color: '#fff'
                                            }}>
                                                <div style={{ fontSize: 11, opacity: 0.9 }}>Total</div>
                                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                                    {beneficiariesSummary.total_count || 0}
                                                </div>
                                            </div>
                                            <div style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                                                borderRadius: 8,
                                                padding: '10px 14px',
                                                color: '#fff'
                                            }}>
                                                <div style={{ fontSize: 11, opacity: 0.9 }}>Move To Bank</div>
                                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                                    {beneficiariesSummary.move_to_bank_count || 0}
                                                </div>
                                            </div>
                                            <div style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                                                borderRadius: 8,
                                                padding: '10px 14px',
                                                color: '#fff'
                                            }}>
                                                <div style={{ fontSize: 11, opacity: 0.9 }}>DMT</div>
                                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                                    {beneficiariesSummary.dmt_count || 0}
                                                </div>
                                            </div>
                                            <div style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                                borderRadius: 8,
                                                padding: '10px 14px',
                                                color: '#fff'
                                            }}>
                                                <div style={{ fontSize: 11, opacity: 0.9 }}>Verified</div>
                                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                                    {beneficiariesSummary.verified_count || 0}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {beneficiariesLoading ? (
                                        <div style={{ textAlign: 'center', padding: 40 }}>
                                            <Spin size="large" />
                                            <div style={{ marginTop: 12, color: '#666' }}>Loading beneficiaries...</div>
                                        </div>
                                    ) : (
                                        <Table
                                            columns={beneficiariesColumns}
                                            dataSource={beneficiariesData}
                                            rowKey={(record, index) => record.id || index}
                                            pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `Total ${total} beneficiaries` }}
                                            size="small"
                                            scroll={{ y: 'calc(100vh - 380px)' }}
                                        />
                                    )}
                                </div>
                            )
                        }
                    ]}
                />
            </Drawer>

            {/* AEPS Slab Analysis Drawer */}
            <Drawer
                title={
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>AEPS Analysis</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                            Merchant Volume & Transaction Amount Stats
                        </div>
                    </div>
                }
                width={500}
                onClose={() => setAepsDrawerVisible(false)}
                open={aepsDrawerVisible}
                styles={{
                    body: { padding: '16px', background: '#f8f9fa' },
                    header: {
                        background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)', // Orange/Red gradient for AEPS
                        borderBottom: 'none'
                    }
                }}
            >
                {/* 1. Merchant Volume Statistics */}
                <div className="mb-4">
                    <h6 className="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2">Merchant Volume Statistics</h6>
                    <div className="row g-2">
                        {[
                            { label: '0 - 20k', key: '0_20k' },
                            { label: '20k - 50k', key: '20k_50k' },
                            { label: '50k - 1L', key: '50k_1L' },
                            { label: '1L - 2L', key: '1L_2L' },
                            { label: '2L - 5L', key: '2L_5L' },
                            { label: '5L - 25L', key: '5L_25L' },
                            { label: '25L - 75L', key: '25L_75L' },
                            { label: '75L - 2Cr', key: '75L_2Cr' },
                            { label: '2Cr - 10Cr', key: '2Cr_10Cr' },
                            { label: '10Cr - 500Cr', key: '10Cr_500Cr' }
                        ].map((slab) => {
                            const count = reports.slab_stats ? (reports.slab_stats[`count_${slab.key}`] || 0) : 0;
                            const amount = reports.slab_stats ? (reports.slab_stats[`amount_${slab.key}`] || 0) : 0;
                            // Only show if there is data to keep it clean, or show all? 
                            // Showing all for layout consistency but maybe dimming empty ones.
                            const hasData = count > 0;

                            return (
                                <div className="col-6" key={slab.key}>
                                    <div className={`p-2 rounded bg-white shadow-sm border-start border-4 ${hasData ? 'border-primary' : 'border-light'}`} style={{ opacity: hasData ? 1 : 0.7 }}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="badge bg-light text-dark border">{slab.label}</span>
                                            {hasData && <i className="fa fa-chart-bar text-primary opacity-50"></i>}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <div className="h5 mb-0 fw-bold text-dark">{count}</div>
                                                <div style={{ fontSize: '9px' }} className="text-muted text-uppercase">Merchants</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success small">₹{Number(amount).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Transaction Amount Analysis */}
                <div>
                    <h6 className="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2">Transaction Amount Analysis</h6>
                    {reports.amount_slabs && reports.amount_slabs.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                            {reports.amount_slabs.map((slab, index) => (
                                <div key={index} className="bg-white p-3 rounded shadow-sm d-flex justify-content-between align-items-center position-relative overflow-hidden">
                                    <div className="position-absolute start-0 top-0 bottom-0 bg-success" style={{ width: '4px' }}></div>

                                    {/* Left: Slab Info */}
                                    <div className="d-flex flex-column">
                                        <div className="text-muted small text-uppercase" style={{ fontSize: '10px' }}>Amount Slab</div>
                                        <div className="fw-bold text-dark">{slab.amt_slab}</div>
                                    </div>

                                    {/* Middle: Count */}
                                    <div className="text-center px-2 border-start border-end mx-2 flex-grow-1">
                                        <div className="text-primary fw-bold h5 mb-0">{slab.txn_count}</div>
                                        <div className="text-muted" style={{ fontSize: '9px' }}>Txns</div>
                                    </div>

                                    {/* Right: Total Amount */}
                                    <div className="text-end">
                                        <div className="text-muted small text-uppercase" style={{ fontSize: '10px' }}>Total Volume</div>
                                        <div className="fw-bold text-success">₹{Number(slab.total_amount).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-white rounded shadow-sm">
                            <i className="fa fa-info-circle text-muted mb-2" style={{ fontSize: '24px' }}></i>
                            <div className="text-muted small">No amount analysis data available</div>
                        </div>
                    )}
                </div>
            </Drawer>

            {/* Recharge Response Data JSON Modal */}
            <Modal
                title={
                    <div className="d-flex align-items-center gap-2">
                        <i className="fa fa-code text-primary" style={{ fontSize: '18px' }}></i>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>Recharge Response Data</div>
                            <div style={{ fontSize: '11px', color: '#666', fontWeight: 400 }}>
                                Number: {selectedRechargeData?.number || 'N/A'} • Operator: {selectedRechargeData?.operator_name || selectedRechargeData?.oprator || 'N/A'}
                            </div>
                        </div>
                    </div>
                }
                open={responseModalVisible}
                onCancel={() => setResponseModalVisible(false)}
                width={650}
                footer={[
                    <button
                        key="copy"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                            if (!selectedRechargeData?.response_data) {
                                toast.info('No response data to copy');
                                return;
                            }
                            let textToCopy = selectedRechargeData.response_data;
                            try {
                                const parsed = typeof textToCopy === 'string' ? JSON.parse(textToCopy) : textToCopy;
                                textToCopy = JSON.stringify(parsed, null, 2);
                            } catch (e) { }
                            copyToClipboard(textToCopy, 'Response Data');
                        }}
                    >
                        <i className="fa fa-copy me-1"></i> Copy JSON
                    </button>,
                    <button
                        key="close"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setResponseModalVisible(false)}
                    >
                        Close
                    </button>
                ]}
            >
                <div style={{ padding: '8px 0' }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 p-2 bg-light rounded gap-2" style={{ fontSize: '12px' }}>
                        <div>
                            <span className="text-muted">API:</span> <strong>{selectedRechargeData?.api_name || 'N/A'}</strong>
                        </div>

                        <div>
                            <span className="text-muted">Amount:</span> <strong className="text-primary">₹{selectedRechargeData?.amount || 0}</strong>
                        </div>
                        <div>
                            <span className={`badge bg-${selectedRechargeData?.status?.toLowerCase() === 'success' ? 'success' : selectedRechargeData?.status?.toLowerCase() === 'pending' ? 'warning' : 'danger'}`}>
                                {selectedRechargeData?.status}
                            </span>
                        </div>
                    </div>
                    <label className="fw-bold small mb-1">Response Data Payload (JSON):</label>
                    <pre style={{
                        background: '#1e1e1e',
                        color: '#50fa7b',
                        padding: '14px',
                        borderRadius: '8px',
                        maxHeight: '420px',
                        overflowY: 'auto',
                        fontSize: '12px',
                        fontFamily: 'Consolas, Monaco, monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                    }}>
                        {(() => {
                            if (!selectedRechargeData?.response_data) {
                                return <span style={{ color: '#888' }}>No response data recorded for this recharge.</span>;
                            }
                            try {
                                const parsed = typeof selectedRechargeData.response_data === 'string'
                                    ? JSON.parse(selectedRechargeData.response_data)
                                    : selectedRechargeData.response_data;
                                return JSON.stringify(parsed, null, 2);
                            } catch (err) {
                                return selectedRechargeData.response_data;
                            }
                        })()}
                    </pre>
                </div>
            </Modal>
        </div>
    );
};

export default Reports;

