import React, { useState } from 'react';

const JsonDataViewer = ({ title, jsonData }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);

    if (!jsonData) {
        return (
            <div className="alert alert-info mb-3">
                <i className="fa fa-info-circle me-2"></i>
                No data available
            </div>
        );
    }

    // Parse JSON if it's a string
    let parsedData;
    try {
        parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (error) {
        return (
            <div className="alert alert-danger mb-3">
                <i className="fa fa-exclamation-triangle me-2"></i>
                Invalid JSON data
            </div>
        );
    }

    // Format key names to be more readable
    const formatKey = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleImageClick = (base64) => {
        setSelectedImage(`data:image/jpeg;base64,${base64}`);
        setShowImageModal(true);
    };

    // Render simple value
    const renderValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-muted fst-italic">N/A</span>;
        }
        if (typeof value === 'boolean') {
            return <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
                {value ? 'Yes' : 'No'}
            </span>;
        }
        if (typeof value === 'number') {
            return <span className="fw-semibold">{value}</span>;
        }
        // Check if it's a base64 image (starts with /9j/ or similar)
        if (typeof value === 'string' && value.length > 100 && (value.startsWith('/9j/') || value.startsWith('iVBOR'))) {
            const imgSrc = `data:image/jpeg;base64,${value}`;
            return (
                <div>
                    <img 
                        src={imgSrc}
                        alt="Photo"
                        className="img-thumbnail"
                        style={{ 
                            maxWidth: '150px', 
                            maxHeight: '150px', 
                            cursor: 'pointer',
                            objectFit: 'cover'
                        }}
                        onClick={() => handleImageClick(value)}
                    />
                    <div className="mt-2">
                        <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleImageClick(value)}
                        >
                            <i className="fa fa-search-plus me-1"></i>
                            View Full Size
                        </button>
                    </div>
                </div>
            );
        }
        return <span>{value}</span>;
    };

    // Flatten nested data structure
    const flattenData = (obj, parentKey = '') => {
        let flattened = {};
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Flatten nested objects
                Object.assign(flattened, flattenData(value, newKey));
            } else if (Array.isArray(value)) {
                // Skip arrays for simple display
                flattened[newKey] = `Array (${value.length} items)`;
            } else {
                flattened[newKey] = value;
            }
        });
        
        return flattened;
    };

    const flatData = flattenData(parsedData);
    const entries = Object.entries(flatData);

    if (entries.length === 0) {
        return (
            <div className="alert alert-warning mb-3">
                <i className="fa fa-exclamation-circle me-2"></i>
                No data to display
            </div>
        );
    }

    return (
        <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                    <i className="fa fa-file-text-o me-2"></i>
                    {title}
                </h6>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover table-bordered mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '40%' }} className="fw-semibold">Field</th>
                                <th className="fw-semibold">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(([key, value]) => (
                                <tr key={key}>
                                    <td className="bg-light">
                                        <strong>{formatKey(key)}</strong>
                                    </td>
                                    <td>{renderValue(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Preview Modal */}
            {showImageModal && selectedImage && (
                <div 
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.9)' }}
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0" onClick={e => e.stopPropagation()}>
                            <div className="modal-header border-0 pb-0">
                                <div className="d-flex gap-2">
                                    <span className="badge bg-light text-dark">
                                        <i className="fa fa-image me-2"></i>
                                        Photo Preview
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowImageModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center px-4">
                                <div 
                                    className="position-relative d-inline-block"
                                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                                >
                                    <img
                                        src={selectedImage}
                                        alt="Full Preview"
                                        className="img-fluid rounded shadow-lg"
                                        style={{
                                            maxHeight: '70vh',
                                            width: 'auto'
                                        }}
                                    />
                                </div>

                                <div className="mt-4">
                                    <a 
                                        href={selectedImage}
                                        download="photo.jpg"
                                        className="btn btn-success me-2"
                                    >
                                        <i className="fa fa-download me-2"></i>
                                        Download Image
                                    </a>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setShowImageModal(false)}
                                    >
                                        <i className="fa fa-times me-2"></i>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JsonDataViewer;
