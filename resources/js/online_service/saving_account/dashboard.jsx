import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const SavingAccountDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    // Hardcoded Bank List for now (as per requirement: Tide, Kotak, Airtel)
    const banks = [
        {
            id: 'tide',
            name: 'Tide Saving Account',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tide_logo.svg/200px-Tide_logo.svg.png', // Replace with actual assets
            description: 'Open a business account with Tide in minutes.',
            link: 'https://www.tide.co/', // Placeholder
            color: 'bg-primary-subtle text-primary border-primary'
        },
        {
            id: 'kotak',
            name: 'Kotak Mahindra Saving Account',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Kotak_Mahindra_Bank_logo.svg',
            description: 'Get high interest rate on your savings with Kotak 811.',
            link: 'https://www.kotak.com/en/home.html', // Placeholder
            color: 'bg-danger-subtle text-danger border-danger'
        },
        {
            id: 'airtel',
            name: 'Airtel Payment Bank Saving Account',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Airtel_Payment_Bank.png',
            description: 'Secure and easy digital payments with Airtel Bank.',
            link: 'https://www.airtel.in/bank/', // Placeholder
            color: 'bg-warning-subtle text-warning border-warning'
        },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const api = ApiService();
                const response = await api.get('/api/online-service/saving-account/dashboard');
                if (response.data.status === 1) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleBankClick = (bank) => {
        // Navigate to instruction page or create page with selected bank
        navigate(`/saving-account/create?bank=${bank.id}`, { state: { bank } });
    };

    return (
        <>
            <Pageheader mainheading="Saving Accounts" parentfolder="Online Services" activepage="Dashboard" />
            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Stats Section */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm overflow-hidden h-100">
                                <div className="card-body bg-primary text-white d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 text-white-50 small text-uppercase fw-bold">Total Applications</p>
                                        <h3 className="mb-0 fw-bold display-6">{stats.total}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                        <i className="fa fa-university fa-2x text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm overflow-hidden h-100">
                                <div className="card-body bg-warning text-dark d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 text-dark-50 small text-uppercase fw-bold">Pending</p>
                                        <h3 className="mb-0 fw-bold display-6">{stats.pending}</h3>
                                    </div>
                                    <div className="bg-dark bg-opacity-10 rounded-circle p-3">
                                        <i className="fa fa-clock fa-2x text-dark"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm overflow-hidden h-100">
                                <div className="card-body bg-success text-white d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 text-white-50 small text-uppercase fw-bold">Approved</p>
                                        <h3 className="mb-0 fw-bold display-6">{stats.approved}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                        <i className="fa fa-check-circle fa-2x text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm overflow-hidden h-100">
                                <div className="card-body bg-danger text-white d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 text-white-50 small text-uppercase fw-bold">Rejected</p>
                                        <h3 className="mb-0 fw-bold display-6">{stats.rejected}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                                        <i className="fa fa-times-circle fa-2x text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Selection Section */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-dark">Available Saving Accounts</h5>
                            <button className="btn btn-primary" onClick={() => navigate('/saving-account/list')}>View My Applications</button>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                {banks.map(bank => (
                                    <div className="col-md-4" key={bank.id}>
                                        <div
                                            className={`card h-100 border-2 border-start-0 border-end-0 border-top-0 border-bottom-0 shadow-sm bank-card ${bank.color.replace('bg-', 'border-')}`}
                                            style={{ transition: 'all 0.3s ease', cursor: 'pointer', borderLeft: '5px solid' }}
                                            onClick={() => handleBankClick(bank)}
                                        >
                                            <div className="card-body text-center p-5 d-flex flex-column justify-content-between">
                                                <div className="mb-4 d-flex align-items-center justify-content-center" style={{ height: '60px' }}>
                                                    {/* Using Icon for now if logo fails, practically should be proper logo */}
                                                    <i className="fa fa-bank fa-3x text-secondary"></i>
                                                </div>
                                                <div>
                                                    <h4 className="fw-bold mb-2 text-dark">{bank.name}</h4>
                                                    <p className="text-secondary mb-4 small">{bank.description}</p>
                                                </div>
                                                <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold">Apply Now <i className="fa fa-arrow-right ms-1"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                .bank-card:hover {
                    transfrom: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </>
    );
};

export default SavingAccountDashboard;
