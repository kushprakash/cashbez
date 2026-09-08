import React from 'react';
import Pageheader from '../layouts/Pageheader';

const AccountingDashboard = () => {
    return (
        <>
            <Pageheader
                currentpage="Accounting Dashboard"
                activepage="Accounting"
                mainpage="Dashboard"
            />
            
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <iconify-icon icon="solar:calculator-broken" class="fs-1 text-success mb-3"></iconify-icon>
                                <h3>Accounting Dashboard</h3>
                                <p className="text-muted">Manage your financial records and accounting operations.</p>
                                <div className="row mt-4">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-success">₹0</h4>
                                            <p className="text-muted">Revenue</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-danger">₹0</h4>
                                            <p className="text-muted">Expenses</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-primary">₹0</h4>
                                            <p className="text-muted">Profit</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-warning">0</h4>
                                            <p className="text-muted">Invoices</p>
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

export default AccountingDashboard;
