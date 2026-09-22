import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../core/hooks/context';

const DepositReceiptModal = ({ isOpen, onClose, data }) => {
    const { userData } = useContext(AuthContext) || {};
    const companyName = data?.company_name ||
                        userData?.company_name ||
                        userData?.setting?.company_name ||
                        localStorage.getItem('company_name') ||
                        'CASHBEZ BANKING';

    // 3 Print Formats: 'A4_HALF' (1/2 A4), 'A4_QUARTER' (1/4 A4), 'POS_THERMAL' (Mall Bill Bluetooth POS)
    const [format, setFormat] = useState(() => {
        return localStorage.getItem('cashbez_receipt_format') || 'A4_HALF';
    });

    const receiptRef = useRef();

    useEffect(() => {
        localStorage.setItem('cashbez_receipt_format', format);
    }, [format]);

    if (!isOpen || !data) return null;

    const {
        transaction_id,
        created_at,
        member_name,
        member_id,
        account_number,
        service_type,
        amount,
        balance_before,
        balance_after,
        narration,
        agent_name,
        agent_mobile,
        txn_type,
        type,
        receipt_type,
        is_withdrawal,
        isWithdrawal: isWithdrawalProp,
        status = 'SUCCESS'
    } = data;

    // Detect if this is a Withdrawal transaction
    const isWithdrawal = Boolean(
        isWithdrawalProp === true ||
        is_withdrawal === true ||
        data?.is_debit === true ||
        txn_type === 'WITHDRAWAL' ||
        txn_type === 'DEBIT' ||
        type === 'DEBIT' ||
        type === 'WITHDRAWAL' ||
        receipt_type === 'WITHDRAWAL' ||
        receipt_type === 'WITHDRAW' ||
        receipt_type === 'DEBIT' ||
        (txn_type && String(txn_type).toUpperCase().includes('WITHDRAW')) ||
        (txn_type && String(txn_type).toUpperCase().includes('DEBIT')) ||
        (type && String(type).toUpperCase().includes('WITHDRAW')) ||
        (type && String(type).toUpperCase().includes('DEBIT')) ||
        (narration && String(narration).toLowerCase().includes('withdraw')) ||
        (narration && String(narration).toLowerCase().includes('debit'))
    );

    const receiptTitle = isWithdrawal ? 'WITHDRAWAL RECEIPT' : 'DEPOSIT RECEIPT';
    const amountLabel = isWithdrawal ? 'Withdrawal Amount' : 'Deposit Amount';
    const amountUpperLabel = isWithdrawal ? 'WITHDRAWAL AMT:' : 'DEPOSIT AMT:';
    const acknowledgementText = isWithdrawal
        ? 'Official Withdrawal Acknowledgment Receipt'
        : 'Official Deposit Acknowledgment Receipt';
    const amtColorClass = isWithdrawal ? 'text-danger' : 'text-success';
    const amtBgClass = isWithdrawal ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10';

    const formattedDate = created_at
        ? new Date(created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const formattedAmount = `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const formattedBalBefore = balance_before !== undefined && balance_before !== null ? `₹${parseFloat(balance_before).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A';
    const formattedBalAfter = balance_after !== undefined && balance_after !== null ? `₹${parseFloat(balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A';

    const handlePrint = () => {
        if (format === 'POS_THERMAL') {
            handleThermalPrint();
            return;
        }

        const printWindow = window.open('', '_blank', 'width=950,height=750');
        if (!printWindow) {
            window.print();
            return;
        }

        const innerContent = receiptRef.current ? receiptRef.current.innerHTML : '';

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${receiptTitle} - ${transaction_id || ''}</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css">
                <style>
                    body {
                        background-color: #ffffff !important;
                        font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        padding: 15px;
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    .table-light {
                        background-color: #f8f9fa !important;
                    }
                    .bg-light {
                        background-color: #f8f9fa !important;
                    }
                    .bg-success {
                        background-color: #198754 !important;
                    }
                    .bg-danger {
                        background-color: #dc3545 !important;
                    }
                    .bg-info {
                        background-color: #0dcaf0 !important;
                    }
                    .text-danger {
                        color: #dc3545 !important;
                    }
                    .text-success {
                        color: #198754 !important;
                    }
                    .text-primary {
                        color: #0d6efd !important;
                    }
                </style>
            </head>
            <body>
                <div style="width: 100%; max-width: ${format === 'A4_QUARTER' ? '340px' : '800px'}; margin: ${format === 'A4_QUARTER' ? '0' : '0 auto'};">
                    ${innerContent}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function(){ window.close(); }, 500);
                        }, 350);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    const handleThermalPrint = () => {
        const printWindow = window.open('', '_blank', 'width=380,height=600');
        if (!printWindow) return;

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${receiptTitle} - ${transaction_id || ''}</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        font-weight: bold;
                        color: #000;
                        width: 280px;
                        margin: 0 auto;
                        padding: 10px;
                        line-height: 1.3;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .dashed-line { border-top: 1px dashed #000; margin: 8px 0; }
                    .double-line { border-top: 2px solid #000; margin: 8px 0; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                    .large-amt { font-size: 16px; font-weight: 900; margin: 6px 0; }
                    .header-title { font-size: 15px; text-transform: uppercase; font-weight: 900; }
                    .footer-text { font-size: 10px; text-align: center; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <div class="header-title">${companyName}</div>
                    <div>${receiptTitle}</div>
                    <div>${agent_name || 'Agent Outlet'}</div>
                    ${agent_mobile ? `<div>Mob: ${agent_mobile}</div>` : ''}
                </div>

                <div class="dashed-line"></div>

                <div class="row"><span>Status:</span><span class="bold">[ SUCCESS ]</span></div>
                <div class="row"><span>Txn ID:</span><span>${transaction_id || 'N/A'}</span></div>
                <div class="row"><span>Date:</span><span>${formattedDate}</span></div>

                <div class="dashed-line"></div>

                <div class="row"><span>Member:</span><span class="bold">${member_name || 'N/A'}</span></div>
                <div class="row"><span>Member ID:</span><span>${member_id || 'N/A'}</span></div>
                <div class="row"><span>Account No:</span><span class="bold">${account_number || 'N/A'}</span></div>
                <div class="row"><span>Scheme:</span><span>${service_type || 'BANKING'}</span></div>

                <div class="dashed-line"></div>

                <div class="row large-amt">
                    <span>${amountUpperLabel}</span>
                    <span>${formattedAmount}</span>
                </div>

                <div class="dashed-line"></div>

                <div class="row"><span>Prev Balance:</span><span>${formattedBalBefore}</span></div>
                <div class="row"><span>New Balance:</span><span class="bold">${formattedBalAfter}</span></div>
                <div class="row"><span>Payment Mode:</span><span>${isWithdrawal ? 'CASH WITHDRAWAL' : 'UTILITY WALLET'}</span></div>
                ${narration ? `<div class="row"><span>Remark:</span><span>${narration}</span></div>` : ''}

                <div class="double-line"></div>

                <div class="footer-text">
                    *** Thank You ***<br/>
                    This is a computer generated receipt.<br/>
                    Helpline: 01169266060
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function(){ window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1080 }}>
            <style>{`
                @media print {
                    body > * {
                        visibility: hidden !important;
                    }
                    .receipt-modal-content, .receipt-modal-content * {
                        visibility: visible !important;
                    }
                    .receipt-modal-content {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: auto !important;
                        z-index: 999999 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: #fff !important;
                    }
                    .d-print-none {
                        display: none !important;
                    }
                }
            `}</style>

            <div className={`modal-dialog modal-dialog-centered ${format === 'POS_THERMAL' ? 'modal-sm' : 'modal-lg'}`}>
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden receipt-modal-content bg-white">

                    {/* Top Control Bar (Format Selection & Actions) */}
                    <div className="bg-dark text-white p-3 d-flex flex-wrap align-items-center justify-content-between gap-2 d-print-none">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bx bx-receipt text-warning fs-4"></i>
                            <span className="fw-bold">Receipt Layout Setting:</span>
                        </div>

                        {/* Format Switcher Buttons */}
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                type="button"
                                className={`btn ${format === 'A4_HALF' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
                                onClick={() => setFormat('A4_HALF')}
                            >
                                <i className="bx bx-file me-1"></i> 1/2 A4 (Half)
                            </button>
                            <button
                                type="button"
                                className={`btn ${format === 'A4_QUARTER' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
                                onClick={() => setFormat('A4_QUARTER')}
                            >
                                <i className="bx bx-layout me-1"></i> 1/4 A4 (Quarter)
                            </button>
                            <button
                                type="button"
                                className={`btn ${format === 'POS_THERMAL' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'}`}
                                onClick={() => setFormat('POS_THERMAL')}
                            >
                                <i className="bx bx-printer me-1"></i> POS Thermal
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success fw-bold" onClick={handlePrint}>
                                <i className="bx bx-printer me-1"></i> Print Receipt
                            </button>
                            <button className="btn btn-sm btn-secondary fw-bold" onClick={onClose}>
                                <i className="bx bx-x me-1"></i> Close
                            </button>
                        </div>
                    </div>

                    {/* Receipt Printable Container */}
                    <div className="p-4" ref={receiptRef} style={{ backgroundColor: '#ffffff' }}>

                        {/* FORMAT 1: 1/2 A4 HALF PAGE RECEIPT */}
                        {format === 'A4_HALF' && (
                            <div className="border rounded-4 p-4 shadow-sm" style={{ border: `2px dashed ${isWithdrawal ? '#dc3545' : '#0d6efd'}` }}>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                    <div>
                                        <h4 className={`fw-bold mb-0 ${isWithdrawal ? 'text-danger' : 'text-primary'}`}>{companyName}</h4>
                                        <small className="text-muted fw-semibold">{acknowledgementText}</small>
                                    </div>
                                    <div className="text-end">
                                        <span className={`badge ${isWithdrawal ? 'bg-danger' : 'bg-success'} fs-6 px-3 py-2`}>
                                            <i className="bx bx-check-circle me-1"></i> {isWithdrawal ? 'WITHDRAWAL SUCCESSFUL' : 'TRANSACTION SUCCESSFUL'}
                                        </span>
                                        <small className="d-block text-muted mt-1">{formattedDate}</small>
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <div className="bg-light p-3 rounded-3 border">
                                            <span className="text-muted small d-block text-uppercase fw-semibold">Member Information</span>
                                            <strong className="text-dark fs-5 d-block">{member_name}</strong>
                                            <small className="text-muted">Member ID: {member_id || 'N/A'}</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-light p-3 rounded-3 border">
                                            <span className="text-muted small d-block text-uppercase fw-semibold">Account Information</span>
                                            <strong className="text-primary fs-5 d-block">{account_number}</strong>
                                            <small className="badge bg-info">{service_type || 'SAVING'}</small>
                                        </div>
                                    </div>
                                </div>

                                <table className="table table-bordered align-middle mb-3">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Transaction Ref ID</th>
                                            <th>Previous Balance</th>
                                            <th>{amountLabel}</th>
                                            <th>Updated Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="fw-bold text-dark">{transaction_id || 'N/A'}</td>
                                            <td>{formattedBalBefore}</td>
                                            <td className={`fw-bold fs-5 ${amtColorClass}`}>{formattedAmount}</td>
                                            <td className="fw-bold text-primary fs-5">{formattedBalAfter}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {narration && (
                                    <div className="alert alert-light border py-2 mb-3 small">
                                        <strong>Remark:</strong> {narration}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-end pt-3 border-top mt-4">
                                    <div>
                                        <small className="text-muted d-block">Served By: <strong>{agent_name || 'Authorized Agent'}</strong></small>
                                        <small className="text-muted">Payment Mode: {isWithdrawal ? 'Member OTP Cash Withdrawal' : 'Utility Wallet'}</small>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-bottom pb-4 mb-1 px-4" style={{ minWidth: '160px' }}></div>
                                        <small className="text-muted fw-semibold">Authorized Signatory</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FORMAT 2: 1/4 A4 QUARTER PAGE RECEIPT */}
                        {format === 'A4_QUARTER' && (
                            <div className="border rounded-3 p-3 ms-0 me-auto bg-white" style={{ width: '100%', maxWidth: '340px', border: '1px solid #cbd5e1' }}>
                                <div className="text-center border-bottom pb-2 mb-2">
                                    <strong className={`text-uppercase d-block fs-6 ${isWithdrawal ? 'text-danger' : 'text-primary'}`}>
                                        {companyName} - {receiptTitle}
                                    </strong>
                                    <small className="text-muted font-monospace">{transaction_id}</small>
                                </div>

                                <div className="d-flex justify-content-between small py-1 border-bottom">
                                    <span className="text-muted">Date & Time:</span>
                                    <span className="fw-semibold">{formattedDate}</span>
                                </div>
                                <div className="d-flex justify-content-between small py-1 border-bottom">
                                    <span className="text-muted">Member Name:</span>
                                    <strong className="text-dark">{member_name}</strong>
                                </div>
                                <div className="d-flex justify-content-between small py-1 border-bottom">
                                    <span className="text-muted">Account No:</span>
                                    <strong className="text-primary">{account_number} ({service_type})</strong>
                                </div>
                                <div className="d-flex justify-content-between small py-1.5 px-2 my-1.5 rounded" style={{ backgroundColor: isWithdrawal ? '#fff5f5' : '#f0fdf4', border: `1px solid ${isWithdrawal ? '#fecdd3' : '#bbf7d0'}` }}>
                                    <strong style={{ color: isWithdrawal ? '#dc3545' : '#16a34a' }}>{amountUpperLabel}</strong>
                                    <strong className="fs-6" style={{ color: isWithdrawal ? '#dc3545' : '#16a34a' }}>{formattedAmount}</strong>
                                </div>
                                <div className="d-flex justify-content-between small py-1 border-bottom">
                                    <span className="text-muted">Updated Balance:</span>
                                    <strong className="text-dark">{formattedBalAfter}</strong>
                                </div>
                                <div className="d-flex justify-content-between small py-1">
                                    <span className="text-muted">Status:</span>
                                    <span className={`badge ${isWithdrawal ? 'bg-danger' : 'bg-success'}`}>SUCCESS</span>
                                </div>

                                <div className="text-center mt-2 pt-2 border-top">
                                    <small className="text-muted d-block" style={{ fontSize: '10px' }}>Thank you for banking with us!</small>
                                </div>
                            </div>
                        )}

                        {/* FORMAT 3: POS THERMAL BLUETOOTH POCKET PRINTER (MALL BILL STYLE) */}
                        {format === 'POS_THERMAL' && (
                            <div className="font-monospace mx-auto p-3 bg-light rounded border text-dark" style={{ maxWidth: '300px', fontSize: '12px' }}>
                                <div className="text-center fw-bold">
                                    <div className="fs-6">{companyName}</div>
                                    <div>{receiptTitle}</div>
                                    <div>=================================</div>
                                </div>

                                <div className="d-flex justify-content-between my-1">
                                    <span>Txn ID:</span>
                                    <span className="fw-bold">{transaction_id}</span>
                                </div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Date:</span>
                                    <span>{formattedDate}</span>
                                </div>
                                <div>---------------------------------</div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Member:</span>
                                    <span className="fw-bold">{member_name}</span>
                                </div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Account:</span>
                                    <span className="fw-bold">{account_number}</span>
                                </div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Scheme:</span>
                                    <span>{service_type}</span>
                                </div>
                                <div>---------------------------------</div>
                                <div className="d-flex justify-content-between my-2 fw-bold fs-6">
                                    <span>{amountUpperLabel}</span>
                                    <span>{formattedAmount}</span>
                                </div>
                                <div>---------------------------------</div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Prev Bal:</span>
                                    <span>{formattedBalBefore}</span>
                                </div>
                                <div className="d-flex justify-content-between my-1 fw-bold">
                                    <span>New Bal:</span>
                                    <span>{formattedBalAfter}</span>
                                </div>
                                <div className="d-flex justify-content-between my-1">
                                    <span>Status:</span>
                                    <span className={`fw-bold ${isWithdrawal ? 'text-danger' : 'text-success'}`}>[ SUCCESS ]</span>
                                </div>
                                <div className="text-center mt-3 pt-2 border-top">
                                    <div>=================================</div>
                                    <small className="d-block" style={{ fontSize: '10px' }}>Helpline: 01169266060</small>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Modal Footer Controls */}
                    <div className="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-between d-print-none">
                        <span className="text-muted small">
                            Format saved to Profile Preference ({format})
                        </span>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onClose}>
                                <i className="bx bx-x me-1"></i> Close
                            </button>
                            <button type="button" className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handlePrint}>
                                <i className="bx bx-printer me-1"></i> Print Receipt
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DepositReceiptModal;
