import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import Pageheader from '../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../core/hooks/context';
import { retrieveTokenAndUserData } from '../core/auth/tokenManager';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ViewAccount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const apiService = ApiService();
    const { user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        if (id) {
            fetchAccountDetails(startDate, endDate);
        }
        // eslint-disable-next-line
    }, [id, startDate, endDate]);


    const fetchAccountDetails = async (filterStart, filterEnd) => {
        try {
            setLoading(true);
            const { token } = retrieveTokenAndUserData() || {};

            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                navigate('/signin');
                return;
            }

            let url = `/api/accounts/${id}`;
            let params = {};
            if (filterStart && filterEnd) {
                params.start_date = filterStart.toISOString().slice(0, 10);
                params.end_date = filterEnd.toISOString().slice(0, 10);
            }

            const response = await apiService.vGet(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params
            });

            if (response.data && response.data.status === 1) {
                setAccount(response.data.data.account);
                setTransactions(response.data.data.recent_transactions || []);
            } else {
                toast.error(response.data?.message || 'Failed to fetch account details');
                navigate('/banking/accounts');
            }

        } catch (error) {
            console.error('Error fetching account details:', error);
            toast.error('Failed to fetch account details');
            navigate('/banking/accounts');
        } finally {
            setLoading(false);
        }
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                <Pageheader mainheading="Account Details" parentfolder="Banking" activepage="View Account" />

                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-12">
                                <div className="card custom-card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading account details...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!account) {
        return (
            <>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
                <Pageheader mainheading="Account Details" parentfolder="Banking" activepage="View Account" />

                <div className="page-content-box">
                    <div className="page-content-box-inner">
                        <div className="row">
                            <div className="col-12">
                                <div className="card custom-card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <div className="mb-4">
                                            <iconify-icon icon="material-symbols:error" width="48" height="48" className="text-danger"></iconify-icon>
                                        </div>
                                        <h5 className="text-danger">Account Not Found</h5>
                                        <p className="text-muted">The requested account could not be found.</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/banking/accounts')}
                                        >
                                            Back to Accounts
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Account Details" parentfolder="Banking" activepage="View Account" />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">

                            {/* Recent Transactions */}
                            <div className="card custom-card border-0 shadow-sm">
                                <div className="card-header border-0 bg-transparent">

                                    <div className="row">

                                        <div className="row align-items-center mb-2">
                                            <div className="col-auto">
                                                <label className="text-muted small me-2">Filter by Date:</label>
                                            </div>
                                            <div className="col-auto">
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={date => setStartDate(date)}
                                                    selectsStart
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    placeholderText="Start Date"
                                                    className="form-control form-control-sm"
                                                    maxDate={endDate || new Date()}
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <span className="mx-2">to</span>
                                            </div>
                                            <div className="col-auto">
                                                <DatePicker
                                                    selected={endDate}
                                                    onChange={date => setEndDate(date)}
                                                    selectsEnd
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    minDate={startDate}
                                                    maxDate={new Date()}
                                                    placeholderText="End Date"
                                                    className="form-control form-control-sm"
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary ms-2"
                                                    onClick={() => { setStartDate(null); setEndDate(null); }}
                                                    disabled={!startDate && !endDate}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">

                                        <div className="col-md-2">
                                            <h5 className="card-title mb-1 text-dark fw-semibold">Recent Transactions</h5>
                                            <p className="text-muted mb-0 small">Latest transactions for this account</p>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="text-muted small">Account Number</label>
                                            <h6 className="mb-0 fw-bold">{account.number}</h6>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="text-muted small">Current Balance</label>
                                            <h5 className="mb-0 fw-bold text-success">{account.balance}</h5>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="text-muted small">Hold Amount</label>
                                            <h6 className="mb-0 fw-bold">{account.hold_amount}</h6>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="text-muted small">Available Balance</label>
                                            <h5 className="mb-0 fw-bold text-primary">{account.available_balance}</h5>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="text-muted small">Account Status</label>
                                            <h5 className="mb-0 fw-bold text-primary">{account.status === 1 ? 'Active' : 'Inactive'}</h5>
                                        </div>



                                    </div>

                                </div>
                                <div className="card-body pt-0">
                                    {transactions.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Type</th>
                                                        <th>Details</th>
                                                        <th>Pre</th>
                                                        <th>Amount</th>
                                                        <th>Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((transaction, index) => (
                                                        <tr key={index}>
                                                            <td>{transaction.date}</td>
                                                            <td>
                                                                <span className={`badge ${transaction.type === 'CR' ? 'bg-success-transparent text-success' : 'bg-danger-transparent text-danger'}`}>
                                                                    {transaction.type === 'CR' ? 'Credit' : 'Debit'}
                                                                </span>
                                                            </td>
                                                            <td>{transaction.details || '-'}</td>

                                                            <td>{transaction.pre_balance || '-'}</td>
                                                            <td>
                                                                <span className={transaction.type === 'CR' ? 'text-success' : 'text-danger'}>
                                                                    {transaction.amount}
                                                                </span>
                                                            </td>
                                                            <td>{transaction.balance || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="mb-3">
                                                <iconify-icon icon="material-symbols:receipt-long-off" width="48" height="48" className="text-muted"></iconify-icon>
                                            </div>
                                            <h6 className="text-muted">No Transactions Found</h6>
                                            <p className="text-muted small">No recent transactions available for this account.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewAccount;
