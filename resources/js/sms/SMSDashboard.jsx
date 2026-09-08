import React from 'react';
import Pageheader from '../layouts/Pageheader';

const SMSDashboard = () => {
    return (
        <>
            <Pageheader
                currentpage="SMS Dashboard"
                activepage="SMS"
                mainpage="Dashboard"
            />
            
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <iconify-icon icon="solar:chat-round-broken" class="fs-1 text-primary mb-3"></iconify-icon>
                                <h3>SMS Services Dashboard</h3>
                                <p className="text-muted">Manage SMS campaigns and messaging services.</p>
                                <div className="row mt-4">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-success">0</h4>
                                            <p className="text-muted">Sent Messages</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-warning">0</h4>
                                            <p className="text-muted">Pending</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-danger">0</h4>
                                            <p className="text-muted">Failed</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <h4 className="text-info">0</h4>
                                            <p className="text-muted">Templates</p>
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

export default SMSDashboard;
