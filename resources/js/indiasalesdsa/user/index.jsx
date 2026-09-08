import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const DsaServices = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet('/api/dsa/services');
            if (response.data?.status === 1) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (category, item) => {
        navigate('/dsa/dashboard', {
            state: { category, item }
        });
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="mb-4">
                <h4 className="fw-bold mb-1">DSA Services</h4>
                <p className="text-muted mb-0">Apply for banking & financial services</p>
            </div>

            {categories.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="fa fa-folder-open fa-3x text-muted opacity-50 mb-3"></i>
                        <p className="text-muted mb-0">No services available</p>
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {categories.map((category) => (
                        <div key={category.id} className="card border-0 shadow-sm">
                            <div className="card-body p-3">
                                {/* Category Header */}
                                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle"
                                            style={{ width: '42px', height: '42px' }}
                                        >
                                            {category.icon ? (
                                                <img
                                                    src={category.icon}
                                                    alt={category.name}
                                                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <i className="fa fa-folder text-success"></i>
                                            )}
                                        </div>
                                        <h6 className="fw-bold mb-0">{category.name}</h6>
                                    </div>
                                    <span className="badge text-success fw-normal">
                                        {category.items?.length || 0} items
                                    </span>
                                </div>

                                {/* Items Grid */}
                                <div className="row g-3">
                                    {category.items?.map((item) => (
                                        <div key={item.id} className="col-4 col-sm-3 col-md-2">
                                            <div
                                                className="text-center cursor-pointer p-2 rounded-3 hover-bg-light"
                                                onClick={() => handleItemClick(category, item)}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div
                                                    className="d-flex align-items-center justify-content-center mx-auto mb-2 rounded-3 bg-light"
                                                    style={{ width: '52px', height: '52px' }}
                                                >
                                                    {item.icon ? (
                                                        <img
                                                            src={item.icon}
                                                            alt={item.title}
                                                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                                                        />
                                                    ) : (
                                                        <i className="fa fa-credit-card text-primary"></i>
                                                    )}
                                                </div>
                                                <small className="text-dark fw-medium d-block text-truncate" title={item.title}>
                                                    {item.title}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DsaServices;
