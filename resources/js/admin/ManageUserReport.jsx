import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData, storeTokenAndUserData } from '../core/auth/tokenManager';
import { toast } from 'react-toastify';

const ManageUserReport = () => {
    const apiService = ApiService();
    const { userData, setProfile } = useContext(AuthContext) || {};
    const isSuperAdmin = userData && (userData.id == 1 || userData.role == 1 || !!localStorage.getItem('impersonatorAdmin'));

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchedData, setSearchedData] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Multi-Wallet Accounts State
    const [userAccounts, setUserAccounts] = useState([]);
    const [selectedAccountForAction, setSelectedAccountForAction] = useState(null);
    const [selectedAccountForPassbook, setSelectedAccountForPassbook] = useState(null);
    const [creatingWallets, setCreatingWallets] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);

    // Modal Visibility States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showPassbookDrawer, setShowPassbookDrawer] = useState(false);

    // Wallet Action Form State
    const [walletActionType, setWalletActionType] = useState('credit'); // credit or debit
    const [walletAmount, setWalletAmount] = useState('');
    const [walletDescription, setWalletDescription] = useState('');
    const [submittingWallet, setSubmittingWallet] = useState(false);

    // User Form State
    const [userForm, setUserForm] = useState({
        name: '',
        mobile: '',
        email: '',
        role: 4,
        status: 1,
        aadhar_number: '',
        pan_card: '',
        shop_name: ''
    });
    const [submittingUser, setSubmittingUser] = useState(false);

    // Merchant (AepsDraft) Form State
    const [merchantForm, setMerchantForm] = useState({
        latitude: '',
        longitude: '',
        shop_city: '',
        shop_address: '',
        video_url: '',
        video_kyc_status: 0,
        aeps_status: 0,
        pan_no: '',
        aadhaar_number: '',
        phone: '',
        email: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        bank_branch: '',
        deviceName: '',
        deviceIMEI: '',
        mposSerialNumber: '',
        phone_verified_at: 0,
        email_verified_at: 0,
        aadhaar_verified_at: 0,
        pan_verified_at: 0,
        bank_verified_at: 0,
        full_name: '',
        shop_name: ''
    });
    const [submittingMerchant, setSubmittingMerchant] = useState(false);

    // Report Tab States
    const [activeTab, setActiveTab] = useState('aeps'); // 'aeps', 'recharge', 'logs'

    // Date Filters for Reports
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Passbook Drawer State
    const [passbookData, setPassbookData] = useState([]);
    const [passbookLoading, setPassbookLoading] = useState(false);
    const [passbookPage, setPassbookPage] = useState(1);
    const [passbookPerPage, setPassbookPerPage] = useState(25);
    const [passbookTotal, setPassbookTotal] = useState(0);
    const [passbookLastPage, setPassbookLastPage] = useState(1);
    const [passbookTypeFilter, setPassbookTypeFilter] = useState('all');

    // Root Hierarchy Dropdowns State
    const [rootLevels, setRootLevels] = useState([]);
    const [loadingRootLevels, setLoadingRootLevels] = useState(false);

    // Report Tab Data States
    const [aepsTxns, setAepsTxns] = useState([]);
    const [aepsLoading, setAepsLoading] = useState(false);
    const [aepsPage, setAepsPage] = useState(1);
    const [aepsHasMore, setAepsHasMore] = useState(false);

    const [rechargeLogs, setRechargeLogs] = useState([]);
    const [rechargeLoading, setRechargeLoading] = useState(false);
    const [rechargePage, setRechargePage] = useState(1);
    const [rechargeHasMore, setRechargeHasMore] = useState(false);

    const [payoutLogs, setPayoutLogs] = useState([]);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutPage, setPayoutPage] = useState(1);
    const [payoutHasMore, setPayoutHasMore] = useState(false);

    const [userLogs, setUserLogs] = useState([]);
    const [userLogsLoading, setUserLogsLoading] = useState(false);
    const [userLogsPage, setUserLogsPage] = useState(1);
    const [userLogsHasMore, setUserLogsHasMore] = useState(false);

    // JSON Detail View Modal States
    const [showPayoutJsonModal, setShowPayoutJsonModal] = useState(false);
    const [selectedPayoutRecord, setSelectedPayoutRecord] = useState(null);

    const [showRechargeJsonModal, setShowRechargeJsonModal] = useState(false);
    const [selectedRechargeRecord, setSelectedRechargeRecord] = useState(null);

    const [showLogJsonModal, setShowLogJsonModal] = useState(false);
    const [selectedLogRecord, setSelectedLogRecord] = useState(null);

    // Alert Notification State
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    };

    // ── Direct Login (Impersonate User) ──
    const handleDirectLogin = async (targetUser) => {
        if (!targetUser) return;
        try {
            const currentAuth = retrieveTokenAndUserData();
            const activeToken = currentAuth?.token || localStorage.getItem('token') || '';

            const res = await apiService.vPost(
                '/api/admin/manage-user-report/impersonate',
                { user_id: targetUser.id }
            );

            if (res && (res.status === 1 || res.data?.status === 1)) {
                const data = res.data || res;
                // Save original admin session info in localStorage
                localStorage.setItem('impersonatorAdmin', JSON.stringify(data.impersonator));

                // Store target user token and userData in cookies & localStorage (identical to OTP login)
                localStorage.setItem('token', data.token);
                storeTokenAndUserData(data.token, data.user);

                if (setProfile) {
                    setProfile(data.user);
                }

                window.dispatchEvent(new Event('impersonationChanged'));
                toast.success(`Directly logged in as ${data.user.name} (${data.user.role_name || 'User'})!`);

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 400);
            } else {
                toast.error(res?.message || res?.data?.message || 'Direct login failed.');
            }
        } catch (e) {
            console.error('Direct login error:', e);
            toast.error(e?.response?.data?.message || 'Failed to execute direct login.');
        }
    };

    // Helper to format JSON response data
    const formatJsonDisplay = (data) => {
        if (!data) return 'No verification data available';
        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2);
        }
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return JSON.stringify(parsed, null, 2);
            } catch (e) {
                return data;
            }
        }
        return String(data);
    };

    // ── Search User ──
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            showAlert('danger', 'Please enter a MID, Mobile Number, or PAN Card.');
            return;
        }

        setLoadingSearch(true);
        setSearchError('');
        setSearchedData(null);
        setUserAccounts([]);

        try {
            const res = await apiService.vGet(`/api/admin/manage-user-report/search?q=${encodeURIComponent(searchQuery.trim())}`);
            if (res.data.status === 1) {
                setSearchedData(res.data);
                setUserAccounts(res.data.accounts || []);
                setAvailableRoles(res.data.roles || []);
                showAlert('success', 'User found successfully!');

                // Populate forms
                const u = res.data.user;
                setUserForm({
                    name: u.name || '',
                    mobile: u.mobile || '',
                    email: u.email || '',
                    role: u.role || 4,
                    status: u.status || 1,
                    aadhar_number: u.aadhar_number || '',
                    pan_card: u.pan_card || '',
                    shop_name: res.data.aeps_draft?.shop_name || u.shop_name || ''
                });

                if (res.data.has_aeps_draft && res.data.aeps_draft) {
                    const m = res.data.aeps_draft;
                    setMerchantForm({
                        latitude: m.latitude || '',
                        longitude: m.longitude || '',
                        shop_city: m.shop_city || '',
                        shop_address: m.shop_address || '',
                        video_url: m.video_url || '',
                        video_kyc_status: m.video_kyc_status ?? 0,
                        aeps_status: m.aeps_status ?? 0,
                        pan_no: m.pan_no || '',
                        aadhaar_number: m.aadhaar_number || '',
                        phone: m.phone || '',
                        email: m.email || '',
                        account_number: m.account_number || '',
                        ifsc_code: m.ifsc_code || '',
                        bank_name: m.bank_name || '',
                        bank_branch: m.bank_branch || '',
                        deviceName: m.deviceName || '',
                        deviceIMEI: m.deviceIMEI || '',
                        mposSerialNumber: m.mposSerialNumber || '',
                        phone_verified_at: m.phone_verified_at ? 1 : 0,
                        email_verified_at: m.email_verified_at ? 1 : 0,
                        aadhaar_verified_at: m.aadhaar_verified_at ? 1 : 0,
                        pan_verified_at: m.pan_verified_at ? 1 : 0,
                        bank_verified_at: m.bank_verified_at ? 1 : 0,
                        full_name: m.full_name || '',
                        shop_name: m.shop_name || ''
                    });
                }

                // Reset report pagination & load initial data
                setAepsPage(1);
                setRechargePage(1);
                setPayoutPage(1);
                setUserLogsPage(1);
                fetchAepsTxns(u.mid, 1, startDate, endDate);
                fetchRechargeLogs(u.id, 1, startDate, endDate);
                fetchPayoutLogs(u.id, 1, startDate, endDate);
                fetchUserLogs(u.id, 1, startDate, endDate);

            } else {
                setSearchError(res.data.message || 'User not found.');
                showAlert('danger', res.data.message || 'User not found.');
            }
        } catch (err) {
            console.error('Search error:', err);
            const msg = err.response?.data?.message || 'Error searching user. Please try again.';
            setSearchError(msg);
            showAlert('danger', msg);
        } finally {
            setLoadingSearch(false);
        }
    };

    // ── Multi-Account Action Helpers ──
    const openWalletModalForAccount = (acc, type) => {
        setSelectedAccountForAction(acc);
        setWalletActionType(type);
        setShowWalletModal(true);
    };

    const openPassbookDrawerForAccount = (acc) => {
        setSelectedAccountForPassbook(acc);
        setShowPassbookDrawer(true);
        if (searchedData?.user?.id) {
            fetchPassbookDrawer(searchedData.user.id, 1, passbookTypeFilter, startDate, endDate, acc?.id);
        }
    };

    const handleSetPrimary = async (accountId) => {
        try {
            const res = await apiService.vPost(`/api/admin/manage-user-report/set-primary-account/${accountId}`, {});
            if (res.data.status === 1) {
                showAlert('success', res.data.message || 'Primary account updated successfully!');
                if (res.data.accounts) {
                    setUserAccounts(res.data.accounts);
                }
            } else {
                showAlert('danger', res.data.message || 'Failed to update primary status.');
            }
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Error updating primary account.');
        }
    };

    const handleCreateWallets = async () => {
        if (!searchedData?.user?.id) return;
        setCreatingWallets(true);
        try {
            const res = await apiService.vPost(`/api/admin/manage-user-report/create-wallets/${searchedData.user.id}`, {});
            if (res.data.status === 1) {
                showAlert('success', res.data.message || 'Trade Wallet & Utility Wallet created successfully!');
                if (res.data.accounts) {
                    setUserAccounts(res.data.accounts);
                }
            } else {
                showAlert('danger', res.data.message || 'Failed to create wallets.');
            }
        } catch (err) {
            showAlert('danger', err.response?.data?.message || 'Error creating wallets.');
        } finally {
            setCreatingWallets(false);
        }
    };

    // ── Fetch Reports ──
    const fetchAepsTxns = async (mid, page = 1, start = '', end = '', isLoadMore = false) => {
        if (!mid) return;
        setAepsLoading(true);
        try {
            let url = `/api/admin/manage-user-report/aeps-transactions/${mid}?page=${page}&per_page=25`;
            if (start && end) url += `&start_date=${start}&end_date=${end}`;

            const res = await apiService.vGet(url);
            if (res.data.status === 1) {
                const items = res.data.data || [];
                setAepsTxns(prev => isLoadMore ? [...prev, ...items] : items);
                setAepsHasMore(res.data.current_page < res.data.last_page);
            }
        } catch (e) {
            console.error('Failed to fetch AEPS txns', e);
        } finally {
            setAepsLoading(false);
        }
    };

    const fetchRechargeLogs = async (userId, page = 1, start = '', end = '', isLoadMore = false) => {
        if (!userId) return;
        setRechargeLoading(true);
        try {
            let url = `/api/admin/manage-user-report/recharge-logs/${userId}?page=${page}&per_page=25`;
            if (start && end) url += `&start_date=${start}&end_date=${end}`;

            const res = await apiService.vGet(url);
            if (res.data.status === 1) {
                const items = res.data.data || [];
                setRechargeLogs(prev => isLoadMore ? [...prev, ...items] : items);
                setRechargeHasMore(res.data.current_page < res.data.last_page);
            }
        } catch (e) {
            console.error('Failed to fetch Recharge logs', e);
        } finally {
            setRechargeLoading(false);
        }
    };

    const fetchPayoutLogs = async (userId, page = 1, start = '', end = '', isLoadMore = false) => {
        if (!userId) return;
        setPayoutLoading(true);
        try {
            let url = `/api/admin/manage-user-report/payout-logs/${userId}?page=${page}&per_page=25`;
            if (start && end) url += `&start_date=${start}&end_date=${end}`;

            const res = await apiService.vGet(url);
            if (res.data.status === 1) {
                const items = res.data.data || [];
                setPayoutLogs(prev => isLoadMore ? [...prev, ...items] : items);
                setPayoutHasMore(res.data.current_page < res.data.last_page);
            }
        } catch (e) {
            console.error('Failed to fetch Payout logs', e);
        } finally {
            setPayoutLoading(false);
        }
    };

    const fetchUserLogs = async (userId, page = 1, start = '', end = '', isLoadMore = false) => {
        if (!userId) return;
        setUserLogsLoading(true);
        try {
            let url = `/api/admin/manage-user-report/user-logs/${userId}?page=${page}&per_page=25`;
            if (start && end) url += `&start_date=${start}&end_date=${end}`;

            const res = await apiService.vGet(url);
            if (res.data.status === 1) {
                const items = res.data.data || [];
                setUserLogs(prev => isLoadMore ? [...prev, ...items] : items);
                setUserLogsHasMore(res.data.current_page < res.data.last_page);
            }
        } catch (e) {
            console.error('Failed to fetch User logs', e);
        } finally {
            setUserLogsLoading(false);
        }
    };

    // ── Fetch Passbook Entries for Right Drawer ──
    const fetchPassbookDrawer = async (userId, page = 1, type = 'all', start = '', end = '', accountId = null, customPerPage = null) => {
        if (!userId) return;
        setPassbookLoading(true);
        try {
            const accId = accountId || selectedAccountForPassbook?.id || '';
            const pPage = customPerPage || passbookPerPage || 25;
            let url = `/api/admin/manage-user-report/passbook/${userId}?page=${page}&per_page=${pPage}&type=${type}`;
            if (accId) url += `&account_id=${accId}`;
            if (start && end) url += `&start_date=${start}&end_date=${end}`;

            const res = await apiService.vGet(url);
            if (res.data.status === 1) {
                setPassbookData(res.data.data || []);
                setPassbookPage(res.data.current_page || 1);
                setPassbookTotal(res.data.total || 0);
                setPassbookLastPage(res.data.last_page || 1);
            }
        } catch (e) {
            console.error('Failed to fetch Passbook entries', e);
        } finally {
            setPassbookLoading(false);
        }
    };

    const openPassbookDrawer = () => {
        if (!searchedData?.user?.id) return;
        setShowPassbookDrawer(true);
        fetchPassbookDrawer(searchedData.user.id, 1, passbookTypeFilter, startDate, endDate, selectedAccountForPassbook?.id);
    };

    // ── Export Passbook to Excel (CSV) ──
    const handleExportPassbookExcel = () => {
        if (!passbookData || passbookData.length === 0) {
            showAlert('danger', 'No passbook records to export.');
            return;
        }

        const headers = ["Txn ID", "Type", "Amount (INR)", "Pre Balance", "New Balance", "Description", "Date & Time"];
        const rows = passbookData.map(pb => [
            `"${pb.transaction_id || pb.id || ''}"`,
            `"${pb.type || ''}"`,
            `"${pb.amount || 0}"`,
            `"${pb.pre_balance ?? (pb.type === 'CR' ? (pb.balance - pb.amount) : (pb.balance + pb.amount))}"`,
            `"${pb.balance || 0}"`,
            `"${(pb.description || '').replace(/"/g, '""')}"`,
            `"${pb.created_at ? new Date(pb.created_at).toLocaleString('en-IN') : ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Passbook_Ledger_${searchedData?.user?.mid || 'User'}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert('success', 'Passbook exported to Excel (CSV) successfully!');
    };

    // ── Export Passbook to PDF / Printable ──
    const handlePrintPassbookPDF = () => {
        if (!passbookData || passbookData.length === 0) {
            showAlert('danger', 'No passbook records to print.');
            return;
        }

        const printWin = window.open('', '_blank', 'width=900,height=700');
        const userMid = searchedData?.user?.mid || 'N/A';
        const userName = searchedData?.user?.name || 'User';
        const walletName = selectedAccountForPassbook?.name || 'All Accounts';

        let rowsHtml = '';
        passbookData.forEach((pb, idx) => {
            const preBal = pb.pre_balance ?? (pb.type === 'CR' ? (pb.balance - pb.amount) : (pb.balance + pb.amount));
            rowsHtml += `
                <tr>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">${idx + 1}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;font-family:monospace;">${pb.transaction_id || pb.id}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;font-weight:bold;color:${pb.type === 'CR' ? 'green' : 'red'};">${pb.type}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">₹${Number(pb.amount || 0).toFixed(2)}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">₹${Number(preBal).toFixed(2)}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">₹${Number(pb.balance || 0).toFixed(2)}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">${pb.description || '—'}</td>
                    <td style="padding:6px;border:1px solid #ccc;font-size:12px;">${pb.created_at ? new Date(pb.created_at).toLocaleString('en-IN') : '—'}</td>
                </tr>
            `;
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Passbook Statement - ${userName} (${userMid})</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { margin-bottom: 5px; color: #1e293b; }
                    p { font-size: 13px; color: #64748b; margin: 2px 0 15px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #f1f5f9; padding: 8px; border: 1px solid #ccc; font-size: 12px; text-align: left; }
                </style>
            </head>
            <body>
                <h2>Passbook Statement / Ledger</h2>
                <p>User: <strong>${userName} (${userMid})</strong> | Wallet: <strong>${walletName}</strong> | Generated: ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Txn ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Pre Bal</th>
                            <th>New Bal</th>
                            <th>Description</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
        }, 500);
    };

    // ── Root Hierarchy Dropdowns Initialization & Handlers ──
    const initRootLevels = async (uData = null) => {
        const u = uData || searchedData?.user;
        if (!u) return;

        const chain = u.root_chain || [];
        // Include ALL roles present in root_chain
        let parentChain = chain.length > 0 ? [...chain] : [];

        // Fallback: If no roles in root_chain, fallback to availableRoles
        if (parentChain.length === 0 && availableRoles && availableRoles.length > 0) {
            parentChain = availableRoles.map(r => ({
                id: null,
                role: r.id,
                role_name: r.name
            }));
        }

        if (parentChain.length === 0) {
            setRootLevels([]);
            return;
        }

        setLoadingRootLevels(true);
        try {
            const levelsData = [];
            for (let i = 0; i < parentChain.length; i++) {
                const parentItem = parentChain[i];
                const roleId = parentItem.role;
                const roleName = parentItem.role_name || `Role #${roleId}`;

                if (!roleId) continue;

                const res = await apiService.vGet(`/api/admin/manage-user-report/users-by-role/${roleId}`);
                const userOptions = res.data?.users || [];

                let selectedId = parentItem.id || '';
                if (!selectedId || !userOptions.some(opt => Number(opt.id) === Number(selectedId))) {
                    selectedId = userOptions[0]?.id || '';
                }

                levelsData.push({
                    level: i + 1,
                    role_id: roleId,
                    role_name: roleName,
                    selected_id: selectedId,
                    options: userOptions
                });
            }
            setRootLevels(levelsData);
        } catch (e) {
            console.error('Error initializing root levels', e);
        } finally {
            setLoadingRootLevels(false);
        }
    };

    const handleRootLevelUserChange = (levelIndex, newSelectedId) => {
        const updatedLevels = [...rootLevels];
        updatedLevels[levelIndex].selected_id = Number(newSelectedId);
        setRootLevels(updatedLevels);
    };

    // Filter Apply Button for Reports
    const handleApplyDateFilter = () => {
        if (!searchedData?.user) return;
        setAepsPage(1);
        setRechargePage(1);
        setPayoutPage(1);
        setUserLogsPage(1);
        fetchAepsTxns(searchedData.user.mid, 1, startDate, endDate);
        fetchRechargeLogs(searchedData.user.id, 1, startDate, endDate);
        fetchPayoutLogs(searchedData.user.id, 1, startDate, endDate);
        fetchUserLogs(searchedData.user.id, 1, startDate, endDate);

        if (showPassbookDrawer) {
            fetchPassbookDrawer(searchedData.user.id, 1, passbookTypeFilter, startDate, endDate, selectedAccountForPassbook?.id);
        }
        showAlert('success', 'Date filter applied.');
    };

    const handleClearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        if (!searchedData?.user) return;
        setAepsPage(1);
        setRechargePage(1);
        setPayoutPage(1);
        setUserLogsPage(1);
        fetchAepsTxns(searchedData.user.mid, 1, '', '');
        fetchRechargeLogs(searchedData.user.id, 1, '', '');
        fetchPayoutLogs(searchedData.user.id, 1, '', '');
        fetchUserLogs(searchedData.user.id, 1, '', '');

        if (showPassbookDrawer) {
            fetchPassbookDrawer(searchedData.user.id, 1, passbookTypeFilter, '', '', selectedAccountForPassbook?.id);
        }
    };

    // Load More Handlers for Reports
    const handleLoadMoreAeps = () => {
        if (!searchedData?.user?.mid || !aepsHasMore || aepsLoading) return;
        const nextPage = aepsPage + 1;
        setAepsPage(nextPage);
        fetchAepsTxns(searchedData.user.mid, nextPage, startDate, endDate, true);
    };

    const handleLoadMoreRecharge = () => {
        if (!searchedData?.user?.id || !rechargeHasMore || rechargeLoading) return;
        const nextPage = rechargePage + 1;
        setRechargePage(nextPage);
        fetchRechargeLogs(searchedData.user.id, nextPage, startDate, endDate, true);
    };

    const handleLoadMorePayout = () => {
        if (!searchedData?.user?.id || !payoutHasMore || payoutLoading) return;
        const nextPage = payoutPage + 1;
        setPayoutPage(nextPage);
        fetchPayoutLogs(searchedData.user.id, nextPage, startDate, endDate, true);
    };

    const handleLoadMoreUserLogs = () => {
        if (!searchedData?.user?.id || !userLogsHasMore || userLogsLoading) return;
        const nextPage = userLogsPage + 1;
        setUserLogsPage(nextPage);
        fetchUserLogs(searchedData.user.id, nextPage, startDate, endDate, true);
    };

    // ── Wallet Action Submit (Credit/Debit) ──
    const handleWalletSubmit = async (e) => {
        e.preventDefault();
        if (!searchedData?.user?.id) return;
        if (!walletAmount || Number(walletAmount) <= 0) {
            showAlert('danger', 'Please enter a valid amount.');
            return;
        }
        if (!walletDescription.trim()) {
            showAlert('danger', 'Please enter a description for the action.');
            return;
        }

        setSubmittingWallet(true);
        try {
            const payload = {
                user_id: searchedData.user.id,
                account_id: selectedAccountForAction?.id || null,
                action: walletActionType,
                amount: walletAmount,
                description: walletDescription
            };
            const res = await apiService.vPost('/api/admin/manage-user-report/wallet-action', payload);
            if (res.data.status === 1) {
                showAlert('success', res.data.message);
                setShowWalletModal(false);
                setWalletAmount('');
                setWalletDescription('');

                // Update local accounts state
                if (res.data.accounts) {
                    setUserAccounts(res.data.accounts);
                }
                // Refresh passbook if open
                if (showPassbookDrawer) {
                    fetchPassbookDrawer(searchedData.user.id, 1, passbookTypeFilter, startDate, endDate, selectedAccountForPassbook?.id);
                }
            } else {
                showAlert('danger', res.data.message || 'Action failed.');
            }
        } catch (err) {
            console.error('Wallet action error:', err);
            showAlert('danger', err.response?.data?.message || 'Failed to execute wallet action.');
        } finally {
            setSubmittingWallet(false);
        }
    };

    // ── User Update Submit ──
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (!searchedData?.user?.id) return;

        setSubmittingUser(true);
        try {
            const payload = {
                ...userForm,
                root_ids: rootLevels.map(lvl => lvl.selected_id)
            };
            const res = await apiService.vPost(`/api/admin/manage-user-report/update-user/${searchedData.user.id}`, payload);
            if (res.data.status === 1) {
                showAlert('success', res.data.message || 'User data & hierarchy updated successfully!');
                setShowUserModal(false);

                // Update local user state
                const updatedU = res.data.user || {};
                setSearchedData(prev => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        name: userForm.name,
                        mobile: userForm.mobile,
                        email: userForm.email,
                        role: userForm.role,
                        status: userForm.status,
                        aadhar_number: userForm.aadhar_number,
                        pan_card: userForm.pan_card,
                        root: updatedU.root || prev.user.root,
                        root_chain: updatedU.root_chain || prev.user.root_chain
                    }
                }));
            } else {
                showAlert('danger', res.data.message || 'Failed to update user.');
            }
        } catch (err) {
            console.error('User update error:', err);
            showAlert('danger', err.response?.data?.message || 'Error updating user.');
        } finally {
            setSubmittingUser(false);
        }
    };

    const openMerchantModal = () => {
        if (searchedData?.aeps_draft) {
            const m = searchedData.aeps_draft;
            setMerchantForm({
                latitude: m.latitude || '',
                longitude: m.longitude || '',
                shop_city: m.shop_city || '',
                shop_address: m.shop_address || '',
                video_url: m.video_url || '',
                video_kyc_status: m.video_kyc_status ?? 0,
                aeps_status: m.aeps_status ?? 0,
                pan_no: m.pan_no || '',
                aadhaar_number: m.aadhaar_number || '',
                phone: m.phone || '',
                email: m.email || '',
                account_number: m.account_number || '',
                ifsc_code: m.ifsc_code || '',
                bank_name: m.bank_name || '',
                bank_branch: m.bank_branch || '',
                deviceName: m.deviceName || '',
                deviceIMEI: m.deviceIMEI || '',
                mposSerialNumber: m.mposSerialNumber || '',
                phone_verified_at: m.phone_verified_at ? 1 : 0,
                email_verified_at: m.email_verified_at ? 1 : 0,
                aadhaar_verified_at: m.aadhaar_verified_at ? 1 : 0,
                pan_verified_at: m.pan_verified_at ? 1 : 0,
                bank_verified_at: m.bank_verified_at ? 1 : 0,
                full_name: m.full_name || searchedData?.user?.name || '',
                shop_name: m.shop_name || m.company_name || m.shopName || searchedData?.user?.shop_name || ''
            });
        }
        setShowMerchantModal(true);
    };

    // ── Merchant (AepsDraft) Update Submit ──
    const handleMerchantSubmit = async (e) => {
        e.preventDefault();
        if (!searchedData?.aeps_draft?.id) return;

        setSubmittingMerchant(true);
        try {
            const res = await apiService.vPost(`/api/admin/manage-user-report/update-merchant/${searchedData.aeps_draft.id}`, merchantForm);
            if (res.data.status === 1) {
                showAlert('success', res.data.message || 'Merchant data updated successfully!');
                setShowMerchantModal(false);

                const updatedDraft = res.data.aeps_draft;

                // Update local merchant & user state
                setSearchedData(prev => ({
                    ...prev,
                    aeps_draft: updatedDraft,
                    user: {
                        ...prev.user,
                        shop_name: updatedDraft.shop_name
                    }
                }));
            } else {
                showAlert('danger', res.data.message || 'Failed to update merchant.');
            }
        } catch (err) {
            console.error('Merchant update error:', err);
            showAlert('danger', err.response?.data?.message || 'Error updating merchant data.');
        } finally {
            setSubmittingMerchant(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="Manage User & Report" parentfolder="Super Admin" activepage="User & Reports" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Alert Message */}
                    {alertMessage.text && (
                        <div className={`alert alert-${alertMessage.type} alert-dismissible fade show mur-alert`} role="alert">
                            <i className={`fas ${alertMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                            {alertMessage.text}
                            <button type="button" className="btn-close" onClick={() => setAlertMessage({ type: '', text: '' })}></button>
                        </div>
                    )}

                    {/* ── SEARCH CARD ── */}
                    <div className="mur-card mur-search-card">
                        <div className="mur-search-header">
                            <h3 className="mur-search-title"><i className="fas fa-search-dollar me-2 text-primary"></i>Search User / Merchant</h3>
                            <span className="mur-badge-info">Enter MID, Mobile Number, or PAN Card</span>
                        </div>
                        <form onSubmit={handleSearch} className="mur-search-form">
                            <div className="input-group input-group-lg mur-input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-id-card text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0 mur-search-input"
                                    placeholder="Enter MID / Mobile (10 digits) / PAN Card..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button type="button" className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                                <button type="submit" className="btn btn-primary px-4 font-weight-bold" disabled={loadingSearch}>
                                    {loadingSearch ? (
                                        <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Searching...</>
                                    ) : (
                                        <><i className="fas fa-search me-2"></i> Search User</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── SEARCH RESULT SECTION ── */}
                    {searchedData && searchedData.user && (
                        <>
                            {/* Profile & Wallet Grid */}
                            <div className="row g-3 mb-4">

                                {/* User Info Card */}
                                <div className="col-lg-6">
                                    <div className="mur-card h-100 mur-profile-card">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="mur-avatar">
                                                    {searchedData.user.name ? searchedData.user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="mur-user-name mb-0">{searchedData.user.name}</h4>
                                                        {Number(searchedData.user.role) === 2 && (
                                                            <Link
                                                                to={`/setting/admin/${searchedData.user.id}`}
                                                                className="btn btn-sm btn-outline-primary ms-1 d-inline-flex align-items-center gap-1 py-1 px-2 font-weight-bold"
                                                                title="Admin Configure Setting"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ fontSize: '12px' }}
                                                            >
                                                                <i className="fas fa-cogs"></i> Setting
                                                            </Link>
                                                        )}
                                                        {isSuperAdmin && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-warning text-dark ms-1 d-inline-flex align-items-center gap-1 py-1 px-2 font-weight-bold shadow-sm"
                                                                title="Direct Login as this User"
                                                                style={{ fontSize: '12px' }}
                                                                onClick={() => handleDirectLogin(searchedData.user)}
                                                            >
                                                                <i className="fas fa-sign-in-alt"></i> Direct Login
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                                        <span className="badge bg-primary-soft text-primary font-mono"><i className="fas fa-hashtag me-1"></i>{searchedData.user.mid}</span>
                                                        <span className="badge bg-secondary-soft text-dark"><i className="fas fa-user-tag me-1"></i>{searchedData.user.role_name}</span>
                                                        <span className={`badge ${searchedData.user.status === 1 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                                            <i className={`fas fa-${searchedData.user.status === 1 ? 'check-circle' : 'times-circle'} me-1`}></i>
                                                            {searchedData.user.status_label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Root Hierarchy Path Banner - Placed directly below Role Name */}
                                        {searchedData.user.root_chain && searchedData.user.root_chain.length > 0 && (
                                            <div className="mb-3 p-2 px-3 rounded border bg-light shadow-sm">
                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                    <small className="font-weight-bold text-dark">
                                                        <i className="fas fa-sitemap me-1 text-primary"></i>Root Hierarchy Path (Referral Chain):
                                                    </small>
                                                    <span className="badge bg-primary-soft text-primary font-mono" style={{ fontSize: '10px' }}>
                                                        ROOT: {searchedData.user.root || '—'}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center flex-nowrap overflow-auto gap-2 py-1" style={{ scrollbarWidth: 'thin' }}>
                                                    {searchedData.user.root_chain.map((item, i) => (
                                                        <React.Fragment key={item.id || i}>
                                                            <div
                                                                className={`d-inline-flex flex-column align-items-center justify-content-center p-2 px-3 rounded ${item.id === searchedData.user.id ? 'bg-primary text-white' : 'bg-dark text-white'} shadow-sm text-nowrap flex-shrink-0`}
                                                                style={{ borderRadius: '6px' }}
                                                            >
                                                                <span className="font-weight-bold font-mono text-center" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                                                                    #{item.id} {item.name}
                                                                </span>
                                                                <span className="opacity-75 font-mono text-center" style={{ fontSize: '9px', marginTop: '2px', textTransform: 'uppercase' }}>
                                                                    ({item.role_name})
                                                                </span>
                                                            </div>
                                                            {i < searchedData.user.root_chain.length - 1 && (
                                                                <i className="fas fa-arrow-right text-primary small flex-shrink-0"></i>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mur-info-grid">
                                            <div className="mur-info-item">
                                                <span className="mur-info-label"><i className="fas fa-store me-1 text-primary"></i>Shop Name</span>
                                                <span className="mur-info-value font-weight-bold text-primary">{searchedData.aeps_draft?.shop_name || searchedData.user?.shop_name || '—'}</span>
                                            </div>
                                            <div className="mur-info-item">
                                                <span className="mur-info-label"><i className="fas fa-phone me-1 text-muted"></i>Mobile</span>
                                                <span className="mur-info-value">{searchedData.user.mobile}</span>
                                            </div>
                                            <div className="mur-info-item">
                                                <span className="mur-info-label"><i className="fas fa-envelope me-1 text-muted"></i>Email</span>
                                                <span className="mur-info-value">{searchedData.user.email || '—'}</span>
                                            </div>
                                            <div className="mur-info-item">
                                                <span className="mur-info-label"><i className="fas fa-id-card me-1 text-muted"></i>PAN Card</span>
                                                <span className="mur-info-value text-uppercase">{searchedData.user.pan_card || '—'}</span>
                                            </div>
                                            <div className="mur-info-item">
                                                <span className="mur-info-label"><i className="fas fa-fingerprint me-1 text-muted"></i>Aadhaar</span>
                                                <span className="mur-info-value">{searchedData.user.aadhar_number || '—'}</span>
                                            </div>
                                        </div>

                                        {/* Edit Buttons Area */}
                                        <div className="mur-action-bar mt-3 pt-3 border-top d-flex gap-2 flex-wrap">
                                            <button
                                                className="btn btn-outline-primary btn-sm flex-fill"
                                                onClick={() => { initRootLevels(); setShowUserModal(true); }}
                                            >
                                                <i className="fas fa-user-edit me-1"></i> Update User Data
                                            </button>

                                            {/* Update Merchant Data Button - Shown ONLY IF aeps_draft exists */}
                                            {searchedData.has_aeps_draft && (
                                                <button
                                                    className="btn btn-primary btn-sm flex-fill"
                                                    onClick={openMerchantModal}
                                                >
                                                    <i className="fas fa-store me-1"></i> Update Merchant Data
                                                </button>
                                            )}

                                            {Number(searchedData.user.role) === 2 && (
                                                <Link
                                                    to={`/setting/admin/${searchedData.user.id}`}
                                                    className="btn btn-outline-success btn-sm flex-fill d-inline-flex align-items-center justify-content-center gap-1"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fas fa-cogs me-1"></i> Setting
                                                </Link>
                                            )}

                                            {isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    className="btn btn-warning text-dark btn-sm flex-fill d-inline-flex align-items-center justify-content-center gap-1 font-weight-bold"
                                                    onClick={() => handleDirectLogin(searchedData.user)}
                                                >
                                                    <i className="fas fa-sign-in-alt me-1"></i> Direct Login
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Multi-Wallet Accounts Section (Exact same grid column space col-lg-6) */}
                                <div className="col-lg-6">
                                    <div className="mur-card h-100 p-3 shadow-sm border-0" style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                            <h5 className="mur-wallet-title mb-0 text-dark font-weight-bold" style={{ fontSize: '15px' }}>
                                                <i className="fas fa-wallet me-2 text-warning"></i>User Accounts & Wallets ({userAccounts.length})
                                            </h5>
                                            <span className="badge bg-primary-soft text-primary font-weight-bold" style={{ fontSize: '11px' }}>
                                                <i className="fas fa-layer-group me-1"></i>Multi-Wallet Active
                                            </span>
                                        </div>

                                        {userAccounts.length === 0 ? (
                                            <div className="text-center py-4 my-2">
                                                <div className="mb-3">
                                                    <i className="fas fa-wallet fa-3x text-warning opacity-75"></i>
                                                </div>
                                                <h6 className="font-weight-bold text-dark mb-1">No Account Wallets Found</h6>
                                                <p className="text-muted small mb-3">This user does not have any active wallets setup in the accounts table.</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary font-weight-bold px-4 py-2 shadow-sm"
                                                    onClick={handleCreateWallets}
                                                    disabled={creatingWallets}
                                                >
                                                    {creatingWallets ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Creating Wallets...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-plus-circle me-2"></i>Create Default Wallets (Trade & Utility)
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="row g-2">
                                                {userAccounts.map((acc, index) => (
                                                    <div key={acc.id || index} className="col-12">
                                                        <div className={`p-2 px-3 rounded border shadow-sm ${acc.primary_status ? 'border-primary bg-white' : 'border-light bg-white'}`} style={{ borderLeft: acc.primary_status ? '4px solid #0d6efd' : '4px solid #6c757d' }}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className="font-weight-bold text-dark" style={{ fontSize: '14px' }}>
                                                                            <i className={`fas ${acc.primary_status ? 'fa-star text-warning' : 'fa-wallet text-secondary'} me-1`}></i>
                                                                            {acc.name}
                                                                        </span>

                                                                    </div>
                                                                    <div className="text-muted font-mono" style={{ fontSize: '11px' }}>
                                                                        ID: <strong className="text-dark">{acc.id || 'N/A'}</strong> | User ID: <strong className="text-dark">{acc.user_id || 'N/A'}</strong> | ACC: <strong>{acc.number}</strong>
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div className="font-mono font-weight-bold text-primary" style={{ fontSize: '16px' }}>
                                                                        ₹{Number(acc.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                    <small className="text-success font-weight-bold me-1" style={{ fontSize: '11px' }}>Avail: ₹{Number(acc.available || 0).toFixed(2)}</small>
                                                                    {acc.hold > 0 && <small className="text-danger" style={{ fontSize: '11px' }}>Hold: ₹{Number(acc.hold).toFixed(2)}</small>}
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons for Each Account */}
                                                            <div className="d-flex gap-2 mt-2 pt-2 border-top">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-success btn-xs flex-fill font-weight-bold py-1"
                                                                    style={{ fontSize: '11px' }}
                                                                    onClick={() => openWalletModalForAccount(acc, 'credit')}
                                                                >
                                                                    <i className="fas fa-plus-circle me-1"></i> + Credit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-xs flex-fill font-weight-bold py-1"
                                                                    style={{ fontSize: '11px' }}
                                                                    onClick={() => openWalletModalForAccount(acc, 'debit')}
                                                                >
                                                                    <i className="fas fa-minus-circle me-1"></i> - Debit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-xs flex-fill font-weight-bold py-1"
                                                                    style={{ fontSize: '11px' }}
                                                                    onClick={() => openPassbookDrawerForAccount(acc)}
                                                                >
                                                                    <i className="fas fa-book-open me-1"></i> Passbook
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── REPORT & LOGS TABS SECTION ── */}
                            <div className="mur-card mur-reports-card">

                                {/* Date Range Filter Bar */}
                                <div className="mur-reports-filter-bar">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <div className="d-flex align-items-center gap-1">
                                            <label className="mur-filter-label">From:</label>
                                            <input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <label className="mur-filter-label">To:</label>
                                            <input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={handleApplyDateFilter}>
                                            <i className="fas fa-filter me-1"></i> Apply Filter
                                        </button>
                                        {(startDate || endDate) && (
                                            <button className="btn btn-outline-secondary btn-sm" onClick={handleClearDateFilter}>
                                                <i className="fas fa-times me-1"></i> Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <ul className="nav nav-tabs mur-nav-tabs" role="tablist">
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'aeps' ? 'active' : ''}`} onClick={() => setActiveTab('aeps')}>
                                            <i className="fas fa-hand-holding-usd me-2"></i>AEPS Transactions (25/page)
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'recharge' ? 'active' : ''}`} onClick={() => setActiveTab('recharge')}>
                                            <i className="fas fa-mobile-alt me-2"></i>Recharge Data & Logs
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'payout' ? 'active' : ''}`} onClick={() => setActiveTab('payout')}>
                                            <i className="fas fa-university me-2 text-success"></i>Payout Data & Logs
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                                            <i className="fas fa-history me-2"></i>User Activity Logs
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'verification_json' ? 'active' : ''}`} onClick={() => setActiveTab('verification_json')}>
                                            <i className="fas fa-code me-2"></i>KYC Verification JSON Data
                                        </button>
                                    </li>
                                </ul>

                                {/* Tab Content */}
                                <div className="tab-content mur-tab-content">

                                    {/* ── TAB 1: AEPS TRANSACTIONS ── */}
                                    {activeTab === 'aeps' && (
                                        <div className="tab-pane fade show active">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mur-table mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Merchant Txn ID</th>
                                                            <th>Type</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Message</th>
                                                            <th>Bank Name</th>
                                                            <th>Date & Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {aepsLoading && aepsTxns.length === 0 ? (
                                                            <tr><td colSpan="7" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading AEPS transactions...</td></tr>
                                                        ) : aepsTxns.length === 0 ? (
                                                            <tr><td colSpan="7" className="text-center py-4 text-muted">No AEPS transactions found for this user.</td></tr>
                                                        ) : (
                                                            aepsTxns.map((tx, idx) => (
                                                                <tr key={tx.id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>
                                                                        <div className="font-mono text-dark font-weight-bold">{tx.merchant_txn_id}</div>
                                                                    </td>
                                                                    <td><span className="badge bg-secondary-soft text-dark">{tx.aeps_type || 'AEPS'}</span></td>
                                                                    <td className="font-weight-bold text-success">₹{Number(tx.amount || 0).toFixed(2)}</td>
                                                                    <td>
                                                                        {(() => {
                                                                            let status = 'Pending';
                                                                            if (tx.response_status === true || tx.response_status === 1) status = 'Success';
                                                                            else if (tx.response_status === false || tx.response_status === 0) status = 'Failed';
                                                                            return <span className={`badge ${status === 'Success' ? 'bg-success-soft text-success' : status === 'Failed' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
                                                                                {status}
                                                                            </span>;
                                                                        })()}
                                                                    </td>
                                                                    <td>{tx.response_message || '—'}</td>
                                                                    <td>{tx.bank_name || '—'}</td>
                                                                    <td><small className="text-muted">{tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}</small></td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Load More Button */}
                                            {aepsHasMore && (
                                                <div className="text-center mt-3 pt-2">
                                                    <button className="btn btn-outline-primary btn-sm px-4" onClick={handleLoadMoreAeps} disabled={aepsLoading}>
                                                        {aepsLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-arrow-down me-1"></i>} View More AEPS Transactions
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── TAB 2: RECHARGE DATA & LOGS ── */}
                                    {activeTab === 'recharge' && (
                                        <div className="tab-pane fade show active">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mur-table mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Txn ID</th>
                                                            <th>Operator</th>
                                                            <th>Number / Account</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                            <th>Date & Time</th>
                                                            <th>Actions / JSON</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rechargeLoading && rechargeLogs.length === 0 ? (
                                                            <tr><td colSpan="8" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading Recharge logs...</td></tr>
                                                        ) : rechargeLogs.length === 0 ? (
                                                            <tr><td colSpan="8" className="text-center py-4 text-muted">No Recharge logs found for this user.</td></tr>
                                                        ) : (
                                                            rechargeLogs.map((rc, idx) => (
                                                                <tr key={rc.id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td className="font-mono text-dark">{rc.txnid || rc.transaction_id || rc.id}</td>
                                                                    <td><span className="badge bg-info-soft text-info">{rc.oprator || rc.operator || 'Mobile'}</span></td>
                                                                    <td className="font-weight-bold">{rc.number || rc.ca_number || '—'}</td>
                                                                    <td className="font-weight-bold text-primary">₹{Number(rc.amount || 0).toFixed(2)}</td>
                                                                    <td>
                                                                        <span className={`badge ${['Success', 'SUCCESS', 'success', '1', 1].includes(rc.status) ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                                                            {rc.status}
                                                                        </span>
                                                                    </td>
                                                                    <td><small className="text-muted">{rc.created_at ? new Date(rc.created_at).toLocaleString() : '—'}</small></td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-info btn-xs font-weight-bold"
                                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                                            onClick={() => {
                                                                                setSelectedRechargeRecord(rc);
                                                                                setShowRechargeJsonModal(true);
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-code me-1"></i>JSON Data
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Load More Button */}
                                            {rechargeHasMore && (
                                                <div className="text-center mt-3 pt-2">
                                                    <button className="btn btn-outline-primary btn-sm px-4" onClick={handleLoadMoreRecharge} disabled={rechargeLoading}>
                                                        {rechargeLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-arrow-down me-1"></i>} View More Recharge Logs
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── TAB 3: PAYOUT DATA & LOGS ── */}
                                    {activeTab === 'payout' && (
                                        <div className="tab-pane fade show active">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mur-table mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Txn ID / UTR</th>
                                                            <th>Beneficiary Name & Mobile</th>
                                                            <th>Account & IFSC</th>
                                                            <th>Amount</th>
                                                            <th>Type & Status</th>
                                                            <th>Date & Time</th>
                                                            <th>Actions / JSON</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {payoutLoading && payoutLogs.length === 0 ? (
                                                            <tr><td colSpan="8" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading Payout logs...</td></tr>
                                                        ) : payoutLogs.length === 0 ? (
                                                            <tr><td colSpan="8" className="text-center py-4 text-muted">No Payout logs found for this user.</td></tr>
                                                        ) : (
                                                            payoutLogs.map((po, idx) => (
                                                                <tr key={po.id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>
                                                                        <div className="font-mono text-dark font-weight-bold">{po.transaction_id || po.id}</div>
                                                                        <small className="text-muted">UTR: {po.utr || '—'}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="font-weight-bold">{po.name || '—'}</div>
                                                                        <small className="text-muted">{po.mobile || ''}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="font-mono text-primary small">{po.account || '—'}</div>
                                                                        <small className="text-muted">IFSC: {po.ifsc || '—'}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="font-weight-bold text-dark">₹{Number(po.amount || 0).toFixed(2)}</div>
                                                                        {po.charge ? <small className="text-danger">Charge: ₹{Number(po.charge).toFixed(2)}</small> : null}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-secondary-soft text-dark me-1">{po.type || 'IMPS'}</span>
                                                                        <span className={`badge ${po.status == 1 || po.status === 'success' ? 'bg-success-soft text-success' : po.status == 0 || po.status === 'pending' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'}`}>
                                                                            {po.status_label || (po.status == 1 || po.status === 'success' ? 'success' : po.status == 0 || po.status === 'pending' ? 'pending' : 'failed')}
                                                                        </span>
                                                                    </td>
                                                                    <td><small className="text-muted">{po.created_at ? new Date(po.created_at).toLocaleString() : '—'}</small></td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-success btn-xs font-weight-bold"
                                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                                            onClick={() => {
                                                                                setSelectedPayoutRecord(po);
                                                                                setShowPayoutJsonModal(true);
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-code me-1"></i>JSON Data
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Load More Button */}
                                            {payoutHasMore && (
                                                <div className="text-center mt-3 pt-2">
                                                    <button className="btn btn-outline-primary btn-sm px-4" onClick={handleLoadMorePayout} disabled={payoutLoading}>
                                                        {payoutLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-arrow-down me-1"></i>} View More Payout Logs
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── TAB 3: USER ACTIVITY LOGS ── */}
                                    {activeTab === 'logs' && (
                                        <div className="tab-pane fade show active">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mur-table mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Log Type</th>
                                                            <th>URL</th>
                                                            <th>Request Data</th>
                                                            <th>Response Data</th>
                                                            <th>Timestamp</th>
                                                            <th>Actions / JSON</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userLogsLoading && userLogs.length === 0 ? (
                                                            <tr><td colSpan="7" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading Activity logs...</td></tr>
                                                        ) : userLogs.length === 0 ? (
                                                            <tr><td colSpan="7" className="text-center py-4 text-muted">No activity logs recorded for this user.</td></tr>
                                                        ) : (
                                                            userLogs.map((log, idx) => (
                                                                <tr key={log.id || idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td><span className="badge bg-secondary-soft text-dark font-weight-bold">{log.type || log.log_type || 'General'}</span></td>
                                                                    <td>
                                                                        <div className="font-mono text-primary small text-truncate" style={{ maxWidth: '200px' }} title={log.url || '—'}>
                                                                            {log.url || '—'}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="font-mono small text-muted text-truncate" style={{ maxWidth: '180px' }} title={formatJsonDisplay(log.request_data)}>
                                                                            {log.request_data ? (typeof log.request_data === 'string' ? log.request_data : JSON.stringify(log.request_data)) : '—'}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="font-mono small text-muted text-truncate" style={{ maxWidth: '180px' }} title={formatJsonDisplay(log.response_data)}>
                                                                            {log.response_data ? (typeof log.response_data === 'string' ? log.response_data : JSON.stringify(log.response_data)) : '—'}
                                                                        </div>
                                                                    </td>
                                                                    <td><small className="text-muted">{log.timestamp ? log.timestamp : (log.created_at ? new Date(log.created_at).toLocaleString() : '—')}</small></td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-info btn-xs font-weight-bold"
                                                                            style={{ fontSize: '11px', padding: '2px 8px' }}
                                                                            onClick={() => {
                                                                                setSelectedLogRecord(log);
                                                                                setShowLogJsonModal(true);
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-code me-1"></i>View JSON
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Load More Button */}
                                            {userLogsHasMore && (
                                                <div className="text-center mt-3 pt-2">
                                                    <button className="btn btn-outline-primary btn-sm px-4" onClick={handleLoadMoreUserLogs} disabled={userLogsLoading}>
                                                        {userLogsLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fas fa-arrow-down me-1"></i>} View More Activity Logs
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── TAB 4: KYC VERIFICATION JSON DATA ── */}
                                    {activeTab === 'verification_json' && (
                                        <div className="tab-pane fade show active p-3">
                                            <div className="row g-3">
                                                {/* Aadhaar Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-fingerprint me-1 text-primary"></i>Aadhaar Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.aadhar_data || searchedData.aeps_draft?.aadharData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'Aadhaar JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ minHeight: '280px', maxHeight: '420px', overflowY: 'auto' }}>
                                                            <pre className="text-success m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.aadhar_data || searchedData.aeps_draft?.aadharData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* PAN Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-id-card me-1 text-warning"></i>PAN Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.pan_data || searchedData.aeps_draft?.panData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'PAN JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ minHeight: '280px', maxHeight: '420px', overflowY: 'auto' }}>
                                                            <pre className="text-info m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.pan_data || searchedData.aeps_draft?.panData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bank Account Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-university me-1 text-success"></i>Bank Account Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.account_data || searchedData.aeps_draft?.accountData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'Bank Account JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ minHeight: '280px', maxHeight: '420px', overflowY: 'auto' }}>
                                                            <pre className="text-warning m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.account_data || searchedData.aeps_draft?.accountData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </>
                    )}

                    {/* ── MODAL 1: WALLET CREDIT / DEBIT (CENTER MODAL) ── */}
                    {showWalletModal && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content mur-modal-content">
                                    <div className={`modal-header ${walletActionType === 'credit' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                        <h5 className="modal-title font-weight-bold">
                                            <i className={`fas fa-${walletActionType === 'credit' ? 'plus-circle' : 'minus-circle'} me-2`}></i>
                                            {walletActionType === 'credit' ? 'Credit Wallet Balance' : 'Debit Wallet Balance'}
                                        </h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowWalletModal(false)}></button>
                                    </div>
                                    <form onSubmit={handleWalletSubmit}>
                                        <div className="modal-body">
                                            <div className="mb-3">
                                                <label className="form-label font-weight-bold">User MID / Name</label>
                                                <input type="text" className="form-control" value={`${searchedData?.user?.name} (${searchedData?.user?.mid})`} disabled />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label font-weight-bold">Target Account / Wallet</label>
                                                <input type="text" className="form-control font-weight-bold text-primary" value={`${selectedAccountForAction?.name || 'Main Wallet'} (${selectedAccountForAction?.primary_status ? 'Primary' : 'Secondary'})`} disabled />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label font-weight-bold">Amount (₹) <span className="text-danger">*</span></label>
                                                <div className="input-group">
                                                    <span className="input-group-text">₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-lg"
                                                        placeholder="Enter amount"
                                                        value={walletAmount}
                                                        onChange={e => setWalletAmount(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label font-weight-bold">Reason / Description <span className="text-danger">*</span></label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Enter reason for this wallet adjustment..."
                                                    value={walletDescription}
                                                    onChange={e => setWalletDescription(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowWalletModal(false)}>Cancel</button>
                                            <button type="submit" className={`btn ${walletActionType === 'credit' ? 'btn-success' : 'btn-danger'}`} disabled={submittingWallet}>
                                                {submittingWallet ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                                Confirm {walletActionType === 'credit' ? 'Credit' : 'Debit'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL 2: UPDATE USER DATA (CENTER MODAL) ── */}
                    {showUserModal && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content mur-modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="font-weight-bold text-white mb-0" style={{ fontSize: '20px' }}><i className="fas fa-user-edit me-2 "></i>Update User Details</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
                                    </div>
                                    <form onSubmit={handleUserSubmit}>
                                        <div className="modal-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                                    <label className="form-label font-weight-bold">Full Name <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Mobile Number <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" value={userForm.mobile} onChange={e => setUserForm({ ...userForm, mobile: e.target.value })} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Email Address</label>
                                                    <input type="email" className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold"><i className="fas fa-store me-1 text-primary"></i>Shop Name / Business Name</label>
                                                    <input type="text" className="form-control font-weight-bold" placeholder="Enter Shop Name" value={userForm.shop_name || ''} onChange={e => setUserForm({ ...userForm, shop_name: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">User Role</label>
                                                    <select className="form-select" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: Number(e.target.value) })}>
                                                        {availableRoles.length > 0 ? (
                                                            availableRoles.map(r => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.name}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <option value=''>No Roles Available</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Account Status</label>
                                                    <select className="form-select" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: Number(e.target.value) })}>
                                                        <option value={1}>Active</option>
                                                        <option value={0}>Inactive / Blocked</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">PAN Card Number</label>
                                                    <input type="text" className="form-control text-uppercase" value={userForm.pan_card} onChange={e => setUserForm({ ...userForm, pan_card: e.target.value.toUpperCase() })} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Aadhaar Number</label>
                                                    <input type="text" className="form-control" value={userForm.aadhar_number} onChange={e => setUserForm({ ...userForm, aadhar_number: e.target.value })} />
                                                </div>
                                            </div>

                                            {/* Root Hierarchy Chain Editor (Parent Dropdowns) */}
                                            <div className="mt-4 pt-3 border-top">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="text-primary font-weight-bold mb-0">
                                                        <i className="fas fa-sitemap me-2"></i>Root Hierarchy Chain Editor (Parent Dropdowns)
                                                    </h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                        onClick={() => initRootLevels()}
                                                        disabled={loadingRootLevels}
                                                    >
                                                        <i className="fas fa-sync-alt me-1"></i>Reload Levels
                                                    </button>
                                                </div>
                                                <p className="text-muted small mb-3">
                                                    Hierarchical parent chain for <strong>{searchedData?.user?.name} (#{searchedData?.user?.id})</strong>. Selecting a parent at Level N filters available users at Level N+1.
                                                </p>

                                                {loadingRootLevels ? (
                                                    <div className="py-3 text-center text-muted">
                                                        <span className="spinner-border spinner-border-sm me-2 text-primary"></span>Loading parent hierarchy options...
                                                    </div>
                                                ) : rootLevels.length === 0 ? (
                                                    <div className="alert alert-info py-2 px-3 small mb-0">
                                                        <i className="fas fa-info-circle me-1"></i>No ancestor parent roles found in root chain (User is top-level).
                                                    </div>
                                                ) : (
                                                    <div className="row g-3">
                                                        {rootLevels.map((lvl, index) => (
                                                            <div key={lvl.level || index} className="col-md-6">
                                                                <label className="form-label font-weight-bold text-dark small">
                                                                    Level {lvl.level} Parent ({lvl.role_name}) <span className="text-danger">*</span>
                                                                </label>
                                                                <select
                                                                    className="form-select font-mono"
                                                                    value={lvl.selected_id}
                                                                    onChange={e => handleRootLevelUserChange(index, e.target.value)}
                                                                >
                                                                    {lvl.options && lvl.options.length > 0 ? (
                                                                        lvl.options.map(u => (
                                                                            <option key={u.id} value={u.id}>
                                                                                #{u.id} - {u.name} ({u.mid})
                                                                            </option>
                                                                        ))
                                                                    ) : (
                                                                        <option value="">No users found for this role/level</option>
                                                                    )}
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary" disabled={submittingUser}>
                                                {submittingUser ? <span className="spinner-border spinner-border-sm me-1"></span> : null} Save User Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL 3: UPDATE MERCHANT DATA (AepsDraft CENTER MODAL) ── */}
                    {/* Rendered ONLY IF aeps_draft exists */}
                    {showMerchantModal && searchedData?.has_aeps_draft && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                                <div className="modal-content mur-modal-content" style={{ maxHeight: '90vh' }}>
                                    <div className="modal-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                                        <h4 className="font-weight-bold text-white mb-0" style={{ fontSize: '20px' }}>
                                            <i className="fas fa-store me-2 text-warning"></i>Update Merchant Data (AEPS Draft)
                                        </h4>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowMerchantModal(false)}></button>
                                    </div>
                                    <form onSubmit={handleMerchantSubmit}>
                                        <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                            {/* Primary Columns Summary Alert */}
                                            <div className="alert alert-light border mb-4 shadow-sm">
                                                <div className="row g-2 align-items-center">
                                                    <div className="col-md-3"><strong>Merchant MID:</strong> <span className="font-mono text-primary font-weight-bold">{searchedData.user.mid}</span></div>
                                                    <div className="col-md-3"><strong>Shop Name:</strong> {merchantForm.shop_name || 'N/A'}</div>
                                                    <div className="col-md-3"><strong>Full Name:</strong> {merchantForm.full_name || 'N/A'}</div>
                                                    <div className="col-md-3"><strong>Phone:</strong> {merchantForm.phone || 'N/A'}</div>
                                                </div>
                                            </div>

                                            {/* Form Grid with All 17 Requested Fields + Verification Status */}
                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-map-marker-alt me-1"></i>Location & Shop Details</h6>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold text-primary">
                                                        <i className="fas fa-edit me-1"></i>Shop Name <span className="badge bg-primary-subtle text-primary border ms-1">Editable Input</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control font-weight-bold border-primary shadow-xs"
                                                        placeholder="Type Shop Name here..."
                                                        value={merchantForm.shop_name || ''}
                                                        onChange={e => setMerchantForm({ ...merchantForm, shop_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Shop City</label>
                                                    <input type="text" className="form-control" value={merchantForm.shop_city} onChange={e => setMerchantForm({ ...merchantForm, shop_city: e.target.value })} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Shop Address</label>
                                                    <input type="text" className="form-control" value={merchantForm.shop_address} onChange={e => setMerchantForm({ ...merchantForm, shop_address: e.target.value })} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Latitude</label>
                                                    <input type="text" className="form-control" value={merchantForm.latitude} onChange={e => setMerchantForm({ ...merchantForm, latitude: e.target.value })} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Longitude</label>
                                                    <input type="text" className="form-control" value={merchantForm.longitude} onChange={e => setMerchantForm({ ...merchantForm, longitude: e.target.value })} />
                                                </div>
                                            </div>

                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-video me-1"></i>KYC & Video KYC Details</h6>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Video URL</label>
                                                    <input type="text" className="form-control" value={merchantForm.video_url} onChange={e => setMerchantForm({ ...merchantForm, video_url: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Video KYC Status</label>
                                                    <select className="form-select" value={merchantForm.video_kyc_status} onChange={e => setMerchantForm({ ...merchantForm, video_kyc_status: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                        <option value={2}>Rejected</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Merchant Status</label>
                                                    <select className="form-select font-weight-bold" value={merchantForm.aeps_status} onChange={e => setMerchantForm({ ...merchantForm, aeps_status: Number(e.target.value) })}>
                                                        <option value={0}>Onboarding Pending</option>
                                                        <option value={1}>EKYC Pending</option>
                                                        <option value={2}>Biometric KYC Pending</option>
                                                        <option value={3}>TwoFA Pending</option>
                                                        <option value={4}>Working</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-id-card me-1"></i>Identity & Contact Info</h6>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">PAN Number</label>
                                                    <input type="text" className="form-control text-uppercase" value={merchantForm.pan_no} onChange={e => setMerchantForm({ ...merchantForm, pan_no: e.target.value.toUpperCase() })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Aadhaar Number</label>
                                                    <input type="text" className="form-control" value={merchantForm.aadhaar_number} onChange={e => setMerchantForm({ ...merchantForm, aadhaar_number: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Phone Number</label>
                                                    <input type="text" className="form-control" value={merchantForm.phone} onChange={e => setMerchantForm({ ...merchantForm, phone: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Email Address</label>
                                                    <input type="email" className="form-control" value={merchantForm.email} onChange={e => setMerchantForm({ ...merchantForm, email: e.target.value })} />
                                                </div>
                                            </div>

                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-university me-1"></i>Bank Account Details</h6>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Account Number</label>
                                                    <input type="text" className="form-control" value={merchantForm.account_number} onChange={e => setMerchantForm({ ...merchantForm, account_number: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">IFSC Code</label>
                                                    <input type="text" className="form-control text-uppercase" value={merchantForm.ifsc_code} onChange={e => setMerchantForm({ ...merchantForm, ifsc_code: e.target.value.toUpperCase() })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Bank Name</label>
                                                    <input type="text" className="form-control" value={merchantForm.bank_name} onChange={e => setMerchantForm({ ...merchantForm, bank_name: e.target.value })} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label font-weight-bold">Bank Branch</label>
                                                    <input type="text" className="form-control" value={merchantForm.bank_branch} onChange={e => setMerchantForm({ ...merchantForm, bank_branch: e.target.value })} />
                                                </div>
                                            </div>

                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-microchip me-1"></i>Device & Hardware Info</h6>
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Device Name</label>
                                                    <input type="text" className="form-control" value={merchantForm.deviceName} onChange={e => setMerchantForm({ ...merchantForm, deviceName: e.target.value })} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Device IMEI</label>
                                                    <input type="text" className="form-control" value={merchantForm.deviceIMEI} onChange={e => setMerchantForm({ ...merchantForm, deviceIMEI: e.target.value })} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">mPOS Serial Number</label>
                                                    <input type="text" className="form-control" value={merchantForm.mposSerialNumber} onChange={e => setMerchantForm({ ...merchantForm, mposSerialNumber: e.target.value })} />
                                                </div>
                                            </div>

                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mb-3"><i className="fas fa-check-double me-1"></i>Verification Status Dropdowns (1 = Verified / 0 = Not Verified)</h6>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Phone Verification</label>
                                                    <select className="form-select" value={merchantForm.phone_verified_at} onChange={e => setMerchantForm({ ...merchantForm, phone_verified_at: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Email Verification</label>
                                                    <select className="form-select" value={merchantForm.email_verified_at} onChange={e => setMerchantForm({ ...merchantForm, email_verified_at: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label font-weight-bold">Aadhaar Verification</label>
                                                    <select className="form-select" value={merchantForm.aadhaar_verified_at} onChange={e => setMerchantForm({ ...merchantForm, aadhaar_verified_at: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">PAN Verification</label>
                                                    <select className="form-select" value={merchantForm.pan_verified_at} onChange={e => setMerchantForm({ ...merchantForm, pan_verified_at: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label font-weight-bold">Bank Verification</label>
                                                    <select className="form-select" value={merchantForm.bank_verified_at} onChange={e => setMerchantForm({ ...merchantForm, bank_verified_at: Number(e.target.value) })}>
                                                        <option value={1}>Verified</option>
                                                        <option value={0}>Not Verified</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Verification Raw JSON Responses Viewer */}
                                            <h6 className="text-primary font-weight-bold border-bottom pb-2 mt-4 mb-3">
                                                <i className="fas fa-code me-2"></i>Verification Raw JSON Responses (Aadhaar, PAN & Bank Account)
                                            </h6>
                                            <div className="row g-3">
                                                {/* Aadhaar Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-fingerprint me-1 text-primary"></i>Aadhaar Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.aadhar_data || searchedData.aeps_draft?.aadharData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'Aadhaar JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                            <pre className="text-success m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.aadhar_data || searchedData.aeps_draft?.aadharData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* PAN Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-id-card me-1 text-warning"></i>PAN Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.pan_data || searchedData.aeps_draft?.panData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'PAN JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                            <pre className="text-info m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.pan_data || searchedData.aeps_draft?.panData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bank Account Verification JSON */}
                                                <div className="col-md-4">
                                                    <div className="card border shadow-sm h-100">
                                                        <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                            <span className="font-weight-bold text-dark"><i className="fas fa-university me-1 text-success"></i>Bank Account Response JSON</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                                onClick={() => {
                                                                    const txt = formatJsonDisplay(searchedData.verification_json?.account_data || searchedData.aeps_draft?.accountData);
                                                                    navigator.clipboard.writeText(txt);
                                                                    showAlert('success', 'Bank Account JSON copied!');
                                                                }}
                                                            >
                                                                <i className="fas fa-copy me-1"></i>Copy
                                                            </button>
                                                        </div>
                                                        <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                            <pre className="text-warning m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                                {formatJsonDisplay(searchedData.verification_json?.account_data || searchedData.aeps_draft?.accountData)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowMerchantModal(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary" disabled={submittingMerchant}>
                                                {submittingMerchant ? <span className="spinner-border spinner-border-sm me-1"></span> : null} Save Merchant Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PASSBOOK SLIDE-OVER DRAWER (RIGHT SIDE MODAL) ── */}
                    {showPassbookDrawer && (
                        <div className="mur-drawer-backdrop" onClick={() => setShowPassbookDrawer(false)}>
                            <div className="mur-drawer-panel" onClick={e => e.stopPropagation()}>
                                <div className="mur-drawer-header">
                                    <div>
                                        <h5 className="mb-0 font-weight-bold text-dark"><i className="fas fa-book-open text-primary me-2"></i>Passbook Ledger</h5>
                                        <small className="text-primary font-weight-bold">{selectedAccountForPassbook?.name ? `Wallet: ${selectedAccountForPassbook.name} (ACC: ${selectedAccountForPassbook.number})` : 'All Accounts'}</small>
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setShowPassbookDrawer(false)}></button>
                                </div>
                                <div className="mur-drawer-body">
                                    {/* Type Filter Pills & Export Buttons */}
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                        <div className="d-flex gap-2">
                                            {['all', 'CR', 'DR'].map(t => (
                                                <button
                                                    key={t}
                                                    className={`btn btn-sm ${passbookTypeFilter === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    onClick={() => {
                                                        setPassbookTypeFilter(t);
                                                        fetchPassbookDrawer(searchedData?.user?.id, 1, t, startDate, endDate, selectedAccountForPassbook?.id);
                                                    }}
                                                >
                                                    {t === 'all' ? 'All' : t === 'CR' ? 'Credits (+)' : 'Debits (-)'}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                className="btn btn-outline-success btn-sm font-weight-bold"
                                                onClick={handleExportPassbookExcel}
                                                title="Export to Excel (.csv)"
                                            >
                                                <i className="fas fa-file-excel me-1"></i>Excel Export
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm font-weight-bold"
                                                onClick={handlePrintPassbookPDF}
                                                title="Print / Save PDF"
                                            >
                                                <i className="fas fa-file-pdf me-1"></i>PDF / Print
                                            </button>
                                        </div>
                                    </div>

                                    {/* Passbook Table Header Bar */}
                                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                        <small className="text-muted font-weight-bold">
                                            Showing {passbookData.length} of {passbookTotal} entries
                                        </small>
                                        <div className="d-flex align-items-center gap-1">
                                            <small className="text-muted me-1">Per Page:</small>
                                            <select
                                                className="form-select form-select-sm font-weight-bold py-0"
                                                style={{ width: '70px', height: '28px' }}
                                                value={passbookPerPage}
                                                onChange={e => {
                                                    const p = Number(e.target.value);
                                                    setPassbookPerPage(p);
                                                    fetchPassbookDrawer(searchedData?.user?.id, 1, passbookTypeFilter, startDate, endDate, selectedAccountForPassbook?.id, p);
                                                }}
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Passbook Table */}
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Txn ID</th>
                                                    <th>Type</th>
                                                    <th>Amount</th>
                                                    <th>Pre Bal</th>
                                                    <th>New Bal</th>
                                                    <th>Description</th>
                                                    <th>Date & Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {passbookLoading ? (
                                                    <tr><td colSpan="7" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span>Loading passbook...</td></tr>
                                                ) : passbookData.length === 0 ? (
                                                    <tr><td colSpan="7" className="text-center py-4 text-muted">No passbook records found.</td></tr>
                                                ) : (
                                                    passbookData.map(pb => (
                                                        <tr key={pb.id}>
                                                            <td className="font-mono text-dark small">{pb.transaction_id || pb.id}</td>
                                                            <td>
                                                                <span className={`badge ${pb.type === 'CR' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                                                    {pb.type}
                                                                </span>
                                                            </td>
                                                            <td className={`font-weight-bold ${pb.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                                                                {pb.type === 'CR' ? '+' : '-'}₹{Number(pb.amount || 0).toFixed(2)}
                                                            </td>
                                                            <td className="text-muted small">₹{Number(pb.pre_balance ?? (pb.type === 'CR' ? (pb.balance - pb.amount) : (pb.balance + pb.amount))).toFixed(2)}</td>
                                                            <td className="font-weight-bold text-dark">₹{Number(pb.balance || 0).toFixed(2)}</td>
                                                            <td className="small text-wrap" style={{ maxWidth: '240px' }}>{pb.description || '—'}</td>
                                                            <td className="small text-muted" style={{ whiteSpace: 'nowrap' }}>{pb.created_at ? new Date(pb.created_at).toLocaleString('en-IN') : '—'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Passbook Pagination */}
                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                        <span className="small text-muted">Page {passbookPage} of {passbookLastPage || 1} ({passbookTotal} records)</span>
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-secondary" disabled={passbookPage <= 1 || passbookLoading} onClick={() => fetchPassbookDrawer(searchedData?.user?.id, passbookPage - 1, passbookTypeFilter, startDate, endDate)}>Prev</button>
                                            <button className="btn btn-outline-secondary" disabled={passbookPage >= passbookLastPage || passbookLoading} onClick={() => fetchPassbookDrawer(searchedData?.user?.id, passbookPage + 1, passbookTypeFilter, startDate, endDate)}>Next</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL: PAYOUT JSON DATA ── */}
                    {showPayoutJsonModal && selectedPayoutRecord && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                <div className="modal-content mur-modal-content">
                                    <div className="modal-header bg-success text-white py-3 px-4">
                                        <h5 className="modal-title font-weight-bold text-white mb-0" style={{ fontSize: '18px' }}>
                                            <i className="fas fa-code me-2"></i>Payout JSON Logs (Txn: {selectedPayoutRecord.transaction_id || selectedPayoutRecord.id})
                                        </h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowPayoutJsonModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-3">
                                        {/* API Response JSON */}
                                        <div className="card border mb-3">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-exchange-alt me-1 text-primary"></i>api_response</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedPayoutRecord.api_response));
                                                        showAlert('success', 'api_response copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                <pre className="text-success m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedPayoutRecord.api_response)}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Callback URL */}
                                        <div className="card border mb-3">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-link me-1 text-info"></i>call_back_url</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedPayoutRecord.call_back_url || 'N/A');
                                                        showAlert('success', 'call_back_url copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom">
                                                <div className="text-info font-mono" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                                    {selectedPayoutRecord.call_back_url || 'No Callback URL recorded'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Callback Response JSON */}
                                        <div className="card border">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-reply me-1 text-warning"></i>call_back_response</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedPayoutRecord.call_back_response));
                                                        showAlert('success', 'call_back_response copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                <pre className="text-warning m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedPayoutRecord.call_back_response)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer py-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowPayoutJsonModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL: RECHARGE JSON DATA ── */}
                    {showRechargeJsonModal && selectedRechargeRecord && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                <div className="modal-content mur-modal-content">
                                    <div className="modal-header bg-info text-white py-3 px-4">
                                        <h5 className="modal-title font-weight-bold text-white mb-0" style={{ fontSize: '18px' }}>
                                            <i className="fas fa-code me-2"></i>Recharge JSON Logs (Txn: {selectedRechargeRecord.txnid || selectedRechargeRecord.transaction_id || selectedRechargeRecord.id})
                                        </h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowRechargeJsonModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-3">
                                        {/* Request Data JSON */}
                                        <div className="card border mb-3">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-paper-plane me-1 text-primary"></i>request_data</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedRechargeRecord.request_data));
                                                        showAlert('success', 'request_data copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                <pre className="text-info m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedRechargeRecord.request_data)}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Response Data JSON */}
                                        <div className="card border">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-check-circle me-1 text-success"></i>response_data</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedRechargeRecord.response_data));
                                                        showAlert('success', 'response_data copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                <pre className="text-success m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedRechargeRecord.response_data)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer py-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowRechargeJsonModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODAL: ACTIVITY LOG JSON DATA ── */}
                    {showLogJsonModal && selectedLogRecord && (
                        <div className="modal fade show d-block mur-modal-backdrop" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                <div className="modal-content mur-modal-content">
                                    <div className="modal-header bg-dark text-white py-3 px-4">
                                        <h5 className="modal-title font-weight-bold text-white mb-0" style={{ fontSize: '18px' }}>
                                            <i className="fas fa-history me-2 text-warning"></i>Activity Log JSON Details (ID: {selectedLogRecord.id})
                                        </h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowLogJsonModal(false)}></button>
                                    </div>
                                    <div className="modal-body p-3">
                                        {/* URL */}
                                        <div className="card border mb-3">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-link me-1 text-info"></i>Request URL</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedLogRecord.url || 'N/A');
                                                        showAlert('success', 'URL copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom">
                                                <div className="text-info font-mono" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                                    {selectedLogRecord.url || 'No URL recorded'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request Data JSON */}
                                        <div className="card border mb-3">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-paper-plane me-1 text-primary"></i>request_data</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedLogRecord.request_data));
                                                        showAlert('success', 'request_data copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                <pre className="text-info m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedLogRecord.request_data)}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Response Data JSON */}
                                        <div className="card border">
                                            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                                <span className="font-weight-bold text-dark"><i className="fas fa-check-circle me-1 text-success"></i>response_data</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formatJsonDisplay(selectedLogRecord.response_data));
                                                        showAlert('success', 'response_data copied!');
                                                    }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copy
                                                </button>
                                            </div>
                                            <div className="card-body p-2 bg-dark rounded-bottom" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                <pre className="text-success m-0 font-mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                                    {formatJsonDisplay(selectedLogRecord.response_data)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer py-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowLogJsonModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom Styles for Modern Aesthetic */}
            <style>{`
                .mur-card {
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e8ecf1;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.2s ease;
                }
                .mur-search-card {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    border-left: 4px solid #4f6ef7;
                    margin-bottom: 20px;
                }
                .mur-search-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                }
                .mur-search-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                    color: #1e293b;
                }
                .mur-badge-info {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 4px 12px;
                    border-radius: 20px;
                }
                .mur-search-input {
                    font-size: 15px;
                    font-weight: 500;
                }
                .mur-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4f6ef7 0%, #3b5de7 100%);
                    color: #ffffff;
                    font-size: 22px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(79,110,247,0.25);
                }
                .mur-user-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .mur-info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    background: #f8fafc;
                    padding: 14px;
                    border-radius: 8px;
                }
                .mur-info-item {
                    display: flex;
                    flex-direction: column;
                }
                .mur-info-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .mur-info-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .mur-wallet-card {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: #ffffff;
                    cursor: pointer;
                }
                .mur-wallet-card:hover {
                    box-shadow: 0 8px 24px rgba(15,23,42,0.3);
                }
                .mur-wallet-title {
                    color: #f8fafc;
                    font-size: 16px;
                }
                .mur-balance-main {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                    margin: 12px 0;
                }
                .mur-balance-currency {
                    font-size: 24px;
                    font-weight: 600;
                    color: #38bdf8;
                }
                .mur-balance-amount {
                    font-size: 36px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                }
                .mur-balance-breakdown {
                    display: flex;
                    gap: 20px;
                    background: rgba(255,255,255,0.06);
                    padding: 10px 14px;
                    border-radius: 8px;
                }
                .mur-bb-item {
                    display: flex;
                    flex-direction: column;
                }
                .mur-bb-label {
                    font-size: 11px;
                    color: #94a3b8;
                }
                .mur-bb-value {
                    font-size: 14px;
                }
                .mur-reports-filter-bar {
                    padding: 14px 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                .mur-filter-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }
                .mur-nav-tabs {
                    border-bottom: 2px solid #e2e8f0;
                }
                .mur-nav-tabs .nav-link {
                    font-weight: 600;
                    color: #64748b;
                    border: none;
                    border-bottom: 2px solid transparent;
                    padding: 10px 18px;
                }
                .mur-nav-tabs .nav-link.active {
                    color: #4f6ef7;
                    border-bottom-color: #4f6ef7;
                    background: transparent;
                }
                .mur-tab-content {
                    padding-top: 16px;
                }
                .mur-table th {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #475569;
                }
                .mur-table td {
                    font-size: 13px;
                }
                .mur-modal-backdrop {
                    background: rgba(15,23,42,0.6);
                    backdrop-filter: blur(4px);
                }
                .mur-modal-content {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                
                /* Passbook Right Drawer */
                .mur-drawer-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15,23,42,0.5);
                    backdrop-filter: blur(3px);
                    z-index: 1050;
                    display: flex;
                    justify-content: flex-end;
                }
                .mur-drawer-panel {
                    width: 50vw;
                    min-width: 550px;
                    max-width: 90vw;
                    height: 100vh;
                    background: #ffffff;
                    box-shadow: -4px 0 24px rgba(0,0,0,0.15);
                    display: flex;
                    flex-direction: column;
                    animation: slideInRight 0.25s ease-out;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .mur-drawer-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }
                .mur-drawer-body {
                    padding: 20px;
                    flex: 1;
                    overflow-y: auto;
                }

                .bg-primary-soft { background: #e0e7ff; }
                .bg-secondary-soft { background: #f1f5f9; }
                .bg-success-soft { background: #dcfce7; }
                .bg-danger-soft { background: #fee2e2; }
                .bg-info-soft { background: #e0f2fe; }
                .bg-warning-soft { background: #fef3c7; }
                .font-mono { font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace; }
                .max-w-300 { max-width: 300px; }
                .max-w-200 { max-width: 200px; }
            `}</style>
        </>
    );
};

export default ManageUserReport;
