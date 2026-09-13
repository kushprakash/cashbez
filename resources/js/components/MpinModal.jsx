import React, { useState } from 'react';

const MpinModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Enter Transaction MPIN",
    serviceTitle = null,
    planName = null,
    amount = null,
    memberInfo = null,
    accountInfo = null,
    walletName = "Utility Wallet",
    loading = false
}) => {
    const [mpin, setMpin] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!mpin || mpin.length !== 4) {
            setError('Please enter a valid 4-digit MPIN.');
            return;
        }
        setError('');
        onConfirm(mpin);
    };

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 4) {
            setMpin(val);
            if (error) setError('');
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1070 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header bg-gradient bg-primary text-white border-0 py-3 rounded-top-4">
                        <h5 className="modal-title fw-bold">
                            <i className="bx bx-lock-alt me-2"></i> {title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 text-center">
                            {/* Member & Account Info Summary Card */}
                            {(memberInfo || accountInfo || amount !== null || serviceTitle || planName) && (
                                <div className="bg-light rounded-3 p-3 mb-4 text-start border shadow-sm">
                                    {/* Service / Purpose & Plan Name */}
                                    {(serviceTitle || planName) && (
                                        <div className="mb-2 pb-2 border-bottom bg-white rounded-3 p-2 border">
                                            {serviceTitle && (
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-muted small fw-semibold">Payment Purpose:</span>
                                                    <span className="badge bg-primary text-white fw-bold">{serviceTitle}</span>
                                                </div>
                                            )}
                                            {planName && (
                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                    <span className="text-muted small fw-semibold">Account Plan / Type:</span>
                                                    <span className="fw-bold text-dark">{planName}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Member Details */}
                                    {memberInfo && (
                                        <div className="mb-2 pb-2 border-bottom">
                                            <span className="text-muted small d-block">Member Details</span>
                                            {typeof memberInfo === 'object' ? (
                                                <div className="fw-bold text-dark">
                                                    {memberInfo.name} <span className="text-primary">({memberInfo.member_id || memberInfo.id})</span>
                                                    {memberInfo.mobile && <span className="text-muted small font-normal d-block">Mobile: {memberInfo.mobile}</span>}
                                                </div>
                                            ) : (
                                                <div className="fw-bold text-dark">{memberInfo}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Account Details */}
                                    {accountInfo && (
                                        <div className="mb-2 pb-2 border-bottom">
                                            <span className="text-muted small d-block">Account Details</span>
                                            <div className="fw-bold text-dark">{accountInfo}</div>
                                        </div>
                                    )}

                                    {/* Amount */}
                                    {amount !== null && amount !== undefined && (
                                        <div className="d-flex align-items-center justify-content-between pt-1">
                                            <span className="text-muted fw-semibold">Total Amount to Pay:</span>
                                            <h4 className="fw-bold text-success mb-0">₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                                        </div>
                                    )}

                                    {/* Debit Wallet Selection Badge */}
                                    <div className="mt-3 p-2 bg-white rounded border d-flex align-items-center justify-content-between">
                                        <span className="text-muted small font-semibold">Auto-Debit Wallet:</span>
                                        <span className="badge bg-dark text-white px-2 py-1 fw-bold">
                                            <i className="bx bx-wallet me-1"></i> {walletName}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* MPIN Entry */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-dark">Enter 4-Digit Security MPIN</label>
                                <input
                                    type="password"
                                    className={`form-control form-control-lg text-center fw-bold fs-3 tracking-wider ${error ? 'is-invalid' : ''}`}
                                    placeholder="••••"
                                    maxLength="4"
                                    value={mpin}
                                    onChange={handlePinChange}
                                    autoFocus
                                    disabled={loading}
                                />
                                {error && <div className="invalid-feedback d-block mt-2 fw-medium">{error}</div>}
                            </div>
                            <p className="text-muted small mb-0">Enter your Agent MPIN to authorize payment & submit request.</p>
                        </div>
                        <div className="modal-footer bg-light border-0 py-3 px-4 rounded-bottom-4 d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary px-4 fw-medium" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success px-4 fw-bold shadow-sm" disabled={loading || mpin.length !== 4}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <i className="bx bx-check-circle me-1"></i> Process to Pay & Open
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MpinModal;
