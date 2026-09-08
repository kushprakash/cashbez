import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { Link } from 'react-router-dom';

const IncomeTaxDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const apiService = ApiService();
                const response = await apiService.vGet('/api/online-service/income-tax/dashboard');
                if (response.data?.status === 1) setStats(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <Pageheader mainheading="Income Tax Dashboard" parentfolder="Online Services" activepage="Income Tax" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-primary text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">My Applications</h6>
                                    <h3 className="mb-0 fw-bold">{stats.total}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-warning text-dark h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Pending</h6>
                                    <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-success text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Approved</h6>
                                    <h3 className="mb-0 fw-bold">{stats.approved}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 bg-danger text-white h-100">
                                <div className="card-body">
                                    <h6 className="opacity-75 mb-2">Rejected</h6>
                                    <h3 className="mb-0 fw-bold">{stats.rejected}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100 hover-lift cursor-pointer">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-file-invoice-dollar text-primary opacity-25" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3 fw-bold">File Income Tax</h4>
                                    <p className="text-muted mb-4 opacity-75">File your ITR for Salary or Business easily.</p>
                                    <Link to="/income-tax/create" className="btn btn-primary px-4 py-2 shadow-sm">File Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100 hover-lift cursor-pointer">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-history text-success opacity-25" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3 fw-bold">Application History</h4>
                                    <p className="text-muted mb-4 opacity-75">View status, download receipts and more.</p>
                                    <Link to="/income-tax/list" className="btn btn-outline-primary px-4 py-2 border-2 fw-medium">View History</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hover-lift { transition: transform 0.2s; }
                .hover-lift:hover { transform: translateY(-5px); }
            `}</style>
        </>
    );
};

export default IncomeTaxDashboard;
