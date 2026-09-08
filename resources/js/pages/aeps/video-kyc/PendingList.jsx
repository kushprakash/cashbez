import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../../layouts/Pageheader';
import VideoKycList from './VideoKycList';

const PendingList = () => {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader 
                mainheading="AEPS Video KYC - Pending List" 
                parentfolder="Banking"
                activepage="Pending List"
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Info Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-warning border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-clock-o fa-2x text-warning me-3"></i>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Pending Verification</h6>
                                        <p className="mb-0 small">
                                            New applications waiting for admin review and video KYC approval.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Component */}
                    <VideoKycList
                        apiEndpoint="/api/v2/aeps/video-kyc/pending-list"
                        listTitle="Pending Applications"
                        listType="pending"
                    />
                </div>
            </div>
        </>
    );
};

export default PendingList;
