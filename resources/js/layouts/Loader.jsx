import React, { Fragment } from 'react'

const Loader = () => {
    return (
        <Fragment>
            <div id="loader-premium-overlay">
                <div className="loader-premium-container">
                    <div className="loader-premium-spinner"></div>
                </div>
            </div>
            <style>{`
                #loader-premium-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(245, 245, 250, 0.85);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .loader-premium-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .loader-premium-spinner {
                    width: 56px;
                    height: 56px;
                    border: 6px solid #e0e0ef;
                    border-top: 6px solid #4f8cff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 24px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loader-premium-text {
                    font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                    font-size: 1.25rem;
                    color: #2d2d44;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }
            `}</style>
        </Fragment>
    )
}

export default Loader;
