import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const BillPaymentInvoiceModal = ({ invoiceData, show, onClose }) => {
    const invoiceRef = useRef();

    if (!invoiceData || !show) return null;

    const {
        transaction = {},
        validation = {},
        billDetails = {},
        billerDetails = {},
        customerDetails = {},
        timestamp,
        user = {},
        operator,
        amount,
        consumer_number,
        status
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
                    <title>Bill Payment Invoice</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .invoice-container { max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
                        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .amount-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
                        .total-amount { font-size: 1.2em; font-weight: bold; color: #28a745; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
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
            toast.info('Generating PDF... Please wait');
            
            const element = invoiceRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 190;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `bill-payment-invoice-${transaction.transaction_id || 'unknown'}.pdf`;
            pdf.save(fileName);
            toast.success('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <>
            {/* Modal */}
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="fas fa-file-invoice me-2"></i>
                                Bill Payment Invoice
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div ref={invoiceRef} className="invoice-container">
                                {/* Header */}
                                <div className="header text-center mb-4">
                                    <h2 className="text-primary mb-1">BILL PAYMENT INVOICE</h2>
                                    <p className="text-muted mb-0">Payment Receipt</p>
                                </div>

                                {/* Invoice Details */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-primary mb-3">Transaction Details</h6>
                                        <p className="mb-2"><strong>Transaction ID:</strong> {transaction.transaction_id || 'N/A'}</p>
                                        <p className="mb-2"><strong>Status:</strong> 
                                            <span className="badge bg-success ms-2">
                                                <i className="fas fa-check-circle me-1"></i>
                                                {status || transaction.status || 'Successful'}
                                            </span>
                                        </p>
                                        <p className="mb-2"><strong>Date & Time:</strong> {formatDate(timestamp || transaction.created_at)}</p>
                                        <p className="mb-2"><strong>User:</strong> {user.name || validation.account_name || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-primary mb-3">Bill Information</h6>
                                        <p className="mb-2"><strong>Consumer Number:</strong> {consumer_number || customerDetails.customer_id || billDetails.consumer_number || 'N/A'}</p>
                                        <p className="mb-2"><strong>Service Provider:</strong> {operator || billerDetails.name || 'N/A'}</p>
                                        <p className="mb-2"><strong>Bill Type:</strong> {billDetails.type || 'Bill Payment'}</p>
                                        <p className="mb-2"><strong>Customer Name:</strong> {billDetails.customerName || user.name || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Amount Summary */}
                                <div className="amount-summary">
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="fas fa-calculator me-2"></i>
                                        Payment Summary
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span>Bill Amount:</span>
                                                <span className="fw-bold">{formatCurrency(amount || billDetails.amount || transaction.amount || 0)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span>Transaction Fee:</span>
                                                <span className="fw-bold">₹0.00</span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <strong className="h6 mb-0">Total Amount Paid:</strong>
                                                <strong className="h6 mb-0 text-success total-amount">
                                                    {formatCurrency(amount || transaction.amount || 0)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                {(billDetails.dueDate || billDetails.refId) && (
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <h6 className="fw-bold text-primary mb-3">Additional Information</h6>
                                            {billDetails.dueDate && (
                                                <p className="mb-2"><strong>Due Date:</strong> {billDetails.dueDate}</p>
                                            )}
                                            {billDetails.refId && (
                                                <p className="mb-2"><strong>Reference ID:</strong> {billDetails.refId}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="text-center mt-5 pt-4 border-top">
                                    <p className="text-muted mb-2">
                                        <small>This is a computer-generated receipt and does not require a signature.</small>
                                    </p>
                                    <p className="text-muted mb-0">
                                        <small>Generated on: {formatDate(new Date())}</small>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                <i className="fas fa-times me-1"></i>
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handlePrint}>
                                <i className="fas fa-print me-1"></i>
                                Print
                            </button>
                            <button type="button" className="btn btn-success" onClick={handleDownloadPDF}>
                                <i className="fas fa-download me-1"></i>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillPaymentInvoiceModal;
