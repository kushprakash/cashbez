import React from 'react';

/**
 * Reusable Modal Component
 * Generic modal for forms and content display
 */
const Modal = ({ 
    show, 
    onClose, 
    title, 
    children, 
    footer,
    size = 'md', // sm, md, lg, xl
    centered = true,
    backdrop = true,
    keyboard = true
}) => {
    if (!show) return null;

    const handleBackdropClick = (e) => {
        if (backdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (keyboard && e.key === 'Escape') {
            onClose();
        }
    };

    React.useEffect(() => {
        if (show && keyboard) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [show, keyboard]);

    const sizeClass = size !== 'md' ? `modal-${size}` : '';
    const centeredClass = centered ? 'modal-dialog-centered' : '';

    return (
        <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleBackdropClick}
            tabIndex="-1"
            role="dialog"
        >
            <div className={`modal-dialog ${sizeClass} ${centeredClass}`} role="document">
                <div className="modal-content">
                    {/* Header */}
                    {title && (
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    {/* Body */}
                    <div className="modal-body">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="modal-footer">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Confirmation Modal Component
 * Quick confirmation dialog with Yes/No buttons
 */
export const ConfirmModal = ({ 
    show, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Yes',
    cancelText = 'No',
    confirmVariant = 'primary',
    loading = false
}) => {
    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`btn btn-${confirmVariant}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </>
            }
        >
            <p className="mb-0">{message}</p>
        </Modal>
    );
};

/**
 * Form Modal Component
 * Modal wrapper for forms with submit/cancel buttons
 */
export const FormModal = ({ 
    show, 
    onClose, 
    onSubmit, 
    title,
    children,
    submitText = 'Submit',
    cancelText = 'Cancel',
    loading = false,
    size = 'md'
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size={size}
            footer={
                <>
                    <button 
                        type="button"
                        className="btn btn-secondary" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        type="submit"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            submitText
                        )}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                {children}
            </form>
        </Modal>
    );
};

/**
 * Alert Modal Component
 * Simple alert/notification modal
 */
export const AlertModal = ({ 
    show, 
    onClose, 
    title = 'Alert',
    message,
    variant = 'info', // info, success, warning, danger
    icon
}) => {
    const icons = {
        info: 'fa-info-circle text-info',
        success: 'fa-check-circle text-success',
        warning: 'fa-exclamation-triangle text-warning',
        danger: 'fa-times-circle text-danger'
    };

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <button className="btn btn-primary" onClick={onClose}>
                    OK
                </button>
            }
        >
            <div className="text-center">
                <i className={`fas ${icon || icons[variant]} fa-3x mb-3`}></i>
                <p className="mb-0">{message}</p>
            </div>
        </Modal>
    );
};

export default Modal;
