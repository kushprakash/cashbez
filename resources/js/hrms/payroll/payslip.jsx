import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import Pageheader from '../../layouts/Pageheader';

const PayslipDownload = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);

  const apiService = ApiService();

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  const handlePrint = () => {
    window.print();
  };

  const formatEarningsDeductions = (data) => {
    if (!data || typeof data !== 'object') return null;
    
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="d-flex justify-content-between border-bottom py-1">
        <span className="text-capitalize">{(key || '').replace('_', ' ')}:</span>
        <span className="fw-bold">{formatCurrency(value)}</span>
      </div>
    ));
  };

  useEffect(() => {
    fetchPayslip();
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const res = await apiService.vGet('/api/public-settings', true, true);
      if (res.data && res.data.status === 1) {
        setCompanySettings(res.data.setting);
      } else {
        console.error('Company settings fetch error:', res.data);
      }
    } catch (err) {
      console.error('Company Settings API Error:', err);
    }
  };

  const fetchPayslip = async () => {
    setLoading(true);
    try {
      const res = await apiService.vGet(`/api/payslip/view/${id}`, true, true);
      if (res.data && res.data.status === 1) {
        setPayslip(res.data.data);
      } else {
        const errorMessage = res.data?.message || 'Failed to fetch payslip';
        toast.error(errorMessage);
        console.error('Payslip fetch error:', res.data);
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.status === 404) {
        toast.error(`Payslip with ID ${id} not found`);
      } else {
        toast.error('Failed to fetch payslip');
      }
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await apiService.vGet(`/api/payslip/download/${id}`, true, true, { responseType: 'blob' });
      if (res.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payslip_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('Payslip downloaded');
      } else {
        toast.error('Failed to download payslip');
      }
    } catch (err) {
      console.error('Download Error:', err);
      if (err.response?.status === 404) {
        toast.error(`Payslip with ID ${id} not found`);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to download payslip');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <style jsx>{`
        @media print {
          .no-print { 
            display: none !important; 
          }
          .page-content-box,
          .card,
          .card-body {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .card-header {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
            font-size: 12px;
          }
          .row {
            margin: 0 !important;
          }
          .col-md-6,
          .col-md-8 {
            padding: 0 !important;
          }
          .bg-light,
          .border-success,
          .border-danger,
          .border-primary {
            border: 1px solid #000 !important;
            background: white !important;
          }
          .card-header {
            background: #f8f9fa !important;
            color: #000 !important;
          }
          .text-success,
          .text-danger,
          .text-primary {
            color: #000 !important;
          }
          .badge {
            border: 1px solid #000 !important;
            background: white !important;
            color: #000 !important;
          }
          /* Hide navigation and headers during print */
          .page-header,
          .breadcrumb,
          nav,
          .pageheader {
            display: none !important;
          }
          /* Hide the entire Pageheader component */
          .page-header-container,
          .main-header,
          .header,
          [class*="pageheader"],
          [class*="page-header"] {
            display: none !important;
          }
          /* Company header print styling */
          .company-header {
            page-break-inside: avoid;
            margin-bottom: 20px !important;
            border-bottom: 2px solid #000 !important;
          }
          .company-header img {
            max-height: 60px !important;
          }
          .company-header h3 {
            font-size: 18px !important;
            margin-bottom: 5px !important;
          }
          .company-header .text-muted {
            color: #000 !important;
            font-size: 10px !important;
          }
        }
      `}</style>
      <div className="no-print">
        <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Payslip" />
      </div>
      <div className="page-content-box no-print-header">
        <div className="page-content-box-inner">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payslip Details</h5>
                  <Link to="/hrms/payroll/payslips" className="btn btn-secondary btn-sm">
                    <i className="fa fa-arrow-left"></i> Back to List
                  </Link>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p>Loading payslip...</p>
                    </div>
                  ) : payslip ? (
                    <>
                      {/* Company Header */}
                      {companySettings && (
                        <div className="company-header text-center mb-4" style={{ 
                          borderBottom: '2px solid #ddd', 
                          paddingBottom: '20px',
                          marginBottom: '30px'
                        }}>
                          <div className="row align-items-center">
                            <div className="col-md-3">
                              {companySettings.logo_url && (
                                <img 
                                  src={companySettings.logo_url} 
                                  alt="Company Logo" 
                                  style={{ maxHeight: '80px', maxWidth: '100%' }}
                                />
                              )}
                            </div>
                            <div className="col-md-6">
                              <h3 className="mb-2 fw-bold text-primary">
                                {companySettings.company_name || 'Company Name'}
                              </h3>
                              {companySettings.address && (
                                <p className="mb-1 text-muted">{companySettings.address}</p>
                              )}
                              <div className="d-flex justify-content-center gap-3 flex-wrap">
                                {companySettings.email && (
                                  <span className="text-muted small">
                                    <i className="fa fa-envelope me-1"></i>
                                    {companySettings.email}
                                  </span>
                                )}
                                {companySettings.mobile_no && (
                                  <span className="text-muted small">
                                    <i className="fa fa-phone me-1"></i>
                                    {companySettings.mobile_no}
                                  </span>
                                )}
                                {companySettings.website && (
                                  <span className="text-muted small">
                                    <i className="fa fa-globe me-1"></i>
                                    {companySettings.website}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-md-3 text-end">
                              <h5 className="mb-1 text-primary">Salary Slip</h5>
                              <p className="mb-0 text-muted">
                                For {payslip ? getMonthName(payslip.month) + ' ' + payslip.year : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Header Information */}
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title text-primary">Employee Information</h6>
                              <div className="mb-2"><strong>Name:</strong> {payslip.employee_name || 'Unknown'}</div>
                              <div className="mb-2"><strong>Payslip ID:</strong> <span className="badge bg-secondary">#{payslip.id}</span></div>
                              <div className="mb-2"><strong>Period:</strong> {getMonthName(payslip.month)} {payslip.year}</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title text-success">Salary Information</h6>
                              <div className="mb-2"><strong>Net Salary:</strong> <span className="text-success fw-bold fs-5">{formatCurrency(payslip.net_salary)}</span></div>
                              <div className="mb-2"><strong>Generated:</strong> {new Date(payslip.created_at).toLocaleDateString('en-IN')}</div>
                              <div className="mb-2"><strong>Status:</strong> <span className="badge bg-success">Generated</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Earnings and Deductions */}
                      <div className="row mb-4">
                        {payslip.earnings && (
                          <div className="col-md-6">
                            <div className="card border-success">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0"><i className="fa fa-plus-circle"></i> Earnings</h6>
                              </div>
                              <div className="card-body">
                                {formatEarningsDeductions(payslip.earnings)}
                                <hr />
                                <div className="d-flex justify-content-between fw-bold text-success">
                                  <span>Total Earnings:</span>
                                  <span>{formatCurrency(
                                    Object.values(payslip.earnings).reduce((sum, val) => sum + parseFloat(val || 0), 0)
                                  )}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {payslip.deductions && (
                          <div className="col-md-6">
                            <div className="card border-danger">
                              <div className="card-header bg-danger text-white">
                                <h6 className="mb-0"><i className="fa fa-minus-circle"></i> Deductions</h6>
                              </div>
                              <div className="card-body">
                                {formatEarningsDeductions(payslip.deductions)}
                                <hr />
                                <div className="d-flex justify-content-between fw-bold text-danger">
                                  <span>Total Deductions:</span>
                                  <span>{formatCurrency(
                                    Object.values(payslip.deductions).reduce((sum, val) => sum + parseFloat(val || 0), 0)
                                  )}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Net Salary Summary */}
                      <div className="card border-primary mb-4">
                        <div className="card-body text-center">
                          <h5 className="text-primary">Net Salary</h5>
                          <h2 className="text-success mb-0">{formatCurrency(payslip.net_salary)}</h2>
                          <small className="text-muted">
                            For {getMonthName(payslip.month)} {payslip.year}
                          </small>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="text-center no-print">
                        <button className="btn btn-info me-2" onClick={handleDownload} disabled={loading}>
                          <i className="fa fa-download"></i> {loading ? 'Processing...' : 'Download PDF'}
                        </button>
                        <button className="btn btn-success me-2" onClick={handlePrint}>
                          <i className="fa fa-print"></i> Print Payslip
                        </button>
                        <Link to="/hrms/payroll/payslips" className="btn btn-secondary">
                          <i className="fa fa-list"></i> View All Payslips
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-warning text-center">
                      <div className="mb-3">
                        <i className="fa fa-exclamation-triangle fa-3x text-warning"></i>
                      </div>
                      <h5>Payslip Not Found</h5>
                      <p>Payslip with ID <strong>{id}</strong> does not exist.</p>
                      <Link to="/hrms/payroll/payslips" className="btn btn-primary">
                        <i className="fa fa-list"></i> View All Payslips
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayslipDownload;
