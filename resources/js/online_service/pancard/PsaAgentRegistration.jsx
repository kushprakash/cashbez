import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PsaAgentRegistration = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [agentData, setAgentData] = useState(null);

    const apiServiceRef = useRef(ApiService());

    // Refs for all form fields (uncontrolled - no re-render on typing)
    const refs = {
        agent_id:       useRef(null),
        name:           useRef(null),
        contact_person: useRef(null),
        email:          useRef(null),
        mobile_no:      useRef(null),
        pin:            useRef(null),
        location:       useRef(null),
        state:          useRef(null),
        district:       useRef(null),
        pan_no:         useRef(null),
        address_1:      useRef(null),
        address_2:      useRef(null),
        address_3:      useRef(null),
        address_4:      useRef(null),
    };

    // Helper: set value into a ref input
    const setRefValue = (key, val) => {
        if (refs[key].current) refs[key].current.value = val || '';
    };

    // Populate all inputs from data object
    const populateForm = (data, suggestedId) => {
        setRefValue('agent_id',       data?.agent_id       || suggestedId || '');
        setRefValue('name',           data?.name           || '');
        setRefValue('contact_person', data?.contact_person || '');
        setRefValue('email',          data?.email          || '');
        setRefValue('mobile_no',      data?.mobile_no      || '');
        setRefValue('pin',            data?.pin            || '');
        setRefValue('location',       data?.location       || '');
        setRefValue('state',          data?.state          || '');
        setRefValue('district',       data?.district       || '');
        setRefValue('pan_no',         data?.pan_no         || '');
        setRefValue('address_1',      data?.address_1      || '');
        setRefValue('address_2',      data?.address_2      || '');
        setRefValue('address_3',      data?.address_3      || '');
        setRefValue('address_4',      data?.address_4      || '');
    };

    // Read all values from DOM refs
    const getFormValues = () => ({
        agent_id:       refs.agent_id.current?.value       || '',
        name:           refs.name.current?.value           || '',
        contact_person: refs.contact_person.current?.value || '',
        email:          refs.email.current?.value          || '',
        mobile_no:      refs.mobile_no.current?.value      || '',
        pin:            refs.pin.current?.value            || '',
        location:       refs.location.current?.value       || '',
        state:          refs.state.current?.value          || '',
        district:       refs.district.current?.value       || '',
        pan_no:         refs.pan_no.current?.value         || '',
        address_1:      refs.address_1.current?.value      || '',
        address_2:      refs.address_2.current?.value      || '',
        address_3:      refs.address_3.current?.value      || '',
        address_4:      refs.address_4.current?.value      || '',
    });

    // Fetch existing agent status on load
    const fetchAgentStatus = async () => {
        setLoading(true);
        try {
            const res = await apiServiceRef.current.vGet('/api/pan-card/agent-status');
            const suggestedId = res?.data?.suggested_agent_id || '';

            if (res?.data?.status === 1 && res?.data?.data) {
                const data = res.data.data;
                setAgentData(data);
                // Populate refs after render
                setTimeout(() => populateForm(data, suggestedId), 0);
            } else {
                setAgentData(null);
                setTimeout(() => setRefValue('agent_id', suggestedId), 0);
            }
        } catch (err) {
            console.error('Error fetching agent status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgentStatus();
    }, []);

    // Handle Form Submit — read from refs, no state needed
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = getFormValues();

        if (!form.name || !form.contact_person || !form.email || !form.mobile_no || !form.pin || !form.location || !form.state || !form.district || !form.pan_no || !form.address_1) {
            toast.error('Please fill all required fields marked with *');
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiServiceRef.current.vPost('/api/pan-card/agent-register', form);
            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'Registration submitted successfully!');
                setAgentData(response.data.data);
            } else {
                toast.error(response?.data?.message || 'Failed to submit registration');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to submit registration');
        } finally {
            setSubmitting(false);
        }
    };

    const isReadOnly = agentData && (agentData.status === 0 || agentData.status === 1);

    return (
        <>
            <Pageheader
                mainheading="PAN CARD Service"
                parentfolder="Online Services"
                activepage="PSA Agent Registration"
            />

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="page-content-box p-3">
                <div className="container-fluid">

                    {/* STATUS BANNER */}
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center bg-light rounded-3">
                            <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                                <span className="fw-bold text-secondary" style={{ fontSize: '15px' }}>
                                    PSA Agent Registration
                                </span>
                            </div>

                            {agentData ? (
                                <div className="d-flex align-items-center gap-2">
                                    {agentData.agent_id && (
                                        <span className="fw-bold text-success me-2" style={{ fontSize: '14px' }}>
                                            Agent ID : {agentData.agent_id}
                                        </span>
                                    )}
                                    {agentData.status === 1 && (
                                        <span className="badge bg-success px-3 py-2 fw-bold" style={{ fontSize: '12px' }}>
                                            Status: APPROVED
                                        </span>
                                    )}
                                    {agentData.status === 0 && (
                                        <span className="badge bg-warning text-dark px-3 py-2 fw-bold" style={{ fontSize: '12px' }}>
                                            Status: PENDING ADMIN APPROVAL
                                        </span>
                                    )}
                                    {agentData.status === 2 && (
                                        <span className="badge bg-danger px-3 py-2 fw-bold" style={{ fontSize: '12px' }}>
                                            Status: REJECTED
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="badge bg-info text-dark px-3 py-2 fw-bold" style={{ fontSize: '12px' }}>
                                    Status: NOT REGISTERED
                                </span>
                            )}
                        </div>
                    </div>

                    {/* REJECTION REMARK */}
                    {agentData && agentData.status === 2 && agentData.admin_remark && (
                        <div className="alert alert-danger shadow-sm rounded-3 mb-4">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            <strong>Registration Rejection Reason:</strong> {agentData.admin_remark}
                            <br />
                            <small className="text-muted">You can update your details below and re-submit for approval.</small>
                        </div>
                    )}

                    {/* FORM */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom p-3">
                            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>
                                BIO PSA Agent Registration
                            </h5>
                            <small className="text-muted">Fill agent information to register for UTI PSA portal manual processing</small>
                        </div>

                        <div className="card-body p-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Fetching registration status...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">

                                        {/* Agent ID */}
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Agent ID
                                            </label>
                                            <input
                                                ref={refs.agent_id}
                                                type="text"
                                                className="form-control font-monospace fw-bold"
                                                name="agent_id"
                                                placeholder="e.g. ANNECHM-816"
                                                disabled={true}
                                            />
                                        </div>

                                        {/* Name */}
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.name}
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                placeholder="Enter full name"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Contact Person */}
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Contact Person <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.contact_person}
                                                type="text"
                                                className="form-control"
                                                name="contact_person"
                                                placeholder="Enter contact person"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.email}
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                placeholder="Enter email address"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Mobile No */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Mobile No <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.mobile_no}
                                                type="text"
                                                className="form-control"
                                                name="mobile_no"
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength="10"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* PIN */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                PIN <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.pin}
                                                type="text"
                                                className="form-control"
                                                name="pin"
                                                placeholder="Enter 6-digit pincode"
                                                maxLength="6"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Location <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.location}
                                                type="text"
                                                className="form-control"
                                                name="location"
                                                placeholder="Enter location"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* State */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.state}
                                                type="text"
                                                className="form-control"
                                                name="state"
                                                placeholder="Enter state name"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* District */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.district}
                                                type="text"
                                                className="form-control"
                                                name="district"
                                                placeholder="Enter district name"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Pan No */}
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Pan No <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.pan_no}
                                                type="text"
                                                className="form-control"
                                                name="pan_no"
                                                placeholder="Enter 10-character PAN number"
                                                maxLength="10"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Address Line 1 */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Address Line 1 <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                ref={refs.address_1}
                                                type="text"
                                                className="form-control"
                                                name="address_1"
                                                placeholder="Address line 1"
                                                disabled={isReadOnly}
                                                required
                                            />
                                        </div>

                                        {/* Address Line 2 */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Address Line 2
                                            </label>
                                            <input
                                                ref={refs.address_2}
                                                type="text"
                                                className="form-control"
                                                name="address_2"
                                                placeholder="Address line 2"
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        {/* Address Line 3 */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Address Line 3
                                            </label>
                                            <input
                                                ref={refs.address_3}
                                                type="text"
                                                className="form-control"
                                                name="address_3"
                                                placeholder="Address line 3"
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        {/* Address Line 4 */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-secondary" style={{ fontSize: '12px' }}>
                                                Address Line 4
                                            </label>
                                            <input
                                                ref={refs.address_4}
                                                type="text"
                                                className="form-control"
                                                name="address_4"
                                                placeholder="Address line 4"
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    {(!isReadOnly || (agentData && agentData.status === 2)) && (
                                        <div className="mt-4 text-end">
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-5 rounded-pill fw-bold text-white shadow-sm"
                                                disabled={submitting}
                                                style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', border: 'none' }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Submitting Registration...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-paper-plane me-2"></i>
                                                        Submit Registration
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PsaAgentRegistration;
