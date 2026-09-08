import React from 'react';

const RcCard = ({ data, isPrintView }) => {
    if (!data) return null;

    const statusColor = data.rc_status === 'ACTIVE' ? '#16a34a' : '#dc2626';

    return (
        <div className={`card overflow-hidden ${isPrintView ? 'border' : 'border-0 shadow-sm'}`}
            style={{ maxWidth: '500px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#fff' }}>

            {/* Header */}
            <div className="card-header py-2 px-3 text-center"
                style={{ backgroundColor: '#fff', borderBottom: '3px solid #b91c1c' }}>
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '12px', color: '#1e293b' }}>Ministry of Road Transport and Highways</h6>
                <h5 className="mb-0 fw-bold text-uppercase mt-1" style={{ fontSize: '15px', color: '#b91c1c' }}>Certificate of Registration</h5>
            </div>

            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Registration No</small>
                        <h4 className="fw-bold font-monospace mb-0" style={{ color: '#0f172a', letterSpacing: '2px' }}>
                            {data.vehicle_number || data.reg_no || '-'}
                        </h4>
                    </div>
                    <span className="badge border" style={{ backgroundColor: '#fff', color: statusColor, borderColor: statusColor, fontSize: '11px' }}>
                        {data.rc_status || '-'}
                    </span>
                </div>

                <div className="row g-2 mb-3">
                    <div className="col-12">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Owner Name</small>
                        <span className="fw-bold" style={{ color: '#0f172a', fontSize: '14px' }}>{data.owner || '-'}</span>
                    </div>
                    {data.owner_father_name && (
                        <div className="col-12">
                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Son/Wife/Daughter of</small>
                            <span className="fw-semibold" style={{ color: '#334155', fontSize: '12px' }}>{data.owner_father_name}</span>
                        </div>
                    )}
                </div>

                <div className="row g-2 py-2 border-top border-bottom mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="col-6">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Maker / Model</small>
                        <span className="fw-semibold d-block text-truncate" style={{ color: '#0f172a', fontSize: '11px' }}>{data.vehicle_manufacturer_name || '-'}</span>
                        <span className="fw-semibold d-block text-truncate" style={{ color: '#0f172a', fontSize: '11px' }}>{data.model || '-'}</span>
                    </div>
                    <div className="col-3">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Fuel</small>
                        <span className="fw-bold" style={{ color: '#0f172a', fontSize: '12px' }}>{data.type || '-'}</span>
                    </div>
                    <div className="col-3">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Class</small>
                        <span className="fw-semibold text-truncate d-block" style={{ color: '#0f172a', fontSize: '11px' }}>{data.vclass || '-'}</span>
                    </div>
                </div>

                <div className="row g-2">
                    <div className="col-4">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Regn Date</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '11px' }}>{data.reg_date || '-'}</span>
                    </div>
                    <div className="col-4">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Valid Upto</small>
                        <span className="fw-bold" style={{ color: '#b91c1c', fontSize: '11px' }}>{data.rc_expiry_date || '-'}</span>
                    </div>
                    <div className="col-4">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Ins. Upto</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '11px' }}>{data.vehicle_insurance_upto || '-'}</span>
                    </div>
                    <div className="col-12 mt-2 pt-2 border-top">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px' }}>Registering Authority</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '11px' }}>{data.reg_authority || '-'}</span>
                    </div>
                </div>
            </div>
            {/* Footer strip */}
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', width: '100%' }}></div>
        </div>
    );
};

export default RcCard;
