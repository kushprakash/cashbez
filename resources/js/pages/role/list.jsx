
import React, { useEffect, useState, useRef } from 'react';
import ApiService from '../../core/services/ApiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableShimmerLoader from '../components/TableShimmerLoader';
import Pageheader from '../../layouts/Pageheader';

const ListRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Use refs to track indices - these persist across re-renders
  const draggedIndexRef = useRef(null);
  const dragOverIndexRef = useRef(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiService = ApiService();
      const response = await apiService.vGet('/api/roles');
      const { data } = response;
      if (data.status !== 1) {
        throw new Error(data.message || 'Failed to fetch roles');
      }
      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    draggedIndexRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.target.style.opacity = '0.5';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (index !== draggedIndexRef.current) {
      dragOverIndexRef.current = index;
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    e.target.style.opacity = '1';

    const sourceIndex = draggedIndexRef.current;
    const targetIndex = dropIndex;

    if (sourceIndex === null || sourceIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      draggedIndexRef.current = null;
      dragOverIndexRef.current = null;
      return;
    }

    // Perform the reorder
    const items = Array.from(roles);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, reorderedItem);

    // Update local state immediately for smooth UX
    setRoles(items);
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;

    // Update backend
    try {
      const apiService = ApiService();
      const rolesWithOrder = items.map((role) => ({ id: role.id }));
      const response = await apiService.vPost('/api/roles/update-order', { roles: rolesWithOrder });

      if (response.data.status === 1) {
        toast.success('Role order updated successfully');
        fetchRoles();
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role order');
      fetchRoles();
    }
  };

  const getRowStyle = (index) => {
    let style = {
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'grab',
      position: 'relative',
    };

    if (index === draggedIndex) {
      style.opacity = 0.4;
      style.backgroundColor = '#e3f2fd';
      style.transform = 'scale(0.98)';
      style.cursor = 'grabbing';
    } else if (index === dragOverIndex) {
      // Show insertion indicator
      const isMovingDown = draggedIndex !== null && draggedIndex < index;
      style.backgroundColor = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
      style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
      style.transform = isMovingDown ? 'translateY(4px)' : 'translateY(-4px)';
      style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
      style.borderLeft = '3px solid #3b82f6';
    }

    return style;
  };

  // Inline styles for the draggable table
  const tableStyles = `
    .drag-table tbody tr {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .drag-table tbody tr:hover {
      background-color: #f8fafc;
    }
    .drag-table tbody tr:active {
      cursor: grabbing;
    }
    .drag-handle {
      transition: all 0.2s ease;
    }
    .drag-handle:hover {
      background-color: #e5e7eb !important;
      transform: scale(1.1);
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .dragging {
      animation: pulse 1s ease-in-out infinite;
    }
  `;

  return (
    <>
      <Pageheader mainheading="Role Master" parentfolder="Roles" activepage="List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                  <h3 className="mb-0 fw-bold">User Roles</h3>
                  <Link to="/role/create" className="btn btn-primary text-white d-flex align-items-center">
                    <i className="fa fa-plus me-1"></i> Create Role
                  </Link>
                </div>
                {loading && <TableShimmerLoader />}
                {error && <div className="alert alert-danger">{error}</div>}
                {!loading && !error && (
                  <div className="card-body p-0">
                    <style>{tableStyles}</style>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0 drag-table">
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: '60px' }}>Position</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th style={{ width: '100px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roles.map((role, index) => (
                            <tr
                              key={role.id}
                              className={index === draggedIndex ? 'dragging' : ''}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnter={(e) => handleDragEnter(e, index)}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragEnd={handleDragEnd}
                              style={getRowStyle(index)}
                            >
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className="drag-handle"
                                    style={{
                                      cursor: 'grab',
                                      padding: '6px 10px',
                                      borderRadius: '6px',
                                      backgroundColor: '#f3f4f6',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    title="Drag to reorder"
                                  >
                                    <i className="fa fa-grip-vertical text-muted"></i>
                                  </span>
                                  <span className="badge bg-primary">{role.guest || index + 1}</span>
                                </div>
                              </td>
                              <td>{role.name}</td>
                              <td>
                                <span className={`badge ${role.status === 1 || role.status === '1' ? 'bg-success' : 'bg-secondary'}`}>
                                  {role.status === 1 || role.status === '1' ? 'Active' : 'Not Active'}
                                </span>
                              </td>
                              <td>
                                <Link
                                  to={`/role/edit/${role.id}`}
                                  className="btn btn-primary btn-sm"
                                >
                                  Edit
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {roles.length === 0 && (
                        <div className="text-center py-5 text-muted">
                          No roles found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListRole;
