import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast } from 'react-toastify';

const SavingAccountAdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [statusForm, setStatusForm] = useState({
        status: 'pending',
        remarks: '',
        payout_amount: ''
    });

    useEffect(() => {
        fetchDashboardData();
        fetchList();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const apiService = ApiService();
            const res = await apiService.vGet('/api/online-service/saving-account/admin-dashboard');
            if (res.data.status === 1) setStats(res.data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchList = async () => {
        try {
            const apiService = ApiService();
            const res = await apiService.vGet('/api/online-service/saving-account/admin/list');
            if (res.data.status === 1) setData(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setStatusForm({
            status: item.status === 1 ? 'approved' : item.status === 2 ? 'rejected' : 'pending',
            remarks: item.remarks || '',
            payout_amount: item.payout_amount || ''
        });
        setShowModal(true);
    };

    const updateStatus = async () => {
        try {
            const apiService = ApiService();
            const res = await apiService.vPut(
                `/api/online-service/saving-account/${selectedItem.id}/status`,
                statusForm
            );

            if (res.data.status === 1) {
                toast.success(res.data.message);
                setShowModal(false);
                fetchList();
                fetchDashboardData();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Update failed');
        }
    };

    const filteredData = data.filter(item =>
        (item.customer_name || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (item.account_number || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const statusBadge = (status) => {
        if (status === 1) return <span className="badge bg-success">Approved</span>;
        if (status === 2) return <span className="badge bg-danger">Rejected</span>;
        return <span className="badge bg-secondary">Pending</span>;
    };

    return (
        <>
            <Pageheader mainheading="Admin Dashboard" parentfolder="Saving Account" activepage="Overview" />

            <div className="page-content-box">
                <div className="page-content-box-inner">

                    {/* Stats */}
                    <div className="row g-4 mb-4">
                        {[
                            { title: 'Total Apps', value: stats.total, cls: 'primary' },
                            { title: 'Pending', value: stats.pending, cls: 'warning text-dark' },
                            { title: 'Approved', value: stats.approved, cls: 'success' },
                            { title: 'Rejected', value: stats.rejected, cls: 'danger' }
                        ].map((s, i) => (
                            <div className="col-md-3" key={i}>
                                <div className={`card bg-${s.cls} text-white shadow-sm`}>
                                    <div className="card-body">
                                        <h6 className="opacity-75">{s.title}</h6>
                                        <h3 className="fw-bold">{s.value}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">
                            All Applications
                        </div>

                        <div className="card-body">
                            <input
                                className="form-control mb-3 w-25"
                                placeholder="Search..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                            />

                            {loading ? (
                                <div className="text-center py-5">Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>User</th>
                                                <th>Bank</th>
                                                <th>Customer</th>
                                                <th>Account</th>
                                                <th>Mobile</th>
                                                <th>Payout</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.length ? filteredData.map(row => (
                                                <tr key={row.id}>
                                                    <td>{row.id}</td>
                                                    <td>{row.user?.name || 'N/A'}</td>
                                                    <td>{row.bank_name}</td>
                                                    <td>{row.customer_name}</td>
                                                    <td>{row.account_number}</td>
                                                    <td>{row.mobile_number}</td>
                                                    <td>{row.payout_amount ? `₹${row.payout_amount}` : '-'}</td>
                                                    <td>{statusBadge(row.status)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => openModal(row)}
                                                        >
                                                            <i className="fa fa-edit" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="9" className="text-center">
                                                        No records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Status</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)} />
                            </div>

                            <div className="modal-body">
                                <select
                                    className="form-select mb-3"
                                    value={statusForm.status}
                                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <input
                                    className="form-control mb-3"
                                    type="number"
                                    placeholder="Payout Amount"
                                    value={statusForm.payout_amount}
                                    onChange={e => setStatusForm({ ...statusForm, payout_amount: e.target.value })}
                                />

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Remarks"
                                    value={statusForm.remarks}
                                    onChange={e => setStatusForm({ ...statusForm, remarks: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                                <button className="btn btn-primary" onClick={updateStatus}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SavingAccountAdminDashboard;
