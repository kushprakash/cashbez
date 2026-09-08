import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';

const ViewBeneficiary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchBeneficiary();
  }, [id]);

  const fetchBeneficiary = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();
      const response = await apiService.vGet(`/api/beneficiaries/${id}`);
      const { data } = response;
      
      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to fetch beneficiary');
      }
      
      setBeneficiary(data.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendDeleteOtp = async () => {
    try {
      const apiService = ApiService();
      const response = await apiService.vPost('/api/beneficiaries/send-otp', {});
      
      if (response.data.status === 1) {
        toast.success('OTP sent successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
    await sendDeleteOtp();
  };

  const confirmDelete = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      const apiService = ApiService();
      const response = await apiService.vDelete(`/api/beneficiaries/${id}`, {
        otp: deleteOtp
      });

      if (response.data.status === 1) {
        toast.success('Beneficiary deleted successfully');
        navigate('/banking/beneficiary');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to delete beneficiary');
    }
  };

  if (loading) {
    return (
      <>
        <Pageheader 
          mainheading="View Beneficiary" 
          parentfolder="Banking" 
          activepage="View Beneficiary" 
        />
        <div className="page-content-box">
          <div className="page-content-box-inner">
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !beneficiary) {
    return (
      <>
        <Pageheader 
          mainheading="View Beneficiary" 
          parentfolder="Banking" 
          activepage="View Beneficiary" 
        />
        <div className="page-content-box">
          <div className="page-content-box-inner">
            <div className="alert alert-danger">
              {error || 'Beneficiary not found'}
            </div>
          </div>
        </div>
      </>
    );
  }

  const verificationData = beneficiary.verification_data || {};

  return (
    <>
      <Pageheader 
        mainheading="View Beneficiary" 
        parentfolder="Banking" 
        activepage="View Beneficiary" 
      />
      
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="mb-0 fw-bold">Beneficiary Details</h3>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/banking/beneficiary')}
                    >
                      <i className="fa fa-arrow-left me-1"></i> Back to List
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Beneficiary Name</label>
                        <div className="form-control-plaintext">{beneficiary.name}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Account Number</label>
                        <div className="form-control-plaintext font-monospace">{beneficiary.account}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">IFSC Code</label>
                        <div className="form-control-plaintext font-monospace">{beneficiary.ifsc}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Branch</label>
                        <div className="form-control-plaintext">{beneficiary.branch || 'Not available'}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Account Verification</label>
                        <div className="form-control-plaintext">
                          <span className={`badge ${beneficiary.account_verified ? 'bg-success' : 'bg-warning'}`}>
                            {beneficiary.account_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">IFSC Verification</label>
                        <div className="form-control-plaintext">
                          <span className={`badge ${beneficiary.ifsc_verified ? 'bg-success' : 'bg-warning'}`}>
                            {beneficiary.ifsc_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {verificationData.ifsc_data && verificationData.ifsc_data.verified && (
                      <>
                        <div className="col-md-12">
                          <hr />
                          <h5 className="fw-bold mb-3">Bank Details</h5>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Bank Name</label>
                            <div className="form-control-plaintext">
                              {verificationData.ifsc_data.bank || 'Not available'}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">City</label>
                            <div className="form-control-plaintext">
                              {verificationData.ifsc_data.city || 'Not available'}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">District</label>
                            <div className="form-control-plaintext">
                              {verificationData.ifsc_data.district || 'Not available'}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">State</label>
                            <div className="form-control-plaintext">
                              {verificationData.ifsc_data.state || 'Not available'}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-md-12">
                      <hr />
                      <h5 className="fw-bold mb-3">System Information</h5>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Added On</label>
                        <div className="form-control-plaintext">
                          {new Date(beneficiary.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Last Updated</label>
                        <div className="form-control-plaintext">
                          {new Date(beneficiary.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {beneficiary.creator && (
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Added By</label>
                          <div className="form-control-plaintext">
                            {beneficiary.creator.name}
                          </div>
                        </div>
                      </div>
                    )}

                    {beneficiary.admin && (
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Processed By</label>
                          <div className="form-control-plaintext">
                            {beneficiary.admin.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="alert alert-info">
                    <i className="fa fa-info-circle"></i>
                    <strong>Note:</strong> Beneficiary details cannot be edited once added. You can only view or delete beneficiaries.
                  </div>

                  <div className="d-flex justify-content-start">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/banking/beneficiary')}
                    >
                      <i className="fa fa-arrow-left me-1"></i> Back to List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Beneficiary</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteOtp('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{beneficiary.name}</strong>?</p>
                <p className="text-muted">An OTP has been sent to your registered mobile number.</p>
                <div className="mb-3">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteOtp('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewBeneficiary;
