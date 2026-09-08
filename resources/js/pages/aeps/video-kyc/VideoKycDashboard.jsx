import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../../layouts/Pageheader';
import VideoKycList from './VideoKycList';

const VideoKycDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');

    const tabs = [
        {
            key: 'pending',
            title: 'Pending List',
            icon: 'fa-clock-o',
            endpoint: '/api/v2/aeps/video-kyc/pending-list',
            description: 'video_kyc_status = 0 AND aeps_status = 0',
            badgeClass: 'bg-warning'
        },
        {
            key: 'verified',
            title: 'Verified List',
            icon: 'fa-check-circle',
            endpoint: '/api/v2/aeps/video-kyc/verified-list',
            description: 'video_kyc_status = 1 AND aeps_status = 0',
            badgeClass: 'bg-success'
        },
        {
            key: 'old',
            title: 'Old List',
            icon: 'fa-archive',
            endpoint: '/api/v2/aeps/video-kyc/old-list',
            description: 'video_kyc_status = 0 AND aeps_status > 0',
            badgeClass: 'bg-secondary'
        },
        {
            key: 'rejected',
            title: 'Rejected List',
            icon: 'fa-ban',
            endpoint: '/api/v2/aeps/video-kyc/rejected-list',
            description: 'Rejected applications with remarks',
            badgeClass: 'bg-danger'
        }
    ];

    const currentTab = tabs.find(tab => tab.key === activeTab);


    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader
                mainheading="AEPS Video KYC Management"
                parentfolder="Banking"
                activepage="Video KYC"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Info Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body bg-light">
                                    <h5 className="mb-3">
                                        <i className="fa fa-info-circle text-primary me-2"></i>
                                        Video KYC Management Dashboard
                                    </h5>
                                    <p className="mb-2">
                                        This dashboard allows you to manage AEPS Video KYC verification requests.
                                        Review user details, verify documents, and approve or reject applications.
                                    </p>
                                    <div className="row mt-3">
                                        <div className="col-md-3">
                                            <div className="alert alert-warning mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Pending:</strong> Awaiting KYC
                                                    </div>
                                                    <Link to="/aeps/video-kyc/pending-list" className="btn btn-sm btn-warning">
                                                        <i className="fa fa-eye me-1"></i>
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="alert alert-success mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Verified:</strong> KYC approved
                                                    </div>
                                                    <Link to="/aeps/video-kyc/verified-list" className="btn btn-sm btn-success">
                                                        <i className="fa fa-eye me-1"></i>
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="alert alert-secondary mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Old:</strong> AEPS onboarded
                                                    </div>
                                                    <Link to="/aeps/video-kyc/old-list" className="btn btn-sm btn-secondary">
                                                        <i className="fa fa-eye me-1"></i>
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="alert alert-danger mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>Rejected:</strong> With remarks
                                                    </div>
                                                    <Link to="/aeps/video-kyc/rejected-list" className="btn btn-sm btn-danger">
                                                        <i className="fa fa-eye me-1"></i>
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="row">
                        <div className="col-12">
                            <ul className="nav nav-tabs mb-3" role="tablist">
                                {tabs.map(tab => (
                                    <li className="nav-item" key={tab.key}>
                                        <button
                                            className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab.key)}
                                            type="button"
                                        >
                                            <i className={`fa ${tab.icon} me-2`}></i>
                                            {tab.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {currentTab && (
                                    <div className="tab-pane fade show active">
                                        <VideoKycList
                                            apiEndpoint={currentTab.endpoint}
                                            listTitle={currentTab.title}
                                            listType={currentTab.key}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoKycDashboard;
