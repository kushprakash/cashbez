import React from 'react';
import { useNavigate } from 'react-router-dom';

const DownloadTnc = () => {
    const navigate = useNavigate();

    return (
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 px-4 px-md-5 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 fw-bold d-flex align-items-center gap-3" style={{ color: '#1e293b' }}>
                            <i className="fas fa-shield-alt text-primary"></i>
                            Terms & Conditions and Data Usage Policy
                        </h4>
                        <button className="btn btn-light rounded-circle" onClick={() => navigate(-1)} title="Go Back">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="card-body p-4 p-md-5 text-secondary" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                    <p className="mb-4 lead text-dark">
                        By using the online document download and verification services provided on our platform, you agree to the following strict compliance conditions. Please read these carefully before proceeding.
                    </p>

                    <h6 className="fw-bold text-dark mt-4 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>1. Explicit Consent & Authorization</h6>
                    <p className="mb-4">
                        You voluntarily provide your document number (and OTP or Date of Birth if applicable) strictly for the purpose of verifying and fetching your digital document from authorized government APIs and central registries.
                        By submitting this information, you authorize us to act as a technology facilitator to retrieve these records on your behalf.
                    </p>

                    <h6 className="fw-bold text-dark mt-4 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>2. Data Collection, Storage, & Security</h6>
                    <p className="mb-2">
                        We prioritize your privacy and strictly adhere to data protection standards:
                    </p>
                    <ul className="mb-4 ps-4">
                        <li className="mb-2"><strong>No Raw Storage:</strong> We do not store your raw document files or high-resolution images on our servers. The document is fetched securely in real-time from the source.</li>
                        <li className="mb-2"><strong>Metadata Logging:</strong> We only store necessary verification metadata (such as reference numbers and timestamps) and an encrypted log of the transaction so you can view your past download history.</li>
                        <li className="mb-2"><strong>Encryption:</strong> All data transmissions between your device, our platform, and government gateways are encrypted using TLS/SSL protocols.</li>
                    </ul>

                    <h6 className="fw-bold text-dark mt-4 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>3. Permitted Usage & Personal Responsibility</h6>
                    <p className="mb-4">
                        The verified document and the corresponding receipt generated are strictly for your <strong>personal, non-commercial use</strong>.
                        You are solely responsible for the physical prints or digital copies you choose to generate or share. Do not share your downloaded, sensitive documents with unauthorized individuals. We are not liable for any misuse of the downloaded files by you or third parties.
                    </p>

                    <h6 className="fw-bold text-dark mt-4 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>4. Disclaimer of Liability & Accuracy</h6>
                    <p className="mb-4">
                        Our service acts solely as a technological bridge to fetch documents from centralized databases (e.g., UIDAI, NSDL, Parivahan, Election Commission).
                        We do not alter, verify, or guarantee the absolute correctness of the data provided by these issuing authorities. We hold no liability for errors, omissions, or the accuracy of the records, nor for any service downtime originating from the source APIs.
                    </p>

                    <h6 className="fw-bold text-dark mt-4 mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>5. Payment & Commission</h6>
                    <p className="mb-4">
                        Transactions involve a service charge as indicated at the time of download. Any commissions or wallet deductions are processed immediately upon successful document retrieval.
                        In case of an API failure where the wallet is deducted but the document is not delivered, a standard refund/reversal policy applies according to our platform's general terms.
                    </p>

                    <div className="mt-5 pt-4 border-top text-center">
                        <p className="mb-0 text-muted small">
                            Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} <br />
                            This policy is compliant with digital data protection guidelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadTnc;
