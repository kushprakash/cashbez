import React from 'react';

const VoterCard = ({ data, isPrintView }) => {
    if (!data) return null;

    return (
        <div className={`card overflow-hidden ${isPrintView ? 'border' : 'border-0 shadow-sm'}`}
            style={{ maxWidth: '400px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#fff', border: isPrintView ? '2px solid #000' : '' }}>

            {/* Header */}
            <div className="card-header py-2 px-3 text-center"
                style={{ backgroundColor: '#fff', borderBottom: '1px solid #ccc' }}>
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '14px', color: '#000' }}>भारत निर्वाचन आयोग</h6>
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '13px', color: '#000' }}>Election Commission of India</h6>
                <small className="d-block mt-1 fw-semibold text-uppercase" style={{ fontSize: '10px', color: '#000' }}>Elector's Photo Identity Card</small>
            </div>

            <div className="card-body p-3">
                <div className="row g-2 mb-3">
                    <div className="col-4">
                        <div className="border d-flex align-items-center justify-content-center" style={{ height: '110px', backgroundColor: '#f8fafc' }}>
                            <i className="fas fa-user-circle text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                    </div>
                    <div className="col-8 ps-2">
                        <div className="mb-3">
                            <h4 className="fw-bold font-monospace mb-0" style={{ color: '#000', letterSpacing: '2px', fontSize: '18px' }}>
                                {data.epic_number || '-'}
                            </h4>
                        </div>
                        <div className="mb-1">
                            <small className="text-muted d-block" style={{ fontSize: '9px' }}>Elector's Name</small>
                            <span className="fw-bold" style={{ color: '#000', fontSize: '14px' }}>{data.name || '-'}</span>
                        </div>
                        <div className="mb-1">
                            <small className="text-muted d-block" style={{ fontSize: '9px' }}>Father's Name</small>
                            <span className="fw-bold" style={{ color: '#000', fontSize: '13px' }}>{data.relation_name || data.father_name || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="row g-2 pt-2 border-top">
                    {data.dob && (
                        <div className="col-6">
                            <small className="text-muted d-block" style={{ fontSize: '9px' }}>Date of Birth</small>
                            <span className="fw-bold" style={{ color: '#000', fontSize: '12px' }}>{data.dob}</span>
                        </div>
                    )}
                    <div className="col-6">
                        <small className="text-muted d-block" style={{ fontSize: '9px' }}>Age/Gender</small>
                        <span className="fw-bold" style={{ color: '#000', fontSize: '12px' }}>{data.age || '-'} / {data.gender || '-'}</span>
                    </div>
                </div>

                <div className="mt-3 pt-2 border-top">
                    <small className="text-muted d-block mb-1" style={{ fontSize: '9px' }}>Address</small>
                    <span className="fw-semibold lh-sm d-block" style={{ color: '#334155', fontSize: '11px' }}>{data.address || '-'}</span>
                </div>

                <div className="mt-2 pt-2 border-top d-flex justify-content-between">
                    <div>
                        <small className="text-muted d-block" style={{ fontSize: '9px' }}>State</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '11px' }}>{data.state || '-'}</span>
                    </div>
                    <div className="text-end">
                        <small className="text-muted d-block" style={{ fontSize: '9px' }}>Constituency</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '11px' }}>{data.assembly_constituency || '-'}</span>
                    </div>
                </div>
            </div>
            {/* Footer strip */}
            <div style={{ height: '4px', backgroundColor: '#000', width: '100%' }}></div>
        </div>
    );
};

export default VoterCard;
