import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CommissionAssignments = () => {
    const navigate = useNavigate();
    const apiService = ApiService();

    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'
    const [roles, setRoles] = useState([]);
    const [packages, setPackages] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Controlled React dropdown state per role
    const [openRoleId, setOpenRoleId] = useState(null);

    // Role assignment form state: { [role_id]: [package_id1, package_id2] }
    const [rolePackages, setRolePackages] = useState({});
    const [savingRole, setSavingRole] = useState(false);

    // User direct override state
    const [filterRoleId, setFilterRoleId] = useState('');
    const [roleUsers, setRoleUsers] = useState([]);
    const [userQuery, setUserQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPackageIds, setUserPackageIds] = useState([]); // Multiple packages for user override
    const [savingUser, setSavingUser] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, pkgRes, assignRes, userRes] = await Promise.all([
                apiService.vGet('/api/commission-master/roles'),
                apiService.vGet('/api/commission-master/packages'),
                apiService.vGet('/api/commission-master/assignments'),
                apiService.vGet('/api/commission-master/users/search?q=')
            ]);

            if (rolesRes.data && rolesRes.data.status === 1) {
                setRoles(rolesRes.data.data || []);
            }
            if (pkgRes.data && pkgRes.data.status === 1) {
                setPackages(pkgRes.data.data || []);
            }
            if (assignRes.data && assignRes.data.status === 1) {
                const list = assignRes.data.data || [];
                setAssignments(list);

                // Populate rolePackages matrix (array of package IDs per role)
                const roleMap = {};
                list.filter(a => a.assign_type === 'role').forEach(a => {
                    if (!roleMap[a.role_id]) roleMap[a.role_id] = [];
                    if (!roleMap[a.role_id].includes(a.package_id)) {
                        roleMap[a.role_id].push(a.package_id);
                    }
                });
                setRolePackages(roleMap);
            }
            if (userRes.data && userRes.data.status === 1) {
                setAllUsers(userRes.data.data || []);
                setSearchResults(userRes.data.data || []);
            }
        } catch (error) {
            toast.error('Error loading assignments data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch users when filterRoleId changes
    useEffect(() => {
        if (filterRoleId) {
            apiService.vGet(`/api/commission-master/users/search?role_id=${filterRoleId}`)
                .then(res => {
                    if (res.data && res.data.status === 1) {
                        setRoleUsers(res.data.data || []);
                    }
                })
                .catch(() => setRoleUsers([]));
        } else {
            setRoleUsers([]);
        }
    }, [filterRoleId]);

    // Search users for direct assignment
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (userQuery.trim().length > 0) {
                try {
                    const url = filterRoleId
                        ? `/api/commission-master/users/search?role_id=${filterRoleId}&q=${encodeURIComponent(userQuery)}`
                        : `/api/commission-master/users/search?q=${encodeURIComponent(userQuery)}`;
                    const response = await apiService.vGet(url);
                    if (response.data && response.data.status === 1) {
                        setSearchResults(response.data.data || []);
                    }
                } catch (error) {
                    // ignore
                }
            } else {
                setSearchResults(filterRoleId && roleUsers.length > 0 ? roleUsers : allUsers);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [userQuery, filterRoleId, roleUsers, allUsers]);

    // Toggle package selection for a role
    const handleToggleRolePackage = (roleId, packageId) => {
        const numericId = Number(packageId);
        setRolePackages(prev => {
            const current = prev[roleId] ? [...prev[roleId]] : [];
            const idx = current.indexOf(numericId);
            if (idx > -1) {
                current.splice(idx, 1);
            } else {
                current.push(numericId);
            }
            return {
                ...prev,
                [roleId]: current
            };
        });
    };

    const handleSaveRoleAssignment = async (roleId) => {
        const pkgIds = rolePackages[roleId] || [];

        setSavingRole(true);
        try {
            const response = await apiService.vPost('/api/commission-master/assignments/role', {
                role_id: roleId,
                package_ids: pkgIds
            });

            if (response.data && response.data.status === 1) {
                toast.success('Packages assigned to Role successfully');
                fetchData();
            } else {
                toast.error(response.data?.message || 'Failed to assign packages');
            }
        } catch (error) {
            toast.error('Error assigning packages to Role');
        } finally {
            setSavingRole(false);
        }
    };

    const handleSaveUserAssignment = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            toast.warning('Please select a user from search results');
            return;
        }
        if (!userPackageIds || userPackageIds.length === 0) {
            toast.warning('Please select at least one package');
            return;
        }

        setSavingUser(true);
        try {
            const response = await apiService.vPost('/api/commission-master/assignments/user', {
                user_id: selectedUser.id,
                package_ids: userPackageIds
            });

            if (response.data && response.data.status === 1) {
                toast.success(`Direct Packages assigned to user ${selectedUser.name} successfully`);
                setSelectedUser(null);
                setUserQuery('');
                setUserPackageIds([]);
                fetchData();
            } else {
                toast.error(response.data?.message || 'Failed to assign packages to user');
            }
        } catch (error) {
            toast.error('Error assigning packages to user');
        } finally {
            setSavingUser(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm('Remove this package assignment?')) return;
        try {
            const response = await apiService.vDelete(`/api/commission-master/assignments/${assignmentId}`);
            if (response.data && response.data.status === 1) {
                toast.success('Assignment removed');
                fetchData();
            } else {
                toast.error('Failed to remove assignment');
            }
        } catch (error) {
            toast.error('Error removing assignment');
        }
    };

    return (
        <div className="page-content-box mt-0 pt-0">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 pt-3">
                <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.2rem' }}>
                        <span className="text-muted fw-normal">Commission Master / </span>
                        <span className="text-secondary fw-bold">Package Assignments</span>
                    </h5>
                    <p className="text-secondary small mb-0">Assign Multiple Commission Packages to Roles or Override for Individual Users</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/packages')}
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-boxes me-1"></i> Packages List ({packages.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/commission-master/special-offers')}
                        className="btn btn-sm btn-outline-warning rounded-3 px-3 fw-semibold"
                    >
                        <i className="fas fa-gift me-1"></i> Special Offers
                    </button>
                </div>
            </div>

            {/* Tabs Header */}
            <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border">
                <li className="nav-item">
                    <button
                        className={`nav-link fw-bold rounded-3 px-4 ${activeTab === 'roles' ? 'active bg-primary text-white' : 'text-secondary'}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        <i className="fas fa-users-cog me-2"></i> Role-wise Multiple Package Assignment
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link fw-bold rounded-3 px-4 ${activeTab === 'users' ? 'active bg-primary text-white' : 'text-secondary'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <i className="fas fa-user-shield me-2"></i> User-wise Override Assignment
                    </button>
                </li>
            </ul>

            {/* Tab 1: Role Assignments */}
            {activeTab === 'roles' && (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold text-dark mb-1 small text-uppercase">
                                    Assign Multiple Packages by User Role
                                </h6>
                                <p className="text-muted small mb-0">
                                    Select and assign multiple commission packages per role. Users will inherit all active packages assigned to their role.
                                </p>
                            </div>
                            <span className="badge bg-light text-dark border px-3 py-2 fw-bold">
                                Total Packages Available: {packages.length}
                            </span>
                        </div>

                        <div className="table-responsive" style={{ overflow: 'visible' }}>
                            <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                                <thead className="bg-light">
                                    <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                        <th className="py-3 px-3" style={{ width: '60px' }}>SR NO</th>
                                        <th className="py-3 px-3" style={{ width: '180px' }}>USER ROLE</th>
                                        <th className="py-3 px-3">ASSIGNED COMMISSION PACKAGES (MULTIPLE)</th>
                                        <th className="py-3 px-3 text-center" style={{ width: '140px' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </td>
                                        </tr>
                                    ) : roles.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">No roles found.</td>
                                        </tr>
                                    ) : (
                                        roles.map((role, idx) => {
                                            const roleAssignedPkgs = rolePackages[role.id] || [];

                                            return (
                                                <tr key={role.id}>
                                                    <td className="py-3 px-3 text-secondary fw-semibold">{idx + 1}</td>
                                                    <td className="py-3 px-3 fw-bold text-dark">{role.name}</td>
                                                    <td className="py-3 px-3">
                                                        <div className="d-flex flex-column gap-2">
                                                            {/* Selected Packages Badges */}
                                                            <div className="d-flex flex-wrap gap-1.5 align-items-center">
                                                                {roleAssignedPkgs.length === 0 ? (
                                                                    <span className="text-muted small fst-italic">No packages assigned yet</span>
                                                                ) : (
                                                                    roleAssignedPkgs.map(pkgId => {
                                                                        const pkg = packages.find(p => p.id == pkgId);
                                                                        if (!pkg) return null;
                                                                        return (
                                                                            <span
                                                                                key={pkg.id}
                                                                                className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 shadow-xs"
                                                                                style={{ fontSize: '0.78rem' }}
                                                                            >
                                                                                <i className="fas fa-box" style={{ fontSize: '10px' }}></i>
                                                                                {pkg.name} {pkg.api ? `(${pkg.api.api_name})` : '(ALL APIs)'}
                                                                                <i
                                                                                    className="fas fa-times cursor-pointer ms-1 text-danger"
                                                                                    style={{ cursor: 'pointer', fontSize: '11px' }}
                                                                                    onClick={() => handleToggleRolePackage(role.id, pkg.id)}
                                                                                    title="Remove package"
                                                                                ></i>
                                                                            </span>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>

                                                            {/* Package Selector Expandable Panel */}
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    className={`btn btn-sm ${openRoleId === role.id ? 'btn-primary text-white' : 'btn-outline-primary'} rounded-3 px-3 py-1.5 fw-semibold text-start d-inline-flex align-items-center justify-content-between`}
                                                                    onClick={() => setOpenRoleId(openRoleId === role.id ? null : role.id)}
                                                                    style={{ minWidth: '260px', maxWidth: '380px', fontSize: '0.82rem' }}
                                                                >
                                                                    <span>
                                                                        <i className="fas fa-boxes me-1.5"></i>
                                                                        {roleAssignedPkgs.length === 0 ? 'Select / Add Packages' : `${roleAssignedPkgs.length} Packages Selected`}
                                                                    </span>
                                                                    <i className={`fas fa-chevron-${openRoleId === role.id ? 'up' : 'down'} ms-2 small`}></i>
                                                                </button>

                                                                {openRoleId === role.id && (
                                                                    <div className="card shadow-lg border rounded-3 mt-2 bg-white" style={{ maxWidth: '540px' }}>
                                                                        <div className="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center border-bottom">
                                                                            <span className="fw-bold small text-secondary">
                                                                                SELECT PACKAGES FOR {role.name.toUpperCase()} ({packages.length} AVAILABLE)
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-bold small"
                                                                                onClick={() => {
                                                                                    const allIds = packages.map(p => p.id);
                                                                                    setRolePackages(prev => ({
                                                                                        ...prev,
                                                                                        [role.id]: roleAssignedPkgs.length === packages.length ? [] : allIds
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                {roleAssignedPkgs.length === packages.length ? 'Deselect All' : 'Select All'}
                                                                            </button>
                                                                        </div>
                                                                        <div className="card-body p-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                                                            {packages.length === 0 ? (
                                                                                <div className="text-muted small py-2 px-2">No packages available. Create a package first.</div>
                                                                            ) : (
                                                                                <div className="row g-2">
                                                                                    {packages.map(pkg => {
                                                                                        const isChecked = roleAssignedPkgs.includes(pkg.id);
                                                                                        return (
                                                                                            <div key={pkg.id} className="col-md-6">
                                                                                                <div
                                                                                                    className={`p-2 rounded-2 border cursor-pointer d-flex align-items-center justify-content-between ${isChecked ? 'bg-primary-subtle border-primary text-primary fw-bold' : 'bg-white text-dark'}`}
                                                                                                    onClick={() => handleToggleRolePackage(role.id, pkg.id)}
                                                                                                    style={{ cursor: 'pointer', fontSize: '0.83rem' }}
                                                                                                >
                                                                                                    <div className="form-check mb-0">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            className="form-check-input me-2 cursor-pointer"
                                                                                                            checked={isChecked}
                                                                                                            onChange={() => {}}
                                                                                                            id={`role-${role.id}-pkg-${pkg.id}`}
                                                                                                        />
                                                                                                        <label className="form-check-label fw-semibold text-dark cursor-pointer" htmlFor={`role-${role.id}-pkg-${pkg.id}`}>
                                                                                                            {pkg.name}
                                                                                                            <span className="d-block text-muted small fw-normal" style={{ fontSize: '0.73rem' }}>
                                                                                                                {pkg.api ? `API: ${pkg.api.api_name}` : 'ALL APIs'}
                                                                                                            </span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="card-footer bg-light py-2 px-3 text-end border-top">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-primary text-white fw-bold px-3 rounded-2"
                                                                                onClick={() => setOpenRoleId(null)}
                                                                            >
                                                                                Done ({roleAssignedPkgs.length} selected)
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveRoleAssignment(role.id)}
                                                            disabled={savingRole}
                                                            className="btn btn-sm btn-success text-white fw-bold px-3 rounded-3"
                                                        >
                                                            <i className="fas fa-save me-1"></i> SAVE
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: User Override Assignments */}
            {activeTab === 'users' && (
                <div className="row g-4">
                    {/* Left: User Override Form */}
                    <div className="col-md-5">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-dark mb-3 small text-uppercase">
                                    Assign Direct Multiple Packages to User (Override)
                                </h6>
                                <p className="text-muted small mb-3">
                                    Select a single user by Name/MID and assign one or multiple custom packages.
                                </p>

                                <form onSubmit={handleSaveUserAssignment}>
                                    {/* 1. Filter by Role (Optional) */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-secondary mb-1">Filter by User Role (Optional)</label>
                                        <select
                                            className="form-select form-select-sm rounded-3"
                                            value={filterRoleId}
                                            onChange={(e) => {
                                                setFilterRoleId(e.target.value);
                                                setSelectedUser(null);
                                                setUserQuery('');
                                            }}
                                        >
                                            <option value="">🌐 ALL ROLES (All Users Table)</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Search & Select User */}
                                    <div className="mb-3 position-relative">
                                        <label className="form-label small fw-semibold text-secondary mb-1">Search User (Name/MID/Mobile)</label>

                                        <div className="input-group input-group-sm">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 fw-semibold"
                                                placeholder="Type name / MID / mobile..."
                                                value={selectedUser ? `${selectedUser.name} ${selectedUser.mid ? '— MID: ' + selectedUser.mid : ''}` : userQuery}
                                                onFocus={() => setShowUserDropdown(true)}
                                                onChange={(e) => {
                                                    setSelectedUser(null);
                                                    setUserQuery(e.target.value);
                                                    setShowUserDropdown(true);
                                                }}
                                                required={!selectedUser}
                                            />
                                            {selectedUser && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm rounded-end-3"
                                                    onClick={() => {
                                                        setSelectedUser(null);
                                                        setUserQuery('');
                                                    }}
                                                    title="Clear Selection"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {showUserDropdown && searchResults.length > 0 && !selectedUser && (
                                            <ul className="list-group position-absolute w-100 shadow-lg border mt-1" style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}>
                                                {searchResults.map((u) => (
                                                    <button
                                                        key={u.id}
                                                        type="button"
                                                        className="list-group-item list-group-item-action small py-2 px-3 text-start border-bottom"
                                                        onClick={() => {
                                                            setSelectedUser(u);
                                                            setShowUserDropdown(false);
                                                        }}
                                                    >
                                                        <div className="fw-bold text-dark">{u.name}</div>
                                                        <div className="text-primary small" style={{ fontSize: '0.75rem' }}>
                                                            {u.mid ? `MID: ${u.mid}` : ''} {u.mobile ? `| Mobile: ${u.mobile}` : ''}
                                                        </div>
                                                    </button>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* 3. Multi-Select Commission Packages */}
                                    <div className="mb-4">
                                        <label className="form-label small fw-semibold text-secondary mb-1">Select Commission Packages (Multiple)</label>
                                        <div className="border rounded-3 p-3 bg-light" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                                                <span className="fw-bold small text-secondary">AVAILABLE PACKAGES ({userPackageIds.length} SELECTED)</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm text-decoration-none p-0 text-primary small fw-semibold"
                                                    onClick={() => setUserPackageIds(userPackageIds.length === packages.length ? [] : packages.map(p => p.id))}
                                                >
                                                    {userPackageIds.length === packages.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            {packages.length === 0 ? (
                                                <div className="text-muted small py-2">No packages available.</div>
                                            ) : (
                                                packages.map((pkg) => {
                                                    const isSelected = userPackageIds.includes(pkg.id);
                                                    return (
                                                        <div key={pkg.id} className="form-check py-1">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input cursor-pointer"
                                                                id={`user-pkg-${pkg.id}`}
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setUserPackageIds(prev => [...prev, pkg.id]);
                                                                    } else {
                                                                        setUserPackageIds(prev => prev.filter(id => id !== pkg.id));
                                                                    }
                                                                }}
                                                            />
                                                            <label className="form-check-label fw-semibold text-dark cursor-pointer small" htmlFor={`user-pkg-${pkg.id}`}>
                                                                {pkg.name} <span className="text-muted">({pkg.api ? pkg.api.api_name : 'ALL APIs'})</span>
                                                            </label>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={savingUser}
                                        className="btn btn-primary btn-sm w-100 text-white fw-bold py-2 rounded-3"
                                    >
                                        <i className="fas fa-check-circle me-1"></i> {savingUser ? 'ASSIGNING...' : 'ASSIGN DIRECT PACKAGES'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right: Active User Overrides Table */}
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-dark mb-3 small text-uppercase">
                                    Direct User Package Overrides
                                </h6>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 border" style={{ fontSize: '0.85rem' }}>
                                        <thead className="bg-light">
                                            <tr className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                <th className="py-2 px-3">SR</th>
                                                <th className="py-2 px-3">USER NAME & MID</th>
                                                <th className="py-2 px-3">MOBILE / EMAIL</th>
                                                <th className="py-2 px-3">ASSIGNED DIRECT PACKAGES</th>
                                                <th className="py-2 px-3 text-center">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.filter(a => a.assign_type === 'user').length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4 text-muted">
                                                        No direct user package overrides assigned yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                /* Group user assignments by user_id */
                                                Object.values(
                                                    assignments.filter(a => a.assign_type === 'user').reduce((acc, a) => {
                                                        if (!acc[a.user_id]) {
                                                            acc[a.user_id] = {
                                                                userInfo: a.userInfo,
                                                                user_id: a.user_id,
                                                                items: []
                                                            };
                                                        }
                                                        acc[a.user_id].items.push(a);
                                                        return acc;
                                                    }, {})
                                                ).map((group, idx) => (
                                                    <tr key={group.user_id}>
                                                        <td className="py-2 px-3 text-secondary fw-semibold">{idx + 1}</td>
                                                        <td className="py-2 px-3 fw-bold text-dark">
                                                            {group.userInfo?.name || 'User #' + group.user_id}
                                                            {group.userInfo?.mid && (
                                                                <span className="badge bg-light text-primary border ms-1" style={{ fontSize: '0.7rem' }}>
                                                                    MID: {group.userInfo.mid}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-3 text-muted">{group.userInfo?.mobile || group.userInfo?.email || '-'}</td>
                                                        <td className="py-2 px-3">
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {group.items.map(a => (
                                                                    <span key={a.id} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                                                                        {a.package?.name || 'Package #' + a.package_id}
                                                                        <i
                                                                            className="fas fa-times cursor-pointer ms-1 text-danger"
                                                                            style={{ cursor: 'pointer', fontSize: '10px' }}
                                                                            onClick={() => handleDeleteAssignment(a.id)}
                                                                            title="Remove assignment"
                                                                        ></i>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (window.confirm(`Remove all direct package assignments for ${group.userInfo?.name || 'this user'}?`)) {
                                                                        group.items.forEach(a => handleDeleteAssignment(a.id));
                                                                    }
                                                                }}
                                                                className="btn btn-sm btn-outline-danger border-0 p-1"
                                                                title="Remove All Assignments for User"
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionAssignments;
