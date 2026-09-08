import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';
import Pageheader from '../../layouts/Pageheader';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const WorkloadReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const roles = [
        { value: '', label: 'All Roles' },
        { value: 'HelpDesk', label: 'Help Desk' },
        { value: 'CoreCommittee', label: 'Core Committee' },
        { value: 'Admin', label: 'Admin' },
        { value: 'SuperAdmin', label: 'Super Admin' }
    ];

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchWorkloadReport();
        }
    }, [selectedRole, currentUser]);

    const fetchCurrentUser = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(user);
    };

    const fetchWorkloadReport = async () => {
        try {
            setLoading(true);
            const response = await complaintService.getWorkloadReport(selectedRole);
            if (response.status === 1) {
                setReportData(response.data);
            } else {
                alert(response.message || 'Error fetching workload report');
            }
        } catch (error) {
            console.error('Error fetching workload report:', error);
            alert('Error loading workload report');
        } finally {
            setLoading(false);
        }
    };

    const getStatusChartData = () => {
        if (!reportData?.summary) return null;

        const summary = reportData.summary;
        return {
            labels: ['New', 'In Progress', 'Resolved', 'Closed'],
            datasets: [{
                label: 'Complaints by Status',
                data: [
                    summary.new_count || 0,
                    summary.in_progress_count || 0,
                    summary.resolved_count || 0,
                    summary.closed_count || 0
                ],
                backgroundColor: [
                    'rgba(13, 202, 240, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(25, 135, 84, 0.8)',
                    'rgba(108, 117, 125, 0.8)'
                ],
                borderColor: [
                    'rgb(13, 202, 240)',
                    'rgb(255, 193, 7)',
                    'rgb(25, 135, 84)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 2
            }]
        };
    };

    const getWorkloadBarData = () => {
        if (!reportData?.staff_workload) return null;

        const staffData = reportData.staff_workload.slice(0, 10); // Top 10 staff
        return {
            labels: staffData.map(s => s.name),
            datasets: [
                {
                    label: 'New',
                    data: staffData.map(s => s.new_count || 0),
                    backgroundColor: 'rgba(13, 202, 240, 0.8)',
                },
                {
                    label: 'In Progress',
                    data: staffData.map(s => s.in_progress_count || 0),
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                },
                {
                    label: 'Resolved',
                    data: staffData.map(s => s.resolved_count || 0),
                    backgroundColor: 'rgba(25, 135, 84, 0.8)',
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        scales: {
            x: {
                stacked: false
            },
            y: {
                stacked: false,
                beginAtZero: true
            }
        }
    };

    const getWorkloadBadgeClass = (count, avgWorkload) => {
        if (count === 0) return 'badge bg-secondary';
        const ratio = count / avgWorkload;
        if (ratio < 0.7) return 'badge bg-success';
        if (ratio < 1.0) return 'badge bg-info';
        if (ratio < 1.3) return 'badge bg-warning text-dark';
        return 'badge bg-danger';
    };

    const getWorkloadStatus = (count, avgWorkload) => {
        if (count === 0) return 'No Load';
        const ratio = count / avgWorkload;
        if (ratio < 0.7) return 'Light';
        if (ratio < 1.0) return 'Normal';
        if (ratio < 1.3) return 'Heavy';
        return 'Overloaded';
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Workload Report" />
                <div className="page-content-box">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader 
                mainheading="Workload Report"
                parentfolder="Complaints"
                activepage="Staff Workload"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Filter Section */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Filter by Role</label>
                                    <select
                                        className="form-select"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 text-end">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={fetchWorkloadReport}
                                    >
                                        <i className="fas fa-sync-alt me-2"></i>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    {reportData?.summary && (
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">Total Complaints</h6>
                                                <h3 className="mb-0">{reportData.summary.total_complaints || 0}</h3>
                                            </div>
                                            <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                <i className="fas fa-clipboard-list fa-2x text-primary"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">Active Staff</h6>
                                                <h3 className="mb-0">{reportData.summary.active_staff || 0}</h3>
                                            </div>
                                            <div className="bg-success bg-opacity-10 p-3 rounded">
                                                <i className="fas fa-users fa-2x text-success"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">Avg per Staff</h6>
                                                <h3 className="mb-0">{reportData.summary.avg_per_staff?.toFixed(1) || 0}</h3>
                                            </div>
                                            <div className="bg-info bg-opacity-10 p-3 rounded">
                                                <i className="fas fa-balance-scale fa-2x text-info"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1">Pending</h6>
                                                <h3 className="mb-0">
                                                    {(reportData.summary.new_count || 0) + (reportData.summary.in_progress_count || 0)}
                                                </h3>
                                            </div>
                                            <div className="bg-warning bg-opacity-10 p-3 rounded">
                                                <i className="fas fa-exclamation-circle fa-2x text-warning"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Charts Row */}
                    <div className="row mb-4">
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-chart-pie me-2 text-primary"></i>
                                        Status Distribution
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {getStatusChartData() && (
                                        <Doughnut data={getStatusChartData()} options={chartOptions} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-0">
                                    <h5 className="mb-0 fw-bold">
                                        <i className="fas fa-chart-bar me-2 text-primary"></i>
                                        Top 10 Staff Workload
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {getWorkloadBarData() && (
                                        <Bar data={getWorkloadBarData()} options={barChartOptions} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staff Workload Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0 fw-bold">
                                <i className="fas fa-table me-2 text-primary"></i>
                                Detailed Staff Workload
                            </h5>
                        </div>
                        <div className="card-body">
                            {reportData?.staff_workload && reportData.staff_workload.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Staff Name</th>
                                                <th>Role</th>
                                                <th className="text-center">New</th>
                                                <th className="text-center">In Progress</th>
                                                <th className="text-center">Resolved</th>
                                                <th className="text-center">Total Assigned</th>
                                                <th className="text-center">Workload Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.staff_workload.map((staff, index) => {
                                                const totalAssigned = staff.total_assigned || 0;
                                                const avgWorkload = reportData.summary?.avg_per_staff || 1;
                                                
                                                return (
                                                    <tr key={staff.user_id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <strong>{staff.name}</strong>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-secondary">
                                                                {staff.role}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-info">
                                                                {staff.new_count || 0}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-warning text-dark">
                                                                {staff.in_progress_count || 0}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-success">
                                                                {staff.resolved_count || 0}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <strong>{totalAssigned}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className={getWorkloadBadgeClass(totalAssigned, avgWorkload)}>
                                                                {getWorkloadStatus(totalAssigned, avgWorkload)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <th colspan="3">Total</th>
                                                <th className="text-center">{reportData.summary?.new_count || 0}</th>
                                                <th className="text-center">{reportData.summary?.in_progress_count || 0}</th>
                                                <th className="text-center">{reportData.summary?.resolved_count || 0}</th>
                                                <th className="text-center">{reportData.summary?.total_complaints || 0}</th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="fas fa-users-slash fa-4x text-muted mb-3"></i>
                                    <p className="text-muted">No staff workload data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Section for SuperAdmin */}
                    {currentUser?.role === 'SuperAdmin' && (
                        <div className="card border-0 shadow-sm mt-4">
                            <div className="card-body">
                                <div className="alert alert-info mb-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="fas fa-info-circle me-2"></i>
                                            <strong>Workload Management:</strong> As a Super Admin, you can review staff workload and reassign complaints to balance the load.
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/complaints/list')}
                                        >
                                            <i className="fas fa-tasks me-2"></i>
                                            Manage Assignments
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WorkloadReport;
