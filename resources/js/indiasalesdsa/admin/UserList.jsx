import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

// UserList Component - Paginated user list with DSA management
const UserList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const apiService = ApiService();
    
    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [search, setSearch] = useState(searchParams.get('search') || '');

    // Modal states
    const [showDsaCodeModal, setShowDsaCodeModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dsaCode, setDsaCode] = useState('');
    const [savingDsaCode, setSavingDsaCode] = useState(false);

    // Login button states
    const [loginLoadingId, setLoginLoadingId] = useState(null);
    const [loginStatus, setLoginStatus] = useState({}); // { [userId]: 'generating' | 'redirecting' | null }

    // Fetch users
    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('per_page', pagination.per_page);
            if (search) params.set('search', search);

            const response = await apiService.vGet(`/api/dsa/admin/users?${params.toString()}`);

            if (response.data.status === 1) {
                const data = response.data.data;
                setUsers(data.data || []);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                });
            } else {
                setError(response.data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [search, pagination.per_page]);

    useEffect(() => {
        fetchUsers(1);
    }, [fetchUsers]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(search ? { search } : {});
        fetchUsers(1);
    };

    // Handle page change
    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    // Open DSA Code Modal
    const openDsaCodeModal = (user) => {
        setSelectedUser(user);
        setDsaCode(user.dsa_code || '');
        setShowDsaCodeModal(true);
    };

    // Save DSA Code
    const saveDsaCode = async () => {
        if (!selectedUser || !dsaCode.trim()) return;

        setSavingDsaCode(true);
        try {
            const response = await apiService.vPost(`/api/dsa/admin/users/${selectedUser.id}/dsa-code`, {
                dsa_code: dsaCode.trim(),
            });

            if (response.data.status === 1) {
                // Update local state
                setUsers(users.map(u =>
                    u.id === selectedUser.id
                        ? { ...u, dsa_code: dsaCode.trim() }
                        : u
                ));
                setShowDsaCodeModal(false);
                setSelectedUser(null);
                setDsaCode('');
            } else {
                alert(response.data.message || 'Failed to update DSA code');
            }
        } catch (err) {
            alert('Failed to update DSA code');
        } finally {
            setSavingDsaCode(false);
        }
    };

    // Handle DSA Login
    const handleDsaLogin = async (user) => {
        setLoginLoadingId(user.id);
        setLoginStatus({ ...loginStatus, [user.id]: 'generating' });

        try {
            const response = await apiService.vGet(`/api/dsa/admin/users/${user.id}/dsa-login-url`);

            if (response.data.status === 1) {
                setLoginStatus({ ...loginStatus, [user.id]: 'redirecting' });

                // Small delay so user sees "Redirecting..." message
                setTimeout(() => {
                    window.open(response.data.data.login_url, '_blank');
                    setLoginLoadingId(null);
                    setLoginStatus({ ...loginStatus, [user.id]: null });
                }, 500);
            } else {
                alert(response.data.message || 'Failed to generate login URL');
                setLoginLoadingId(null);
                setLoginStatus({ ...loginStatus, [user.id]: null });
            }
        } catch (err) {
            alert('Failed to generate login URL');
            setLoginLoadingId(null);
            setLoginStatus({ ...loginStatus, [user.id]: null });
        }
    };

    // Get login button text
    const getLoginButtonText = (userId) => {
        const status = loginStatus[userId];
        if (status === 'generating') return 'Generating...';
        if (status === 'redirecting') return 'Redirecting...';
        return 'Login DSA';
    };

    // Render pagination
    const renderPagination = () => {
        const pages = [];
        const { current_page, last_page } = pagination;

        for (let i = 1; i <= last_page; i++) {
            if (
                i === 1 ||
                i === last_page ||
                (i >= current_page - 2 && i <= current_page + 2)
            ) {
                pages.push(
                    <li key={i} className={`page-item ${current_page === i ? 'active' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </button>
                    </li>
                );
            } else if (i === current_page - 3 || i === current_page + 3) {
                pages.push(
                    <li key={i} className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }

        return (
            <nav aria-label="User pagination">
                <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(current_page - 1)}
                            disabled={current_page === 1}
                        >
                            Previous
                        </button>
                    </li>
                    {pages}
                    <li className={`page-item ${current_page === last_page ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(current_page + 1)}
                            disabled={current_page === last_page}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-people me-2"></i>
                                DSA Users Management
                            </h5>
                            <span className="badge bg-light text-dark">
                                Total: {pagination.total}
                            </span>
                        </div>

                        <div className="card-body">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by name, mobile, MID, or DSA code..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary">
                                            <i className="bi bi-search"></i> Search
                                        </button>
                                        {search && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => {
                                                    setSearch('');
                                                    setSearchParams({});
                                                    fetchUsers(1);
                                                }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* Error */}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            {!loading && users.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>MID</th>
                                                <th>Name</th>
                                                <th>Mobile</th>
                                                <th>DSA Code</th>
                                                <th>Status</th>
                                                <th style={{ width: '200px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>
                                                        <code>{user.mid}</code>
                                                    </td>
                                                    <td>{user.name}</td>
                                                    <td>{user.mobile}</td>
                                                    <td>
                                                        {user.dsa_code ? (
                                                            <span className="badge bg-success">
                                                                {user.dsa_code}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-warning text-dark">
                                                                Not Set
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                            {user.status === 1 ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => handleDsaLogin(user)}
                                                                disabled={loginLoadingId === user.id}
                                                            >
                                                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                                                {getLoginButtonText(user.id)}
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => openDsaCodeModal(user)}
                                                            >
                                                                <i className="bi bi-pencil me-1"></i>
                                                                {user.dsa_code ? 'Edit Code' : 'Set Code'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && users.length === 0 && (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-inbox display-4"></i>
                                    <p className="mt-3">No users found</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && pagination.last_page > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <small className="text-muted">
                                        Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                        {pagination.total} users
                                    </small>
                                    {renderPagination()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DSA Code Modal */}
            {showDsaCodeModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-key me-2"></i>
                                    Update DSA Code
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDsaCodeModal(false)}
                                    disabled={savingDsaCode}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">
                                    Enter the DSA code for <strong>{selectedUser?.name}</strong> (MID: {selectedUser?.mid})
                                </p>
                                <div className="form-group">
                                    <label className="form-label">DSA Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 22PV0725"
                                        value={dsaCode}
                                        onChange={(e) => setDsaCode(e.target.value.toUpperCase())}
                                        disabled={savingDsaCode}
                                    />
                                    <small className="form-text text-muted">
                                        Get this code from the DSA panel website
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDsaCodeModal(false)}
                                    disabled={savingDsaCode}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={saveDsaCode}
                                    disabled={savingDsaCode || !dsaCode.trim()}
                                >
                                    {savingDsaCode ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-1"></i>
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
