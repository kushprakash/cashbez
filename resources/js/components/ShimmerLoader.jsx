import React from 'react';
import './ShimmerLoader.css';

const ShimmerLoader = () => {
    return (
        <div className="shimmer-container">
            {/* Header Shimmer */}
            <div className="shimmer-header">
                <div className="container-fluid">
                    <div className="shimmer-breadcrumb">
                        <div className="shimmer-item shimmer-sm"></div>
                        <div className="shimmer-item shimmer-xs"></div>
                        <div className="shimmer-item shimmer-sm"></div>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                {/* Stats Cards Shimmer */}
                <div className="row mb-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="col-lg-2 col-md-4 col-sm-6 mb-3">
                            <div className="shimmer-card">
                                <div className="shimmer-card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="shimmer-icon me-3"></div>
                                        <div className="flex-grow-1">
                                            <div className="shimmer-item shimmer-lg mb-2"></div>
                                            <div className="shimmer-item shimmer-md"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Shimmer */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="shimmer-card">
                            <div className="shimmer-card-header">
                                <div className="shimmer-item shimmer-lg"></div>
                            </div>
                            <div className="shimmer-card-body">
                                <div className="row">
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index} className="col-lg-3 col-md-6 mb-2">
                                            <div className="shimmer-button"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections Shimmer */}
                <div className="row">
                    {/* Left Column */}
                    <div className="col-lg-6 mb-4">
                        <div className="shimmer-card">
                            <div className="shimmer-card-header">
                                <div className="shimmer-item shimmer-lg"></div>
                            </div>
                            <div className="shimmer-card-body">
                                {/* Table Shimmer */}
                                <div className="shimmer-table">
                                    <div className="shimmer-table-header">
                                        <div className="shimmer-item shimmer-sm"></div>
                                        <div className="shimmer-item shimmer-sm"></div>
                                        <div className="shimmer-item shimmer-sm"></div>
                                        <div className="shimmer-item shimmer-xs"></div>
                                    </div>
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="shimmer-table-row">
                                            <div className="shimmer-item shimmer-md"></div>
                                            <div className="shimmer-item shimmer-xs"></div>
                                            <div className="shimmer-item shimmer-xs"></div>
                                            <div className="shimmer-item shimmer-sm"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-6 mb-4">
                        <div className="shimmer-card">
                            <div className="shimmer-card-header">
                                <div className="shimmer-item shimmer-lg"></div>
                            </div>
                            <div className="shimmer-card-body">
                                {/* List Shimmer */}
                                <div className="shimmer-list">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="shimmer-list-item">
                                            <div className="d-flex align-items-center">
                                                <div className="shimmer-avatar me-3"></div>
                                                <div className="flex-grow-1">
                                                    <div className="shimmer-item shimmer-md mb-1"></div>
                                                    <div className="shimmer-item shimmer-lg"></div>
                                                </div>
                                                <div className="shimmer-item shimmer-sm"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section Shimmer */}
                <div className="row">
                    <div className="col-12">
                        <div className="shimmer-card">
                            <div className="shimmer-card-header">
                                <div className="shimmer-item shimmer-lg"></div>
                            </div>
                            <div className="shimmer-card-body">
                                <div className="shimmer-chart">
                                    <div className="shimmer-chart-bars">
                                        {[...Array(8)].map((_, index) => (
                                            <div 
                                                key={index} 
                                                className="shimmer-chart-bar"
                                                style={{ height: `${Math.random() * 60 + 20}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Indicator */}
            <div className="shimmer-loading-indicator">
                <div className="shimmer-spinner">
                    <div className="shimmer-spinner-inner"></div>
                </div>
                <div className="shimmer-loading-text">
                    <div className="shimmer-item shimmer-md"></div>
                </div>
            </div>
        </div>
    );
};

export default ShimmerLoader;
