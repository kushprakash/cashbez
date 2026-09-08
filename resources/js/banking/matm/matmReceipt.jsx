
import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import axios from "axios";


const PrintAepsReceipt = (props) => {
    // Accept state as prop for modal usage, fallback to useLocation for route usage
    let location = useLocation();
    let state = props.state !== undefined ? props.state : location.state;
    const [logo, setLogo] = useState('');
    const navigate = useNavigate();
    const ref = useRef(null);
    let tx = state;
    // If tx is an array, try to use the first element, else null
    if (Array.isArray(tx)) {
        tx = tx.length > 0 ? tx[0] : null;
    }
    // Only access transactionType if tx is a non-null object
    const AepsType = (tx && typeof tx === 'object' && 'transactionType' in tx) ? tx.transactionType : "BAL"; // CW | BAL | MS | M
    const [isPrinting, setIsPrinting] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {

                const res = await axios.get('/api/getLogo');
                if (res && res.data && res.data.status === 1 && res.data.logo) {
                    setLogo(res.data);
                }
            } catch (e) {
                // final fallback: leave logo empty
                console.error("Error fetching logo:", e);
            }
        };
        fetchLogo();
    }, [location]);

  

    /* ---------- helpers ---------- */
    const printable = async () => {
        setIsPrinting(true);
        try {
            const w = window.open("", "", "width=900,height=650");
            w.document.write("<html><head><title>AEPS Transaction Receipt</title>");
            // clone current styles
            [...document.querySelectorAll("style,link[rel=stylesheet]")]
                .forEach(tag => w.document.write(tag.outerHTML));
            w.document.write("</head><body>");
            w.document.write(ref.current.outerHTML);
            w.document.write("</body></html>");
            w.document.close();
            w.focus();

            // Small delay to ensure rendering
            setTimeout(() => {
                w.print();
                setIsPrinting(false);
            }, 500);
        } catch (error) {
            console.error("Print error:", error);
            setIsPrinting(false);
        }
    };

    const pdf = async () => {
        setIsPdfGenerating(true);
        try {
            await html2pdf()
                .set({
                    margin: 0.5,
                    filename: `AEPS-Receipt-${tx.fpTransactionId || 'Transaction'}.pdf`,
                    html2canvas: { scale: 2, logging: false },
                    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                })
                .from(ref.current)
                .save();
        } catch (error) {
            console.error("PDF generation error:", error);
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const shareReceipt = async () => {
        if (navigator.share) {
            try {
                // Generate PDF blob for sharing
                const pdfBlob = await html2pdf()
                    .set({
                        margin: 0.5,
                        filename: `AEPS-Receipt-${tx.fpTransactionId}.pdf`,
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                        output: 'blob'
                    })
                    .from(ref.current)
                    .output('blob');

                const file = new File(
                    [pdfBlob],
                    `AEPS-Receipt-${tx.fpTransactionId}.pdf`,
                    { type: 'application/pdf' }
                );

                await navigator.share({
                    title: 'AEPS Transaction Receipt',
                    text: `AEPS ${tx.transactionType} Receipt of ₹${Number(tx.transactionAmount || 0).toFixed(2)}`,
                    files: [file]
                });
            } catch (error) {
                console.error('Share failed:', error);
            }
        }
    };

    // Determine transaction status for styling
    const getStatusVariant = () => {
        const status = tx.transactionStatus?.toLowerCase();
        if (status === 'success' || status === 'successful')
            return 'success';
        if (status === 'failed' || status === 'failure')
            return 'danger';
        if (status === 'pending')
            return 'warning';
        return 'info';
    };

    // Check if this is a Balance Enquiry transaction
    const isBalanceEnquiry = tx.transactionType === "BAL" || AepsType === "BAL";

    console.log("Transaction Data:", tx); // Debugging
    /* ---------- UI ---------- */
    return (
        <div>

            <div className="main-container container-fluid">
                <div className="d-flex justify-content-center gap-2 mb-4">
                    <button
                        className="btn btn-primary d-flex align-items-center"
                        onClick={printable}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Printing...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-print me-2"></i> Print
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-outline-primary d-flex align-items-center"
                        onClick={pdf}
                        disabled={isPdfGenerating}
                    >
                        {isPdfGenerating ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-file-pdf-o me-2"></i> Save PDF
                            </>
                        )}
                    </button>

                </div>
                <div className="inner-body">
                    
                    <div className={`py-2 ${tx.transactionType === "MS" || AepsType === "MS" ? 'container-fluid' : 'container'}`}>
                        <div className="row justify-content-center">
                            <div className={`col-12 ${tx.transactionType === "MS" || AepsType === "MS" ? 'col-md-12 col-lg-12' : 'col-md-12 col-lg-12'}`}>
                                {/* RECEIPT */}
                                <div className="card shadow-sm mb-2 receipt-card" ref={ref}>
                                  

                                    <div className="card-body p-2">
                                        <div className="row mb-2 text-center">
                                           
                                            <div className="col">
                                                {/* Status Badge */}
                                                <span
                                                    className={`badge rounded-pill ${tx.errorCode === "00" ? "bg-success" : tx.errorCode === "55" ? "bg-warning" : "bg-danger"} px-3 py-1 mb-2 small`}
                                                >
                                                    {tx.errorMessage}
                                                </span>

                                                {/* Show amount for non-Mini Statement and non-Balance Enquiry transactions */}
                                                {(tx.transactionType !== "MS" && AepsType !== "MS" && !isBalanceEnquiry) && (
                                                    <>
                                                        <div className="text-muted small">Transaction Amount</div>
                                                        <div className="fs-4 fw-bold">₹{Number(tx.transactionAmount).toFixed(2)}</div>
                                                    </>
                                                )}

                                                {/* Show only balance for Balance Enquiry transactions */}
                                                {isBalanceEnquiry && (
                                                    <>
                                                        <div className="text-muted small">Available Balance</div>
                                                        <div className="fs-4 fw-bold">₹{Number(tx.balanceAmount).toFixed(2)}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mini Statement - Two Column Layout */}
                                        {(tx.transactionType === "MS" || AepsType === "MS") && (
                                            <div className="row">
                                                {/* Left Column - Basic Info */}
                                                <div className="col-lg-5 mb-4">
                                                    <div className="row text-center mb-4">
                                                        <div className="col">
                                                            <div className="text-muted">Available Balance</div>
                                                            <div className="fs-2 fw-bold">₹{Number(tx.miniStatementBalance || tx.balanceAmount).toFixed(2)}</div>
                                                        </div>
                                                    </div>

                                                    <table className="table table-bordered table-hover transaction-details">
                                                        <tbody>
                                                            <tr>
                                                                <td className="fw-medium">Transaction Type</td>
                                                                <td>Mini Statement</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-medium">Terminal ID</td>
                                                                <td>{tx.terminalId}</td>
                                                            </tr>

                                                            <tr>
                                                                <td className="fw-medium">Transaction ID</td>
                                                                <td>{tx.fpTransactionId}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-medium">Bank RRN</td>
                                                                <td>{tx.bankRRN}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-medium">Response Code</td>
                                                                <td>{tx.errorCode}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="fw-medium">Message</td>
                                                                <td>{tx.errorMessage}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Right Column - Transaction History */}
                                                <div className="col-lg-7">
                                                    {tx.miniStatementStructureModel && tx.miniStatementStructureModel.length > 0 && (
                                                        <>
                                                            <h5 className="mb-3">Transaction History</h5>
                                                            <table className="table table-bordered table-hover mini-statement">
                                                                <thead>
                                                                    <tr className="bg-light">
                                                                        <th>Date</th>
                                                                        <th>Type</th>
                                                                        <th>Amount (₹)</th>
                                                                        <th>Description</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {tx.miniStatementStructureModel.map((statement, index) => (
                                                                        <tr key={index}>
                                                                            <td>{statement.date}</td>
                                                                            <td>
                                                                                <span className={`badge ${statement.txnType === 'Cr' ? 'bg-success' : 'bg-danger'}`}>
                                                                                    {statement.txnType}
                                                                                </span>
                                                                            </td>
                                                                            <td className="text-end">{Number(statement.amount).toFixed(2)}</td>
                                                                            <td>{statement.narration}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Other Transaction Types */}
                                        {(tx.transactionType !== "MS" && AepsType !== "MS") && (
                                            <>

                                                <table className="table table-bordered table-hover transaction-details mt-3">
                                                    <tbody>
                                                        <tr>
                                                            <td className="fw-medium">Transaction Type</td>
                                                            <td>{tx.transactionType === "WDLS" ? "Cash Withdrawal" : tx.transactionType}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Terminal ID</td>
                                                            <td>{tx.terminalId}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Card No</td>
                                                            <td>{tx.cardNumber}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Transaction ID</td>
                                                            <td>{tx.fpTransactionId}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Bank RRN</td>
                                                            <td>{tx.bankRRN}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Available Balance</td>
                                                            <td className="fw-medium">₹{Number(tx.balanceAmount).toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-medium">Transaction Status</td>
                                                            <td>{tx.errorMessage}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </>
                                        )}
                                    </div>

                                    <div className="card-footer bg-white py-2 border-top px-3 small">

                                        <div className="fw-bold text-center">
                                            Powered by {logo.name}
                                        </div>
                                    </div>
                                </div>


                           
                            </div>
                        </div>

                        {/* Custom styling that will be included in print */}
                        <style jsx="true">{`
                .receipt-card {
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    max-width: 400px;
                    margin: 0 auto;
                    font-size: 0.85rem;
                }
                
                .transaction-details td {
                    padding: 6px 10px;
                }
                
                .transaction-details tr:nth-child(odd) {
                    background-color: rgba(0,0,0,0.02);
                }

                .mini-statement thead th {
                    font-weight: 600;
                    font-size: 0.8rem;
                }

                .mini-statement td {
                    padding: 5px 8px;
                    font-size: 0.8rem;
                }
                
                @media print {
                    body {
                        padding: 0;
                        margin: 0;
                    }
                    .receipt-card {
                        box-shadow: none !important;
                        border: 1px solid #ddd;
                        max-width: 100%;
                        width: 80mm;
                        font-size: 11px;
                    }
                    .card-header {
                        padding: 8px !important;
                    }
                    .card-body {
                        padding: 8px !important;
                    }
                    .card-footer {
                        padding: 6px !important;
                        font-size: 10px;
                    }
                    .transaction-details td {
                        padding: 4px 8px;
                        font-size: 11px;
                    }
                    .mini-statement td, .mini-statement th {
                        padding: 3px 6px;
                        font-size: 10px;
                    }
                    h5 {
                        font-size: 14px !important;
                    }
                    .fs-4 {
                        font-size: 18px !important;
                    }
                }
            `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintAepsReceipt;