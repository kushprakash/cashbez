import React from 'react';
import Pageheader from '../layouts/Pageheader';

const LoanDashboard = () => {
    return (
        <>
            <Pageheader
                currentpage="Loan Dashboard"
                activepage="Loan"
                mainpage="Dashboard"
            />
            
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <iconify-icon icon="solar:hand-money-broken" class="fs-1 text-warning mb-3"></iconify-icon>
                                <h3>Loan Management Dashboard</h3>
                                <p className="text-muted">Track and manage loan applications and disbursements.</p>
                                <div className="row mt-4">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-primary">0</h4>
                                            <p className="text-muted">Active Loans</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-warning">0</h4>
                                            <p className="text-muted">Pending Applications</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-success">₹0</h4>
                                            <p className="text-muted">Disbursed Amount</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-danger">₹0</h4>
                                            <p className="text-muted">Outstanding</p>
                                        </div>
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

export default LoanDashboard;
