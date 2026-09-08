import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';

/* ---------------- INFO CARD COMPONENT ---------------- */
const InfoCard = ({ title, items, icon, badge }) => (
    <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
            <i className={`fa ${icon} text-primary me-2`}></i>
            <h5 className="mb-0 fw-bold">{title}</h5>
            {badge && <span className="badge bg-danger ms-auto">{badge}</span>}
        </div>
        <div className="card-body p-4">
            <ul className="list-group list-group-flush">
                {items?.map((item, idx) => (
                    <li key={idx} className="list-group-item border-0 ps-0">
                        <i className="fa fa-check-circle text-success me-2"></i>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

/* ---------------- MAIN COMPONENT ---------------- */
const CreateSavingAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    const bankId = searchParams.get('bank');

    /* ---------------- BANK JSON ---------------- */
    const banks = {
        tide: {
            id: "tide",
            name: "Tide Saving Account",
            link: "https://tide.u9ilnk.me/d/wfMzcF2nYl?deep_link_sub1=THN123",
            banner_color: "bg-primary",

            target_audience: [
                "Applicant must be at least 18 years old",
                "Applicant must be a resident of India",
                "Applicant must have PAN & Aadhaar",
                "Mobile must be linked with Aadhaar",
                "Android device is required"
            ],

            terms_conditions: [
                "Only new users are eligible",
                "One account per device allowed",
                "Fraud cases will lead to blocking",
                "Referral code CMC123 is mandatory",
                "Journey must be completed in one go"
            ],

            instructions: [
                "Click on Open Account Now",
                "Redirected to Tide official website",
                "Complete registration and KYC",
                "Return here after account creation",
                "Submit registered mobile number"
            ]
        },

        airtel: {
            id: "airtel",
            name: "Airtel Payments Bank",
            link: "https://trkkcoin.com/IT2993M9W1/4C3LNP?ln=English",
            banner_color: "bg-warning text-dark",

            target_audience: [
                "Indian resident only",
                "Age must be 18+",
                "Only new users allowed",
                "Mobile must be linked with Aadhaar",
            ],

            terms_conditions: [
                "Minimum deposit ₹100",
                "Airtel Thanks App must not be installed",
                "Only one account per device",
                "Fraud leads to cancellation"
            ],

            instructions: [
                "Click Open Account Now",
                "Download Airtel Thanks App",
                "Upgrade to Savings Account",
                "Complete e-KYC",
                "Submit details here"
            ]
        },

        kotak: {
            id: "kotak",
            name: "Kotak 811 Saving Account",
            link: "https://trkkcoin.com/IT2162NSN3/4C3LNP?ln=English",
            banner_color: "bg-danger",

            target_audience: [
                "New users only",
                "Age must be 18+",
                "PAN & Aadhaar mandatory",
                "Mobile must be linked with Aadhaar",
            ],

            terms_conditions: [
                "Minimum deposit ₹1000",
                "Zero balance account",
                "Kotak Lite not eligible",
                "Only one account per device",
                "Journey must be completed in one session"
            ],

            instructions: [
                "Click Open Account Now",
                "Fill Kotak 811 form",
                "Complete Video KYC",
                "Account activation",
                "Submit details here"
            ]
        }
    };

    const id = bankId || location.state?.bank?.id;
    const selectedBank = banks[id];

    const [formData, setFormData] = useState({
        bank_name: '',
        customer_name: '',
        mobile_number: '',
        account_number: ''
    });

    useEffect(() => {
        if (!selectedBank) {
            toast.error("Invalid Bank Selection");
            navigate('/saving-account');
        } else {
            setFormData(prev => ({
                ...prev,
                bank_name: selectedBank.name
            }));
        }
    }, [selectedBank, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenLink = () => {
        window.open(selectedBank.link, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiService = ApiService();
            const res = await apiService.postWithFile(
                '/api/online-service/saving-account',
                formData
            );

            if (res.data.status === 1) {
                toast.success(res.data.message);
                navigate('/saving-account/list');
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!selectedBank) return null;

    return (
        <>
            <Pageheader
                mainheading="Apply for Saving Account"
                parentfolder="Saving Account"
                activepage="Create"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className='row'>
                        <div className='col-md-4'>
                            {/* -------- BANNER -------- */}
                            <div className={`card border-0 shadow-sm mb-4 text-white ${selectedBank.banner_color}`}>
                                <div className="card-body p-5">
                                    <h2 className="fw-bold">{selectedBank.name}</h2>
                                    <p className="lead">Follow the steps below carefully</p>
                                    <button
                                        className="btn btn-light btn-lg fw-bold"
                                        onClick={handleOpenLink}
                                    >
                                        Open Account Now <i className="fa fa-external-link ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='col-md-8'>
                            {/* -------- FORM -------- */}
                            <form onSubmit={handleSubmit}>
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Customer Name</label>
                                                <input
                                                    className="form-control"
                                                    name="customer_name"
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Mobile Number</label>
                                                <input
                                                    className="form-control"
                                                    name="mobile_number"
                                                    maxLength="10"
                                                    pattern="[0-9]{10}"
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label">
                                                    Account Number / Application ID
                                                </label>
                                                <input
                                                    className="form-control form-control-lg"
                                                    name="account_number"
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg"
                                                disabled={loading}
                                            >
                                                {loading ? "Submitting..." : "Submit Details"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* -------- INFO CARDS -------- */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <InfoCard
                                title="Target Audience"
                                icon="fa-users"
                                items={selectedBank.target_audience}
                            />
                        </div>

                        <div className="col-md-4">
                            <InfoCard
                                title="Terms & Conditions"
                                icon="fa-file-contract"
                                badge="Mandatory"
                                items={selectedBank.terms_conditions}
                            />
                        </div>

                        <div className="col-md-4">
                            <InfoCard
                                title="Instructions"
                                icon="fa-list-ol"
                                items={selectedBank.instructions}
                            />
                        </div>
                    </div>



                </div>
            </div>
        </>
    );
};

export default CreateSavingAccount;
