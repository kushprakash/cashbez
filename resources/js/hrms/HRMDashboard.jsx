import React from 'react';
import Pageheader from '../layouts/Pageheader';

const HRMDashboard = () => {

    const getTimeBasedGreeting = (name) => {
        name = capitalizeText(name.split(" ")[0]);
        const hours = new Date().getHours();
        if (hours < 12) return `🌞 Good Morning! ${name}, Have a bright and beautiful day!`;
        if (hours < 18) return `☀️ Good Afternoon!  ${name}, Keep shining and stay positive!`;
        return `🌙 Good Evening! ${name}, Relax and unwind, you deserve it!`;
    };


    function capitalizeText(text) {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <>
            <Pageheader mainheading="Welcome to Dashboard" parentfolder="HRMS" activepage="Dashboard" />
            
            <div className="page-content-box">
                <div className="container-fluid">
                    <div className="stats-card mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{getTimeBasedGreeting('Prakash')}</h5>
                            <i className="fas fa-sync-alt" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center py-5">
                                    <iconify-icon icon="solar:users-group-two-rounded-broken" class="fs-1 text-success mb-3"></iconify-icon>
                                    <h3>Human Resources Dashboard</h3>
                                    <p className="text-muted">Manage employee records, attendance, and HR operations.</p>
                                    <div className="row mt-4">
                                        <div className="col-md-3">
                                            <div className="stat-card">
                                                <h4 className="text-primary">0</h4>
                                                <p className="text-muted">Total Employees</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="stat-card">
                                                <h4 className="text-success">0</h4>
                                                <p className="text-muted">Present Today</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="stat-card">
                                                <h4 className="text-warning">0</h4>
                                                <p className="text-muted">On Leave</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="stat-card">
                                                <h4 className="text-info">0</h4>
                                                <p className="text-muted">Departments</p>
                                            </div>
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

export default HRMDashboard;