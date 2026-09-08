import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const RechargeInvoice = ({ invoiceData, show, onClose }) => {
    const invoiceRef = useRef();

    if (!invoiceData) return null;

    const {
        transaction = {},
        validation = {},
        rechargeDetails = {},
        operatorDetails = {},
        timestamp = new Date().toISOString()
    } = invoiceData;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        const originalContents = document.body.innerHTML;
        const printContents = printContent.innerHTML;

        document.body.innerHTML = `
            <html>
                <head>
                    <title>Mobile Recharge Invoice</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .invoice-container { max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { color: #007bff; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .details-section { flex: 1; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        .table th { background-color: #f8f9fa; font-weight: bold; }
                        .total-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                        .footer { text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; page-break-inside: avoid; }
                        .footer .row { display: flex; flex-wrap: wrap; justify-content: center; margin: 0; }
                        .footer .col-12 { padding: 2px 10px; }
                        .footer .d-block { display: inline !important; }
                        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                        .status-success { background-color: #d4edda; color: #155724; }
                        .text-success { color: #28a745; }
                        .text-primary { color: #007bff; }
                        .fw-bold { font-weight: bold; }
                        .mb-3 { margin-bottom: 1rem; }
                        .row { display: flex; flex-wrap: wrap; margin: -5px; }
                        .col { flex: 1; padding: 5px; }
                    </style>
                </head>
                <body>
                    ${printContents}
                </body>
            </html>
        `;

        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleDownloadPDF = async () => {
        try {
            const element = invoiceRef.current;

            // Show loading state
            const loadingToast = toast.loading('Generating PDF...');

            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `mobile-recharge-invoice-${transaction?.transaction_id || 'receipt'}.pdf`;
            pdf.save(fileName);

            // Update loading toast to success
            toast.update(loadingToast, {
                render: `PDF downloaded successfully: ${fileName}`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF. Please try again.');
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0 pb-2">
                        <h5 className="modal-title fw-bold text-success">
                            <i className="fas fa-receipt me-2"></i>
                            Recharge Invoice
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        <div ref={invoiceRef} className="invoice-container" style={{
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            fontFamily: 'Arial, sans-serif',
                            lineHeight: '1.5',
                            color: '#333'
                        }}>
                            {/* Header */}
                            <div className="header text-center border-bottom pb-4 mb-4" style={{ pageBreakAfter: 'avoid' }}>
                                <div className="logo text-primary fw-bold" style={{ fontSize: '28px' }}>
                                    <i className="fas fa-mobile-alt me-2"></i>
                                    Mobile Recharge Invoice
                                </div>
                                <p className="text-muted mb-0">Transaction Receipt</p>
                            </div>

                            {/* Invoice Details */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-primary mb-3">Transaction Details</h6>
                                    <p className="mb-2"><strong>Transaction ID:</strong> {transaction?.transaction_id || 'N/A'}</p>
                                    <p className="mb-2"><strong>Passbook ID:</strong> {transaction?.passbook_id || 'N/A'}</p>
                                    <p className="mb-2"><strong>Date & Time:</strong> {formatDate(timestamp)}</p>
                                    <p className="mb-2">
                                        <strong>Status:</strong>
                                        <span className="badge bg-success ms-2">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Successful
                                        </span>
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-primary mb-3">Account Details</h6>
                                    <p className="mb-2"><strong>Account Name:</strong> {validation?.account_name || 'N/A'}</p>
                                    <p className="mb-2"><strong>Account Number:</strong> {validation?.account_number || 'N/A'}</p>
                                    <p className="mb-2"><strong>Previous Balance:</strong> {formatCurrency(transaction?.previous_balance || 0)}</p>
                                    <p className="mb-2"><strong>New Balance:</strong> {formatCurrency(transaction?.new_balance || 0)}</p>
                                </div>
                            </div>

                            {/* Recharge Information */}
                            <div className="card border-0 bg-light mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="fas fa-mobile-alt me-2"></i>
                                        Recharge Information
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Mobile Number:</strong> {rechargeDetails?.number || 'N/A'}</p>
                                            <p className="mb-2"><strong>Operator:</strong> {operatorDetails?.operatorname || 'N/A'}</p>
                                            <p className="mb-2"><strong>Circle:</strong> {operatorDetails?.circalname || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Plan Type:</strong> {rechargeDetails?.planType || 'Standard'}</p>
                                            <p className="mb-2"><strong>Validity:</strong> {rechargeDetails?.validity || 'As per plan'}</p>
                                            <p className="mb-2"><strong>Plan Description:</strong> {rechargeDetails?.details || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Summary Table */}
                            <div className="table-responsive mb-4">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Mobile Recharge for {rechargeDetails?.number || 'N/A'}</td>
                                            <td>{formatCurrency(validation?.transaction_amount || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td>Service Charges</td>
                                            <td>{formatCurrency(0)}</td>
                                        </tr>
                                        <tr className="table-success">
                                            <td><strong>Total Amount</strong></td>
                                            <td><strong>{formatCurrency(validation?.transaction_amount || 0)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Summary */}
                            <div className="card border-primary mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-credit-card me-2"></i>
                                        Payment Summary
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Amount Debited:</strong> <span className="text-danger">{formatCurrency(validation?.transaction_amount || 0)}</span></p>
                                            <p className="mb-2"><strong>Previous Balance:</strong> {formatCurrency(transaction?.previous_balance || 0)}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-2"><strong>Remaining Balance:</strong> <span className="text-success">{formatCurrency(transaction?.new_balance || 0)}</span></p>
                                            <p className="mb-2"><strong>Transaction Date:</strong> {formatDate(validation?.validated_at || timestamp)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="alert alert-info mb-4">
                                <h6 className="fw-bold mb-3">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Important Notes:
                                </h6>
                                <ul className="mb-0 small">
                                    <li>Please save this invoice for your records</li>
                                    <li>Recharge will be processed within 5-10 minutes</li>
                                    <li>In case of any issues, contact customer support with Transaction ID</li>
                                    <li>This is a computer generated invoice and does not require physical signature</li>
                                </ul>
                            </div>

                            {/* Footer */}

                        </div>

                    </div>

                    <div className="modal-footer border-0 pt-0">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            <i className="fas fa-times me-2"></i>
                            Close
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handlePrint}>
                            <i className="fas fa-print me-2"></i>
                            Print Invoice
                        </button>
                        <button type="button" className="btn btn-success" onClick={handleDownloadPDF}>
                            <i className="fas fa-download me-2"></i>
                            Download PDF
                        </button>


                    </div>


                </div>
            </div>
        </div>
    );
};

export default RechargeInvoice;
