import React, { useCallback, useState } from 'react';

/**
 * File Upload Zone Component
 * Drag-and-drop file upload area with preview and validation
 */
const FileUploadZone = ({ 
    files = [], 
    onChange, 
    onRemove,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 5,
    acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
    multiple = true
}) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, [files, maxFiles, maxSize]);

    const handleChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        // Validate file count
        if (files.length + newFiles.length > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate file size
        const oversizedFiles = newFiles.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            alert(`Some files exceed the maximum size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
            return;
        }

        onChange([...files, ...newFiles]);
    };

    const getFileIcon = (file) => {
        const type = file.type;
        if (type.startsWith('image/')) return 'fa-image text-primary';
        if (type.startsWith('video/')) return 'fa-video text-danger';
        if (type.includes('pdf')) return 'fa-file-pdf text-danger';
        if (type.includes('word')) return 'fa-file-word text-primary';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel text-success';
        return 'fa-file text-secondary';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null;
    };

    return (
        <div className="file-upload-zone">
            {/* Drop Zone */}
            <div 
                className={`border-2 border-dashed rounded p-4 text-center ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="mb-3">
                    <i className="fas fa-cloud-upload-alt fa-3x text-muted"></i>
                </div>
                <p className="mb-2">
                    <strong>Drag & drop files here</strong>
                </p>
                <p className="text-muted small mb-3">or</p>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    <i className="fas fa-folder-open me-2"></i>
                    Browse Files
                    <input
                        type="file"
                        multiple={multiple}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                        accept={acceptedTypes}
                    />
                </label>
                <p className="text-muted small mt-3 mb-0">
                    Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB | Max files: {maxFiles}
                </p>
                <p className="text-muted small mb-0">
                    Supported: Images, PDF, Word, Excel
                </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-3">
                    <h6 className="mb-2">Selected Files ({files.length})</h6>
                    <div className="row g-2">
                        {files.map((file, index) => {
                            const preview = getFilePreview(file);
                            return (
                                <div key={index} className="col-md-6">
                                    <div className="card border">
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="flex-shrink-0">
                                                    {preview ? (
                                                        <img 
                                                            src={preview} 
                                                            alt={file.name}
                                                            className="rounded"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <i className={`fas ${getFileIcon(file)} fa-2x`}></i>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1 ms-3">
                                                    <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                                                        {file.name}
                                                    </h6>
                                                    <small className="text-muted">{formatFileSize(file.size)}</small>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => onRemove(index)}
                                                    title="Remove file"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadZone;
