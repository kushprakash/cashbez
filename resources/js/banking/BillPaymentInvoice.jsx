import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';
import Pageheader from '../layouts/Pageheader';
import BbpsTopNav from './BbpsTopNav';

const BillPaymentInvoice = ({ invoiceData: propInvoiceData, hideNav = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const invoiceRef = useRef();

    // Use passed prop if present, else read location.state
    const invoiceData = propInvoiceData || location.state || {};

    const {
        transaction = {},
        validation = {},
        billDetails = {},
        billerDetails = {},
        customerDetails = {},
        timestamp,
        paymentMode = 'UPI'
    } = invoiceData;

    const customerName = billDetails?.customerName || validation?.account_name || 'DR VASUSINGH S LULLA';
    const billerName = billerDetails?.name || 'B.E.S.T Mumbai';
    const refId = transaction?.ref_id || transaction?.transaction_id || `MockntCK1U1sw2`;
    const txnId = transaction?.txnid || `MockoxS9liY3Ls`;
    const consumerId = customerDetails?.customer_id || billDetails?.billNumber || '5933010294';
    const mobileNumber = customerDetails?.mobile_number || '9954490941';
    const billDate = billDetails?.billDate || '26-Mar-2024';
    const billAmount = transaction?.amount || billDetails?.dueAmount || billDetails?.amount || 50;
    const fee = 0;
    const totalAmount = billAmount;
    const paymentChannel = 'INT';
    const billNumber = billDetails?.billNumber || '-';
    const paymentDateTime = timestamp ? new Date(timestamp).toLocaleString('en-GB') : new Date().toISOString().replace('T', ' ').substring(0, 19);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        try {
            toast.info('Generating PDF... Please wait');
            const element = invoiceRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`Bill-Payment-Receipt-${refId}.pdf`);
            toast.success('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <>


            <div className={`page-content-box bg-transparent border-0 p-0 shadow-none ${hideNav ? 'mt-0 pt-0' : 'mt-0 pt-0'}`}>
                {!hideNav && <BbpsTopNav activeTab="history" />}
                <div className="row justify-content-start">
                    <div className="col-lg-6 col-md-8 col-sm-12" style={{ maxWidth: '580px' }}>
                        {/* Bill Receipt Card */}
                        <div ref={invoiceRef} className="card border border-light-subtle shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                            {/* Header */}
                            <div className="p-2 border-bottom d-flex justify-content-between align-items-center bg-white">
                                <h5 className="fw-semibold mb-0 ml-4" style={{ color: '#65a30d', fontSize: '1.2rem' }}>
                                    &nbsp;&nbsp;&nbsp;&nbsp; Payment Successful
                                </h5>
                                <div className="d-flex align-items-center">
                                    <img
                                        src="/assets/bbps-icon.png"
                                        alt="BBPS"
                                        style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain' }}
                                    />
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    {/* Row 1 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Customer Name</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{customerName}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Biller Name</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{billerName}</p>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Ref ID</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{refId}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Bharat Connect Txn ID</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{txnId}</p>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Consumer ID</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{consumerId}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Mobile Number</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{mobileNumber}</p>
                                    </div>

                                    {/* Row 4 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Bill Date</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{billDate}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Bill Amount</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>₹{billAmount}</p>
                                    </div>

                                    {/* Row 5 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Customer Convenience Fee</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>₹{fee}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Total Paid Amount</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>₹{totalAmount}</p>
                                    </div>

                                    {/* Row 6 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Payment Mode</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{paymentMode}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Payment Channel</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{paymentChannel}</p>
                                    </div>

                                    {/* Row 7 */}
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Bill Number</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{billNumber}</p>
                                    </div>
                                    <div className="col-md-6 col-6">
                                        <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.9rem' }}>Date/Time of Bill Payment</label>
                                        <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.9rem' }}>{paymentDateTime}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-3 px-4 bg-white border-top d-flex justify-content-between align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                                    onClick={() => navigate('/banking/bill/payment-report')}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem' }}
                                >
                                    ← Back to History
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                                    onClick={handleDownloadPDF}
                                    style={{ borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                                >
                                    <iconify-icon icon="material-symbols:print" width="20" height="20"></iconify-icon>
                                    EXPORT TO PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillPaymentInvoice;
