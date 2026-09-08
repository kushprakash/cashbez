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
        // Log the error to console or your error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="error-boundary">
                    <div className="card border-danger">
                        <div className="card-header bg-danger text-white">
                            <h5 className="card-title mb-0">
                                <i className="fa fa-exclamation-triangle me-2"></i>
                                Something went wrong
                            </h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-3">
                                    <summary className="btn btn-outline-secondary btn-sm">
                                        Show Error Details
                                    </summary>
                                    <div className="mt-2">
                                        <h6>Error:</h6>
                                        <pre className="text-danger small">{this.state.error.toString()}</pre>
                                        
                                        <h6 className="mt-3">Stack Trace:</h6>
                                        <pre className="text-muted small">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </div>
                                </details>
                            )}
                            
                            <div className="mt-3">
                                <button 
                                    className="btn btn-primary me-2"
                                    onClick={() => window.location.reload()}
                                >
                                    <i className="fa fa-refresh me-1"></i>
                                    Refresh Page
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                >
                                    <i className="fa fa-undo me-1"></i>
                                    Try Again
                                </button>
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
