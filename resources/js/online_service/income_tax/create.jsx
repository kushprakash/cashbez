import React, { useState, useRef, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { uploadToBunny } from '../../utils/BunnyUploadService';

const CreateIncomeTax = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [appType, setAppType] = useState(''); // 'individual' or 'business'

    const [formData, setFormData] = useState({
        // Common
        pan_number: '',
        aadhar_number: '',
        mobile_number: '',
        email_id: '',
        itr_password: '',

        // Bank
        bank_account_no: '',
        ifsc_code: '',
        account_type: 'savings', // default

        // Business Specific
        bussiness_name: '',
        nature_of_business: '',
        total_sales: '',
        profit_margin: '',
        business_expenses: '',

        // Deductions
        deduction_lic_tuition: '',
        deduction_fd_nsc: '',
        deduction_home_loan: '',
        deduction_health_insurance: '',
        deduction_savings_interest: '',
    });

    const [files, setFiles] = useState({
        pan_file: null,
        id_proof_file: null,
        aadhar_front_file: null,
        aadhar_back_file: null,
        bank_statement_file: null, // For business mainly, but good for all
        form_16_file: null, // Covers Form 16/16A/Salary Slip
        salary_slip_file: null, // Additional if needed, or stick to one logic
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (name, file) => {
        if (file) {
            if (file.size > 500 * 1024) { // 500KB
                toast.error(`File must be less than 500KB`);
                return;
            }
            setFiles(prev => ({ ...prev, [name]: file }));
        } else {
            setFiles(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!appType) {
            toast.error("Please select an Application Type first.");
            return;
        }

        setLoading(true);

        try {
            const apiService = ApiService();
            const payload = { ...formData, application_type: appType };

            // Basic File Validation
            if (!files.pan_file) { toast.error("PAN Card is required"); setLoading(false); return; }
            if (!files.aadhar_front_file) { toast.error("Aadhar Front is required"); setLoading(false); return; }

            // Upload files directly to BunnyCDN
            toast.info('Uploading documents...');
            const fileUrls = {};
            
            for (const [key, file] of Object.entries(files)) {
                if (file) {
                    try {
                        const result = await uploadToBunny(file, 'income_tax_documents', (percent) => {
                            console.log(`${key}: ${percent}%`);
                        });
                        if (result.success) {
                            fileUrls[key] = result.url;
                        } else {
                            toast.error(`Failed to upload ${key}: ${result.error}`);
                            setLoading(false);
                            return;
                        }
                    } catch (err) {
                        toast.error(`Upload error for ${key}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Combine payload with file URLs
            const finalPayload = { ...payload, ...fileUrls };

            // Send to backend (URLs only, no files)
            const response = await apiService.post('/api/online-service/income-tax', finalPayload);

            if (response.data.status === 1) {
                toast.success(response.data.message);
                navigate('/income-tax/list');
            } else {
                toast.error(response.data.message || 'Failed to submit');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || 'Failed to submit application');
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader mainheading="Income Tax Filing" parentfolder="Online Services" activepage="Apply" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Step 1: Type Selection */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body p-4 text-center">
                            <h5 className="mb-3 fw-bold text-primary">Select Application Type</h5>
                            <div className="d-flex justify-content-center gap-4">
                                <div className={`cursor-pointer p-4 border rounded-3 ${appType === 'individual' ? 'bg-primary-subtle border-primary' : 'bg-light'}`}
                                    onClick={() => setAppType('individual')} style={{ width: '200px' }}>
                                    <i className="fa fa-user fa-3x mb-3 text-primary"></i>
                                    <h6 className="fw-bold mb-0">Salaried / Individual</h6>
                                    <small className="text-muted">Form 16, Salary Slips</small>
                                </div>
                                <div className={`cursor-pointer p-4 border rounded-3 ${appType === 'business' ? 'bg-primary-subtle border-primary' : 'bg-light'}`}
                                    onClick={() => setAppType('business')} style={{ width: '200px' }}>
                                    <i className="fa fa-briefcase fa-3x mb-3 text-primary"></i>
                                    <h6 className="fw-bold mb-0">Business / Proprietor</h6>
                                    <small className="text-muted">Form 16A, Balance Sheet</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appType && (
                        <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">

                            {/* Personal Details */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3 px-4">
                                    <h5 className="mb-0 fw-bold text-primary">
                                        {appType === 'business' ? "Proprietor's & Business Details" : "Personal Details"}
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">

                                        {/* Business Specific Top Fields */}
                                        {appType === 'business' && (
                                            <>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-medium">Business Name <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="bussiness_name" value={formData.bussiness_name} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-medium">Nature of Business <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="nature_of_business" value={formData.nature_of_business} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-medium">Total Sales (Yearly)</label>
                                                    <input type="number" className="form-control" name="total_sales" value={formData.total_sales} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Profit Margin (Approx)</label>
                                                    <input type="text" className="form-control" name="profit_margin" value={formData.profit_margin} onChange={handleInputChange} placeholder="e.g. 10%" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Business Expenses (Brief)</label>
                                                    <textarea className="form-control" rows="1" name="business_expenses" value={formData.business_expenses} onChange={handleInputChange}></textarea>
                                                </div>
                                                <div className="col-12"><hr className="text-muted opacity-25" /></div>
                                            </>
                                        )}

                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Mobile Number <span className="text-danger">*</span></label>
                                            <input type="tel" className="form-control" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} required pattern="[0-9]{10}" maxLength="10" />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Email ID <span className="text-danger">*</span></label>
                                            <input type="email" className="form-control" name="email_id" value={formData.email_id} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Aadhar Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="aadhar_number" value={formData.aadhar_number} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">PAN Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">ITR Password (If Registered)</label>
                                            <input type="text" className="form-control" name="itr_password" value={formData.itr_password} onChange={handleInputChange} placeholder="Optional" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3 px-4">
                                    <h5 className="mb-0 fw-bold text-primary">Bank Details</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Account Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="bank_account_no" value={formData.bank_account_no} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">IFSC Code <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control text-uppercase" name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Account Type</label>
                                            <select className="form-select" name="account_type" value={formData.account_type} onChange={handleInputChange}>
                                                <option value="savings">Savings</option>
                                                <option value="current">Current</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3 px-4">
                                    <h5 className="mb-0 fw-bold text-primary">Deduction Details (Amounts)</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">LIC Premium / Tuition Fee</label>
                                            <input type="number" className="form-control" name="deduction_lic_tuition" value={formData.deduction_lic_tuition} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">5 Yr FD / NSC</label>
                                            <input type="number" className="form-control" name="deduction_fd_nsc" value={formData.deduction_fd_nsc} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Home Loan Interest</label>
                                            <input type="number" className="form-control" name="deduction_home_loan" value={formData.deduction_home_loan} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Health Insurance Premium</label>
                                            <input type="number" className="form-control" name="deduction_health_insurance" value={formData.deduction_health_insurance} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-medium">Savings A/c Interest</label>
                                            <input type="number" className="form-control" name="deduction_savings_interest" value={formData.deduction_savings_interest} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3 px-4">
                                    <h5 className="mb-0 fw-bold text-primary">Upload Documents</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <FileUpload label="PAN Card" name="pan_file" file={files.pan_file} onFileChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <FileUpload label="ID Proof" name="id_proof_file" file={files.id_proof_file} onFileChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <FileUpload label="Aadhar Front" name="aadhar_front_file" file={files.aadhar_front_file} onFileChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <FileUpload label="Aadhar Back" name="aadhar_back_file" file={files.aadhar_back_file} onFileChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <FileUpload
                                                label={appType === 'business' ? "Bank Statement (1 Year)" : "Bank Passbook / Statement"}
                                                name="bank_statement_file"
                                                file={files.bank_statement_file}
                                                onFileChange={handleFileChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <FileUpload
                                                label={appType === 'business' ? "Form 16A (If Any)" : "Form 16 / Salary Slip"}
                                                name="form_16_file"
                                                file={files.form_16_file}
                                                onFileChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-3 mb-5">
                                <button type="button" className="btn btn-light border px-4" onClick={() => navigate('/income-tax/dashboard')}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>
            {/* Styles for FileUpload component if needed, though likely best to import it if it were shared. I'll inline a simple one or reuse the one from Gst if I can, but reuse via copy is safer unless I refactor. I'll copy the FileUpload component code here for completeness. */}
        </>
    );
};

const FileUpload = ({ label, name, file, onFileChange }) => {
    const inputRef = useRef(null);
    return (
        <div className="h-100">
            <label className="form-label fw-semibold mb-2">{label}</label>
            <div
                className={`border-2 border-dashed rounded-3 p-3 text-center d-flex flex-column align-items-center justify-content-center ${file ? 'bg-light border-success' : 'bg-light border-secondary-subtle'}`}
                style={{ cursor: 'pointer', minHeight: '120px' }}
                onClick={() => inputRef.current.click()}
            >
                <input type="file" ref={inputRef} className="d-none" onChange={(e) => onFileChange(name, e.target.files[0])} accept="image/*,.pdf" />
                {file ? (
                    <>
                        <i className="fa fa-check-circle text-success fa-2x mb-2"></i>
                        <small className="text-truncate w-100">{file.name}</small>
                    </>
                ) : (
                    <>
                        <i className="fa fa-cloud-upload text-secondary fa-2x mb-2"></i>
                        <small className="text-muted">Click to Upload</small>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateIncomeTax;
