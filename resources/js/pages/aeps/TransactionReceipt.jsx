import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const TransactionReceipt = ({ data }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();

  const sourceData = data || location.state || {};
  const {
    transactionData,
    transactionType,
    aadhaarNumber,
    bankName,
    bankIin,
    customerMobile,
    logo,
    message,
    agentName,
    agentMobile,
    merchantName,
    retailerLocation,
    commission,
    charges,
    amount,
    rrn,
    status,
    createdAt
  } = sourceData;

  const isDrawer = !!data;

  if (!transactionData && !amount && !rrn) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">No transaction data available</div>
      </div>
    );
  }

  // Extract data from the nested API response structure
  let responseData;
  if (transactionData && transactionData.data && transactionData.data.data) {
    responseData = transactionData.data.data;
  } else if (transactionData && transactionData.data) {
    responseData = transactionData.data;
  } else if (transactionData) {
    responseData = transactionData;
  } else {
    responseData = {};
  }

  const txnMessage = message || responseData.message || responseData.errorMessage || responseData.response_message || null;
  const isSuccess = status === 1 || status === true || responseData.transactionStatus === 'successful' || responseData.status === 'SUCCESS' || responseData.status === 1;

  const getTransactionTypeName = (type) => {
    switch (type) {
      case 'CW': return 'Cash Withdrawal';
      case 'MS': return 'Mini Statement';
      case 'BE': return 'Balance Enquiry';
      case 'AP':
      case 'M': return 'Aadhaar Pay';
      default: return type || 'AEPS Transaction';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === 'N/A') {
      if (createdAt) return new Date(createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      return new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return dateTimeString;
    const [day, month, year] = datePart.split('/');
    const date = new Date(`${year}-${month}-${day} ${timePart}`);
    if (isNaN(date.getTime())) return dateTimeString;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    if (amount === 'N/A' || isNaN(parseFloat(amount))) return 'N/A';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return 'N/A';
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3');
  };

  const handleDoAnotherAction = (targetMode) => {
    navigate('/aeps', {
      state: {
        mode: targetMode,
        aadhaarNumber: aadhaarNumber || responseData?.aadhaarNumber || responseData?.aadhaar_number,
        customerMobile: customerMobile || responseData?.customerMobile || responseData?.mobile,
        bankIin: bankIin || responseData?.bankIin || responseData?.bankIIN,
        bankName: bankName || responseData?.bankName || responseData?.issuerBank
      }
    });
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const element = receiptRef.current;
    const transactionId = responseData.fpTransactionId || responseData.merchantTxnId || responseData.merchantTransactionId || Date.now();
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `AEPS-Receipt-${transactionId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true }
    };
    setTimeout(() => html2pdf().set(opt).from(element).save(), 100);
  };

  const handleLedgerPrint = () => {
    const printContent = `
      <html>
        <head>
          <title>AEPS Transaction Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-weight: bold; font-size: 12px; width: 300px; margin: 0 auto; color: #000; padding: 10px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .merchant { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .retailer { font-size: 13px; font-weight: bold; margin-top: 3px; }
            .location { font-size: 11px; font-weight: normal; margin-top: 2px; }
            .title { font-size: 13px; font-weight: bold; margin-top: 6px; text-decoration: underline; }
            .section { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .label { font-weight: bold; margin-right: 10px; }
            .value { text-align: right; word-break: break-all; }
            .status-success { font-weight: bold; color: #000; }
            .status-failed { font-weight: bold; color: #000; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #000; }
            table { width: 100%; font-size: 10px; margin-top: 8px; text-align: left; }
            th { border-bottom: 1px dashed #000; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="merchant">${merchantName || 'CASHBEZ BANKING'}</div>
            <div class="retailer">${agentName || 'Retailer Outlet'}</div>
            ${agentMobile ? `<div class="location">Mob: ${agentMobile}</div>` : ''}
            ${retailerLocation ? `<div class="location">Location: ${retailerLocation}</div>` : ''}
            <div class="title">AEPS TRANSACTION RECEIPT</div>
          </div>

          <div class="section">
            <div class="row">
              <span class="label">Status:</span>
              <span class="value ${isSuccess ? 'status-success' : 'status-failed'}">${isSuccess ? 'SUCCESS' : 'FAILED'}</span>
            </div>
            ${txnMessage ? `<div class="row"><span class="label">Message:</span><span class="value">${txnMessage}</span></div>` : ''}
            <div class="row">
              <span class="label">Amount:</span>
              <span class="value">${formatCurrency(amount || responseData.transactionAmount || responseData.balanceAmount || responseData.miniStatementBalance)}</span>
            </div>
            ${commission ? `<div class="row"><span class="label">Commission:</span><span class="value">${formatCurrency(commission)}</span></div>` : ''}
            ${charges ? `<div class="row"><span class="label">Charges:</span><span class="value">${formatCurrency(charges)}</span></div>` : ''}
          </div>

          <div class="section">
            <div class="row"><span class="label">Txn ID:</span><span class="value">${responseData.fpTransactionId || responseData.merchantTxnId || rrn || 'N/A'}</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="value">${formatDateTime(responseData.requestTransactionTime)}</span></div>
            <div class="row"><span class="label">Txn Type:</span><span class="value">${getTransactionTypeName(responseData.transactionType || transactionType)}</span></div>
            ${customerMobile ? `<div class="row"><span class="label">Customer Mob:</span><span class="value">${customerMobile}</span></div>` : ''}
            ${aadhaarNumber ? `<div class="row"><span class="label">Aadhaar:</span><span class="value">${maskAadhaar(aadhaarNumber)}</span></div>` : ''}
            <div class="row"><span class="label">Bank Name:</span><span class="value">${bankName || responseData.bankName || responseData.issuerBank || 'N/A'}</span></div>
            ${responseData.balanceAmount ? `<div class="row"><span class="label">Bank Bal:</span><span class="value">${formatCurrency(responseData.balanceAmount)}</span></div>` : ''}
            ${(responseData.bankRRN || rrn) ? `<div class="row"><span class="label">Bank RRN:</span><span class="value">${responseData.bankRRN || rrn}</span></div>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for using our banking service.</p>
            <p>Helpline: 01169266060</p>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '520px',
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden'
    },
    header: {
      padding: '24px 24px 20px',
      textAlign: 'center',
      borderBottom: '1px solid #f0f0f0'
    },
    logo: {
      height: '36px',
      marginBottom: '16px'
    },
    statusIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px',
      background: isSuccess ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    statusTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: isSuccess ? '#059669' : '#dc2626',
      margin: '0 0 4px',
      letterSpacing: '-0.01em'
    },
    errorMessage: {
      fontSize: '13px',
      color: '#6b7280',
      margin: '8px 0 0',
      lineHeight: '1.4'
    },
    amount: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827',
      margin: '16px 0 0',
      letterSpacing: '-0.02em'
    },
    body: {
      padding: '20px 24px'
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '10px 0',
      borderBottom: '1px solid #f5f5f5'
    },
    rowLast: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '10px 0'
    },
    label: {
      fontSize: '13px',
      color: '#6b7280',
      fontWeight: '400'
    },
    value: {
      fontSize: '13px',
      color: '#111827',
      fontWeight: '500',
      textAlign: 'right',
      maxWidth: '60%',
      wordBreak: 'break-all'
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
      margin: '4px 0'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '12px'
    },
    miniStatementTable: {
      width: '100%',
      fontSize: '12px',
      borderCollapse: 'collapse'
    },
    miniStatementHeader: {
      background: '#f9fafb',
      padding: '8px 10px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    },
    miniStatementCell: {
      padding: '10px',
      borderBottom: '1px solid #f3f4f6',
      color: '#374151'
    },
    badge: {
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    badgeDr: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    badgeCr: {
      background: '#ecfdf5',
      color: '#059669'
    },
    footer: {
      background: '#fafafa',
      padding: '16px 24px',
      borderTop: '1px solid #f0f0f0'
    },
    footerText: {
      fontSize: '11px',
      color: '#9ca3af',
      lineHeight: '1.6',
      margin: 0
    },
    actionBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff'
    },
    btnInfo: {
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: '#fff'
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff'
    },
    btnSecondary: {
      background: '#f3f4f6',
      color: '#374151'
    }
  };

  return (
    <div className="py-3 transaction-receipt">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .transaction-receipt, .transaction-receipt * {
            visibility: visible;
          }
          .transaction-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>
      <div className="text-end mb-3 d-print-none" style={styles.container}>
        {!isDrawer && (
          <button style={{ ...styles.actionBtn, ...styles.btnSecondary }} className="me-2" onClick={() => navigate(-1)}>
            <i className="fa fa-arrow-left"></i> Back
          </button>
        )}
        <button style={{ ...styles.actionBtn, ...styles.btnInfo }} className="me-2" onClick={handleLedgerPrint}>
          <i className="fa fa-print"></i> Thermal Print
        </button>
        <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} className="me-2" onClick={handlePrint}>
          <i className="fa fa-print"></i> Print
        </button>
        <button style={{ ...styles.actionBtn, ...styles.btnSuccess }} onClick={handleDownloadPDF}>
          <i className="fa fa-download"></i> PDF
        </button>
      </div>

      <div style={styles.container} ref={receiptRef}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            {logo && <img src={logo} alt="Logo" style={styles.logo} />}
            <div className="text-uppercase fw-bold text-primary mb-1" style={{ fontSize: '13px', letterSpacing: '0.05em' }}>
              {merchantName || 'Banking Services'}
            </div>

            <div className="border rounded-3 p-2 bg-light mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{agentName || 'Retailer Outlet'}</span>
                <span className="badge bg-secondary">{agentMobile || 'Authorized Agent'}</span>
              </div>
              {retailerLocation && (
                <div className="text-start text-muted mt-1" style={{ fontSize: '11.5px' }}>
                  <i className="fa fa-map-marker-alt me-1 text-danger"></i> Location: {retailerLocation}
                </div>
              )}
            </div>

            <div style={styles.statusIcon}>
              {isSuccess ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <h2 style={styles.statusTitle}>{isSuccess ? 'Transaction Successful' : 'Transaction Failed'}</h2>
            {txnMessage && <p style={styles.errorMessage}>{txnMessage}</p>}

            <div style={styles.amount}>
              {formatCurrency(amount || responseData.transactionAmount || responseData.balanceAmount || responseData.miniStatementBalance)}
            </div>
          </div>

          {/* Transaction Details */}
          <div style={styles.body}>
            <div style={styles.row}>
              <span style={styles.label}>Transaction ID</span>
              <span style={styles.value}>{responseData.fpTransactionId || responseData.merchantTxnId || rrn || 'N/A'}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Transaction Type</span>
              <span style={styles.value}>{getTransactionTypeName(responseData.transactionType || transactionType)}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Date &amp; Time</span>
              <span style={styles.value}>{formatDateTime(responseData.requestTransactionTime)}</span>
            </div>
            {responseData.customerName && responseData.customerName !== 'N/A' && (
              <div style={styles.row}>
                <span style={styles.label}>Customer Name</span>
                <span style={styles.value}>{responseData.customerName}</span>
              </div>
            )}
            {customerMobile && (
              <div style={styles.row}>
                <span style={styles.label}>Customer Mobile</span>
                <span style={styles.value}>{customerMobile}</span>
              </div>
            )}
            {aadhaarNumber && (
              <div style={styles.row}>
                <span style={styles.label}>Aadhaar Number</span>
                <span style={styles.value}>{maskAadhaar(aadhaarNumber)}</span>
              </div>
            )}
            <div style={styles.row}>
              <span style={styles.label}>Bank Name</span>
              <span style={styles.value}>{bankName || responseData.bankName || responseData.issuerBank || 'N/A'}</span>
            </div>
            {responseData?.balanceAmount ? (
              <div style={styles.row}>
                <span style={styles.label}>Account Balance</span>
                <span style={styles.value}>{formatCurrency(responseData.balanceAmount)}</span>
              </div>
            ) : null}
            {(responseData.bankRRN || rrn) && (
              <div style={styles.row}>
                <span style={styles.label}>Bank RRN</span>
                <span style={styles.value}>{responseData.bankRRN || rrn}</span>
              </div>
            )}
            {commission ? (
              <div style={styles.row}>
                <span style={styles.label}>Commission Earned</span>
                <span style={{ ...styles.value, color: '#10b981', fontWeight: 'bold' }}>{formatCurrency(commission)}</span>
              </div>
            ) : null}
            {charges ? (
              <div style={styles.row}>
                <span style={styles.label}>Service Charges</span>
                <span style={{ ...styles.value, color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(charges)}</span>
              </div>
            ) : null}
            {responseData.stan && responseData.stan !== 'N/A' && (
              <div style={styles.rowLast}>
                <span style={styles.label}>STAN</span>
                <span style={styles.value}>{responseData.stan}</span>
              </div>
            )}
          </div>

          {/* Mini Statement Section */}
          {responseData.transactionType === 'MS' && responseData.miniStatementStructureModel && responseData.miniStatementStructureModel.length > 0 && (
            <div style={{ ...styles.body, paddingTop: 0 }}>
              <div style={styles.divider}></div>
              <h4 style={{ ...styles.sectionTitle, marginTop: '16px' }}>Mini Statement</h4>
              <table style={styles.miniStatementTable}>
                <thead>
                  <tr>
                    <th style={styles.miniStatementHeader}>Date</th>
                    <th style={styles.miniStatementHeader}>Type</th>
                    <th style={{ ...styles.miniStatementHeader, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.miniStatementStructureModel.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.miniStatementCell}>{item.date}</td>
                      <td style={styles.miniStatementCell}>
                        <span style={{ ...styles.badge, ...(item.txnType === 'Dr' ? styles.badgeDr : styles.badgeCr) }}>
                          {item.txnType === 'Dr' ? 'Debit' : 'Credit'}
                        </span>
                      </td>
                      <td style={{ ...styles.miniStatementCell, textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan="2" style={{ ...styles.miniStatementCell, fontWeight: '600', color: '#059669' }}>Balance</td>
                    <td style={{ ...styles.miniStatementCell, textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(responseData.balanceAmount || responseData.miniStatementBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Footer Instructions */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              • Always collect system-generated receipt<br />
              • Check SMS alert for each transaction<br />
              • Merchant Portal: {merchantName || 'Banking Service'}<br />
              • Helpline: 01169266060
            </p>
          </div>
        </div>

        {/* Do another action using same Aadhaar & Bank section */}
        <div className="mt-3 text-start d-print-none" style={{ maxWidth: '480px', margin: '16px auto 0' }}>
          <p className="text-muted small fw-semibold mb-2" style={{ fontSize: '13px', color: '#6b7280' }}>
            Do another action using same Aadhaar &amp; Bank:
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 flex-fill shadow-sm"
              style={{ fontSize: '13px', borderColor: '#e5e7eb', color: '#374151', backgroundColor: '#ffffff', fontWeight: '500' }}
              onClick={() => handleDoAnotherAction('BE')}
            >
              Balance Enquiry
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 flex-fill shadow-sm"
              style={{ fontSize: '13px', borderColor: '#e5e7eb', color: '#374151', backgroundColor: '#ffffff', fontWeight: '500' }}
              onClick={() => handleDoAnotherAction('MS')}
            >
              Mini Statement
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 flex-fill shadow-sm"
              style={{ fontSize: '13px', borderColor: '#e5e7eb', color: '#374151', backgroundColor: '#ffffff', fontWeight: '500' }}
              onClick={() => handleDoAnotherAction('CW')}
            >
              Cash Withdrawal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
