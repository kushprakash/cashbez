import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console and any error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Render custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary-container">
                    <div className="container-fluid">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="error-boundary-card text-center p-5">
                                    <div className="error-icon mb-4">
                                        <iconify-icon icon="solar:danger-triangle-broken" class="fs-1 text-danger"></iconify-icon>
                                    </div>
                                    
                                    <h3 className="error-title mb-3">Oops! Something went wrong</h3>
                                    
                                    <p className="error-message text-muted mb-4">
                                        We encountered an unexpected error. This has been logged and our team will investigate.
                                    </p>

                                    {process.env.NODE_ENV === 'development' && (
                                        <details className="error-details mb-4">
                                            <summary className="btn btn-outline-secondary btn-sm mb-3">
                                                Show Error Details
                                            </summary>
                                            <div className="error-stack text-start">
                                                <pre className="bg-light p-3 rounded border">
                                                    <code>
                                                        {this.state.error && this.state.error.toString()}
                                                        <br />
                                                        {this.state.errorInfo.componentStack}
                                                    </code>
                                                </pre>
                                            </div>
                                        </details>
                                    )}

                                    <div className="error-actions">
                                        <button 
                                            className="btn btn-primary me-3"
                                            onClick={this.handleRetry}
                                        >
                                            <iconify-icon icon="solar:refresh-broken" class="me-2"></iconify-icon>
                                            Try Again
                                        </button>
                                        
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => window.location.reload()}
                                        >
                                            <iconify-icon icon="solar:home-broken" class="me-2"></iconify-icon>
                                            Reload Page
                                        </button>
                                    </div>

                                    <div className="error-help mt-4">
                                        <small className="text-muted">
                                            If this problem persists, please contact support with error code: {Date.now()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
