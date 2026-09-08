import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import { uploadToBunny, deleteFromBunny } from '../../utils/BunnyUploadService';

const ItemForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        title: '',
        icon_type: 'upload',
        icon_url: '',
        link: '',
        link_type: 'url',
        other_url: '',
        target_audience: [''],
        terms_conditions: [''],
        instructions: [''],
        display_order: 0,
        is_active: true,
        android: true,
        web: false,
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
        fetchCategories();
        if (isEdit) {
            fetchItem();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await apiService.vGet('/api/dsa/admin/categories');
            if (response.data.status === 1) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchItem = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/dsa/admin/items/${id}`);
            if (response.data.status === 1) {
                const item = response.data.data;
                setFormData({
                    category_id: item.category_id,
                    title: item.title,
                    icon_type: item.icon_type || 'upload',
                    icon_url: item.icon_type === 'url' ? item.icon : '',
                    link: item.link,
                    link_type: item.link_type || 'url',
                    other_url: item.other_url || '',
                    target_audience: item.target_audience?.length > 0 ? item.target_audience : [''],
                    terms_conditions: item.terms_conditions?.length > 0 ? item.terms_conditions : [''],
                    instructions: item.instructions?.length > 0 ? item.instructions : [''],
                    display_order: item.display_order || 0,
                    is_active: item.is_active,
                    android: item.android,
                    web: item.web,
                });
                if (item.icon) {
                    setIconPreview(item.icon);
                    // Track original icon URL for cleanup if re-uploaded
                    if (item.icon_type === 'upload') {
                        setOriginalIconUrl(item.icon);
                    }
                }
            }
        } catch (err) {
            setError('Failed to fetch item');
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

    // Dynamic array field handlers
    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleAddArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
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
                category_id: formData.category_id,
                title: formData.title,
                icon_type: formData.icon_type,
                icon_url: iconUrl || iconPreview, // Use new URL or existing one
                link: formData.link,
                link_type: formData.link_type,
                other_url: formData.other_url || null,
                target_audience: formData.target_audience.filter(item => item.trim() !== ''),
                terms_conditions: formData.terms_conditions.filter(item => item.trim() !== ''),
                instructions: formData.instructions.filter(item => item.trim() !== ''),
                display_order: formData.display_order,
                is_active: formData.is_active ? 1 : 0,
                android: formData.android ? 1 : 0,
                web: formData.web ? 1 : 0,
            };

            const url = isEdit
                ? `/api/dsa/admin/items/${id}`
                : '/api/dsa/admin/items';

            const response = await apiService.vPost(url, payload);

            if (response.data.status === 1) {
                toast.success(isEdit ? 'Item updated!' : 'Item created!');
                navigate('/dsa/admin/items');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to save item');
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
                    <i className="ti ti-apps me-2"></i>
                    {isEdit ? 'Edit Item' : 'Add Item'}
                </h4>
                <Link to="/dsa/admin/items" className="btn btn-outline-secondary">
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
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-select"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Link Type</label>
                                <select
                                    className="form-select"
                                    name="link_type"
                                    value={formData.link_type}
                                    onChange={handleChange}
                                >
                                    <option value="url">External URL</option>
                                    <option value="path">App Route/Path</option>
                                    <option value="dsa">DSA Link (IndiaSales)</option>
                                </select>
                                {formData.link_type === 'dsa' && (
                                    <small className="text-muted">
                                        DSA links build URLs like: https://indiasales.club/COMPANY/USER_CODE/your-path
                                    </small>
                                )}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Link *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.link_type === 'url'
                                            ? 'https://...'
                                            : formData.link_type === 'dsa'
                                                ? 'saving-account or /credit-card'
                                                : '/route/path'
                                    }
                                    required
                                />
                                {formData.link_type === 'dsa' && (
                                    <small className="text-muted">
                                        Enter only the path part, e.g., "saving-account" or "credit-card"
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <label className="form-label">Other URL (Optional)</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="other_url"
                                    value={formData.other_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                                <small className="text-muted">
                                    Optional alternative URL for this item
                                </small>
                            </div>
                        </div>

                        {/* Dynamic Fields Section */}
                        <div className="card bg-light border-0 mb-3">
                            <div className="card-body">
                                <h6 className="card-title mb-3">
                                    <i className="fa fa-list-alt me-2"></i>Additional Information
                                </h6>

                                {/* Target Audience */}
                                <div className="mb-3">
                                    <label className="form-label d-flex justify-content-between align-items-center">
                                        <span>Target Audience</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleAddArrayItem('target_audience')}
                                        >
                                            <i className="fa fa-plus me-1"></i>Add
                                        </button>
                                    </label>
                                    {formData.target_audience.map((item, index) => (
                                        <div key={index} className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item}
                                                onChange={(e) => handleArrayChange('target_audience', index, e.target.value)}
                                                placeholder={`Target audience ${index + 1}`}
                                            />
                                            {formData.target_audience.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleRemoveArrayItem('target_audience', index)}
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Terms & Conditions */}
                                <div className="mb-3">
                                    <label className="form-label d-flex justify-content-between align-items-center">
                                        <span>Terms & Conditions</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleAddArrayItem('terms_conditions')}
                                        >
                                            <i className="fa fa-plus me-1"></i>Add
                                        </button>
                                    </label>
                                    {formData.terms_conditions.map((item, index) => (
                                        <div key={index} className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item}
                                                onChange={(e) => handleArrayChange('terms_conditions', index, e.target.value)}
                                                placeholder={`Term ${index + 1}`}
                                            />
                                            {formData.terms_conditions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleRemoveArrayItem('terms_conditions', index)}
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Instructions */}
                                <div className="mb-0">
                                    <label className="form-label d-flex justify-content-between align-items-center">
                                        <span>Instructions</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleAddArrayItem('instructions')}
                                        >
                                            <i className="fa fa-plus me-1"></i>Add
                                        </button>
                                    </label>
                                    {formData.instructions.map((item, index) => (
                                        <div key={index} className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item}
                                                onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                                                placeholder={`Instruction ${index + 1}`}
                                            />
                                            {formData.instructions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleRemoveArrayItem('instructions', index)}
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4 mb-3">
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
                            <div className="col-md-4 mb-3">
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
                                            Uploads to CDN with compression
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
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Display Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="display_order"
                                    value={formData.display_order}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mb-3">
                                <div className="progress" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        style={{ width: `${uploadProgress}%` }}
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
                                        style={{ maxWidth: '80px', maxHeight: '80px' }}
                                        className="rounded border"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="row mb-3">
                            <div className="col-12">
                                <label className="form-label">Visibility</label>
                                <div className="d-flex gap-4">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            id="is_active"
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="android"
                                            checked={formData.android}
                                            onChange={handleChange}
                                            id="android"
                                        />
                                        <label className="form-check-label" htmlFor="android">
                                            Show on Android
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="web"
                                            checked={formData.web}
                                            onChange={handleChange}
                                            id="web"
                                        />
                                        <label className="form-check-label" htmlFor="web">
                                            Show on Web
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                            <Link to="/dsa/admin/items" className="btn btn-outline-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ItemForm;
