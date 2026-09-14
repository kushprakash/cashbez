import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../core/services/ApiService';
import MpinModal from './MpinModal';
import DepositReceiptModal from './DepositReceiptModal';

/* ─────────────────────────────────────────────────────────────
   Searchable Saving Account / Member Selector Component
───────────────────────────────────────────────────────────── */
const SavingAccountSelectSearch = ({ accounts = [], value, onChange, placeholder = "Search member by Name, Mobile, Account No, Member ID..." }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (value) {
            const selected = accounts.find(a => a.id == value);
            if (selected) {
                const memberName = selected.member?.name || 'N/A';
                const memberId = selected.member?.member_code || selected.member?.id || '';
                const mobile = selected.member?.mobile || '';
                setSearchQuery(`${selected.account_number} - ${memberName} (${memberId}) ${mobile ? `- ${mobile}` : ''}`);
            }
        } else {
            setSearchQuery('');
        }
    }, [value, accounts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredAccounts = accounts.filter(a => {
        if (!searchQuery) return true;
        const memberName = (a.member?.name || '').toLowerCase();
        const memberId = String(a.member?.member_code || a.member?.id || '').toLowerCase();
        const mobile = String(a.member?.mobile || '').toLowerCase();
        const accNo = String(a.account_number || '').toLowerCase();
        const formatted = `${a.account_number} - ${a.member?.name || 'N/A'} (${memberId}) ${mobile ? `- ${mobile}` : ''}`.toLowerCase();

        if (searchQuery.toLowerCase() === formatted) return true;

        const q = searchQuery.toLowerCase();
        return accNo.includes(q) || memberName.includes(q) || memberId.includes(q) || mobile.includes(q);
    });

    const handleSelect = (account) => {
        onChange(account.id);
        const memberName = account.member?.name || 'N/A';
        const memberId = account.member?.member_code || account.member?.id || '';
        const mobile = account.member?.mobile || '';
        setSearchQuery(`${account.account_number} - ${memberName} (${memberId}) ${mobile ? `- ${mobile}` : ''}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setSearchQuery('');
        setIsOpen(true);
    };

    return (
        <div className="position-relative" ref={wrapperRef}>
            <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0"><i className="bx bx-search text-muted"></i></span>
                <input
                    type="text"
                    className="form-control border-start-0 fs-6"
                    placeholder={placeholder}
                    value={searchQuery}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                        if (value) onChange('');
                    }}
                />
                {value ? (
                    <button type="button" className="btn btn-outline-secondary border-start-0" onClick={handleClear}>
                        <i className="bx bx-x"></i>
                    </button>
                ) : null}
            </div>

            {isOpen && (
                <div
                    className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1"
                    style={{ zIndex: 1060, maxHeight: '240px', overflowY: 'auto', left: 0, right: 0 }}
                >
                    {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((a) => {
                            const isSelected = value == a.id;
                            const memberName = a.member?.name || 'N/A';
                            const memberId = a.member?.member_code || a.member?.id || 'N/A';
                            const mobile = a.member?.mobile || 'N/A';
                            const bal = parseFloat(a.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                            return (
                                <div
                                    key={a.id}
                                    className={`p-2.5 px-3 border-bottom text-start transition-all ${
                                        isSelected ? 'bg-primary text-white' : 'hover-bg-light text-dark'
                                    }`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelect(a)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="fw-bold">{memberName} <span className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`}>({memberId})</span></div>
                                        <span className={`badge ${isSelected ? 'bg-light text-primary' : 'bg-success-subtle text-success'}`}>
                                            Bal: ₹{bal}
                                        </span>
                                    </div>
                                    <div className={`small ${isSelected ? 'text-white-50' : 'text-muted'} mt-0.5`}>
                                        Acc No: <strong className={isSelected ? 'text-white' : 'text-primary'}>{a.account_number}</strong> | Mobile: {mobile} | KYC: {a.member?.kyc_status || 'PENDING'}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-center text-muted small">No saving account found matching "{searchQuery}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Saving Withdrawal Modal Main Component
───────────────────────────────────────────────────────────── */
const SavingWithdrawalModal = ({ isOpen, onClose, onSuccess }) => {
    const api = ApiService();
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
            setShowReceiptModal(false);
            setReceiptData(null);
            setForm({
                account_id: '',
                account_number: '',
                member_name: '',
                member_mobile: '',
                member_kyc: 'PENDING',
                available_balance: 0,
                amount: '',
                otp: '',
                otpSent: false,
                sendingOtp: false,
                narration: ''
            });
        }
    }, [isOpen]);

    const fetchAccounts = async () => {
        try {
            setLoadingAccounts(true);
            const res = await api.vGet('/api/agent/financial/saving/accounts?per_page=100');
            if (res.data?.status === 1) {
                setAccounts(res.data.data?.data || res.data.data || []);
            }
        } catch (e) {
            console.error('Failed to fetch saving accounts', e);
        } finally {
            setLoadingAccounts(false);
        }
    };

    if (!isOpen && !showReceiptModal) return null;

    const handleAccountSelect = (accId) => {
        if (!accId) {
            setForm(prev => ({
                ...prev,
                account_id: '',
                account_number: '',
                member_name: '',
                member_mobile: '',
                member_kyc: 'PENDING',
                available_balance: 0,
                otpSent: false,
            }));
            return;
        }

        const selected = accounts.find(a => a.id == accId);
        if (selected) {
            setForm(prev => ({
                ...prev,
                account_id: selected.id,
                account_number: selected.account_number,
                member_name: selected.member?.name || 'N/A',
                member_mobile: selected.member?.mobile || '',
                member_kyc: selected.member?.kyc_status || 'PENDING',
                available_balance: parseFloat(selected.current_balance || 0),
                otpSent: false,
                otp: ''
            }));
        }
    };

    const handleSendOtp = async () => {
        if (!form.account_id) return toast.error('Please select a Saving Account.');
        const amt = parseFloat(form.amount || 0);
        if (amt <= 0) return toast.error('Please enter a valid withdrawal amount.');
        if (amt > form.available_balance) return toast.error(`Insufficient balance. Maximum available: ₹${form.available_balance}`);
        if (form.member_kyc !== 'APPROVED') return toast.error('Withdrawal Rejected: Member KYC is not approved.');

        try {
            setForm(prev => ({ ...prev, sendingOtp: true }));
            const res = await api.vPost('/api/agent/financial/saving/send-withdrawal-otp', {
                account_id: form.account_id,
                amount: amt
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'OTP sent successfully to member mobile!');
                setForm(prev => ({ ...prev, otpSent: true, sendingOtp: false }));
            } else {
                toast.error(res.data?.message || 'Failed to send OTP.');
                setForm(prev => ({ ...prev, sendingOtp: false }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
            setForm(prev => ({ ...prev, sendingOtp: false }));
        }
    };

    const handleSubmitOtp = (e) => {
        e.preventDefault();
        if (!form.otp || form.otp.length !== 6) {
            return toast.error('Please enter the 6-digit OTP sent to member mobile.');
        }
        setShowMpin(true);
    };

    const handleMpinConfirm = async (pin) => {
        try {
            setSubmitting(true);
            const res = await api.vPost('/api/agent/financial/saving/withdraw', {
                account_id: form.account_id,
                amount: form.amount,
                otp: form.otp,
                narration: form.narration,
                mpin: pin
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Withdrawal completed successfully!');
                setShowMpin(false);
                
                const txn = res.data.transaction;
                const selAcc = accounts.find(a => a.id == form.account_id);

                const receiptObj = {
                    transaction_id: txn?.transaction_id || `WTH${Date.now()}`,
                    created_at: txn?.created_at || new Date().toISOString(),
                    member_name: form.member_name,
                    member_id: selAcc?.member?.member_code || selAcc?.member?.id || 'N/A',
                    account_number: form.account_number,
                    service_type: 'SAVING',
                    amount: form.amount,
                    balance_before: form.available_balance,
                    balance_after: form.available_balance - parseFloat(form.amount || 0),
                    narration: form.narration || 'Saving Account Cash Withdrawal',
                    txn_type: 'WITHDRAWAL',
                    type: 'DEBIT',
                    receipt_type: 'WITHDRAWAL',
                    isWithdrawal: true
                };

                setReceiptData(receiptObj);
                setShowReceiptModal(true);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.data?.message || 'Withdrawal failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Withdrawal failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceiptClose = () => {
        setShowReceiptModal(false);
        onClose();
    };

    return (
        <>
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header bg-danger text-white border-0 py-3 px-4 rounded-top-4">
                            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                <i className="bx bx-wallet fs-4"></i>
                                <span>Saving Account Mobile OTP Withdrawal</span>
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleSubmitOtp}>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Select Member / Saving Account <span className="text-danger">*</span></label>
                                    <SavingAccountSelectSearch
                                        accounts={accounts}
                                        value={form.account_id}
                                        onChange={handleAccountSelect}
                                        placeholder="Search member by Name, Mobile, Account No, Member ID..."
                                    />
                                </div>

                                {form.account_id && (
                                    <div className="card border-0 shadow-sm bg-light p-3 mb-3 rounded-3">
                                        <div className="row g-2 text-dark small">
                                            <div className="col-6">
                                                <span className="text-muted d-block">Account No:</span>
                                                <strong className="text-primary fs-6">{form.account_number}</strong>
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted d-block">KYC Status:</span>
                                                <span className={`badge ${form.member_kyc === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    KYC: {form.member_kyc}
                                                </span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted d-block">Member Name:</span>
                                                <strong>{form.member_name}</strong> ({form.member_mobile})
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted d-block">Available Balance:</span>
                                                <strong className="text-success fs-5">₹{form.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Withdrawal Amount (₹) <span className="text-danger">*</span></label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white fw-bold">₹</span>
                                        <input
                                            type="number"
                                            className="form-control fw-bold"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            min="1"
                                            max={form.available_balance || undefined}
                                            placeholder="Enter Withdrawal Amount"
                                            disabled={form.otpSent}
                                            required
                                        />
                                    </div>
                                </div>

                                {!form.otpSent ? (
                                    <div className="d-grid mt-3 mb-2">
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-lg fw-bold"
                                            onClick={handleSendOtp}
                                            disabled={form.sendingOtp || !form.account_id || !form.amount}
                                        >
                                            {form.sendingOtp ? (
                                                <>
                                                    <i className="bx bx-loader-alt bx-spin me-2"></i> Sending OTP to Mobile...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bx bx-mobile-vibration me-2"></i> Step 1: Send OTP to Member Mobile
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-white rounded border border-danger-subtle mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="badge bg-success"><i className="bx bx-check me-1"></i> OTP Sent to {form.member_mobile}</span>
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm text-decoration-none p-0 text-secondary"
                                                onClick={handleSendOtp}
                                                disabled={form.sendingOtp}
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Enter 6-Digit Member Mobile OTP <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg text-center fw-bold letter-spacing-2"
                                                style={{ letterSpacing: '4px', fontSize: '20px' }}
                                                maxLength="6"
                                                value={form.otp}
                                                onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                                                placeholder="• • • • • •"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label small fw-semibold text-muted">Narration (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={form.narration}
                                                onChange={e => setForm({ ...form, narration: e.target.value })}
                                                placeholder="Withdrawal Remarks"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn-close-white btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                                {form.otpSent && (
                                    <button type="submit" className="btn btn-danger px-4 fw-bold">
                                        Step 2: Proceed to MPIN & Withdraw
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <MpinModal
                isOpen={showMpin}
                onClose={() => setShowMpin(false)}
                onConfirm={handleMpinConfirm}
                title="Confirm Saving Account Withdrawal"
                serviceTitle="Saving Account Cash Withdrawal"
                accountInfo={form.account_number}
                amount={parseFloat(form.amount || 0)}
                walletName="Saving Account Balance"
                loading={submitting}
            />

            <DepositReceiptModal
                isOpen={showReceiptModal}
                onClose={handleReceiptClose}
                data={receiptData}
            />
        </>
    );
};

export default SavingWithdrawalModal;
