import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../../layouts/Pageheader';
import VideoKycList from './VideoKycList';

const OldList = () => {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader 
                mainheading="AEPS Video KYC - Old List" 
                parentfolder="Banking"
                activepage="Old List"
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Info Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-secondary border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-archive fa-2x text-secondary me-3"></i>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Legacy Applications</h6>
                                        <p className="mb-0 small">
                                            Previously onboarded applications that skipped video KYC verification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Component */}
                    <VideoKycList
                        apiEndpoint="/api/v2/aeps/video-kyc/old-list"
                        listTitle="Old Applications"
                        listType="old"
                    />
                </div>
            </div>
        </>
    );
};

export default OldList;
