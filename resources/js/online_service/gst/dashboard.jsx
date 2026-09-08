import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { Link } from 'react-router-dom';

const GstDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const apiService = ApiService();
                const response = await apiService.vGet('/api/online-service/gst/dashboard');
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
            <Pageheader mainheading="GST Dashboard" parentfolder="GST" activepage="Dashboard" />
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

                    <div className="row">
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-file-invoice text-primary opacity-25" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3 fw-bold">New GST Application</h4>
                                    <p className="text-muted mb-4">Apply for a new GST registration easily.</p>
                                    <Link to="/gst/create" className="btn btn-primary px-4 py-2">Apply Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-list-check text-success opacity-25" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3 fw-bold">Track Applications</h4>
                                    <p className="text-muted mb-4">View status and history of your applications.</p>
                                    <Link to="/gst/list" className="btn btn-outline-primary px-4 py-2">View List</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GstDashboard;
