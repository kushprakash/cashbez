import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pageheader from '../../../layouts/Pageheader';
import VideoKycList from './VideoKycList';

const VerifiedList = () => {
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Pageheader 
                mainheading="AEPS Video KYC - Verified List" 
                parentfolder="Banking"
                activepage="Verified List"
            />
            
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    {/* Info Card */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-success border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-check-circle fa-2x text-success me-3"></i>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Verified Applications</h6>
                                        <p className="mb-0 small">
                                            Applications approved through video KYC, ready for AEPS onboarding.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Component */}
                    <VideoKycList
                        apiEndpoint="/api/v2/aeps/video-kyc/verified-list"
                        listTitle="Verified Applications"
                        listType="verified"
                    />
                </div>
            </div>
        </>
    );
};

export default VerifiedList;
