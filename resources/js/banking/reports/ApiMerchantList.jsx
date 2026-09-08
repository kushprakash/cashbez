import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { Table, Tag, Button, Drawer, Modal, Avatar, Tooltip, Space, Typography, Card, Descriptions, Badge, Row, Col, Statistic, DatePicker, Tabs, Spin, Empty, Pagination, Input } from 'antd';
import { EyeOutlined, HistoryOutlined, TeamOutlined, BankOutlined, UserOutlined, SwapOutlined, CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, SafetyOutlined, VideoCameraOutlined, PictureOutlined, MobileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../core/hooks/context';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Search } = Input;

const ApiMerchantList = () => {
    const { userData: user, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [userRole, setUserRole] = useState(user.role);
    const [activeTab, setActiveTab] = useState('all');
    const [aepsStatusCounts, setAepsStatusCounts] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
    });
    const [filters, setFilters] = useState({});
    const [sorter, setSorter] = useState({});
    const [uniqueAdmins, setUniqueAdmins] = useState([]);
    // Drawer/Modal States
    const [passbookVisible, setPassbookVisible] = useState(false);
    const [kycVisible, setKycVisible] = useState(false);
    const [referralsVisible, setReferralsVisible] = useState(false);
    const [transactionsVisible, setTransactionsVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dynamicFilters, setDynamicFilters] = useState([]);
    // Data for Modals
    const [passbookData, setPassbookData] = useState([]);
    const [passbookLoading, setPassbookLoading] = useState(false);
    const [passbookPagination, setPassbookPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    const [passbookSearch, setPassbookSearch] = useState('');
    const [passbookTypeFilter, setPassbookTypeFilter] = useState('');
    const [kycData, setKycData] = useState(null);
    const [kycLoading, setKycLoading] = useState(false);
    const [referralsData, setReferralsData] = useState([]);
    const [referralsLoading, setReferralsLoading] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [commissionSummary, setCommissionSummary] = useState(null);
    // Transactions Drawer States
    const [transactionsData, setTransactionsData] = useState({ data: [], filters: [], summary: {} });
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [txnTab, setTxnTab] = useState('aeps');
    const [txnFilter, setTxnFilter] = useState('all');
    const [txnPage, setTxnPage] = useState(1);
    const [txnTotal, setTxnTotal] = useState(0);
    // Recharge & Bill Pay Drawer States
    const [rechargeVisible, setRechargeVisible] = useState(false);
    const [rechargeData, setRechargeData] = useState({ data: [], filters: [], summary: {} });
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const [rechargeTab, setRechargeTab] = useState('recharge');
    const [rechargeFilter, setRechargeFilter] = useState('all');
    const [rechargePage, setRechargePage] = useState(1);
    const apiService = ApiService();

    const fetchData = (params = {}) => {
        setLoading(true);
        const query = {
            page: params.pagination?.current || pagination.current,
            per_page: params.pagination?.pageSize || pagination.pageSize,
            sort_by: params.sorter?.field || 'created_at',
            sort_dir: params.sorter?.order === 'ascend' ? 'asc' : 'desc',
            ...(params.filters !== undefined ? params.filters : filters),
        };

        // Add aeps_status filter if a specific tab is active
        if (activeTab !== 'all') {
            query.aeps_status = activeTab;
        }

        apiService.vGet('/api/admin/users/api', { params: query }).then(res => {
            setData(res.data.data);
            setSummary(res.data.summary);

            // Use counts from backend if available
            if (res.data.aeps_status_counts) {
                setAepsStatusCounts(res.data.aeps_status_counts);
            } else {
                // Fallback to default
                setAepsStatusCounts({
                    all: res.data.total,
                    0: 0, 1: 0, 2: 0, 3: 0, 4: 0
                });
            }

            // Commission breakdown from main response (no extra API call!)
            if (res.data.commission_breakdown) {
                setCommissionSummary(res.data.commission_breakdown);
            }

            setPagination({
                ...params.pagination,
                total: res.data.total,
                current: res.data.current_page,
                pageSize: res.data.per_page,
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const fetchChildRoles = async (parentId = null, level) => {

        try {
            const apiService = ApiService();
            // Using 'admin_id' parameter as per backend implementation
            const response = await apiService.vPost('/api/v2/aeps/roles-by-user', { root_id: parentId });

            if (response.data.status === 1 && response.data.data && response.data.data.users && response.data.data.users.length > 0) {
                setDynamicFilters(prev => {
                    // Remove any levels deeper than or equal to current level
                    const newFilters = prev.filter(f => f.level < level);
                    // Store the single object response as data for this level
                    return [...newFilters, { level, data: response.data.data, selectedValue: null }];
                });
            } else {
                // No children found or empty data, shorten the list
                setDynamicFilters(prev => prev.filter(f => f.level < level));
            }
        } catch (err) {
            console.error('Failed to fetch child roles:', err);
        }
    };

    const handleDynamicChange = (e, level) => {
        const value = e.target.value;

        // Update the selected value for this level
        setDynamicFilters(prev => prev.map(f => {
            if (f.level === level) {
                return { ...f, selectedValue: value };
            }
            return f;
        }));

        if (value && value !== 'all') {
            fetchChildRoles(value, level + 1);
        } else {
            // If cleared or 'all', remove subsequent levels
            setDynamicFilters(prev => prev.filter(f => f.level <= level));
        }

        const newFilters = { ...filters };
        let effectiveId = value;
        if (value === 'all' || !value) {
            if (level === 0) {
                effectiveId = selectedAdmin;
            } else {
                const parent = dynamicFilters.find(f => f.level === level - 1);
                effectiveId = parent ? parent.selectedValue : selectedAdmin;
            }
        }

        if (effectiveId && effectiveId !== 'all') {
            newFilters.selected_admin_id = effectiveId;
        } else {
            delete newFilters.selected_admin_id;
        }

        setFilters(newFilters);
        fetchData({ filters: newFilters });
    };

    const handleAdminChange = (e) => {
        const value = e.target.value;
        setSelectedAdmin(value);
        const newFilters = { ...filters };
        if (value && value !== 'all') {
            newFilters.selected_admin_id = value;
        } else {
            delete newFilters.selected_admin_id;
        }
        setFilters(newFilters);
        fetchData({ filters: newFilters });
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination({ ...pagination, current: 1 }); // Reset to first page
    };

    useEffect(() => {
        fetchData({ pagination });
        if (userRole == 1) {
            fetchAdmins();
        } else {
            setSelectedAdmin('all');
            fetchChildRoles(null, 0);
        }
    }, []);

    useEffect(() => {
        // Refetch data when activeTab changes
        fetchData({ pagination: { ...pagination, current: 1 } });
    }, [activeTab]);

    useEffect(() => {
        setDynamicFilters([]); // Reset dynamic filters when admin changes
        if (selectedAdmin && selectedAdmin !== 'all') {
            fetchChildRoles(selectedAdmin, 0);
        }
    }, [selectedAdmin]);

    const handleTableChange = (newPagination, newFilters, newSorter) => {
        const mergedFilters = { ...filters, ...newFilters };
        setFilters(mergedFilters);
        setSorter(newSorter);
        fetchData({
            pagination: newPagination,
            filters: mergedFilters,
            sorter: newSorter,
        });
    };

    const handleSearch = (value) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters.q = value;
        } else {
            delete newFilters.q;
        }
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchData({ filters: newFilters, pagination: { ...pagination, current: 1 } });
    };

    // Actions
    const openPassbook = (user) => {
        setSelectedUser(user);
        setPassbookVisible(true);
        setPassbookSearch('');
        setPassbookTypeFilter('');
        setPassbookPagination({ current: 1, pageSize: 50, total: 0 });
        fetchPassbook(user.admin_id, 1, 50, '', '');
    };

    const fetchPassbook = (userId, page = 1, pageSize = 50, search = '', typeFilter = '') => {
        setPassbookLoading(true);
        const params = { page, per_page: pageSize };
        if (search) params.q = search;
        if (typeFilter) params.type = typeFilter;

        apiService.vGet(`/api/admin/users/${userId}/passbook`, { params }).then(res => {
            setPassbookData(res.data.data);
            setPassbookPagination({
                current: res.data.current_page,
                pageSize: res.data.per_page,
                total: res.data.total
            });
            setPassbookLoading(false);
        }).catch(() => setPassbookLoading(false));
    };

    const handlePassbookSearch = (value) => {
        setPassbookSearch(value);
        fetchPassbook(selectedUser.admin_id, 1, passbookPagination.pageSize, value, passbookTypeFilter);
    };

    const handlePassbookTypeChange = (value) => {
        setPassbookTypeFilter(value);
        fetchPassbook(selectedUser.admin_id, 1, passbookPagination.pageSize, passbookSearch, value);
    };

    const handlePassbookTableChange = (pag) => {
        fetchPassbook(selectedUser.admin_id, pag.current, pag.pageSize, passbookSearch, passbookTypeFilter);
    };

    const openKyc = (user) => {
        setSelectedUser(user);
        setKycVisible(true);
        setKycLoading(true);
        apiService.vGet(`/api/admin/users/${user.id}/aeps-kyc`).then(res => {
            setKycData(res.data);
            setKycLoading(false);
        }).catch(() => setKycLoading(false));
    };

    // Open Transactions Drawer (AEPS only)
    const openTransactions = (user) => {
        setSelectedUser(user);
        setTransactionsVisible(true);
        setTxnTab('aeps');
        setTxnFilter('all');
        setTxnPage(1);
        fetchTransactions(user.id, 'aeps', 'all', 1);
    };

    const fetchTransactions = (userId, tab, filter, page) => {
        setTransactionsLoading(true);
        apiService.vGet(`/api/admin/users/${userId}/transactions`, {
            params: { tab, filter, page, per_page: 50 }
        }).then(res => {
            setTransactionsData(res.data);
            setTxnTotal(res.data.data?.total || 0);
            setTransactionsLoading(false);
        }).catch(() => setTransactionsLoading(false));
    };

    const handleTxnTabChange = (key) => {
        setTxnTab(key);
        setTxnFilter('all');
        setTxnPage(1);
        fetchTransactions(selectedUser.id, key, 'all', 1);
    };

    const handleTxnFilterChange = (filter) => {
        setTxnFilter(filter);
        setTxnPage(1);
        fetchTransactions(selectedUser.id, txnTab, filter, 1);
    };

    const handleTxnPageChange = (page) => {
        setTxnPage(page);
        fetchTransactions(selectedUser.id, txnTab, txnFilter, page);
    };

    // Open Recharge & Bill Pay Drawer
    const openRechargeBill = (user) => {
        setSelectedUser(user);
        setRechargeVisible(true);
        setRechargeTab('recharge');
        setRechargeFilter('all');
        setRechargePage(1);
        fetchRecharge(user.id, 'recharge', 'all', 1);
    };

    const fetchRecharge = (userId, tab, filter, page) => {
        setRechargeLoading(true);
        apiService.vGet(`/api/admin/users/${userId}/transactions`, {
            params: { tab, filter, page, per_page: 50 }
        }).then(res => {
            setRechargeData(res.data);
            setRechargeLoading(false);
        }).catch(() => setRechargeLoading(false));
    };

    const handleRechargeTabChange = (key) => {
        setRechargeTab(key);
        setRechargeFilter('all');
        setRechargePage(1);
        fetchRecharge(selectedUser.id, key, 'all', 1);
    };

    const handleRechargeFilterChange = (filter) => {
        setRechargeFilter(filter);
        setRechargePage(1);
        fetchRecharge(selectedUser.id, rechargeTab, filter, 1);
    };

    const handleRechargePageChange = (page) => {
        setRechargePage(page);
        fetchRecharge(selectedUser.id, rechargeTab, rechargeFilter, page);
    };

    const columns = [
        {
            title: 'S.No.',
            key: 'serial',
            width: 60,
            render: (_, __, index) => {
                return (pagination.current - 1) * pagination.pageSize + index + 1;
            },
        },
        {
            title: 'User Details',
            dataIndex: 'name',
            key: 'user_details',
            width: 260,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: 0 }}>

                    <Avatar
                        icon={<UserOutlined />}
                        src={record.photo}
                        size={42}
                    />

                    <div style={{ lineHeight: '18px' }}>

                        {/* Name */}
                        <Text strong style={{ fontSize: '14px' }}>
                            {record.name}
                        </Text>

                        {/* ID + Role */}
                        <div>
                            <Text type="primary" style={{ fontSize: '12px' }}>
                                ID: {record.id} | {record.role_name}
                            </Text>
                        </div>

                        {/* Contact Numbers */}
                        <div style={{ marginTop: '2px', fontSize: '12px', color: '#595959' }}>
                            <div>
                                <i className="fa fa-phone me-1 text-muted"></i>
                                {record.contact?.mobile || '-'}
                            </div>

                            <div>
                                <i className="fa fa-envelope me-1 text-muted"></i>
                                {record.contact?.email || '-'}
                            </div>
                            <div>
                                <i className="fa fa-calendar me-1 text-muted"></i>
                                {dayjs(record.created_at).format('DD-MM-YYYY HH:mm') || '-'}
                            </div>
                        </div>

                    </div>

                </div>
            ),
        },


        {
            title: 'Company / Shop',
            dataIndex: 'company_info',
            key: 'company_info',
            render: (text) => (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxWidth: '200px' }}>
                    {text.split(' | ').map((part, i) => <div key={i}>{part}</div>)}
                </div>
            ),
        },
        {
            title: 'Balances',
            key: 'balances',
            render: (_, record) => (
                <div style={{ minWidth: '120px' }}>
                    <div className="d-flex">
                        <Text type="secondary">Total Amount:&nbsp;&nbsp;&nbsp;</Text>
                        <Text strong onClick={() => record.is_admin == 1 && openPassbook(record)} style={{ cursor: record.is_admin == 1 ? 'pointer' : 'default', color: '#1890ff' }}>
                            ₹{record.balances?.total ?? 0}
                        </Text>
                    </div>
                    <div className="d-flex" style={{ fontSize: '12px' }}>
                        <Text type="secondary">Hold Amount:&nbsp;&nbsp;&nbsp;</Text>
                        <Text type="danger">₹{record.balances?.hold ?? 0}</Text>
                    </div>
                    <div className="d-flex" style={{ fontSize: '12px' }}>
                        <Text type="secondary">Available Balance:&nbsp;&nbsp;&nbsp;</Text>
                        <Text type="success">₹{record.balances?.available ?? 0}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Business',
            key: 'business',
            render: (_, record) => {
                const items = [
                    { label: 'Cash Withdrawal', value: record.business?.cw ?? 0, color: '#1890ff', click: true },
                    { label: 'Aadhar Pay', value: record.business?.ap ?? 0, color: '#fa541c' },
                    { label: 'CMS', value: record.business?.cms ?? 0, color: '#eb2f96' },
                ];

                return (
                    <div style={{ minWidth: 120, padding: 0 }}>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    lineHeight: '18px',
                                    padding: '1px 0',
                                }}
                            >
                                <span style={{ color: '#8c8c8c' }}>{item.label}</span>

                                <span
                                    onClick={() => item.click && record.is_admin == 1 && openPassbook(record)}
                                    style={{
                                        fontWeight: item.click && record.is_admin == 1 ? 600 : 500,
                                        cursor: item.click && record.is_admin == 1 ? 'pointer' : 'default',
                                        color: item.color,
                                    }}
                                >
                                    ₹{item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            },
        },

        {
            title: 'AEPS Status',
            dataIndex: 'aeps_status',
            key: 'aeps_status',
            render: (value) => {

                const statusMap = {
                    0: { text: "Onboarding Pending", color: "blue" },
                    1: { text: "EKYC Pending", color: "orange" },
                    2: { text: "Biometric KYC Pending", color: "cyan" },
                    3: { text: "TwoFA Pending", color: "green" },
                    4: { text: "Working", color: "purple" },
                };

                const status = statusMap[value] || { text: "N/A", color: "default" };

                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },

        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View KYC">
                        <Button size="small" icon={<BankOutlined />} onClick={() => openKyc(record)} />
                    </Tooltip>
                    <Tooltip title="Transactions">
                        <Button size="small" icon={<SwapOutlined />} onClick={() => openTransactions(record)} />
                    </Tooltip>
                    {record.is_admin == 1 && (
                        <>

                            <Tooltip title="Passbook">
                                <Button size="small" icon={<HistoryOutlined />} onClick={() => openPassbook(record)} />
                            </Tooltip>

                            <Tooltip title="Recharge & Bill Payment">
                                <Button size="small" icon={<MobileOutlined />} onClick={() => openRechargeBill(record)} />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const passbookColumns = [
        { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: t => new Date(t).toLocaleString() },
        { title: 'Remark', dataIndex: 'description', key: 'description' },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <Text type={record.type === 'CR' ? 'success' : 'danger'}>
                    {record.type === 'CR' ? '+' : '-'}₹{amount}
                </Text>
            )
        },
        { title: 'Balance', dataIndex: 'balance', key: 'balance', render: b => `₹${b}` },
    ];

    const handleDateChange = (dates) => {
        const newFilters = { ...filters };
        if (dates) {
            newFilters.start_date = dates[0].format('YYYY-MM-DD');
            newFilters.end_date = dates[1].format('YYYY-MM-DD');
        } else {
            delete newFilters.start_date;
            delete newFilters.end_date;
        }
        setFilters(newFilters);
        fetchData({ filters: newFilters });
    };

    const fetchAdmins = async () => {
        try {
            const apiService = ApiService();
            const response = await apiService.vGet('/api/v2/aeps/get-all-admins?api=1');
            if (response.data.status === 1) {
                setUniqueAdmins(response.data.admins || []);
            }
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        }
    };

    return (
        <>
            <Pageheader mainheading="API Partner Merchant List" parentfolder="Banking" activepage="API Partner Merchant List" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    <div className="card">
                        <div className="card-header">
                            <div className="row justify-content-between align-items-center g-3">
                                <div className="col-12 col-md-auto">
                                    <h4 className="mb-0">API Partner Merchant List</h4>
                                </div>
                                <div className="col-12 col-md-auto">
                                    <div className="row g-2 align-items-center">
                                        {userRole && (userRole == 1) && (
                                            <div className="col-auto">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={selectedAdmin}
                                                    onChange={handleAdminChange}
                                                >
                                                    <option value="all">All API Partners</option>
                                                    {uniqueAdmins.map((admin) => (
                                                        <option key={admin.id} value={admin.id}>
                                                            {admin.name} ({admin.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Dynamic User Filters (Recursive) */}
                                        {dynamicFilters.map((levelFilter, index) => (
                                            <div className="col-auto" key={levelFilter.level}>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={levelFilter.selectedValue || ''}
                                                    onChange={(e) => handleDynamicChange(e, levelFilter.level)}
                                                >
                                                    <option value="">Select {levelFilter.data.role_name}</option>
                                                    <option value="all">All {levelFilter.data.role_name}s</option>
                                                    {levelFilter.data.users && levelFilter.data.users.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            {u.name} ({u.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                        <div className="col-auto">
                                            <Space>
                                                <Search
                                                    placeholder="Search Name/Mobile/MID/ID"
                                                    allowClear
                                                    onSearch={handleSearch}
                                                    style={{ width: 220 }}
                                                />
                                                <RangePicker onChange={handleDateChange} />
                                            </Space>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {summary && (
                        <>
                            {/* Summary Stats Row - Clean & Compact */}
                            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                {[
                                    { title: 'Available Balance', value: summary.balance, color: '#52c41a' },
                                    { title: 'AEPS Volume', value: (parseFloat(summary.business.cw) + parseFloat(summary.business.cd) + parseFloat(summary.business.ap) + parseFloat(summary.business.atm)), color: '#1890ff' },
                                    { title: 'Utility', value: summary.business.utility, color: '#13c2c2' },
                                    { title: 'Commission', value: summary.business.commission, color: '#722ed1' },
                                    { title: 'Charges', value: summary.business.charge, color: '#fa541c' },
                                    { title: 'TDS', value: summary.business.tds, color: '#fa541c' },
                                ].map((item, index) => (
                                    <Col xs={12} sm={8} md={4} lg={index < 5 ? Math.floor(24 / 5) : 4} key={index} style={{ flex: 1 }}>
                                        <div style={{
                                            background: '#fff',
                                            borderRadius: 6,
                                            padding: '12px 14px',
                                            borderLeft: `3px solid ${item.color}`,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                        }}>
                                            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                                                {item.title}
                                            </Text>
                                            <Text strong style={{ fontSize: 16, color: '#262626' }}>
                                                ₹{parseFloat(item.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {/* Business Breakdown - Professional Table */}
                            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: 6,
                                        padding: '12px 16px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <Text strong style={{ fontSize: 13, color: '#262626' }}>
                                                Business Volume
                                            </Text>
                                            <div style={{ textAlign: 'right' }}>
                                                <Text type="secondary" style={{ fontSize: 11 }}>Total AEPS: </Text>
                                                <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                                                    ₹{parseFloat((parseFloat(summary.business.cw || 0) + parseFloat(summary.business.cd || 0) + parseFloat(summary.business.ap || 0) + parseFloat(summary.business.atm || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </Text>
                                            </div>
                                        </div>
                                        <Row gutter={[12, 8]}>
                                            {[
                                                { label: 'Cash Withdrawal', value: summary.business.cw, color: '#1890ff', icon: '💸' },
                                                { label: 'Aadhaar Pay', value: summary.business.ap, color: '#fa541c', icon: '👆' },
                                                { label: 'Commission', value: summary.business.commission, color: '#13c2c2', icon: '💎' },
                                                { label: 'Charges', value: summary.business.charge, color: '#fa8c16', icon: '📋' },
                                                { label: 'TDS', value: summary.business.tds, color: '#fa8c16', icon: '📋' },
                                            ].map((item, index) => (
                                                <Col xs={12} sm={8} md={4} key={index}>
                                                    <div style={{
                                                        background: '#fafafa',
                                                        borderRadius: 4,
                                                        padding: '8px 10px',
                                                        border: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 14 }}>{item.icon}</span>
                                                            <Text style={{ fontSize: 11, color: '#595959' }}>{item.label}</Text>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                            <Text strong style={{ fontSize: 13, color: item.color }}>
                                                                ₹{parseFloat(item.value || 0).toLocaleString('en-IN')}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>

                            {/* Commission Breakdown - Professional Table */}
                            {commissionSummary && commissionSummary.categories && commissionSummary.categories.length > 0 && (
                                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                    <Col span={24}>
                                        <div style={{
                                            background: '#fff',
                                            borderRadius: 6,
                                            padding: '12px 16px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                <Text strong style={{ fontSize: 13, color: '#262626' }}>
                                                    Commission Breakdown
                                                </Text>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Text type="secondary" style={{ fontSize: 11 }}>Total: </Text>
                                                    <Text strong style={{ fontSize: 14, color: '#52c41a' }}>
                                                        ₹{parseFloat(commissionSummary.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                                        ({commissionSummary.total_count} txns)
                                                    </Text>
                                                </div>
                                            </div>
                                            <Row gutter={[12, 8]}>
                                                {commissionSummary.categories.map((cat, index) => (
                                                    <Col xs={12} sm={8} md={4} key={cat.service_type || index}>
                                                        <div style={{
                                                            background: '#fafafa',
                                                            borderRadius: 4,
                                                            padding: '8px 10px',
                                                            border: '1px solid #f0f0f0'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                                                                <Text style={{ fontSize: 11, color: '#595959' }}>{cat.label}</Text>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                                <Text strong style={{ fontSize: 13, color: cat.color }}>
                                                                    ₹{parseFloat(cat.total_amount || 0).toLocaleString('en-IN')}
                                                                </Text>
                                                                <Text type="secondary" style={{ fontSize: 10 }}>
                                                                    {cat.transaction_count} • {cat.percentage}%
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}

                    <div className="card">
                        <div className="card-body">
                            <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
                                <TabPane
                                    tab={
                                        <span>
                                            All
                                            {aepsStatusCounts.all > 0 && (
                                                <Badge count={aepsStatusCounts.all} style={{ marginLeft: 8 }} />
                                            )}
                                        </span>
                                    }
                                    key="all"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            Onboarding Pending
                                            {aepsStatusCounts[0] > 0 && (
                                                <Badge count={aepsStatusCounts[0]} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
                                            )}
                                        </span>
                                    }
                                    key="0"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            EKYC Pending
                                            {aepsStatusCounts[1] > 0 && (
                                                <Badge count={aepsStatusCounts[1]} style={{ marginLeft: 8, backgroundColor: '#fa8c16' }} />
                                            )}
                                        </span>
                                    }
                                    key="1"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            Biometric KYC Pending
                                            {aepsStatusCounts[2] > 0 && (
                                                <Badge count={aepsStatusCounts[2]} style={{ marginLeft: 8, backgroundColor: '#13c2c2' }} />
                                            )}
                                        </span>
                                    }
                                    key="2"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            TwoFA Pending
                                            {aepsStatusCounts[3] > 0 && (
                                                <Badge count={aepsStatusCounts[3]} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
                                            )}
                                        </span>
                                    }
                                    key="3"
                                />
                                <TabPane
                                    tab={
                                        <span>
                                            Working
                                            {aepsStatusCounts[4] > 0 && (
                                                <Badge count={aepsStatusCounts[4]} style={{ marginLeft: 8, backgroundColor: '#722ed1' }} />
                                            )}
                                        </span>
                                    }
                                    key="4"
                                />
                            </Tabs>

                            <Table
                                columns={columns}
                                rowKey="id"
                                dataSource={data}
                                pagination={{
                                    current: pagination.current,
                                    pageSize: pagination.pageSize,
                                    total: pagination.total,
                                    showSizeChanger: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                                    pageSizeOptions: ['10', '25', '50', '100', '500'],
                                }}
                                loading={loading}
                                onChange={handleTableChange}
                                size="small"
                                scroll={{ x: 1000 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Passbook Drawer */}
            <Drawer
                title={`Passbook: ${selectedUser?.name}`}
                width={700}
                onClose={() => setPassbookVisible(false)}
                open={passbookVisible}
            >
                <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by description..."
                        value={passbookSearch}
                        onChange={(e) => handlePassbookSearch(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ maxWidth: 250 }}
                    />
                    <select
                        value={passbookTypeFilter}
                        onChange={(e) => handlePassbookTypeChange(e.target.value)}
                        className="form-select form-select-sm"
                        style={{ maxWidth: 120 }}
                    >
                        <option value="">All Types</option>
                        <option value="CR">Credit (CR)</option>
                        <option value="DR">Debit (DR)</option>
                    </select>
                    <Text type="secondary" style={{ alignSelf: 'center' }}>
                        Total: {passbookPagination.total} entries
                    </Text>
                </div>
                <Table
                    columns={passbookColumns}
                    dataSource={passbookData}
                    loading={passbookLoading}
                    rowKey="id"
                    pagination={{
                        current: passbookPagination.current,
                        pageSize: passbookPagination.pageSize,
                        total: passbookPagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} entries`,
                        pageSizeOptions: ['25', '50', '100', '200'],
                    }}
                    onChange={handlePassbookTableChange}
                    size="small"
                />
            </Drawer>

            {/* KYC Modal - AepsDraft Data */}
            <Modal
                title={<><IdcardOutlined /> KYC Details - {selectedUser?.name}</>}
                open={kycVisible}
                onCancel={() => setKycVisible(false)}
                footer={null}
                width={800}
            >
                {kycLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div> : (
                    kycData ? (
                        <div>
                            {/* Verification Status Pills */}
                            <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <Tag color={kycData.phone_verified ? 'green' : 'red'} icon={kycData.phone_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    <PhoneOutlined /> Phone {kycData.phone_verified ? 'Verified' : 'Pending'}
                                </Tag>
                                <Tag color={kycData.email_verified ? 'green' : 'red'} icon={kycData.email_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    <MailOutlined /> Email {kycData.email_verified ? 'Verified' : 'Pending'}
                                </Tag>
                                <Tag color={kycData.aadhaar_verified ? 'green' : 'red'} icon={kycData.aadhaar_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    <IdcardOutlined /> Aadhaar {kycData.aadhaar_verified ? 'Verified' : 'Pending'}
                                </Tag>
                                <Tag color={kycData.pan_verified ? 'green' : 'red'} icon={kycData.pan_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    <SafetyOutlined /> PAN {kycData.pan_verified ? 'Verified' : 'Pending'}
                                </Tag>
                                <Tag color={kycData.bank_verified ? 'green' : 'red'} icon={kycData.bank_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    <BankOutlined /> Bank {kycData.bank_verified ? 'Verified' : 'Pending'}
                                </Tag>
                                <Tag color={kycData.video_kyc_status === 1 ? 'green' : kycData.video_kyc_status === 0 ? 'orange' : 'red'}>
                                    <VideoCameraOutlined /> Video KYC {kycData.video_kyc_status === 1 ? 'Approved' : kycData.video_kyc_status === 0 ? 'Pending' : 'Rejected'}
                                </Tag>
                            </div>

                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="MID">{kycData.mid}</Descriptions.Item>
                                <Descriptions.Item label="Full Name">{kycData.full_name}</Descriptions.Item>
                                <Descriptions.Item label="Shop Name">{kycData.shop_name}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{kycData.phone}</Descriptions.Item>
                                <Descriptions.Item label="Email" span={2}>{kycData.email}</Descriptions.Item>
                                <Descriptions.Item label="Shop Address" span={2}>
                                    {`${kycData.shop_address || ''}, ${kycData.shop_city || ''}, ${kycData.shop_district || ''} - ${kycData.shop_pin_code || ''}`}
                                </Descriptions.Item>
                                <Descriptions.Item label="Aadhaar">{kycData.aadhaar_number ? `XXXX-XXXX-${kycData.aadhaar_number.slice(-4)}` : '-'}</Descriptions.Item>
                                <Descriptions.Item label="PAN">{kycData.pan_no}</Descriptions.Item>
                                <Descriptions.Item label="Bank Name">{kycData.bank_name}</Descriptions.Item>
                                <Descriptions.Item label="IFSC">{kycData.ifsc_code}</Descriptions.Item>
                                <Descriptions.Item label="Account Number" span={2}>{kycData.account_number}</Descriptions.Item>
                                <Descriptions.Item label="AEPS Status">
                                    <Tag color={kycData.aeps_status === 4 ? 'green' : 'blue'}>
                                        {kycData.aeps_status === 4 ? 'Active' : `Status: ${kycData.aeps_status}`}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Registered">{dayjs(kycData.created_at).format('DD-MM-YYYY HH:mm')}</Descriptions.Item>
                            </Descriptions>

                            {/* Media Section */}
                            {(kycData.shop_inner || kycData.shop_outer || kycData.video_url) && (
                                <div style={{ marginTop: 16 }}>
                                    <Text strong><PictureOutlined /> Media Files</Text>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                                        {kycData.shop_inner && (
                                            <a href={kycData.shop_inner} target="_blank" rel="noopener noreferrer">
                                                <img src={kycData.shop_inner} alt="Shop Inner" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                                            </a>
                                        )}
                                        {kycData.shop_outer && (
                                            <a href={kycData.shop_outer} target="_blank" rel="noopener noreferrer">
                                                <img src={kycData.shop_outer} alt="Shop Outer" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #d9d9d9' }} />
                                            </a>
                                        )}
                                        {kycData.video_url && (
                                            <a href={kycData.video_url} target="_blank" rel="noopener noreferrer">
                                                <Tag color="blue" icon={<VideoCameraOutlined />} style={{ padding: '8px 16px' }}>View Video KYC</Tag>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : <Empty description="No KYC data found" />
                )}
            </Modal>

            {/* Transactions Drawer */}
            <Drawer
                title={<><SwapOutlined /> Transactions: {selectedUser?.name}</>}
                width={900}
                onClose={() => setTransactionsVisible(false)}
                open={transactionsVisible}
            >
                <Tabs activeKey={txnTab} onChange={handleTxnTabChange} type="card">
                    <TabPane tab={<span>💸 AEPS</span>} key="aeps" />
                    {/* <TabPane tab={<span>📱 Recharge</span>} key="recharge" />
                    <TabPane tab={<span>📋 Bill Pay</span>} key="billpay" /> */}
                </Tabs>

                {/* Pill Filters */}
                <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <Tag
                        color={txnFilter === 'all' ? 'blue' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleTxnFilterChange('all')}
                    >
                        All ({transactionsData.summary?.total_count || 0})
                    </Tag>
                    {transactionsData.filters?.map((f) => (
                        <Tag
                            key={f.key}
                            color={txnFilter === f.key ? 'blue' : 'default'}
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => handleTxnFilterChange(f.key)}
                        >
                            {f.label} ({f.count})
                        </Tag>
                    ))}
                </div>

                {/* Summary Stats */}
                {transactionsData.summary && (
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, borderLeft: '3px solid #52c41a' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Success</Text>
                                <div><Text strong style={{ color: '#52c41a' }}>{transactionsData.summary.success_count || 0}</Text></div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ background: '#fff2f0', padding: 12, borderRadius: 6, borderLeft: '3px solid #ff4d4f' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Failed</Text>
                                <div><Text strong style={{ color: '#ff4d4f' }}>{transactionsData.summary.failed_count || 0}</Text></div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 6, borderLeft: '3px solid #1890ff' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Total Amount</Text>
                                <div><Text strong style={{ color: '#1890ff', fontSize: 16 }}>₹{parseFloat(transactionsData.summary.total_amount || 0).toLocaleString('en-IN')}</Text></div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Transactions Table */}
                {transactionsLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                ) : transactionsData.data?.data?.length > 0 ? (
                    <>
                        <Table
                            dataSource={transactionsData.data.data}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            scroll={{ x: 800 }}
                            columns={
                                txnTab === 'aeps' ? [
                                    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
                                    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: t => dayjs(t).format('DD-MM-YY HH:mm'), width: 120 },
                                    { title: 'Type', dataIndex: 'aeps_type', key: 'aeps_type', render: t => <Tag>{t}</Tag>, width: 80 },
                                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: a => `₹${parseFloat(a).toLocaleString()}`, width: 100 },
                                    { title: 'Status', dataIndex: 'response_status', key: 'response_status', render: s => <Tag color={s === true ? 'green' : 'red'}>{s === true ? 'Success' : 'Failed'}</Tag>, width: 80 },
                                    { title: 'Customer', dataIndex: 'mobile', key: 'mobile', width: 110 },
                                    { title: 'RRN', dataIndex: 'rrn', key: 'rrn', width: 140 },
                                ] : [
                                    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
                                    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: t => dayjs(t).format('DD-MM-YY HH:mm'), width: 120 },
                                    { title: 'Operator', dataIndex: 'oprator', key: 'oprator', width: 120 },
                                    { title: 'Number', dataIndex: 'number', key: 'number', width: 120 },
                                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: a => `₹${parseFloat(a).toLocaleString()}`, width: 100 },
                                    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={['Success', 'SUCCESS', 'success'].includes(s) ? 'green' : 'red'}>{s}</Tag>, width: 90 },
                                    { title: 'Txn ID', dataIndex: 'operator_txn_id', key: 'operator_txn_id', width: 150 },
                                ]
                            }
                        />
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Pagination
                                current={transactionsData.data.current_page}
                                total={transactionsData.data.total}
                                pageSize={transactionsData.data.per_page}
                                onChange={handleTxnPageChange}
                                showSizeChanger={false}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="No transactions found" />
                )}
            </Drawer>

            {/* Recharge & Bill Pay Drawer */}
            <Drawer
                title={<><i className="fa fa-mobile me-2" />Recharge &amp; Bill Pay: {selectedUser?.name}</>}
                width={900}
                onClose={() => setRechargeVisible(false)}
                open={rechargeVisible}
            >
                <Tabs activeKey={rechargeTab} onChange={handleRechargeTabChange} type="card">
                    <TabPane tab={<span><i className="fa fa-mobile me-1" />Recharge</span>} key="recharge" />
                    <TabPane tab={<span><i className="fa fa-file-text me-1" />Bill Pay</span>} key="billpay" />
                </Tabs>

                {/* Pill Filters */}
                <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 12 }}>
                    <Tag
                        color={rechargeFilter === 'all' ? 'blue' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px' }}
                        onClick={() => handleRechargeFilterChange('all')}
                    >
                        All ({rechargeData.summary?.total_count || 0})
                    </Tag>
                    {rechargeData.filters?.map((f) => (
                        <Tag
                            key={f.key}
                            color={rechargeFilter === f.key ? 'blue' : 'default'}
                            style={{ cursor: 'pointer', padding: '4px 12px' }}
                            onClick={() => handleRechargeFilterChange(f.key)}
                        >
                            {f.label} ({f.count})
                        </Tag>
                    ))}
                </div>

                {/* Summary Stats */}
                {rechargeData.summary && (
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, borderLeft: '3px solid #52c41a' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Success</Text>
                                <div><Text strong style={{ color: '#52c41a' }}>{rechargeData.summary.success_count || 0}</Text></div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div style={{ background: '#fff2f0', padding: 12, borderRadius: 6, borderLeft: '3px solid #ff4d4f' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Failed</Text>
                                <div><Text strong style={{ color: '#ff4d4f' }}>{rechargeData.summary.failed_count || 0}</Text></div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 6, borderLeft: '3px solid #1890ff' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Total Amount</Text>
                                <div><Text strong style={{ color: '#1890ff', fontSize: 16 }}>₹{parseFloat(rechargeData.summary.total_amount || 0).toLocaleString('en-IN')}</Text></div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Recharge / Bill Pay Table */}
                {rechargeLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                ) : rechargeData.data?.data?.length > 0 ? (
                    <>
                        <Table
                            dataSource={rechargeData.data.data}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            scroll={{ x: 700 }}
                            columns={[
                                { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
                                { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: t => dayjs(t).format('DD-MM-YY HH:mm'), width: 120 },
                                { title: 'Operator', dataIndex: 'oprator', key: 'oprator', width: 120 },
                                { title: 'Number', dataIndex: 'number', key: 'number', width: 120 },
                                { title: 'Amount', dataIndex: 'amount', key: 'amount', render: a => `₹${parseFloat(a).toLocaleString()}`, width: 100 },
                                {
                                    title: 'Status', dataIndex: 'status', key: 'status', width: 90,
                                    render: s => <Tag color={['Success', 'SUCCESS', 'success'].includes(s) ? 'green' : 'red'}>{s}</Tag>
                                },
                                { title: 'Txn ID', dataIndex: 'operator_txn_id', key: 'operator_txn_id', width: 150 },
                            ]}
                        />
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <Pagination
                                current={rechargeData.data.current_page}
                                total={rechargeData.data.total}
                                pageSize={rechargeData.data.per_page}
                                onChange={handleRechargePageChange}
                                showSizeChanger={false}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="No transactions found" />
                )}
            </Drawer>

            {/* Referrals Modal */}
            <Modal
                title={`Referrals: ${selectedUser?.name}`}
                open={referralsVisible}
                onCancel={() => setReferralsVisible(false)}
                footer={null}
                width={600}
            >
                <Table
                    loading={referralsLoading}
                    dataSource={referralsData}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    columns={[
                        { title: 'Name', dataIndex: 'name', key: 'name' },
                        { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
                        { title: 'Role', dataIndex: 'role', key: 'role' },
                        { title: 'Joined', dataIndex: 'created_at', key: 'created_at', render: t => new Date(t).toLocaleDateString() },
                    ]}
                />
            </Modal>
        </>
    );
};

export default ApiMerchantList;
