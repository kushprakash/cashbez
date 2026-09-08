import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiService from '../../core/services/ApiService';
import { uploadToBunny, deleteFromBunny } from '../../utils/BunnyUploadService';

const BannerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        type: 'home',
        redirect_url: '',
        start_date: '',
        end_date: '',
        status: true,
    });
    const [customType, setCustomType] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [originalImageUrl, setOriginalImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);

    const apiService = ApiService();

    // Banner type options
    const typeOptions = [
        { value: 'home', label: 'Home Page' },
        { value: 'dth', label: 'DTH Recharge' },
        { value: 'mobile', label: 'Mobile Recharge' },
        { value: 'online_service ', label: 'Online Service' },
        { value: 'other', label: 'Other' },
    ];

    useEffect(() => {
        if (isEdit) {
            fetchBanner();
        }
    }, [id]);

    const fetchBanner = async () => {
        try {
            setLoading(true);
            const response = await apiService.vGet(`/api/admin/banners/${id}`);
            if (response.data.status === 1) {
                const banner = response.data.data;
                setFormData({
                    type: banner.type,
                    redirect_url: banner.redirect_url || '',
                    start_date: banner.start_date ? banner.start_date.split(' ')[0] : '',
                    end_date: banner.end_date ? banner.end_date.split(' ')[0] : '',
                    status: !!banner.status,
                });
                if (banner.image) {
                    setImagePreview(banner.image);
                    setOriginalImageUrl(banner.image);
                }
                
                // Check if banner type is not in predefined options
                const predefinedTypes = ['home', 'dth', 'mobile', 'online_service', 'other'];
                if (banner.type && !predefinedTypes.includes(banner.type)) {
                    setFormData(prev => ({ ...prev, type: 'other' }));
                    setCustomType(banner.type);
                }
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError('Failed to fetch banner');
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
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEdit && !imageFile) {
            setError('Please select an image');
            return;
        }

        setSaving(true);
        setError(null);
        setUploadProgress(0);

        try {
            let imageUrl = originalImageUrl;

            // Upload new image to BunnyCDN if selected
            if (imageFile) {
                toast.info('Uploading image to CDN...');
                
                const result = await uploadToBunny(imageFile, 'banners', (percent) => {
                    setUploadProgress(percent);
                });

                if (result.success) {
                    imageUrl = result.url;
                    toast.success('Image uploaded successfully!');
                    
                    // Delete old image if re-uploading
                    if (originalImageUrl && originalImageUrl !== imageUrl) {
                        console.log('Deleting old banner image:', originalImageUrl);
                        await deleteFromBunny(originalImageUrl);
                    }
                } else {
                    setError(`Failed to upload image: ${result.error}`);
                    setSaving(false);
                    return;
                }
            }

            const payload = {
                type: formData.type === 'other' ? customType : formData.type,
                image_url: imageUrl,
                redirect_url: formData.redirect_url,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                status: formData.status ? 1 : 0,
            };

            const url = isEdit 
                ? `/api/admin/banners/${id}` 
                : '/api/admin/banners';
            
            const response = isEdit
                ? await apiService.vPut(url, payload)
                : await apiService.vPost(url, payload);
            
            if (response.data.status === 1) {
                toast.success(isEdit ? 'Banner updated!' : 'Banner created!');
                navigate('/admin/banners');
            } else {
                setError(response.data.error || response.data.message || 'Failed to save banner');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save banner');
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
                    <i className="ti ti-photo me-2"></i>
                    {isEdit ? 'Edit Banner' : 'Add Banner'}
                </h4>
                <Link to="/admin/banners" className="btn btn-outline-secondary">
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
                                <label className="form-label">Banner Type *</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    {typeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Custom Type Input when 'other' is selected */}
                            {formData.type === 'other' && (
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Custom Type Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={customType}
                                        onChange={(e) => setCustomType(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                        placeholder="e.g., promo_winter"
                                        required
                                    />
                                    <small className="text-muted">Use lowercase with underscores (auto-formatted)</small>
                                </div>
                            )}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Banner Redirect URL / Link (Optional)</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    name="redirect_url"
                                    value={formData.redirect_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/promo or /banking/bill-payment"
                                />
                                <small className="text-muted">Target page URL opened when retailer clicks the banner.</small>
                            </div>

                            <div className="col-md-3 mb-3">
                                <label className="form-label">Schedule Start Date (Optional)</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-3">
                                <label className="form-label">Schedule End Date (Optional)</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <div className="form-check form-switch mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status}
                                        onChange={handleChange}
                                        id="status"
                                    />
                                    <label className="form-check-label" htmlFor="status">
                                        {formData.status ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Banner Image {!isEdit && '*'}
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!isEdit}
                            />
                            <small className="text-muted">
                                Recommended: 1920x600 pixels. Image will be auto-compressed.
                            </small>
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

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mb-3">
                                <label className="form-label">Preview</label>
                                <div>
                                    <img 
                                        src={imagePreview} 
                                        alt="Banner preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}
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
                            <Link to="/admin/banners" className="btn btn-outline-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BannerForm;
