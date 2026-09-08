/**
 * BunnyCDN Direct Upload Service
 * Uploads files directly to BunnyCDN from the browser (no server load)
 * Includes smart compression based on file type and usage
 */

import ApiService from '../core/services/ApiService';

let cachedConfig = null;

/**
 * Compression presets based on folder/usage type
 * Each preset defines: maxWidth, maxHeight, quality (0-1), maxSizeKB
 */
const COMPRESSION_PRESETS = {
    // Logos - small, high quality
    logo: { maxWidth: 400, maxHeight: 400, quality: 0.9, maxSizeKB: 100 },
    favicon: { maxWidth: 64, maxHeight: 64, quality: 0.9, maxSizeKB: 20 },
    footer_logo: { maxWidth: 300, maxHeight: 150, quality: 0.85, maxSizeKB: 80 },
    
    // Popups - medium size, good quality
    popups: { maxWidth: 800, maxHeight: 800, quality: 0.85, maxSizeKB: 300 },
    popup: { maxWidth: 800, maxHeight: 800, quality: 0.85, maxSizeKB: 300 },
    
    // Documents - larger allowed, maintain readability
    gst_documents: { maxWidth: 1200, maxHeight: 1600, quality: 0.8, maxSizeKB: 500 },
    itr_documents: { maxWidth: 1200, maxHeight: 1600, quality: 0.8, maxSizeKB: 500 },
    income_tax: { maxWidth: 1200, maxHeight: 1600, quality: 0.8, maxSizeKB: 500 },
    documents: { maxWidth: 1200, maxHeight: 1600, quality: 0.8, maxSizeKB: 500 },
    
    // Settings/branding
    settings: { maxWidth: 600, maxHeight: 600, quality: 0.85, maxSizeKB: 200 },
    
    // Shop images (AEPS)
    shop_images: { maxWidth: 1280, maxHeight: 1280, quality: 0.8, maxSizeKB: 400 },
    aeps: { maxWidth: 1280, maxHeight: 1280, quality: 0.8, maxSizeKB: 400 },
    
    // Default for unknown folders
    default: { maxWidth: 1200, maxHeight: 1200, quality: 0.85, maxSizeKB: 500 }
};

/**
 * Get compression preset for a folder
 */
const getCompressionPreset = (folder) => {
    const folderLower = folder.toLowerCase();
    
    // Check each preset key
    for (const [key, preset] of Object.entries(COMPRESSION_PRESETS)) {
        if (folderLower.includes(key)) {
            return preset;
        }
    }
    
    return COMPRESSION_PRESETS.default;
};

/**
 * Check if file is an image that can be compressed
 */
const isCompressibleImage = (file) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return imageTypes.includes(file.type.toLowerCase());
};

/**
 * Compress image using canvas
 * @param {File} file - Image file to compress
 * @param {Object} preset - Compression preset
 * @returns {Promise<Blob>} - Compressed image blob
 */
const compressImage = async (file, preset) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            try {
                let { width, height } = img;
                const { maxWidth, maxHeight, quality } = preset;
                
                // Calculate new dimensions maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Use high quality image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Draw image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with quality
                // Use WebP if supported for better compression, fallback to JPEG
                const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log(`📦 Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (${Math.round((1 - blob.size / file.size) * 100)}% reduction)`);
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas compression failed'));
                        }
                    },
                    outputType,
                    quality
                );
            } catch (err) {
                reject(err);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Smart compress file based on type and folder
 * @param {File} file - File to potentially compress
 * @param {string} folder - Target folder (determines preset)
 * @returns {Promise<File|Blob>} - Compressed file or original
 */
const smartCompress = async (file, folder) => {
    // Skip non-compressible files (PDFs, etc.)
    if (!isCompressibleImage(file)) {
        console.log(`📄 ${file.name}: Not an image, skipping compression`);
        return file;
    }
    
    const preset = getCompressionPreset(folder);
    const fileSizeKB = file.size / 1024;
    
    // Skip if file is already under threshold
    if (fileSizeKB <= preset.maxSizeKB * 0.8) {
        console.log(`✅ ${file.name}: Already optimized (${fileSizeKB.toFixed(1)}KB)`);
        return file;
    }
    
    try {
        console.log(`🔄 Compressing ${file.name} for ${folder}...`);
        const compressed = await compressImage(file, preset);
        
        // Only use compressed if it's actually smaller
        if (compressed.size < file.size) {
            return compressed;
        } else {
            console.log(`⚠️ Compression didn't help, using original`);
            return file;
        }
    } catch (error) {
        console.warn(`⚠️ Compression failed for ${file.name}:`, error);
        return file; // Return original on failure
    }
};

/**
 * Fetch BunnyCDN configuration from backend
 * Uses ApiService which handles auth (token/MID/MKEY) automatically
 */
export const fetchBunnyConfig = async () => {
    if (cachedConfig) return cachedConfig;
    
    try {
        const apiService = ApiService();
        const response = await apiService.vGet('/api/bunny/config');
        
        if (response.data && response.data.status === 1) {
            cachedConfig = response.data.data;
            return cachedConfig;
        }
        throw new Error(response.data?.message || 'Config fetch failed');
    } catch (error) {
        console.error('BunnyConfig Error:', error);
        throw error;
    }
};

/**
 * Generate unique filename
 */
const generateFilename = (file) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    // Get extension from original file or blob
    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    return `${timestamp}_${random}.${ext}`;
};

/**
 * Upload file directly to BunnyCDN with smart compression
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path (e.g., 'gst_documents', 'popups')
 * @param {function} onProgress - Optional progress callback (0-100)
 * @param {boolean} compress - Enable compression (default: true)
 * @returns {Promise<{success: boolean, url: string, error?: string}>}
 */
export const uploadToBunny = async (file, folder, onProgress = null, compress = true) => {
    try {
        // Smart compress before upload
        const fileToUpload = compress ? await smartCompress(file, folder) : file;
        
        const config = await fetchBunnyConfig();
        const filename = generateFilename(file); // Use original filename for extension
        const path = `${folder}/${filename}`;
        const uploadUrl = `${config.upload_url}/${path}`;
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('AccessKey', config.api_key);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            
            // Progress tracking
            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        onProgress(percent);
                    }
                };
            }
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const cdnUrl = `https://${config.cdn_hostname}/${path}`;
                    resolve({
                        success: true,
                        url: cdnUrl,
                        path: path,
                        filename: filename,
                        originalSize: file.size,
                        uploadedSize: fileToUpload.size
                    });
                } else {
                    reject({
                        success: false,
                        error: `Upload failed: ${xhr.statusText}`
                    });
                }
            };
            
            xhr.onerror = () => {
                reject({
                    success: false,
                    error: 'Network error during upload'
                });
            };
            
            xhr.send(fileToUpload);
        });
        
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Upload failed'
        };
    }
};

/**
 * Upload multiple files to BunnyCDN with compression
 * @param {FileList|File[]} files - Files to upload
 * @param {string} folder - Folder path
 * @param {function} onProgress - Progress callback for each file
 * @param {boolean} compress - Enable compression (default: true)
 * @returns {Promise<{success: boolean, urls: string[], errors: string[]}>}
 */
export const uploadMultipleToBunny = async (files, folder, onProgress = null, compress = true) => {
    const results = {
        success: true,
        urls: [],
        errors: [],
        totalSaved: 0
    };
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const result = await uploadToBunny(file, folder, (percent) => {
                if (onProgress) {
                    onProgress(i, percent, file.name);
                }
            }, compress);
            
            if (result.success) {
                results.urls.push(result.url);
                if (result.originalSize && result.uploadedSize) {
                    results.totalSaved += (result.originalSize - result.uploadedSize);
                }
            } else {
                results.errors.push(`${file.name}: ${result.error}`);
                results.success = false;
            }
        } catch (error) {
            results.errors.push(`${file.name}: ${error.message}`);
            results.success = false;
        }
    }
    
    if (results.totalSaved > 0) {
        console.log(`💾 Total saved: ${(results.totalSaved / 1024).toFixed(1)}KB`);
    }
    
    return results;
};

/**
 * Clear cached config (call on logout)
 */
export const clearBunnyConfig = () => {
    cachedConfig = null;
};

/**
 * Extract path from a BunnyCDN URL
 * @param {string} url - The CDN URL (e.g., https://cdn.example.com/folder/file.jpg)
 * @returns {string|null} - The path (e.g., folder/file.jpg) or null if invalid
 */
export const extractPathFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
        const urlObj = new URL(url);
        // Remove leading slash from pathname
        return urlObj.pathname.replace(/^\//, '');
    } catch (e) {
        console.warn('Failed to parse URL:', url);
        return null;
    }
};

/**
 * Delete a file from BunnyCDN via backend API
 * SECURITY: Delete operations only go through backend to keep API key secure
 * @param {string} urlOrPath - The CDN URL or path of the file to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFromBunny = async (urlOrPath) => {
    if (!urlOrPath) {
        return { success: true }; // Nothing to delete
    }
    
    try {
        const apiService = ApiService();
        
        // Call backend delete endpoint
        const response = await apiService.vPost('/api/bunny/delete', {
            url: urlOrPath.startsWith('http') ? urlOrPath : null,
            path: !urlOrPath.startsWith('http') ? urlOrPath : null,
        });
        
        if (response.data?.status === 1) {
            console.log(`🗑️ Deleted from CDN: ${urlOrPath}`);
            return { success: true };
        } else {
            return { 
                success: false, 
                error: response.data?.message || 'Delete failed' 
            };
        }
    } catch (error) {
        console.error('Delete error:', error);
        return { 
            success: false, 
            error: error.message || 'Delete failed' 
        };
    }
};

export default {
    uploadToBunny,
    uploadMultipleToBunny,
    deleteFromBunny,
    extractPathFromUrl,
    fetchBunnyConfig,
    clearBunnyConfig,
    smartCompress,
    COMPRESSION_PRESETS
};
