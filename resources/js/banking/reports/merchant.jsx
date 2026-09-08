import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { Table, Tag, Button, Drawer, Modal, Avatar, Tooltip, Space, Typography, Card, Descriptions, Badge, Row, Col, Statistic, DatePicker, Tabs, Input, Checkbox, Divider, Select, message as antMessage } from 'antd';
import { EyeOutlined, HistoryOutlined, TeamOutlined, BankOutlined, UserOutlined, WhatsAppOutlined, ShareAltOutlined, CheckSquareOutlined, BorderOutlined, CopyOutlined, EyeOutlined as PreviewIcon, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../core/hooks/context';
import { ApiOutlined } from '@mui/icons-material';
import WhatsAppShareModal from './components/WhatsAppShareModal';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Search } = Input;

const TRUNCATE_LEN = 20;

const CompanyInfoCell = ({ parts, rowKey }) => {
    const [expanded, setExpanded] = useState({});
    const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

    return (
        <div style={{ fontSize: '12px', lineHeight: '20px' }}>
            {parts.map((part, i) => {
                let faIcon = 'fa-building', color = '#595959';
                if (part.startsWith('MID:')) { faIcon = 'fa-id-badge'; color = '#1890ff'; }
                else if (part.startsWith('Shop:')) { faIcon = 'fa-store'; color = '#52c41a'; }
                else if (part.startsWith('R:')) { faIcon = 'fa-user-tie'; color = '#722ed1'; }

                const isLong = part.length > TRUNCATE_LEN;
                const isOpen = expanded[i];
                const display = isLong && !isOpen ? part.slice(0, TRUNCATE_LEN) + '…' : part;

                return (
                    <div key={`${rowKey}-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 3 }}>
                        <i className={`fa ${faIcon} mt-1`} style={{ color, flexShrink: 0, width: 13, textAlign: 'center' }} />
                        <span style={{ color, wordBreak: 'break-word', flex: 1 }}>{display}</span>
                        {isLong && (
                            <Tooltip title={isOpen ? 'Collapse' : 'Show full'}>
                                <i
                                    className={`fa ${isOpen ? 'fa-eye-slash' : 'fa-eye'} mt-1`}
                                    onClick={() => toggle(i)}
                                    style={{ cursor: 'pointer', color: '#1890ff', flexShrink: 0 }}
                                />
                            </Tooltip>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const ListUser = () => {
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
    const [selectedAdmin, setSelectedAdmin] = useState('all');
    const [commissionSummary, setCommissionSummary] = useState(null);

    // WhatsApp Share Modal
    const [shareVisible, setShareVisible] = useState(false);


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

        apiService.vGet('/api/admin/users', { params: query }).then(res => {
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

    const fetchChildRoles = async (parentId, level) => {
        try {
            const apiService = ApiService();
            // Using 'admin_id' parameter as per backend implementation
            const response = await apiService.vPost('/api/v2/aeps/roles-by-user', { admin_id: parentId });

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
            setSelectedAdmin(user.id);
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

    // Actions
    const openPassbook = (user) => {
        setSelectedUser(user);
        setPassbookVisible(true);
        setPassbookSearch('');
        setPassbookTypeFilter('');
        setPassbookPagination({ current: 1, pageSize: 50, total: 0 });
        fetchPassbook(user.id, 1, 50, '', '');
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
        fetchPassbook(selectedUser.id, 1, passbookPagination.pageSize, value, passbookTypeFilter);
    };

    const handlePassbookTypeChange = (value) => {
        setPassbookTypeFilter(value);
        fetchPassbook(selectedUser.id, 1, passbookPagination.pageSize, passbookSearch, value);
    };

    const handlePassbookTableChange = (pag) => {
        fetchPassbook(selectedUser.id, pag.current, pag.pageSize, passbookSearch, passbookTypeFilter);
    };

    const openKyc = (user) => {
        setSelectedUser(user);
        setKycVisible(true);
        setKycLoading(true);
        apiService.vGet(`/api/admin/users/${user.id}/kyc`).then(res => {
            setKycData(res.data);
            setKycLoading(false);
        }).catch(() => setKycLoading(false));
    };

    const openReferrals = (user) => {
        setSelectedUser(user);
        setReferralsVisible(true);
        setReferralsLoading(true);
        apiService.vGet(`/api/admin/users/${user.id}/referrals`).then(res => {
            setReferralsData(res.data.data);
            setReferralsLoading(false);
        }).catch(() => setReferralsLoading(false));
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
                                <i className="fa fa-user me-1 text-muted"></i>
                                {record.contact?.mid || '-'}
                            </div>
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
                                {dayjs(record.created_at).format('DD MMM YYYY') || '-'}
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
            width: 220,
            render: (text, record) => {
                if (!text) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
                const parts = text.split(' | ').filter(Boolean);
                return <CompanyInfoCell parts={parts} rowKey={record.id} />;
            },
        },
        {
            title: 'Balances',
            key: 'balances',
            render: (_, record) => (
                <div style={{ minWidth: '120px' }}>
                    <div className="d-flex">
                        <Text type="secondary">Total Amount:&nbsp;&nbsp;&nbsp;</Text>
                        <Text strong onClick={() => openPassbook(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
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
                    { label: 'Cash Deposit', value: record.business?.cd ?? 0, color: '#52c41a' },
                    { label: 'Aadhar Pay', value: record.business?.ap ?? 0, color: '#fa541c' },
                    { label: 'M-ATM', value: record.business?.atm ?? 0, color: '#722ed1' },
                    { label: 'CMS', value: record.business?.cms ?? 0, color: '#eb2f96' },
                    { label: 'Utility', value: record.business?.utility ?? 0, color: '#13c2c2' },
                    { label: 'Commission', value: record.business?.commission ?? 0, color: '#1677ff' },
                    { label: 'Charge', value: record.business?.charge ?? 0, color: '#ff4d4f' },
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
                                    onClick={() => item.click && openPassbook(record)}
                                    style={{
                                        fontWeight: item.click ? 600 : 500,
                                        cursor: item.click ? 'pointer' : 'default',
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
                    <Tooltip title="Passbook">
                        <Button size="small" icon={<HistoryOutlined />} onClick={() => openPassbook(record)} />
                    </Tooltip>
                    <Tooltip title="Referrals">
                        <Button size="small" icon={<TeamOutlined />} onClick={() => openReferrals(record)} />
                    </Tooltip>
                    {/* <Tooltip title="Edit">
                        <Link to={`/users/edit/${record.id}`}>
                            <Button size="small" icon={<EyeOutlined />} />
                        </Link>
                    </Tooltip> */}
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
            const response = await apiService.vGet('/api/v2/aeps/get-all-admins');
            if (response.data.status === 1) {
                setUniqueAdmins(response.data.admins || []);
            }
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        }
    };

    return (
        <>
            <Pageheader mainheading="Associate List" parentfolder="Banking" activepage="Associate List"
                buttons={(user.role === "1" || (user.role === "2" && user.is_api_partner === true) || user.id === 21) && (
                    <>
                        <Link to="/banking/api-merchant/list" className='btn btn-primary'> <ApiOutlined /> API MERCHANT</Link>
                    </>
                )}
            />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    <div className="card">
                        <div className="card-header">
                            <div className="row justify-content-between align-items-center g-3">
                                <div className="col-12 col-md-auto">
                                    <h4 className="mb-0">Associate List</h4>
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
                                                    <option value="all">All Admins</option>
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
                                            <Space wrap>
                                                <Search
                                                    placeholder="Search Name/Mobile/MID/ID"
                                                    allowClear
                                                    onSearch={handleSearch}
                                                    style={{ width: 220 }}
                                                />
                                                <RangePicker onChange={handleDateChange} />
                                                <Button
                                                    type="primary"
                                                    icon={<i className="fa fa-download" />}
                                                    onClick={() => {
                                                        const query = {
                                                            ...filters,
                                                            aeps_status: activeTab !== 'all' ? activeTab : undefined
                                                        };
                                                        const apiService = ApiService();
                                                        apiService.vGet('/api/admin/users/export', {
                                                            params: query,
                                                            responseType: 'blob'
                                                        }).then((response) => {
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `merchant_list_${new Date().toISOString().slice(0, 10)}.csv`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        }).catch(err => {
                                                            console.error("Export failed", err);
                                                        });
                                                    }}
                                                >
                                                    Export CSV
                                                </Button>
                                                <Button
                                                    style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                                                    icon={<WhatsAppOutlined />}
                                                    onClick={() => {
                                                        setShareVisible(true);
                                                    }}
                                                >
                                                    Share
                                                </Button>
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
                                                { label: 'Cash Deposit', value: summary.business.cd, color: '#52c41a', icon: '💰' },
                                                { label: 'Aadhaar Pay', value: summary.business.ap, color: '#fa541c', icon: '👆' },
                                                { label: 'M-ATM', value: summary.business.atm, color: '#722ed1', icon: '🏧' },
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

            {/* KYC Modal */}
            <Modal
                title="KYC Details"
                open={kycVisible}
                onCancel={() => setKycVisible(false)}
                footer={null}
                width={700}
            >
                {kycLoading ? <p>Loading...</p> : (
                    kycData ? (
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Aadhaar">{kycData.aadhar_number}</Descriptions.Item>
                            <Descriptions.Item label="PAN">{kycData.pan_number}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge status={kycData.kyc_completed ? 'success' : 'warning'} text={kycData.kyc_completed ? 'Verified' : 'Pending'} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Bank">{kycData.bank_name} ({kycData.account_number})</Descriptions.Item>
                            <Descriptions.Item label="Address" span={2}>
                                {`${kycData.street}, ${kycData.vtc}, ${kycData.dist}, ${kycData.state} - ${kycData.pincode}`}
                            </Descriptions.Item>
                        </Descriptions>
                    ) : <p>No KYC data found.</p>
                )}
            </Modal>

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

            {/* ===== WhatsApp Share Modal ===== */}
            <WhatsAppShareModal 
                visible={shareVisible} 
                onCancel={() => setShareVisible(false)} 
                data={data} 
            />
        </>
    );
};

export default ListUser;
