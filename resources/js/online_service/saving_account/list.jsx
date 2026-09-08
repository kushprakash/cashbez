import React, { useState, useEffect } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { Link } from 'react-router-dom';

const SavingAccountList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const apiService = ApiService();
            const response = await apiService.get('/api/online-service/saving-account');
            if (response.data.status === 1) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = data.filter(item =>
        (item.customer_name || '')
            .toLowerCase()
            .includes(filterText.toLowerCase())
    );

    const renderStatus = (status) => {
        if (status === 1) return <span className="badge bg-success">Approved</span>;
        if (status === 2) return <span className="badge bg-danger">Rejected</span>;
        return <span className="badge bg-secondary">Pending</span>;
    };

    return (
        <>
            <Pageheader
                mainheading="Application History"
                parentfolder="Saving Account"
                activepage="List"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">My Applications</h5>
                            <Link
                                to="/saving-account/dashboard"
                                className="btn btn-primary btn-sm"
                            >
                                <i className="fa fa-plus me-1" />
                                New Application
                            </Link>
                        </div>

                        <div className="card-body">

                            <input
                                type="text"
                                className="form-control w-25 mb-3"
                                placeholder="Filter by Customer Name"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />

                            {loading ? (
                                <div className="text-center py-5">Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Bank Name</th>
                                                <th>Customer Name</th>
                                                <th>Account No</th>
                                                <th>Mobile</th>
                                                <th>Status</th>
                                                <th>Payout</th>
                                                <th>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map((row) => (
                                                    <tr key={row.id}>
                                                        <td>
                                                            {new Date(row.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td>{row.bank_name}</td>
                                                        <td>{row.customer_name}</td>
                                                        <td>{row.account_number}</td>
                                                        <td>{row.mobile_number}</td>
                                                        <td>{renderStatus(row.status)}</td>
                                                        <td>
                                                            {row.payout_amount
                                                                ? `₹${row.payout_amount}`
                                                                : '-'}
                                                        </td>
                                                        <td>{row.remarks || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
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
        </>
    );
};

export default SavingAccountList;
