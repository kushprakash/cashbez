import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const showAlert = (title, text, icon = 'info') => {
    if (window.Swal) {
        window.Swal.fire(title, text, icon);
    } else if (icon === 'error') {
        toast.error(`${title ? title + ': ' : ''}${text}`);
    } else if (icon === 'success') {
        toast.success(`${title ? title + ': ' : ''}${text}`);
    } else {
        toast.info(`${title ? title + ': ' : ''}${text}`);
    }
};

export default function AgentReportsView() {
    const [reportType, setReportType] = useState('MEMBERS');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReport(reportType);
    }, [reportType]);

    const fetchReport = async (type) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/agent/financial/reports', {
                params: { report_type: type }
            });
            if (res.data && res.data.status === 1) {
                setReportData(res.data.data || []);
            } else {
                setReportData([]);
            }
        } catch (err) {
            console.error('Failed to fetch report:', err);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!reportData || reportData.length === 0) {
            showAlert('No Data', 'There is no data to export.', 'info');
            return;
        }

        const headers = reportType === 'MEMBERS' 
            ? ['Member ID', 'Name', 'Mobile', 'Email', 'Status', 'KYC Status', 'Created At']
            : reportType === 'TRANSACTIONS'
            ? ['Txn ID', 'Member ID', 'Account No', 'Service', 'Type', 'Amount', 'Mode', 'Status', 'Date']
            : ['Account No', 'Member ID', 'Service', 'Balance / Deposit', 'Status', 'Opening Date'];

        const rows = reportData.map(item => {
            if (reportType === 'MEMBERS') {
                return [
                    item.member_id || '',
                    `"${item.name || ''}"`,
                    item.mobile || '',
                    item.email || '',
                    item.status || '',
                    item.kyc_status || '',
                    item.created_at || ''
                ];
            } else if (reportType === 'TRANSACTIONS') {
                return [
                    item.transaction_id || '',
                    item.member?.member_id || '',
                    item.account?.account_number || '',
                    item.service_type || '',
                    item.txn_type || '',
                    item.amount || 0,
                    item.payment_mode || '',
                    item.status || '',
                    item.created_at || ''
                ];
            } else {
                return [
                    item.account_number || '',
                    item.member?.member_id || '',
                    item.service_type || '',
                    item.current_balance || item.opening_amount || 0,
                    item.status || '',
                    item.created_at || ''
                ];
            }
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Agent_Financial_Report_${reportType}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = reportData.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const text = JSON.stringify(item).toLowerCase();
        return text.includes(term);
    });

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <i className="fa-solid fa-chart-pie text-amber-400"></i>
                        Agent Scoped Reports Suite
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Comprehensive financial, membership & account performance analytics (Scoped to your agent ID)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/agent/financial-dashboard"
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2 border border-slate-700"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Financial Dashboard
                    </Link>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
                    >
                        <i className="fa-solid fa-file-excel"></i>
                        Export CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
                    >
                        <i className="fa-solid fa-print"></i>
                        Print Report
                    </button>
                </div>
            </div>

            {/* Report Selection Tabs */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[
                        { id: 'MEMBERS', label: 'Members Report', icon: 'fa-users' },
                        { id: 'SAVING', label: 'Saving Accounts', icon: 'fa-piggy-bank' },
                        { id: 'DD', label: 'Daily Deposit (DD)', icon: 'fa-calendar-day' },
                        { id: 'RD', label: 'Recurring Deposit (RD)', icon: 'fa-arrows-rotate' },
                        { id: 'FD', label: 'Fixed Deposit (FD)', icon: 'fa-vault' },
                        { id: 'TRANSACTIONS', label: 'Transaction Audit', icon: 'fa-receipt' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setReportType(tab.id)}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                                reportType === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Counter Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
                </div>
                <div className="text-sm font-medium text-slate-500">
                    Showing <span className="font-bold text-slate-800">{filteredData.length}</span> of <span className="font-bold text-slate-800">{reportData.length}</span> entries
                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-indigo-500"></i>
                        <p className="text-sm font-medium">Loading report records...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <i className="fa-solid fa-folder-open text-4xl mb-3 text-slate-300"></i>
                        <p className="text-base font-medium text-slate-600">No records found</p>
                        <p className="text-xs text-slate-400 mt-1">Try changing filters or report category</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    {reportType === 'MEMBERS' ? (
                                        <>
                                            <th className="py-3.5 px-4">Member ID</th>
                                            <th className="py-3.5 px-4">Member Name</th>
                                            <th className="py-3.5 px-4">Mobile</th>
                                            <th className="py-3.5 px-4">KYC Status</th>
                                            <th className="py-3.5 px-4">Account Status</th>
                                            <th className="py-3.5 px-4">Joined Date</th>
                                        </>
                                    ) : reportType === 'TRANSACTIONS' ? (
                                        <>
                                            <th className="py-3.5 px-4">Txn ID</th>
                                            <th className="py-3.5 px-4">Member / Account</th>
                                            <th className="py-3.5 px-4">Service</th>
                                            <th className="py-3.5 px-4">Type</th>
                                            <th className="py-3.5 px-4">Amount</th>
                                            <th className="py-3.5 px-4">Mode</th>
                                            <th className="py-3.5 px-4">Date</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="py-3.5 px-4">Account No</th>
                                            <th className="py-3.5 px-4">Member Details</th>
                                            <th className="py-3.5 px-4">Service Type</th>
                                            <th className="py-3.5 px-4">Balance / Deposit</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4">Opened Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {filteredData.map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                        {reportType === 'MEMBERS' ? (
                                            <>
                                                <td className="py-3.5 px-4 font-bold text-indigo-600">{item.member_id}</td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                                                <td className="py-3.5 px-4 text-slate-600">{item.mobile}</td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        item.kyc_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.kyc_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {item.kyc_status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                            </>
                                        ) : reportType === 'TRANSACTIONS' ? (
                                            <>
                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{item.transaction_id}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-800">{item.member?.name || 'N/A'}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{item.account?.account_number || item.member?.member_id}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                                                        {item.service_type}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                                        item.txn_type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.txn_type === 'WITHDRAWAL' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                        {item.txn_type}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">
                                                    {item.payment_mode}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-500">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3.5 px-4 font-bold text-indigo-600">{item.account_number}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-800">{item.member?.name || 'N/A'}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{item.member?.member_id}</div>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-slate-600">{item.service_type}</td>
                                                <td className="py-3.5 px-4 font-bold text-emerald-600">
                                                    ₹{parseFloat(item.current_balance || item.opening_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
