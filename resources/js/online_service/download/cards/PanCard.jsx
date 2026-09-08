import React from 'react';

const PanCard = ({ data, isPrintView }) => {
    if (!data) return null;

    return (
        <div className={`card overflow-hidden ${isPrintView ? 'border' : 'border-0 shadow-sm'}`}
            style={{ maxWidth: '500px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#fff' }}>

            {/* Header */}
            <div className="card-header py-3 px-4 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: '#fff', borderBottom: '3px solid #1e3a8a' }}>
                <div className="d-flex align-items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '40px' }} onError={(e) => e.target.style.display = 'none'} />
                    <div>
                        <h6 className="mb-0 fw-bold" style={{ color: '#1e3a8a', fontSize: '13px', letterSpacing: '0.5px' }}>INCOME TAX DEPARTMENT</h6>
                        <small className="fw-semibold text-secondary" style={{ fontSize: '10px', letterSpacing: '1px' }}>GOVERNMENT OF INDIA</small>
                    </div>
                </div>
            </div>

            <div className="card-body p-4 position-relative">
                {/* Background watermark */}
                <div className="position-absolute top-50 start-50 translate-middle pointer-events-none" style={{ opacity: 0.03, zIndex: 0 }}>
                    <i className="fas fa-address-card" style={{ fontSize: '15rem' }}></i>
                </div>

                <div className="row g-3 position-relative" style={{ zIndex: 1 }}>
                    <div className="col-12">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Permanent Account Number Card</small>
                        <h3 className="fw-bold font-monospace mb-0 mt-1" style={{ color: '#0f172a', letterSpacing: '3px' }}>
                            {data.pan || data.Txnid || '-'}
                        </h3>
                    </div>

                    <div className="col-12 mt-4">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Name</small>
                        <span className="fw-bold" style={{ color: '#0f172a', fontSize: '15px' }}>{data.RegisteredName || '-'}</span>
                    </div>

                    {data.FatherName && (
                        <div className="col-12 mt-3">
                            <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Father's Name</small>
                            <span className="fw-bold" style={{ color: '#0f172a', fontSize: '14px' }}>{data.FatherName}</span>
                        </div>
                    )}

                    <div className="col-6 mt-3">
                        <small className="text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>PAN Type</small>
                        <span className="fw-semibold" style={{ color: '#334155', fontSize: '13px' }}>
                            {data.type || 'Individual'}
                        </span>
                    </div>

                    <div className="col-12 mt-4 pt-3 border-top">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                            <span className="fw-semibold" style={{ color: '#16a34a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {data.resText || 'Officially Verified Record'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer strip */}
            <div style={{ height: '8px', background: 'linear-gradient(to right, #1e3a8a, #3b82f6)', width: '100%' }}></div>
        </div>
    );
};

export default PanCard;
