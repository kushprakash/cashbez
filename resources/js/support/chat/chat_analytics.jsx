import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import Pageheader from '../../layouts/Pageheader';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ComplaintDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [pendingActions, setPendingActions] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await complaintService.getDashboard();
            if (response.status === 1) {
                setStats(response.data.stats);
                setRecentComplaints(response.data.recent_complaints);
                setPendingActions(response.data.pending_actions);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            'NEW': 'bg-warning',
            'ASSIGNED': 'bg-info',
            'IN_PROGRESS': 'bg-primary',
            'RESOLVED': 'bg-success',
            'CLOSED': 'bg-secondary',
            'CANCELLED': 'bg-danger'
        };
        return badges[status] || 'bg-light';
    };

    const getCategoryBadgeClass = (category) => {
        const badges = {
            'TRANSACTION': 'bg-danger',
            'ACCOUNT': 'bg-warning',
            'TECHNICAL': 'bg-info',
            'BILLING': 'bg-secondary',
            'KYC': 'bg-primary',
            'OTHER': 'bg-light'
        };
        return badges[category] || 'bg-light';
    };

    const chartData = stats ? {
        labels: ['New', 'In Progress', 'Resolved', 'Closed'],
        datasets: [{
            data: [stats.new, stats.in_progress, stats.resolved, stats.closed],
            backgroundColor: [
                'rgba(255, 193, 7, 0.8)',
                'rgba(0, 123, 255, 0.8)',
                'rgba(40, 167, 69, 0.8)',
                'rgba(108, 117, 125, 0.8)',
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': ' + context.parsed;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Pageheader 
                mainheading="Complaint Dashboard" 
                parentfolder="Complaints" 
                activepage="Dashboard" 
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    
                    {/* Statistics Cards */}
                    <div className="row mb-4">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-lg bg-primary bg-opacity-10 text-primary rounded">
                                                <i className="fas fa-exclamation-circle fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 text-muted">Total Complaints</h6>
                                            <h3 className="mb-0 fw-bold">{stats?.total || 0}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-lg bg-warning bg-opacity-10 text-warning rounded">
                                                <i className="fas fa-clock fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 text-muted">New</h6>
                                            <h3 className="mb-0 fw-bold">{stats?.new || 0}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-lg bg-success bg-opacity-10 text-success rounded">
                                                <i className="fas fa-check-circle fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 text-muted">Resolved</h6>
                                            <h3 className="mb-0 fw-bold">{stats?.resolved || 0}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar avatar-lg bg-info bg-opacity-10 text-info rounded">
                                                <i className="fas fa-tasks fa-2x"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-1 text-muted">Pending Actions</h6>
                                            <h3 className="mb-0 fw-bold">{pendingActions}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* Status Chart */}
                        <div className="col-lg-4 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">Status Distribution</h5>
                                </div>
                                <div className="card-body">
                                    <div style={{ height: '300px' }}>
                                        {chartData && <Doughnut data={chartData} options={chartOptions} />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Complaints */}
                        <div className="col-lg-8 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Recent Complaints</h5>
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={() => navigate('/complaints/list')}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Title</th>
                                                    <th>Category</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentComplaints.map((complaint) => (
                                                    <tr 
                                                        key={complaint.complaint_id}
                                                        onClick={() => navigate(`/complaints/view/${complaint.complaint_id}`)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <td className="fw-bold">{complaint.complaint_id}</td>
                                                        <td>{complaint.title}</td>
                                                        <td>
                                                            <span className={`badge ${getCategoryBadgeClass(complaint.category)}`}>
                                                                {complaint.category}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                                                                {complaint.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(complaint.created_on).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComplaintDashboard;