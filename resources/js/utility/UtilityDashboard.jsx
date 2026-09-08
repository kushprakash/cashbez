import React from 'react';
import Pageheader from '../layouts/Pageheader';

const UtilityDashboard = () => {
    return (
        <>
            <Pageheader
                currentpage="Utility Dashboard"
                activepage="Utility"
                mainpage="Dashboard"
            />
            
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <iconify-icon icon="solar:settings-broken" class="fs-1 text-info mb-3"></iconify-icon>
                                <h3>Utility Services Dashboard</h3>
                                <p className="text-muted">Manage utility services and bill payments.</p>
                                <div className="row mt-4">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-primary">0</h4>
                                            <p className="text-muted">Electricity Bills</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-success">0</h4>
                                            <p className="text-muted">Water Bills</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-warning">0</h4>
                                            <p className="text-muted">Gas Bills</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-info">0</h4>
                                            <p className="text-muted">Internet Bills</p>
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

export default UtilityDashboard;
