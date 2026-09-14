import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import MpinModal from '../../components/MpinModal';
import MemberSelectSearch from '../../components/MemberSelectSearch';

import DepositReceiptModal from '../../components/DepositReceiptModal';

const CollectionCenterView = () => {
    const api = ApiService();
    const [members, setMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    const [accountId, setAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [narration, setNarration] = useState('');

    const [showMpinModal, setShowMpinModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

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

    useEffect(() => {
        fetchMembersList();
    }, []);

    const handleMemberSelect = async (memId) => {
        setSelectedMemberId(memId);
        setAccountId('');
        if (!memId) {
            setSelectedMember(null);
            return;
        }
        try {
            const res = await api.vGet(`/api/agent/financial/members/${memId}`);
            if (res.data && res.data.status === 1) {
                setSelectedMember(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load member accounts', err);
        }
    };

    const handleFormSubmitClick = (e) => {
        e.preventDefault();
        if (!selectedMemberId) return toast.error('Please select a member.');
        if (!accountId) return toast.error('Please select an account for collection.');
        const amt = parseFloat(amount);
        if (amt <= 0) return toast.error('Please enter a valid collection amount.');
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
                toast.success(res.data.message);
                setShowMpinModal(false);

                const txn = res.data.transaction;
                const accData = res.data.account;
                const targetAcc = selectedMember?.accounts?.find(a => a.id == accountId);

                const receiptObj = {
                    transaction_id: txn?.transaction_id || `DEP${Date.now()}`,
                    created_at: txn?.created_at || new Date().toISOString(),
                    member_name: selectedMember?.name,
                    member_id: selectedMember?.member_id,
                    account_number: targetAcc?.account_number || accData?.account_number,
                    service_type: targetAcc?.service_type || accData?.service_type || 'DEPOSIT',
                    amount: amount,
                    balance_before: txn?.balance_before ?? targetAcc?.current_balance,
                    balance_after: txn?.balance_after ?? (accData?.current_balance || parseFloat(targetAcc?.current_balance || 0) + parseFloat(amount)),
                    narration: narration,
                };

                setReceiptData(receiptObj);
                setShowReceiptModal(true);

                // Instantly re-fetch member details to update account balance on screen!
                handleMemberSelect(selectedMemberId);
            } else {
                toast.error(res.data?.message || 'Collection failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Collection failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1">
                        <i className="bx bx-dollar-circle text-success me-2"></i> Deposit
                    </h3>
                    <p className="text-muted mb-0">Fast deposit for Saving, DD, RD, and Other accounts</p>
                </div>
                <Link to="/agent/financial-dashboard" className="btn btn-secondary fw-bold shadow-sm">
                    <i className="bx bx-arrow-back me-1"></i> Back to Financial Dashboard
                </Link>
            </div>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-primary text-white py-3 rounded-top-4">
                            <h6 className="mb-0 fw-bold"><i className="bx bx-paper-plane me-2"></i>Deposit</h6>
                        </div>
                        <form onSubmit={handleFormSubmitClick} className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">1. Select Member <span className="text-danger">*</span></label>
                                <MemberSelectSearch
                                    members={members}
                                    value={selectedMemberId}
                                    onChange={handleMemberSelect}
                                    placeholder="Search & Choose Member by Name, ID, Mobile..."
                                />
                            </div>

                            {selectedMember && (
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">2. Select Account <span className="text-danger">*</span></label>
                                    <select className="form-select form-select-lg" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                                        <option value="">-- Choose Account --</option>
                                        {selectedMember.accounts?.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                [{acc.service_type}] {acc.account_number} (Bal: ₹{parseFloat(acc.current_balance).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-semibold">3. Collection Amount (₹) <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg fw-bold"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    required
                                />
                                <small className="text-muted">Auto-debited from Utility Wallet</small>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">4. Remark / Narration</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Doorstep daily collection"
                                    value={narration}
                                    onChange={(e) => setNarration(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow-sm" disabled={!selectedMemberId || !accountId || !amount}>
                                <i className="bx bx-check-circle me-1"></i> Proceed to MPIN & Post Collection
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 bg-light">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bx bx-info-circle text-primary me-2"></i> Collection Summary & Rules
                            </h6>
                            <ul className="list-unstyled text-muted small">
                                <li className="mb-2"><i className="bx bx-check text-success me-1"></i> Every collection auto-debits the Agent Utility Wallet (`primary_status = 0`).</li>
                                <li className="mb-2"><i className="bx bx-check text-success me-1"></i> Agent MPIN modal is mandatory before submission.</li>
                                <li className="mb-2"><i className="bx bx-check text-success me-1"></i> Passbook entry is created instantly with unique transaction reference.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <MpinModal
                isOpen={showMpinModal}
                onClose={() => setShowMpinModal(false)}
                onConfirm={handleMpinConfirm}
                title="Confirm Field Collection Payment"
                serviceTitle="Field Account Collection"
                accountInfo={selectedMember?.accounts?.find(a => a.id == accountId)?.account_number}
                amount={amount}
                memberInfo={selectedMember}
                walletName="Utility Wallet"
                loading={submitting}
            />

            <DepositReceiptModal
                isOpen={showReceiptModal}
                onClose={() => {
                    setShowReceiptModal(false);
                    setAmount('');
                    setNarration('');
                }}
                data={receiptData}
            />
        </div>
    );
};

export default CollectionCenterView;
