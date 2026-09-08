import React from 'react';

/**
 * Timeline Component
 * Displays activity history in a vertical timeline format
 */
const Timeline = ({ items = [], emptyMessage = 'No activity recorded' }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionIcon = (actionType) => {
        const icons = {
            'CREATED': 'fa-plus-circle text-primary',
            'STATUS_UPDATED': 'fa-exchange-alt text-info',
            'ASSIGNED': 'fa-user-plus text-success',
            'REASSIGNED': 'fa-user-edit text-warning',
            'COMMENT_ADDED': 'fa-comment text-info',
            'RESOLVED': 'fa-check-circle text-success',
            'CLOSED': 'fa-times-circle text-secondary',
            'REOPENED': 'fa-redo text-danger',
            'FILE_ATTACHED': 'fa-paperclip text-primary',
            'CHAT_LINKED': 'fa-link text-info'
        };
        return icons[actionType] || 'fa-circle text-muted';
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-history fa-3x text-muted mb-3"></i>
                <p className="text-muted">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="timeline">
            {items.map((item, index) => (
                <div 
                    key={item.id || index} 
                    className={`timeline-item ${index !== items.length - 1 ? 'mb-4 pb-3 border-bottom' : ''}`}
                >
                    <div className="d-flex">
                        {/* Icon */}
                        <div className="flex-shrink-0 me-3">
                            <div className="timeline-icon bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                                <i className={`fas ${getActionIcon(item.action_type)} d-block text-center`}></i>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>{item.action_type?.replace('_', ' ') || 'Action'}</strong>
                                    {item.user?.name && (
                                        <span className="text-muted ms-2">
                                            by {item.user.name}
                                        </span>
                                    )}
                                    {item.role && (
                                        <span className="badge bg-secondary ms-2">{item.role}</span>
                                    )}
                                </div>
                                <small className="text-muted">
                                    {formatDate(item.created_at)}
                                </small>
                            </div>

                            {/* Description/Details */}
                            {item.description && (
                                <p className="mb-1">{item.description}</p>
                            )}

                            {/* Remarks */}
                            {item.remarks && (
                                <div className="bg-light p-2 rounded mt-2">
                                    <small className="text-muted">
                                        <i className="fas fa-quote-left me-2"></i>
                                        {item.remarks}
                                    </small>
                                </div>
                            )}

                            {/* Additional Info */}
                            {item.old_value && item.new_value && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        Changed from <span className="badge bg-secondary">{item.old_value}</span> to{' '}
                                        <span className="badge bg-primary">{item.new_value}</span>
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;
