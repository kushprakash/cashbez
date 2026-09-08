import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';

const ManualKycVerify = () => {
    const { userId } = useParams();
    const apiService = ApiService();
    const { userData } = useContext(AuthContext);
    const [kycData, setKycData] = useState(null);
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('aadhaar');

    // Authorization: only role=1 or user_id=21
    const isAuthorized = userData && (userData.role == 1 || userData.id == 21);

    // ── Mode state for each section ──
    const [aadhaarMode, setAadhaarMode] = useState('api'); // 'api' | 'helper' | 'manual'
    const [panMode, setPanMode] = useState('api');
    const [helperPanMode, setHelperPanMode] = useState('api');
    const [bankMode, setBankMode] = useState('api');

    // ── Loading states ──
    const [aadhaarLoading, setAadhaarLoading] = useState(false);
    const [panLoading, setPanLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);

    // ── Aadhaar Form ──
    const [aadhaarForm, setAadhaarForm] = useState({
        aadhar_number: '', otp: '', txnid: '',
        name: '', dob: '', gender: '', mobile: '', email: '', photo: '',
        country: 'India', dist: '', house: '', landmark: '', pincode: '',
        po: '', state: '', street: '', subdist: '', vtc: ''
    });
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [aadhaarHelperOtpSent, setAadhaarHelperOtpSent] = useState(false);
    const [aadhaarHelperTxnid, setAadhaarHelperTxnid] = useState('');
    const [aadhaarJsonPreview, setAadhaarJsonPreview] = useState(null);

    // ── PAN Form ──
    const [panForm, setPanForm] = useState({
        pan_number: '', registered_name: '', father_name: '', type: 'Individual'
    });
    const [panJsonPreview, setPanJsonPreview] = useState(null);

    // ── Bank Form ──
    const [bankForm, setBankForm] = useState({
        account_number: '', ifsc_code: '', bank_name: '', branch: '',
        account_holder_name: '', city: ''
    });
    const [bankJsonPreview, setBankJsonPreview] = useState(null);

    // ── Fetch KYC Data ──
    const fetchKycData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiService.vGet(`/api/kyc/details/${userId}`);
            if (res.data.status === 1) {
                setKycData(res.data.kyc);
                setTargetUser(res.data.user);
            } else {
                // Try alternate endpoint
                const res2 = await apiService.vGet(`/api/admin/users/${userId}/kyc`);
                if (res2.data) {
                    setKycData(res2.data);
                }
            }
        } catch (e) {
            toast.error('Failed to load KYC data');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchKycData(); }, [fetchKycData]);

    // ── Status Badge ──
    const StatusBadge = ({ verified, label }) => (
        <span className={`mkv-badge ${verified ? 'mkv-badge-verified' : 'mkv-badge-pending'}`}>
            {verified ? <>✓ {label} Verified</> : <>⏳ {label} Pending</>}
        </span>
    );

    // ── Mode Button Group ──
    const ModeSelector = ({ mode, setMode, section }) => (
        <div className="mkv-mode-group">
            <button className={`mkv-mode-btn ${mode === 'api' ? 'active' : ''}`} onClick={() => setMode('api')}>
                <i className="fas fa-bolt"></i> API Verify
            </button>
            <button className={`mkv-mode-btn ${mode === 'helper' ? 'active' : ''}`} onClick={() => setMode('helper')}>
                <i className="fas fa-download"></i> Gorter Fetch
            </button>
            <button className={`mkv-mode-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                <i className="fas fa-edit"></i> Manual Entry
            </button>
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AADHAAR HANDLERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Mode 1: Existing API (send OTP + verify OTP with name matching)
    const aadhaarSendOtpApi = async () => {
        if (!aadhaarForm.aadhar_number || aadhaarForm.aadhar_number.length !== 12) {
            return toast.error('Enter valid 12-digit Aadhaar number');
        }
        try {
            setAadhaarLoading(true);
            const res = await apiService.vPost('/api/kyc/aadhaar/send-otp', { aadhar_number: aadhaarForm.aadhar_number });
            if (res.data.status === 1) {
                setAadhaarOtpSent(true);
                setAadhaarForm(p => ({ ...p, txnid: res.data.txnid }));
                toast.success('OTP sent');
            } else toast.error(res.data.message);
        } catch { toast.error('Failed to send OTP'); }
        finally { setAadhaarLoading(false); }
    };

    const aadhaarVerifyOtpApi = async () => {
        if (!aadhaarForm.otp || aadhaarForm.otp.length !== 6) return toast.error('Enter 6-digit OTP');
        try {
            setAadhaarLoading(true);
            const res = await apiService.vPost('/api/kyc/aadhaar/verify-otp', {
                otp: aadhaarForm.otp, txnid: aadhaarForm.txnid, aadhar_number: aadhaarForm.aadhar_number
            });
            if (res.data.status === 1) {
                toast.success('Aadhaar verified via API');
                fetchKycData();
                setAadhaarOtpSent(false);
            } else toast.error(res.data.message);
        } catch { toast.error('Verification failed'); }
        finally { setAadhaarLoading(false); }
    };

    // Mode 2: Helper — send OTP via helper (no uniqueness check)
    const aadhaarHelperSendOtp = async () => {
        if (!aadhaarForm.aadhar_number || aadhaarForm.aadhar_number.length !== 12) {
            return toast.error('Enter valid 12-digit Aadhaar number');
        }
        try {
            setAadhaarLoading(true);
            const res = await apiService.vPost('/api/kyc/helper/aadhaar/send-otp', { aadhar_number: aadhaarForm.aadhar_number });
            if (res.data.status === 1) {
                setAadhaarHelperOtpSent(true);
                setAadhaarHelperTxnid(res.data.txnid);
                toast.success('OTP sent (Helper)');
            } else toast.error(res.data.message);
        } catch { toast.error('Failed'); }
        finally { setAadhaarLoading(false); }
    };

    const aadhaarHelperVerifyOtp = async () => {
        if (!aadhaarForm.otp || aadhaarForm.otp.length !== 6) return toast.error('Enter 6-digit OTP');
        try {
            setAadhaarLoading(true);
            const res = await apiService.vPost('/api/kyc/helper/aadhaar/verify-otp', {
                otp: aadhaarForm.otp, txnid: aadhaarHelperTxnid
            });
            if (res.data.status === 1) {
                const d = res.data.aadhaar_data;
                setAadhaarForm(p => ({
                    ...p, name: d.name, dob: d.dob, gender: d.gender,
                    mobile: d.mobile, email: d.email, photo: d.photo,
                    country: d.country, dist: d.dist, house: d.house,
                    landmark: d.landmark, pincode: d.pincode, po: d.po,
                    state: d.state, street: d.street, subdist: d.subdist, vtc: d.vtc
                }));
                toast.success('Form auto-filled from Gorter API — review & save');
                setAadhaarHelperOtpSent(false);
            } else toast.error(res.data.message);
        } catch { toast.error('Verification failed'); }
        finally { setAadhaarLoading(false); }
    };

    // Mode 2 & 3: Save manually
    const saveAadhaarManual = async () => {
        if (!aadhaarForm.aadhar_number || !aadhaarForm.name) {
            return toast.error('Aadhaar number and name are required');
        }
        try {
            setAadhaarLoading(true);
            const res = await apiService.vPost('/api/kyc/manual/aadhaar', {
                user_id: userId, ...aadhaarForm
            });
            if (res.data.status === 1) {
                toast.success('Aadhaar saved successfully');
                setAadhaarJsonPreview(res.data.generated_json);
                fetchKycData();
            } else toast.error(res.data.message);
        } catch { toast.error('Save failed'); }
        finally { setAadhaarLoading(false); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAN HANDLERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Mode 1: Existing API
    const panVerifyApi = async () => {
        if (!panForm.pan_number || panForm.pan_number.length !== 10) return toast.error('Enter valid PAN');
        try {
            setPanLoading(true);
            const res = await apiService.vPost('/api/kyc/pan/verify', { pan_number: panForm.pan_number });
            if (res.data.status === 1) {
                toast.success('PAN verified via API');
                fetchKycData();
            } else toast.error(res.data.message);
        } catch { toast.error('PAN verification failed'); }
        finally { setPanLoading(false); }
    };

    // Mode 2: Helper — fetch from Gorter without saving
    const panHelperFetch = async () => {
        if (!panForm.pan_number || panForm.pan_number.length !== 10) return toast.error('Enter valid PAN');
        try {
            setPanLoading(true);
            const res = await apiService.vPost('/api/kyc/helper/pan', { pan_number: panForm.pan_number });
            if (res.data.status === 1) {
                const d = res.data.pan_data;
                setPanForm(p => ({
                    ...p,
                    pan_number: d.pan_number,
                    registered_name: d.registered_name,
                    father_name: d.father_name,
                    type: d.type || 'Individual'
                }));
                toast.success('Form auto-filled from Gorter — review & save');
            } else toast.error(res.data.message);
        } catch { toast.error('Fetch failed'); }
        finally { setPanLoading(false); }
    };

    // Mode 2 & 3: Save manually
    const savePanManual = async () => {
        if (!panForm.pan_number || !panForm.registered_name) {
            return toast.error('PAN & registered name required');
        }
        try {
            setPanLoading(true);
            const res = await apiService.vPost('/api/kyc/manual/pan', {
                user_id: userId, ...panForm
            });
            if (res.data.status === 1) {
                toast.success('PAN saved');
                setPanJsonPreview(res.data.generated_json);
                fetchKycData();
            } else toast.error(res.data.message);
        } catch { toast.error('Save failed'); }
        finally { setPanLoading(false); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BANK HANDLERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Mode 1: Existing API
    const bankVerifyApi = async () => {
        if (!bankForm.account_number || !bankForm.ifsc_code) return toast.error('Enter account & IFSC');
        try {
            setBankLoading(true);
            const res = await apiService.vPost('/api/kyc/bank/verify', {
                account_number: bankForm.account_number, ifsc_code: bankForm.ifsc_code
            });
            if (res.data.status === 1) {
                toast.success('Bank verified via API');
                fetchKycData();
            } else toast.error(res.data.message);
        } catch { toast.error('Bank verification failed'); }
        finally { setBankLoading(false); }
    };

    // Mode 2: Helper — fetch from Gorter
    const bankHelperFetch = async () => {
        if (!bankForm.account_number || !bankForm.ifsc_code) return toast.error('Enter account & IFSC');
        try {
            setBankLoading(true);
            const res = await apiService.vPost('/api/kyc/helper/bank', {
                account_number: bankForm.account_number, ifsc_code: bankForm.ifsc_code
            });
            if (res.data.status === 1) {
                const d = res.data.bank_data;
                setBankForm(p => ({
                    ...p,
                    account_number: d.account_number,
                    account_holder_name: d.account_name,
                    bank_name: d.bank_name,
                    branch: d.branch,
                    city: d.city,
                    ifsc_code: d.ifsc_code
                }));
                toast.success('Form auto-filled from Gorter — review & save');
            } else toast.error(res.data.message);
        } catch { toast.error('Fetch failed'); }
        finally { setBankLoading(false); }
    };

    // Mode 2 & 3: Save manually
    const saveBankManual = async () => {
        if (!bankForm.account_number || !bankForm.ifsc_code || !bankForm.bank_name || !bankForm.branch) {
            return toast.error('Account, IFSC, bank name & branch required');
        }
        try {
            setBankLoading(true);
            const res = await apiService.vPost('/api/kyc/manual/bank', {
                user_id: userId, ...bankForm
            });
            if (res.data.status === 1) {
                toast.success('Bank saved');
                setBankJsonPreview(res.data.generated_json);
                fetchKycData();
            } else toast.error(res.data.message);
        } catch { toast.error('Save failed'); }
        finally { setBankLoading(false); }
    };

    // ── JSON Preview Panel ──
    const JsonPreview = ({ data, label }) => {
        if (!data) return null;
        return (
            <div className="mkv-json-panel">
                <div className="mkv-json-header">
                    <i className="fas fa-code"></i> {label} — Generated JSON
                </div>
                <pre className="mkv-json-body">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    };

    // ── Input Helper ──
    const FormInput = ({ label, value, onChange, placeholder, maxLength, disabled, uppercase, type = 'text', halfWidth }) => (
        <div className={`mkv-field ${halfWidth ? 'mkv-field-half' : ''}`}>
            <label className="mkv-label">{label}</label>
            <input
                type={type}
                className="mkv-input"
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                style={uppercase ? { textTransform: 'uppercase' } : {}}
            />
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER: AADHAAR TAB
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const renderAadhaarTab = () => (
        <div className="mkv-section">
            <div className="mkv-section-header">
                <div className="mkv-section-title">
                    <i className="fas fa-id-card"></i> Aadhaar Verification
                </div>
                <StatusBadge verified={kycData?.aadhar_verified} label="Aadhaar" />
            </div>

            <ModeSelector mode={aadhaarMode} setMode={setAadhaarMode} section="aadhaar" />

            {/* Mode 1: API Verify */}
            {aadhaarMode === 'api' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Uses existing KYC API flow with OTP verification & name matching</div>
                    <div className="mkv-row">
                        <FormInput label="Aadhaar Number" value={aadhaarForm.aadhar_number}
                            onChange={e => setAadhaarForm(p => ({ ...p, aadhar_number: e.target.value.replace(/\D/g, '') }))}
                            placeholder="Enter 12-digit Aadhaar" maxLength={12} disabled={aadhaarOtpSent} halfWidth />
                    </div>
                    {!aadhaarOtpSent ? (
                        <button className="mkv-btn mkv-btn-primary" onClick={aadhaarSendOtpApi} disabled={aadhaarLoading}>
                            {aadhaarLoading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send OTP</>}
                        </button>
                    ) : (
                        <>
                            <div className="mkv-row">
                                <FormInput label="OTP" value={aadhaarForm.otp}
                                    onChange={e => setAadhaarForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="6-digit OTP" maxLength={6} halfWidth />
                            </div>
                            <div className="mkv-btn-row">
                                <button className="mkv-btn mkv-btn-success" onClick={aadhaarVerifyOtpApi} disabled={aadhaarLoading}>
                                    {aadhaarLoading ? 'Verifying...' : '✓ Verify & Save'}
                                </button>
                                <button className="mkv-btn mkv-btn-ghost" onClick={() => setAadhaarOtpSent(false)}>Resend</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Mode 2: Gorter Fetch + Review */}
            {aadhaarMode === 'helper' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fetch from Gorter API (no name matching) → auto-fill form → review → save</div>
                    <div className="mkv-row">
                        <FormInput label="Aadhaar Number" value={aadhaarForm.aadhar_number}
                            onChange={e => setAadhaarForm(p => ({ ...p, aadhar_number: e.target.value.replace(/\D/g, '') }))}
                            placeholder="Enter 12-digit Aadhaar" maxLength={12} disabled={aadhaarHelperOtpSent} halfWidth />
                    </div>
                    {!aadhaarHelperOtpSent ? (
                        <button className="mkv-btn mkv-btn-warning" onClick={aadhaarHelperSendOtp} disabled={aadhaarLoading}>
                            {aadhaarLoading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-download"></i> Fetch OTP from Gorter</>}
                        </button>
                    ) : (
                        <>
                            <div className="mkv-row">
                                <FormInput label="OTP" value={aadhaarForm.otp}
                                    onChange={e => setAadhaarForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="6-digit OTP" maxLength={6} halfWidth />
                            </div>
                            <button className="mkv-btn mkv-btn-warning" onClick={aadhaarHelperVerifyOtp} disabled={aadhaarLoading}>
                                {aadhaarLoading ? 'Fetching...' : '⬇ Fetch & Auto-Fill'}
                            </button>
                        </>
                    )}
                    {/* Shared form fields — populated by helper or typed manually */}
                    {renderAadhaarFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={saveAadhaarManual} disabled={aadhaarLoading}>
                        {aadhaarLoading ? 'Saving...' : '✓ Save Aadhaar Verification'}
                    </button>
                    <JsonPreview data={aadhaarJsonPreview} label="Aadhaar" />
                </div>
            )}

            {/* Mode 3: Pure Manual */}
            {aadhaarMode === 'manual' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fill all fields manually — JSON response auto-generated in Gorter format</div>
                    <div className="mkv-row">
                        <FormInput label="Aadhaar Number *" value={aadhaarForm.aadhar_number}
                            onChange={e => setAadhaarForm(p => ({ ...p, aadhar_number: e.target.value.replace(/\D/g, '') }))}
                            placeholder="12-digit Aadhaar" maxLength={12} halfWidth />
                    </div>
                    {renderAadhaarFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={saveAadhaarManual} disabled={aadhaarLoading}>
                        {aadhaarLoading ? 'Saving...' : '✓ Save Aadhaar Verification'}
                    </button>
                    <JsonPreview data={aadhaarJsonPreview} label="Aadhaar" />
                </div>
            )}
        </div>
    );

    const renderAadhaarFormFields = () => (
        <div className="mkv-form-grid">
            <div className="mkv-form-divider">Personal Details</div>
            <div className="mkv-row">
                <FormInput label="Full Name *" value={aadhaarForm.name}
                    onChange={e => setAadhaarForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" halfWidth />
                <FormInput label="Date of Birth" value={aadhaarForm.dob}
                    onChange={e => setAadhaarForm(p => ({ ...p, dob: e.target.value }))} placeholder="DD-MM-YYYY" halfWidth />
            </div>
            <div className="mkv-row">
                <div className="mkv-field mkv-field-half">
                    <label className="mkv-label">Gender</label>
                    <select className="mkv-input" value={aadhaarForm.gender || ''}
                        onChange={e => setAadhaarForm(p => ({ ...p, gender: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="T">Transgender</option>
                    </select>
                </div>
                <FormInput label="Mobile" value={aadhaarForm.mobile}
                    onChange={e => setAadhaarForm(p => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="Email" value={aadhaarForm.email}
                    onChange={e => setAadhaarForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" halfWidth />
            </div>
            <div className="mkv-form-divider">Address Details</div>
            <div className="mkv-row">
                <FormInput label="House" value={aadhaarForm.house}
                    onChange={e => setAadhaarForm(p => ({ ...p, house: e.target.value }))} placeholder="House/Building" halfWidth />
                <FormInput label="Street" value={aadhaarForm.street}
                    onChange={e => setAadhaarForm(p => ({ ...p, street: e.target.value }))} placeholder="Street" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="Landmark" value={aadhaarForm.landmark}
                    onChange={e => setAadhaarForm(p => ({ ...p, landmark: e.target.value }))} placeholder="Landmark" halfWidth />
                <FormInput label="VTC" value={aadhaarForm.vtc}
                    onChange={e => setAadhaarForm(p => ({ ...p, vtc: e.target.value }))} placeholder="Village/Town/City" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="Post Office" value={aadhaarForm.po}
                    onChange={e => setAadhaarForm(p => ({ ...p, po: e.target.value }))} placeholder="Post Office" halfWidth />
                <FormInput label="Sub-District" value={aadhaarForm.subdist}
                    onChange={e => setAadhaarForm(p => ({ ...p, subdist: e.target.value }))} placeholder="Sub-district" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="District" value={aadhaarForm.dist}
                    onChange={e => setAadhaarForm(p => ({ ...p, dist: e.target.value }))} placeholder="District" halfWidth />
                <FormInput label="State" value={aadhaarForm.state}
                    onChange={e => setAadhaarForm(p => ({ ...p, state: e.target.value }))} placeholder="State" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="Country" value={aadhaarForm.country}
                    onChange={e => setAadhaarForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" halfWidth />
                <FormInput label="Pincode" value={aadhaarForm.pincode}
                    onChange={e => setAadhaarForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))} placeholder="Pincode" maxLength={6} halfWidth />
            </div>
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER: PAN TAB
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const renderPanTab = () => (
        <div className="mkv-section">
            <div className="mkv-section-header">
                <div className="mkv-section-title">
                    <i className="fas fa-address-card"></i> PAN Verification
                </div>
                <StatusBadge verified={kycData?.pan_verified} label="PAN" />
            </div>

            <ModeSelector mode={panMode} setMode={setPanMode} section="pan" />

            {/* Mode 1: API Verify */}
            {panMode === 'api' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Uses existing KYC API with name matching against Aadhaar name</div>
                    <div className="mkv-row">
                        <FormInput label="PAN Number" value={panForm.pan_number}
                            onChange={e => setPanForm(p => ({ ...p, pan_number: e.target.value.toUpperCase() }))}
                            placeholder="ABCDE1234F" maxLength={10} uppercase halfWidth />
                    </div>
                    <button className="mkv-btn mkv-btn-primary" onClick={panVerifyApi} disabled={panLoading}>
                        {panLoading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : <><i className="fas fa-bolt"></i> Verify via API</>}
                    </button>
                </div>
            )}

            {/* Mode 2: Gorter Fetch + Review */}
            {panMode === 'helper' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fetch from Gorter (no name matching) → auto-fill → review → save</div>
                    <div className="mkv-row">
                        <FormInput label="PAN Number" value={panForm.pan_number}
                            onChange={e => setPanForm(p => ({ ...p, pan_number: e.target.value.toUpperCase() }))}
                            placeholder="ABCDE1234F" maxLength={10} uppercase halfWidth />
                    </div>
                    <button className="mkv-btn mkv-btn-warning" onClick={panHelperFetch} disabled={panLoading}>
                        {panLoading ? 'Fetching...' : '⬇ Fetch from Gorter'}
                    </button>
                    {renderPanFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={savePanManual} disabled={panLoading}>
                        {panLoading ? 'Saving...' : '✓ Save PAN Verification'}
                    </button>
                    <JsonPreview data={panJsonPreview} label="PAN" />
                </div>
            )}

            {/* Mode 3: Pure Manual */}
            {panMode === 'manual' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fill PAN details manually — JSON auto-generated</div>
                    <div className="mkv-row">
                        <FormInput label="PAN Number *" value={panForm.pan_number}
                            onChange={e => setPanForm(p => ({ ...p, pan_number: e.target.value.toUpperCase() }))}
                            placeholder="ABCDE1234F" maxLength={10} uppercase halfWidth />
                    </div>
                    {renderPanFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={savePanManual} disabled={panLoading}>
                        {panLoading ? 'Saving...' : '✓ Save PAN Verification'}
                    </button>
                    <JsonPreview data={panJsonPreview} label="PAN" />
                </div>
            )}
        </div>
    );

    const renderPanFormFields = () => (
        <div className="mkv-form-grid">
            <div className="mkv-row">
                <FormInput label="Registered Name *" value={panForm.registered_name}
                    onChange={e => setPanForm(p => ({ ...p, registered_name: e.target.value }))} placeholder="As per PAN" halfWidth />
                <FormInput label="Father's Name" value={panForm.father_name}
                    onChange={e => setPanForm(p => ({ ...p, father_name: e.target.value }))} placeholder="Father's name" halfWidth />
            </div>
            <div className="mkv-row">
                <div className="mkv-field mkv-field-half">
                    <label className="mkv-label">Type</label>
                    <select className="mkv-input" value={panForm.type}
                        onChange={e => setPanForm(p => ({ ...p, type: e.target.value }))}>
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="HUF">HUF</option>
                        <option value="Firm">Firm</option>
                        <option value="Trust">Trust</option>
                    </select>
                </div>
            </div>
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER: BANK TAB
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const renderBankTab = () => (
        <div className="mkv-section">
            <div className="mkv-section-header">
                <div className="mkv-section-title">
                    <i className="fas fa-university"></i> Bank Account Verification
                </div>
                <StatusBadge verified={kycData?.account_verified} label="Bank" />
            </div>

            <ModeSelector mode={bankMode} setMode={setBankMode} section="bank" />

            {/* Mode 1: API Verify */}
            {bankMode === 'api' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Uses existing KYC API with IFSC + name matching</div>
                    <div className="mkv-row">
                        <FormInput label="Account Number" value={bankForm.account_number}
                            onChange={e => setBankForm(p => ({ ...p, account_number: e.target.value }))}
                            placeholder="Account number" halfWidth />
                        <FormInput label="IFSC Code" value={bankForm.ifsc_code}
                            onChange={e => setBankForm(p => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))}
                            placeholder="IFSC code" maxLength={11} uppercase halfWidth />
                    </div>
                    <button className="mkv-btn mkv-btn-primary" onClick={bankVerifyApi} disabled={bankLoading}>
                        {bankLoading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : <><i className="fas fa-bolt"></i> Verify via API</>}
                    </button>
                </div>
            )}

            {/* Mode 2: Gorter Fetch + Review */}
            {bankMode === 'helper' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fetch from Gorter + IFSC (no name matching) → auto-fill → review → save</div>
                    <div className="mkv-row">
                        <FormInput label="Account Number" value={bankForm.account_number}
                            onChange={e => setBankForm(p => ({ ...p, account_number: e.target.value }))}
                            placeholder="Account number" halfWidth />
                        <FormInput label="IFSC Code" value={bankForm.ifsc_code}
                            onChange={e => setBankForm(p => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))}
                            placeholder="IFSC code" maxLength={11} uppercase halfWidth />
                    </div>
                    <button className="mkv-btn mkv-btn-warning" onClick={bankHelperFetch} disabled={bankLoading}>
                        {bankLoading ? 'Fetching...' : '⬇ Fetch from Gorter'}
                    </button>
                    {renderBankFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={saveBankManual} disabled={bankLoading}>
                        {bankLoading ? 'Saving...' : '✓ Save Bank Verification'}
                    </button>
                    <JsonPreview data={bankJsonPreview} label="Bank" />
                </div>
            )}

            {/* Mode 3: Pure Manual */}
            {bankMode === 'manual' && (
                <div className="mkv-mode-content">
                    <div className="mkv-hint">Fill bank details manually — JSON auto-generated</div>
                    <div className="mkv-row">
                        <FormInput label="Account Number *" value={bankForm.account_number}
                            onChange={e => setBankForm(p => ({ ...p, account_number: e.target.value }))}
                            placeholder="Account number" halfWidth />
                        <FormInput label="IFSC Code *" value={bankForm.ifsc_code}
                            onChange={e => setBankForm(p => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))}
                            placeholder="IFSC code" maxLength={11} uppercase halfWidth />
                    </div>
                    {renderBankFormFields()}
                    <button className="mkv-btn mkv-btn-success mkv-btn-lg" onClick={saveBankManual} disabled={bankLoading}>
                        {bankLoading ? 'Saving...' : '✓ Save Bank Verification'}
                    </button>
                    <JsonPreview data={bankJsonPreview} label="Bank" />
                </div>
            )}
        </div>
    );

    const renderBankFormFields = () => (
        <div className="mkv-form-grid">
            <div className="mkv-row">
                <FormInput label="Account Holder Name" value={bankForm.account_holder_name}
                    onChange={e => setBankForm(p => ({ ...p, account_holder_name: e.target.value }))} placeholder="Name" halfWidth />
                <FormInput label="Bank Name *" value={bankForm.bank_name}
                    onChange={e => setBankForm(p => ({ ...p, bank_name: e.target.value }))} placeholder="Bank name" halfWidth />
            </div>
            <div className="mkv-row">
                <FormInput label="Branch *" value={bankForm.branch}
                    onChange={e => setBankForm(p => ({ ...p, branch: e.target.value }))} placeholder="Branch" halfWidth />
                <FormInput label="City" value={bankForm.city}
                    onChange={e => setBankForm(p => ({ ...p, city: e.target.value }))} placeholder="City" halfWidth />
            </div>
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER: KYC SUMMARY SIDEBAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const renderSummary = () => (
        <div className="mkv-summary-card">
            <div className="mkv-summary-title">
                <i className="fas fa-shield-alt"></i> KYC Status
            </div>
            <div className="mkv-summary-items">
                <div className="mkv-summary-item">
                    <span className={`mkv-dot ${kycData?.aadhar_verified ? 'green' : 'orange'}`}></span>
                    <span>Aadhaar</span>
                    <span className="mkv-summary-val">{kycData?.aadhar_number || '—'}</span>
                </div>
                <div className="mkv-summary-item">
                    <span className={`mkv-dot ${kycData?.pan_verified ? 'green' : 'orange'}`}></span>
                    <span>PAN</span>
                    <span className="mkv-summary-val">{kycData?.pan_number || '—'}</span>
                </div>
                <div className="mkv-summary-item">
                    <span className={`mkv-dot ${kycData?.account_verified ? 'green' : 'orange'}`}></span>
                    <span>Bank</span>
                    <span className="mkv-summary-val">{kycData?.account_number || '—'}</span>
                </div>
            </div>
            {kycData?.name && (
                <div className="mkv-summary-user">
                    <strong>{kycData.name}</strong>
                    <small>{kycData.dob} · {kycData.gender}</small>
                    <small>{kycData.dist}, {kycData.state} {kycData.pincode}</small>
                </div>
            )}
            <div className={`mkv-kyc-overall ${kycData?.kyc_completed ? 'complete' : 'incomplete'}`}>
                {kycData?.kyc_completed ? '✓ KYC Complete' : '⏳ KYC Incomplete'}
            </div>
        </div>
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MAIN RENDER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (loading) {
        return (
            <>
                <Pageheader currentpage="Manual KYC" activepage="Users" mainpage="Manual Verification" />
                <div className="app-content">
                    <div className="container-fluid">
                        <div className="mkv-loading"><i className="fas fa-spinner fa-spin"></i> Loading KYC data...</div>
                    </div>
                </div>
            </>
        );
    }

    if (!isAuthorized) {
        return (
            <>
                <Pageheader currentpage="Unauthorized" activepage="Users" mainpage="Manual KYC" />
                <div className="app-content">
                    <div className="container-fluid">
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <i className="fas fa-lock" style={{ fontSize: '64px', color: '#dc3545', marginBottom: '20px', display: 'block' }}></i>
                            <h3 style={{ color: '#dc3545', fontWeight: 700 }}>Access Denied</h3>
                            <p style={{ color: '#6c757d', marginTop: '10px' }}>Manual KYC verification is restricted to authorized administrators only.</p>
                            <Link to="/users/list" className="btn btn-primary mt-3"><i className="fas fa-arrow-left me-1"></i> Back to Users</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader currentpage="Manual KYC Verification" activepage="Users" mainpage="Manual KYC" />
            <div className="app-content">
                <div className="container-fluid">
                    <div className="mkv-layout">
                        {/* Left: Main Content */}
                        <div className="mkv-main">
                            {/* Tab Navigation */}
                            <div className="mkv-tabs">
                                <button className={`mkv-tab ${activeTab === 'aadhaar' ? 'active' : ''}`} onClick={() => setActiveTab('aadhaar')}>
                                    <i className="fas fa-id-card"></i> Aadhaar
                                    {kycData?.aadhar_verified && <span className="mkv-tab-check">✓</span>}
                                </button>
                                <button className={`mkv-tab ${activeTab === 'pan' ? 'active' : ''}`} onClick={() => setActiveTab('pan')}>
                                    <i className="fas fa-address-card"></i> PAN
                                    {kycData?.pan_verified && <span className="mkv-tab-check">✓</span>}
                                </button>
                                <button className={`mkv-tab ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')}>
                                    <i className="fas fa-university"></i> Bank Account
                                    {kycData?.account_verified && <span className="mkv-tab-check">✓</span>}
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'aadhaar' && renderAadhaarTab()}
                            {activeTab === 'pan' && renderPanTab()}
                            {activeTab === 'bank' && renderBankTab()}
                        </div>

                        {/* Right: Summary Sidebar */}
                        <div className="mkv-sidebar">
                            {renderSummary()}
                            <Link to="/users/list" className="mkv-btn mkv-btn-ghost" style={{ width: '100%', textAlign: 'center', marginTop: '12px' }}>
                                <i className="fas fa-arrow-left"></i> Back to Users
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />

            <style>{`
                /* ═══════════════════════════════════════════════
                   Manual KYC Verify — Banking Grade Premium UI
                   ═══════════════════════════════════════════════ */
                .mkv-layout { display: flex; gap: 20px; align-items: flex-start; }
                .mkv-main { flex: 1; min-width: 0; }
                .mkv-sidebar { width: 280px; flex-shrink: 0; position: sticky; top: 20px; }

                /* Tabs */
                .mkv-tabs {
                    display: flex; gap: 4px; background: #f1f3f5; border-radius: 10px;
                    padding: 4px; margin-bottom: 16px;
                }
                .mkv-tab {
                    flex: 1; padding: 10px 16px; border: none; border-radius: 8px;
                    background: transparent; color: #6b7280; font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all .2s; display: flex; align-items: center;
                    justify-content: center; gap: 8px;
                }
                .mkv-tab:hover { background: #e5e7eb; }
                .mkv-tab.active {
                    background: #fff; color: #1a1a2e; box-shadow: 0 1px 3px rgba(0,0,0,.1);
                }
                .mkv-tab-check {
                    background: #10b981; color: #fff; width: 18px; height: 18px;
                    border-radius: 50%; font-size: 10px; display: inline-flex;
                    align-items: center; justify-content: center;
                }

                /* Section */
                .mkv-section {
                    background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
                    padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
                }
                .mkv-section-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f3f5;
                }
                .mkv-section-title { font-size: 16px; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; }

                /* Badges */
                .mkv-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
                    letter-spacing: .3px; text-transform: uppercase;
                }
                .mkv-badge-verified { background: #d1fae5; color: #065f46; }
                .mkv-badge-pending { background: #fef3c7; color: #92400e; }

                /* Mode Group */
                .mkv-mode-group {
                    display: flex; gap: 4px; margin-bottom: 16px;
                    background: #f8f9fa; border-radius: 8px; padding: 3px;
                }
                .mkv-mode-btn {
                    flex: 1; padding: 8px 12px; border: none; border-radius: 6px;
                    background: transparent; color: #6b7280; font-size: 12px; font-weight: 600;
                    cursor: pointer; transition: all .15s; display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                }
                .mkv-mode-btn:hover { background: #e5e7eb; }
                .mkv-mode-btn.active {
                    background: #1a1a2e; color: #fff; box-shadow: 0 2px 4px rgba(26,26,46,.2);
                }

                /* Mode Content */
                .mkv-mode-content { animation: mkvFadeIn .2s ease; }
                @keyframes mkvFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

                .mkv-hint {
                    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
                    padding: 8px 12px; font-size: 11px; color: #1e40af; margin-bottom: 14px;
                }

                /* Form Layout */
                .mkv-form-grid { margin: 16px 0; }
                .mkv-form-divider {
                    font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase;
                    letter-spacing: .8px; margin: 16px 0 8px; padding-bottom: 4px;
                    border-bottom: 1px dashed #e5e7eb;
                }
                .mkv-row { display: flex; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
                .mkv-field { flex: 1; min-width: 200px; }
                .mkv-field-half { flex: 0 0 calc(50% - 6px); min-width: 180px; }
                .mkv-label {
                    display: block; font-size: 11px; font-weight: 600; color: #6b7280;
                    margin-bottom: 4px; text-transform: uppercase; letter-spacing: .3px;
                }
                .mkv-input {
                    width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px;
                    font-size: 13px; background: #fff; color: #1a1a2e; transition: border-color .15s;
                    outline: none;
                }
                .mkv-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
                .mkv-input:disabled { background: #f3f4f6; color: #9ca3af; }

                /* Buttons */
                .mkv-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
                    padding: 8px 18px; border: none; border-radius: 8px; font-size: 13px;
                    font-weight: 600; cursor: pointer; transition: all .15s; margin-top: 8px;
                }
                .mkv-btn:disabled { opacity: .6; cursor: not-allowed; }
                .mkv-btn-primary { background: #4f46e5; color: #fff; }
                .mkv-btn-primary:hover:not(:disabled) { background: #4338ca; }
                .mkv-btn-success { background: #059669; color: #fff; }
                .mkv-btn-success:hover:not(:disabled) { background: #047857; }
                .mkv-btn-warning { background: #d97706; color: #fff; }
                .mkv-btn-warning:hover:not(:disabled) { background: #b45309; }
                .mkv-btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }
                .mkv-btn-ghost:hover { background: #f3f4f6; }
                .mkv-btn-lg { width: 100%; padding: 12px; font-size: 14px; margin-top: 16px; }
                .mkv-btn-row { display: flex; gap: 8px; }

                /* JSON Preview */
                .mkv-json-panel {
                    margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
                }
                .mkv-json-header {
                    background: #1a1a2e; color: #a5b4fc; padding: 8px 12px; font-size: 11px;
                    font-weight: 700; display: flex; align-items: center; gap: 6px;
                }
                .mkv-json-body {
                    background: #0f0f1e; color: #c7d2fe; padding: 12px; font-size: 11px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace; margin: 0;
                    max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
                }

                /* Summary Card */
                .mkv-summary-card {
                    background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
                    padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
                }
                .mkv-summary-title {
                    font-size: 14px; font-weight: 700; color: #1a1a2e;
                    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
                }
                .mkv-summary-items { display: flex; flex-direction: column; gap: 8px; }
                .mkv-summary-item {
                    display: flex; align-items: center; gap: 8px; font-size: 12px;
                    color: #374151; padding: 6px 0; border-bottom: 1px solid #f3f4f6;
                }
                .mkv-summary-val { margin-left: auto; font-family: monospace; font-size: 11px; color: #6b7280; }
                .mkv-dot {
                    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
                }
                .mkv-dot.green { background: #10b981; }
                .mkv-dot.orange { background: #f59e0b; }
                .mkv-summary-user {
                    margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;
                    display: flex; flex-direction: column; gap: 2px;
                }
                .mkv-summary-user strong { font-size: 14px; color: #1a1a2e; }
                .mkv-summary-user small { font-size: 11px; color: #9ca3af; }
                .mkv-kyc-overall {
                    margin-top: 12px; padding: 8px; border-radius: 8px; text-align: center;
                    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
                }
                .mkv-kyc-overall.complete { background: #d1fae5; color: #065f46; }
                .mkv-kyc-overall.incomplete { background: #fef3c7; color: #92400e; }

                /* Loading */
                .mkv-loading {
                    text-align: center; padding: 60px; color: #6b7280; font-size: 14px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .mkv-layout { flex-direction: column-reverse; }
                    .mkv-sidebar { width: 100%; position: static; }
                    .mkv-field-half { flex: 1; min-width: 140px; }
                }
            `}</style>
        </>
    );
};

export default ManualKycVerify;
