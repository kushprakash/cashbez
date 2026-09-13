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

const showConfirm = async (title, html) => {
    if (window.Swal) {
        const result = await window.Swal.fire({
            title: title,
            html: html,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Submit Closing',
            cancelButtonText: 'Review Cash Count'
        });
        return result.isConfirmed;
    } else {
        const plainText = html.replace(/<br\/>/g, '\n').replace(/<[^>]+>/g, '');
        return window.confirm(`${title}\n\n${plainText}`);
    }
};

export default function DailyClosingView() {
    const [loading, setLoading] = useState(true);
    const [closingInfo, setClosingInfo] = useState({
        closing_date: '',
        opening_balance: 0,
        total_deposit: 0,
        total_withdrawal: 0,
        calculated_closing_balance: 0,
        today_status: 'NOT_SUBMITTED',
        existing_closing: null
    });

    // Cash Denominations state
    const [notes, setNotes] = useState({
        n500: 0,
        n200: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        coins: 0
    });

    const [physicalCash, setPhysicalCash] = useState(0);
    const [remark, setRemark] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDailyClosingInfo();
    }, []);

    // Recalculate total physical cash from notes
    useEffect(() => {
        const total = 
            (parseInt(notes.n500 || 0) * 500) +
            (parseInt(notes.n200 || 0) * 200) +
            (parseInt(notes.n100 || 0) * 100) +
            (parseInt(notes.n50 || 0) * 50) +
            (parseInt(notes.n20 || 0) * 20) +
            (parseInt(notes.n10 || 0) * 10) +
            parseFloat(notes.coins || 0);
        setPhysicalCash(total);
    }, [notes]);

    const fetchDailyClosingInfo = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/agent/financial/daily-closing');
            if (res.data && res.data.status === 1) {
                const info = res.data.data;
                setClosingInfo(info);
                if (info.existing_closing) {
                    setPhysicalCash(info.existing_closing.physical_cash || 0);
                    setRemark(info.existing_closing.remark || '');
                } else {
                    setPhysicalCash(info.calculated_closing_balance || 0);
                }
            }
        } catch (err) {
            console.error('Failed to fetch daily closing:', err);
            showAlert('Error', 'Failed to load daily closing information.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNoteChange = (key, val) => {
        const num = val === '' ? 0 : parseInt(val) || 0;
        setNotes(prev => ({ ...prev, [key]: num < 0 ? 0 : num }));
    };

    const handleSubmitClosing = async (e) => {
        e.preventDefault();

        const diff = physicalCash - closingInfo.calculated_closing_balance;
        
        if (diff !== 0) {
            const confirmed = await showConfirm(
                'Cash Difference Detected!',
                `Calculated System Balance: <b>₹${closingInfo.calculated_closing_balance.toLocaleString()}</b><br/>
                 Physical Cash Counted: <b>₹${physicalCash.toLocaleString()}</b><br/>
                 Difference: <b class="${diff < 0 ? 'text-red-600' : 'text-emerald-600'}">₹${diff.toLocaleString()}</b><br/><br/>
                 Are you sure you want to submit this daily closing report?`
            );
            if (!confirmed) return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post('/api/agent/financial/daily-closing', {
                physical_cash: physicalCash,
                remark: remark
            });

            if (res.data && res.data.status === 1) {
                showAlert('Success', res.data.message || 'Daily closing submitted successfully!', 'success');
                fetchDailyClosingInfo();
            } else {
                showAlert('Error', res.data.message || 'Failed to submit daily closing.', 'error');
            }
        } catch (err) {
            console.error('Submission failed:', err);
            showAlert('Error', err.response?.data?.message || 'Submission failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const difference = physicalCash - closingInfo.calculated_closing_balance;

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400">
                <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-indigo-500"></i>
                <p className="text-sm font-medium">Calculating today's financial summary...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <i className="fa-solid fa-cash-register text-emerald-400"></i>
                        Agent Daily Cash Closing
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Date: <span className="font-semibold text-white">{closingInfo.closing_date}</span> | Reconcile collections, cash counter & submit closing report
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/agent/financial-dashboard"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2 border border-slate-700"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Financial Dashboard
                    </Link>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md inline-flex items-center gap-2 ${
                        closingInfo.today_status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                        closingInfo.today_status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                        <i className={`fa-solid ${
                            closingInfo.today_status === 'APPROVED' ? 'fa-check-circle' :
                            closingInfo.today_status === 'PENDING' ? 'fa-hourglass-half' : 'fa-circle-info'
                        }`}></i>
                        Status: {closingInfo.today_status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* 4 Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase text-slate-400">Opening Balance</div>
                        <div className="text-xl font-bold text-slate-800">₹{closingInfo.opening_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                        <i className="fa-solid fa-arrow-down-long"></i>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase text-slate-400">Total Today Deposits</div>
                        <div className="text-xl font-bold text-emerald-600">+ ₹{closingInfo.total_deposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                        <i className="fa-solid fa-arrow-up-long"></i>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase text-slate-400">Total Today Withdrawals</div>
                        <div className="text-xl font-bold text-rose-600">- ₹{closingInfo.total_withdrawal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-200">
                        <i className="fa-solid fa-calculator"></i>
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase text-indigo-500">System Closing Balance</div>
                        <div className="text-xl font-black text-indigo-900">₹{closingInfo.calculated_closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>

            {/* Reconciliation & Form Grid */}
            <form onSubmit={handleSubmitClosing} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Physical Denomination Calculator (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i className="fa-solid fa-money-bill-wave text-emerald-500"></i>
                        Physical Cash Denomination Count
                    </h2>
                    <p className="text-xs text-slate-400">
                        Enter count of physical notes present in cash drawer to auto-calculate physical cash total.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase">
                                    <th className="py-2.5 px-3">Denomination</th>
                                    <th className="py-2.5 px-3">Count (Pcs)</th>
                                    <th className="py-2.5 px-3 text-right">Subtotal (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {[
                                    { key: 'n500', label: '₹ 500 Note', mult: 500 },
                                    { key: 'n200', label: '₹ 200 Note', mult: 200 },
                                    { key: 'n100', label: '₹ 100 Note', mult: 100 },
                                    { key: 'n50', label: '₹ 50 Note', mult: 50 },
                                    { key: 'n20', label: '₹ 20 Note', mult: 20 },
                                    { key: 'n10', label: '₹ 10 Note', mult: 10 },
                                ].map(item => (
                                    <tr key={item.key}>
                                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{item.label}</td>
                                        <td className="py-2.5 px-3">
                                            <input
                                                type="number"
                                                min="0"
                                                value={notes[item.key] || ''}
                                                onChange={(e) => handleNoteChange(item.key, e.target.value)}
                                                className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                            ₹{((notes[item.key] || 0) * item.mult).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="py-2.5 px-3 text-slate-700 font-semibold">Coins / Change</td>
                                    <td className="py-2.5 px-3">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={notes.coins || ''}
                                            onChange={(e) => handleNoteChange('coins', e.target.value)}
                                            className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                        ₹{(parseFloat(notes.coins || 0)).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Closing Summary & Submit (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <i className="fa-solid fa-clipboard-check text-indigo-600"></i>
                            Reconciliation Summary
                        </h2>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 font-medium text-sm">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Calculated System Balance:</span>
                                <span className="font-bold text-slate-800">₹{closingInfo.calculated_closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Counted Physical Cash:</span>
                                <span className="font-bold text-emerald-600">₹{physicalCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base font-bold">
                                <span>Variance / Difference:</span>
                                <span className={difference === 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-amber-600'}>
                                    ₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Closing Remarks / Notes</label>
                            <textarea
                                rows="3"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter any variance explanation or cash drawer notes..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Submitting Closing...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-paper-plane"></i>
                                Submit Daily Closing for Admin Approval
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
