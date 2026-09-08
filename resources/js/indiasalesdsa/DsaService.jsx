import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ApiService from '../core/services/ApiService';
import axios from 'axios';
import { apiUrl } from '../core/config';
import { storeTokenAndUserData } from '../core/auth/tokenManager';

const DsaService = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dsaUrl, setDsaUrl] = useState(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const urlToken = searchParams.get('token');

        if (urlToken) {
            setToken(urlToken);
            fetchUserProfile(urlToken);
        } else {
            fetchDsaDashboard(urlToken);
        }
    }, [searchParams]);

    const fetchUserProfile = async (authToken) => {
        try {
            setLoading(true);
            setError(null);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${apiUrl}api/userdata`,
                headers: {
                    'Content-Type': 'application/json',
                    'Token': authToken,
                }
            };

            const response = await axios.request(config);

            if (response.data.status === 1) {
                setUserData(response.data.user);
                localStorage.setItem('token', authToken);
                storeTokenAndUserData(authToken, response.data.user);
                fetchDsaDashboard(authToken);
            } else {
                setError(response.data.message || 'Failed to fetch user data');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user profile. Please check your token.');
            setLoading(false);
        }
    };

    const fetchDsaDashboard = async (authToken) => {
        try {
            setLoading(true);
            setError(null);

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${apiUrl}api/dsa/dashboard`,
                headers: {
                    'Content-Type': 'application/json',
                    'Token': authToken,
                }
            };

            const response = await axios.request(config);
            if (response.data.status === 1) {
                setDsaUrl(response.data.data.url);
            } else {
                setError(response.data.message || 'Failed to load DSA service');
            }
        } catch (err) {
            setError('Failed to load DSA service. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setError(null);
        fetchDsaDashboard();
    }, []);

    if (loading) {
        return (
            <>
                <div className="container-fluid mt-2">
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Opening DSA service portal...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="container-fluid mt-2">
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">
                                            <i className="ti ti-building-bank me-2 text-primary"></i>
                                            DSA Service Portal
                                        </h5>
                                        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
                                            <i className="ti ti-arrow-left me-1"></i>Back
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="ti ti-alert-circle fs-1 text-danger mb-3"></i>
                                    <h5 className="text-danger mb-3">Unable to Load DSA Service</h5>
                                    <p className="text-muted mb-4">{error}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRefresh}
                                    >
                                        <i className="ti ti-refresh me-2"></i>
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="container-fluid" style={{ padding: 0 }}>
                {/* Compact Header */}
                <div className="row g-0">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-0">
                            <div className="card-body py-2 px-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0">
                                        <i className="ti ti-building-bank me-2 text-primary"></i>
                                        DSA Service - IndiaSales
                                    </h6>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={handleRefresh}
                                        >
                                            <i className="ti ti-refresh"></i>
                                        </button>
                                        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
                                            <i className="ti ti-x"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-height Iframe */}
                <div className="row g-0">
                    <div className="col-12">
                        {dsaUrl && (
                            <iframe
                                src={dsaUrl}
                                width="100%"
                                style={{
                                    height: 'calc(100vh - 60px)',
                                    border: 'none',
                                    display: 'block'
                                }}
                                title="DSA Service Portal"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DsaService;
