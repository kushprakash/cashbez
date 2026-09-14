import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../core/services/ApiService';
import MpinModal from './MpinModal';
import MemberSelectSearch from './MemberSelectSearch';
import DepositReceiptModal from './DepositReceiptModal';

const AccountDepositModal = ({ isOpen, serviceType = null, onClose, onSuccess }) => {
    const api = ApiService();
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [accountId, setAccountId] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [amount, setAmount] = useState('');
    const [narration, setNarration] = useState('');

    const [showMpinModal, setShowMpinModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchMembersList();
            resetForm();
        }
    }, [isOpen, serviceType]);

    const resetForm = () => {
        setSelectedMemberId('');
        setSelectedMember(null);
        setFilteredAccounts([]);
        setAccountId('');
        setSelectedAccount(null);
        setAmount('');
        setNarration('');
        setShowMpinModal(false);
        setShowReceiptModal(false);
        setReceiptData(null);
    };

    const fetchMembersList = async () => {
        try {
            const res = await api.vGet('/api/agent/financial/members?per_page=100');
            if (res.data && res.data.status === 1) {
                setMembers(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch members list', err);
        }
    };

    const handleMemberSelect = async (memId) => {
        setSelectedMemberId(memId);
        setAccountId('');
        setSelectedAccount(null);
        setAmount('');

        if (!memId) {
            setSelectedMember(null);
            setFilteredAccounts([]);
            return;
        }

        try {
            const res = await api.vGet(`/api/agent/financial/members/${memId}`);
            if (res.data && res.data.status === 1) {
                const mem = res.data.data;
                setSelectedMember(mem);

                const accList = mem.accounts || [];
                let matching = accList.filter(a => a.status === 'ACTIVE');
                if (serviceType) {
                    matching = matching.filter(a => a.service_type === serviceType);
                }

                setFilteredAccounts(matching);

                // Auto-select if only 1 matching account exists
                if (matching.length === 1) {
                    const acc = matching[0];
                    setAccountId(acc.id);
                    setSelectedAccount(acc);
                    if (acc.opening_amount) {
                        setAmount(String(acc.opening_amount));
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load member accounts', err);
        }
    };

    const handleAccountChange = (e) => {
        const accId = e.target.value;
        setAccountId(accId);
        if (!accId) {
            setSelectedAccount(null);
            setAmount('');
            return;
        }

        const acc = filteredAccounts.find(a => a.id == accId);
        setSelectedAccount(acc || null);
        if (acc && acc.opening_amount) {
            setAmount(String(acc.opening_amount));
        }
    };

    if (!isOpen) return null;

    const modalTitle = serviceType === 'SAVING'
        ? 'Saving Account Deposit'
        : serviceType === 'DD'
        ? 'Daily Deposit (DD) Cash Collection'
        : serviceType === 'RD'
        ? 'Recurring Deposit (RD) Installment Deposit'
        : 'Account Cash Deposit';

    const handleFormSubmitClick = (e) => {
        e.preventDefault();
        if (!selectedMemberId) return toast.error('Please select a member.');
        if (!accountId) return toast.error('Please select an account for deposit.');
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return toast.error('Please enter a valid deposit amount.');
        setShowMpinModal(true);
    };

    const handleMpinConfirm = async (mpinCode) => {
        try {
            setSubmitting(true);
            const res = await api.vPost('/api/agent/financial/accounts/collect', {
                account_id: accountId,
                amount: amount,
                narration: narration,
                mpin: mpinCode
            });

            if (res.data && res.data.status === 1) {
                toast.success(res.data.message || 'Deposit processed successfully!');
                setShowMpinModal(false);

                const txn = res.data.transaction;
                const accData = res.data.account;

                const receiptObj = {
                    transaction_id: txn?.transaction_id || `DEP${Date.now()}`,
                    created_at: txn?.created_at || new Date().toISOString(),
                    member_name: selectedMember?.name,
                    member_id: selectedMember?.member_code || selectedMember?.id,
                    account_number: selectedAccount?.account_number || accData?.account_number,
                    service_type: selectedAccount?.service_type || serviceType || 'DEPOSIT',
                    amount: amount,
                    balance_before: txn?.balance_before ?? selectedAccount?.current_balance,
                    balance_after: txn?.balance_after ?? (accData?.current_balance || parseFloat(selectedAccount?.current_balance || 0) + parseFloat(amount)),
                    narration: narration,
                };

                setReceiptData(receiptObj);
                setShowReceiptModal(true);

                if (onSuccess) onSuccess();
            } else {
                toast.error(res.data?.message || 'Deposit failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deposit failed.');
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
                        <div className="modal-header bg-success text-white border-0 py-3 px-4 rounded-top-4">
                            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                <i className="bx bx-money-withdraw fs-4"></i>
                                <span>{modalTitle}</span>
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <form onSubmit={handleFormSubmitClick}>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">1. Select Member <span className="text-danger">*</span></label>
                                    <MemberSelectSearch
                                        members={members}
                                        value={selectedMemberId}
                                        onChange={handleMemberSelect}
                                        placeholder="Search Member by Name, Member ID, Mobile..."
                                    />
                                </div>

                                {selectedMemberId && (
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">2. Select Account <span className="text-danger">*</span></label>
                                        {filteredAccounts.length > 0 ? (
                                            <select
                                                className="form-select form-select-lg fw-bold"
                                                value={accountId}
                                                onChange={handleAccountChange}
                                                required
                                            >
                                                <option value="">-- Choose {serviceType || 'Account'} --</option>
                                                {filteredAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.account_number} ({acc.service_type}) — Balance: ₹{parseFloat(acc.current_balance || 0).toLocaleString('en-IN')}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="alert alert-warning py-2 small mb-0">
                                                <i className="bx bx-error-circle me-1"></i> No active {serviceType || ''} account found for this member.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedAccount && (
                                    <div className="card border-0 shadow-sm bg-light p-3 mb-3 rounded-3">
                                        <div className="row g-2 text-dark small">
                                            <div className="col-6">
                                                <span className="text-muted d-block">Account No:</span>
                                                <strong className="text-primary fs-6">{selectedAccount.account_number}</strong>
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted d-block">Service Scheme:</span>
                                                <span className="badge bg-success">{selectedAccount.service_type}</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted d-block">Member Name:</span>
                                                <strong>{selectedMember?.name}</strong> ({selectedMember?.mobile || 'N/A'})
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted d-block">Current Balance:</span>
                                                <strong className="text-success fs-5">₹{parseFloat(selectedAccount.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">3. Deposit Amount (₹) <span className="text-danger">*</span></label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white fw-bold">₹</span>
                                        <input
                                            type="number"
                                            className="form-control fw-bold"
                                            placeholder="Enter Deposit Amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <small className="text-muted">Amount will be debited from Agent Utility Wallet</small>
                                </div>

                                <div className="mb-2">
                                    <label className="form-label small fw-semibold text-muted">Narration / Remark (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Daily collection / Installment deposit"
                                        value={narration}
                                        onChange={(e) => setNarration(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 px-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-success px-4 fw-bold" disabled={!accountId || !amount}>
                                    <i className="bx bx-check-shield me-1"></i> Proceed to MPIN & Deposit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title={`Confirm ${serviceType || ''} Deposit`}
                serviceTitle={`${serviceType || 'Account'} Cash Deposit`}
                accountInfo={selectedAccount?.account_number}
                amount={parseFloat(amount || 0)}
                walletName="Agent Utility Wallet"
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

export default AccountDepositModal;
