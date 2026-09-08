import React from 'react';

const DlCard = ({ data, isPrintView }) => {
    if (!data) return null;

    const statusColor = data.dl_status === 'ACTIVE' ? '#16a34a' : '#dc2626';

    return (
        <div className={`card overflow-hidden ${isPrintView ? 'border' : 'border-0 shadow-sm'}`}
            style={{ maxWidth: '500px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#fff', border: isPrintView ? '2px solid #1e293b' : '' }}>

            {/* Header */}
            <div className="card-header py-2 px-3 d-flex align-items-center"
                style={{ backgroundColor: '#fff', borderBottom: '2px solid #2563eb' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '35px' }} className="me-3" onError={(e) => e.target.style.display = 'none'} />
                <div className="flex-grow-1 text-center pe-4">
                    <h6 className="mb-0 fw-bold text-uppercase d-block" style={{ fontSize: '12px', color: '#1e3a8a' }}>Union of India</h6>
                    <h5 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '16px', color: '#1e3a8a', letterSpacing: '1px' }}>Driving Licence</h5>
                </div>
            </div>

            <div className="card-body p-3">
                <div className="row">
                    <div className="col-12 mb-3 d-flex align-items-center justify-content-between pb-2 border-bottom border-dashed">
                        <div>
                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>DL Number</small>
                            <h4 className="fw-bold font-monospace mb-0" style={{ color: '#0f172a', letterSpacing: '2px' }}>{data.dl_no || '-'}</h4>
                        </div>
                        <div className="text-end">
                            <span className="badge border" style={{ backgroundColor: '#fff', color: statusColor, borderColor: statusColor, fontSize: '11px' }}>
                                STATUS: {data.dl_status || '-'}
                            </span>
                        </div>
                    </div>

                    <div className="col-8">
                        <div className="mb-2">
                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Name</small>
                            <span className="fw-bold" style={{ color: '#0f172a', fontSize: '14px' }}>{data.name || '-'}</span>
                        </div>
                        <div className="mb-2">
                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>S/W/D of</small>
                            <span className="fw-semibold" style={{ color: '#334155', fontSize: '13px' }}>{data.father_or_husband_name || '-'}</span>
                        </div>
                        <div className="row g-2 mb-2">
                            <div className="col-6">
                                <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Issue Date</small>
                                <span className="fw-semibold" style={{ color: '#334155', fontSize: '12px' }}>{data.issue_date || '-'}</span>
                            </div>
                            <div className="col-6">
                                <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Valid Till</small>
                                <span className="fw-bold" style={{ color: '#b91c1c', fontSize: '12px' }}>{data.validity_to || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-4 d-flex flex-column align-items-end">
                        <div className="border d-flex align-items-center justify-content-center mb-2" style={{ width: '80px', height: '100px', backgroundColor: '#f8fafc' }}>
                            <i className="fas fa-user text-muted" style={{ fontSize: '2.5rem' }}></i>
                        </div>
                    </div>

                    <div className="col-12 pt-2 border-top">
                        <small className="text-muted d-block text-uppercase mb-1" style={{ fontSize: '9px' }}>Registered Address</small>
                        <span className="fw-semibold lh-sm d-block" style={{ color: '#334155', fontSize: '11px' }}>{data.address || data.complete_address || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DlCard;
