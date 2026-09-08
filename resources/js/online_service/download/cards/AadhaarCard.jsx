import React from 'react';

const AadhaarCard = ({ data, isPrintView }) => {
    if (!data) return null;

    return (
        <div className={`card overflow-hidden ${isPrintView ? 'border' : 'border-0 shadow-sm'}`}
            style={{ maxWidth: '500px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#fff' }}>

            {/* Header */}
            <div className="card-header py-2 px-3 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: '#fff', borderBottom: '2px solid #ea580c' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '40px' }} onError={(e) => e.target.style.display = 'none'} />
                <div className="text-center flex-grow-1">
                    <h6 className="mb-0 fw-bold text-danger" style={{ fontSize: '14px' }}>भारत सरकार</h6>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '13px' }}>GOVERNMENT OF INDIA</h6>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar" style={{ height: '35px' }} onError={(e) => e.target.style.display = 'none'} />
            </div>

            <div className="card-body p-3">
                <div className="d-flex align-items-start gap-3 mb-4">
                    {data.photo ? (
                        <img
                            src={`data:image/jpeg;base64,${data.photo}`}
                            alt="Photo"
                            style={{ width: '85px', height: '110px', objectFit: 'cover', border: '1px solid #ccc', padding: '2px' }}
                        />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center"
                            style={{ width: '85px', height: '110px', border: '1px solid #ccc', backgroundColor: '#f8fafc' }}>
                            <i className="fas fa-user" style={{ color: '#cbd5e1', fontSize: '2rem' }}></i>
                        </div>
                    )}
                    <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: '16px' }}>{data.name || '-'}</h5>
                        <p className="mb-1 text-dark" style={{ fontSize: '13px' }}>
                            <span className="text-muted me-1 text-uppercase" style={{ fontSize: '10px' }}>DOB:</span> <span className="fw-bold">{data.dob || '-'}</span>
                        </p>
                        <p className="mb-0 text-dark" style={{ fontSize: '13px' }}>
                            <span className="text-muted me-1 text-uppercase" style={{ fontSize: '10px' }}>Gender:</span> <span className="fw-bold">{data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender || '-'}</span>
                        </p>
                    </div>
                </div>

                <div className="text-center pt-3 mt-2 border-top">
                    <h3 className="fw-bold font-monospace mb-0" style={{ color: '#000', letterSpacing: '4px', fontSize: '22px' }}>
                        {data.aadhaarno ? data.aadhaarno.replace(/(.{4})/g, '$1 ').trim() : '-'}
                    </h3>
                    <div className="mt-1 border-top" style={{ borderColor: '#dc2626 !important', borderWidth: '2px !important' }}></div>
                    <small className="fw-bold d-block mt-1 text-danger" style={{ fontSize: '13px' }}>मेरा आधार, मेरी पहचान</small>
                </div>

                {(data.address || data.mobile || data.email) && (
                    <div className="mt-4 pt-3 border-top border-dashed">
                        <small className="text-muted d-block text-uppercase mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>Additional Details</small>

                        {data.address && (
                            <div className="mb-2">
                                <small className="text-muted d-block" style={{ fontSize: '9px' }}>Address</small>
                                <span className="fw-semibold" style={{ color: '#334155', fontSize: '12px' }}>{data.address}</span>
                            </div>
                        )}
                        <div className="d-flex gap-4">
                            {data.mobile && (
                                <div>
                                    <small className="text-muted d-block" style={{ fontSize: '9px' }}>Mobile</small>
                                    <span className="fw-semibold" style={{ color: '#334155', fontSize: '12px' }}>{data.mobile}</span>
                                </div>
                            )}
                            {data.email && (
                                <div>
                                    <small className="text-muted d-block" style={{ fontSize: '9px' }}>Email</small>
                                    <span className="fw-semibold" style={{ color: '#334155', fontSize: '12px' }}>{data.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AadhaarCard;
