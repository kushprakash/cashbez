import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import { uploadToBunny, deleteFromBunny } from '../../utils/BunnyUploadService';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        icon_type: 'upload',
        icon_url: '',
        display_order: 0,
        is_active: true,
    });
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [originalIconUrl, setOriginalIconUrl] = useState(null); // Track original for deletion
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    const apiService = ApiService();

    useEffect(() => {
        if (isEdit) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/dsa/admin/categories/${id}`);
            if (response.data.status === 1) {
                const cat = response.data.data;
                setFormData({
                    name: cat.name,
                    icon_type: cat.icon_type || 'upload',
                    icon_url: cat.icon_type === 'url' ? cat.icon : '',
                    display_order: cat.display_order || 0,
                    is_active: cat.is_active,
                });
                if (cat.icon) {
                    setIconPreview(cat.icon);
                    // Track original icon URL for cleanup if re-uploaded
                    if (cat.icon_type === 'upload') {
                        setOriginalIconUrl(cat.icon);
                    }
                }
            }
        } catch (err) {
            setError('Failed to fetch category');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setUploadProgress(0);

        try {
            let iconUrl = formData.icon_url;

            // Upload file to BunnyCDN if icon_type is 'upload' and a file is selected
            if (formData.icon_type === 'upload' && iconFile) {
                toast.info('Uploading icon to CDN...');
                
                const result = await uploadToBunny(iconFile, 'dsa_icons', (percent) => {
                    setUploadProgress(percent);
                });

                if (result.success) {
                    iconUrl = result.url;
                    toast.success('Icon uploaded successfully!');
                    
                    // Delete old icon from CDN if it was a Bunny upload
                    if (originalIconUrl && originalIconUrl !== iconUrl) {
                        console.log('Deleting old icon:', originalIconUrl);
                        await deleteFromBunny(originalIconUrl);
                    }
                } else {
                    setError(`Failed to upload icon: ${result.error}`);
                    setSaving(false);
                    return;
                }
            }

            // Send data as JSON (no FormData needed since file is already uploaded)
            const payload = {
                name: formData.name,
                icon_type: formData.icon_type,
                icon_url: iconUrl || iconPreview, // Use new URL or existing one
                display_order: formData.display_order,
                is_active: formData.is_active ? 1 : 0,
            };

            const url = isEdit 
                ? `/api/dsa/admin/categories/${id}` 
                : '/api/dsa/admin/categories';
            
            const response = await apiService.vPost(url, payload);
            
            if (response.data.status === 1) {
                toast.success(isEdit ? 'Category updated!' : 'Category created!');
                navigate('/dsa/admin/categories');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to save category');
            console.error('Save error:', err);
        } finally {
            setSaving(false);
            setUploadProgress(0);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="ti ti-category me-2"></i>
                    {isEdit ? 'Edit Category' : 'Add Category'}
                </h4>
                <Link to="/dsa/admin/categories" className="btn btn-outline-secondary">
                    <i className="ti ti-arrow-left me-1"></i>Back
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Display Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="display_order"
                                    value={formData.display_order}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Status</label>
                                <div className="form-check form-switch mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label">
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Icon Type</label>
                                <select
                                    className="form-select"
                                    name="icon_type"
                                    value={formData.icon_type}
                                    onChange={handleChange}
                                >
                                    <option value="upload">Upload Image</option>
                                    <option value="url">External URL</option>
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                {formData.icon_type === 'upload' ? (
                                    <>
                                        <label className="form-label">Icon Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <small className="text-muted">
                                            Image will be uploaded to CDN with automatic compression
                                        </small>
                                    </>
                                ) : (
                                    <>
                                        <label className="form-label">Icon URL</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="icon_url"
                                            value={formData.icon_url}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mb-3">
                                <div className="progress" style={{height: '8px'}}>
                                    <div 
                                        className="progress-bar progress-bar-striped progress-bar-animated" 
                                        style={{width: `${uploadProgress}%`}}
                                    ></div>
                                </div>
                                <small className="text-muted">Uploading: {uploadProgress}%</small>
                            </div>
                        )}

                        {iconPreview && (
                            <div className="mb-3">
                                <label className="form-label">Preview</label>
                                <div>
                                    <img 
                                        src={iconPreview} 
                                        alt="Icon preview"
                                        style={{maxWidth: '100px', maxHeight: '100px'}}
                                        className="rounded border"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        {uploadProgress > 0 ? 'Uploading...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-device-floppy me-1"></i>
                                        {isEdit ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                            <Link to="/dsa/admin/categories" className="btn btn-outline-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm;
