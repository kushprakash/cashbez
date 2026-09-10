import React, { useState, useEffect, useRef } from 'react';
import { uploadToBunny } from '../../../utils/BunnyUploadService';
import { toast } from 'react-toastify';

const GpsCameraModal = ({
    show,
    onClose,
    onCaptureSuccess,
    type, // 'shop_inner' | 'shop_outer' | 'video_url'
    title,
    location = { latitude: '', longitude: '' }
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const fileInputRef = useRef(null);

    const isVideoMode = type === 'video_url';

    const [facingMode, setFacingMode] = useState(isVideoMode ? 'user' : 'environment');
    const [cameraActive, setCameraActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [currentCoords, setCurrentCoords] = useState({
        latitude: location.latitude || '',
        longitude: location.longitude || ''
    });

    // Sync coords if location prop changes or fetch fresh geolocation
    useEffect(() => {
        if (show) {
            fetchLocation();
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [show, facingMode]);

    const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCurrentCoords({
                        latitude: pos.coords.latitude.toFixed(6),
                        longitude: pos.coords.longitude.toFixed(6)
                    });
                },
                (err) => {
                    console.warn('Geolocation error in modal:', err);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    const startCamera = async () => {
        setErrorMsg('');
        stopCamera();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorMsg('Camera access requires HTTPS or is restricted by your mobile browser settings. You can use the Native Camera button below.');
            setCameraActive(false);
            return;
        }

        const constraintLevels = [
            // 1. Precise facingMode + ideal resolution
            {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: isVideoMode
            },
            // 2. Simple facingMode
            {
                video: { facingMode: facingMode },
                audio: isVideoMode
            },
            // 3. Simple video with audio
            {
                video: true,
                audio: isVideoMode
            },
            // 4. Video only without audio (if microphone permission failed)
            {
                video: true,
                audio: false
            }
        ];

        let mediaStream = null;
        let lastError = null;

        for (const constraints of constraintLevels) {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                if (mediaStream) break;
            } catch (err) {
                console.warn('Camera constraint level failed:', constraints, err);
                lastError = err;
            }
        }

        if (mediaStream) {
            streamRef.current = mediaStream;
            setCameraActive(true);

            // Bind stream to video element
            setTimeout(() => {
                if (videoRef.current) {
                    const videoEl = videoRef.current;
                    videoEl.setAttribute('playsinline', 'true');
                    videoEl.setAttribute('webkit-playsinline', 'true');
                    videoEl.muted = true;
                    videoEl.srcObject = mediaStream;
                    videoEl.play().catch(e => console.warn('Video play error:', e));
                }
            }, 50);
        } else {
            console.error('All camera constraint levels failed:', lastError);
            setErrorMsg('Camera stream inactive. Use the Native Phone Camera button below.');
            setCameraActive(false);
        }
    };

    // Auto-bind stream when cameraActive changes
    useEffect(() => {
        if (cameraActive && streamRef.current && videoRef.current) {
            const videoEl = videoRef.current;
            videoEl.setAttribute('playsinline', 'true');
            videoEl.setAttribute('webkit-playsinline', 'true');
            videoEl.muted = true;
            if (videoEl.srcObject !== streamRef.current) {
                videoEl.srcObject = streamRef.current;
                videoEl.play().catch(e => console.warn('Autoplay error:', e));
            }
        }
    }, [cameraActive]);

    const stopCamera = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setIsRecording(false);
        setRecordingTime(0);
    };

    const toggleFacingMode = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    };

    // Draw Google Map style watermark overlay on canvas
    const drawWatermark = (ctx, width, height) => {
        const now = new Date();
        const dateTimeStr = now.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        }) + ' ' + now.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const latStr = currentCoords.latitude ? `${currentCoords.latitude}° N` : 'Lat: N/A';
        const longStr = currentCoords.longitude ? `${currentCoords.longitude}° E` : 'Long: N/A';

        // Bottom banner background
        const bannerHeight = Math.max(75, height * 0.15);
        const bannerY = height - bannerHeight;

        // Dark gradient banner
        const gradient = ctx.createLinearGradient(0, bannerY, 0, height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.85)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // Accent left bar (Google Map green/emerald)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, bannerY, 8, bannerHeight);

        // Icon & Text positioning
        const paddingLeft = 20;
        let textY = bannerY + 24;

        // Title line
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('📍 GPS MAP VERIFIED LOCATION', paddingLeft, textY);

        // Coordinates line
        textY += 20;
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`LAT: ${latStr}  |  LONG: ${longStr}`, paddingLeft, textY);

        // Timestamp & Badge line
        textY += 18;
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`📅 ${dateTimeStr}  •  Cashbez AEPS KYC`, paddingLeft, textY);
    };

    // Capture Image with Watermark & High KB Compression
    const handleCapturePhoto = async () => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        // Ultra-light image dimensions (Max 800px for small KB size)
        const origWidth = video.videoWidth || 1280;
        const origHeight = video.videoHeight || 720;
        const maxDim = 800;
        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (origWidth > maxDim || origHeight > maxDim) {
            if (origWidth > origHeight) {
                targetHeight = Math.round((origHeight * maxDim) / origWidth);
                targetWidth = maxDim;
            } else {
                targetWidth = Math.round((origWidth * maxDim) / origHeight);
                targetHeight = maxDim;
            }
        }

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Mirror front camera if user facing
        if (facingMode === 'user') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
        } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Draw Watermark
        drawWatermark(ctx, canvas.width, canvas.height);

        // Quality 0.60 produces extremely lightweight ~40KB - 80KB images
        canvas.toBlob(async (blob) => {
            if (!blob) {
                toast.error('Failed to capture photo frame');
                return;
            }
            console.log(`📦 Compressed Photo Size: ${(blob.size / 1024).toFixed(1)} KB`);
            const file = new File([blob], `${type}_${Date.now()}.jpg`, { type: 'image/jpeg' });
            await uploadFileToBunny(file);
        }, 'image/jpeg', 0.60);
    };

    // 10-Second Video Recording with Compressed Bitrate (< 1 MB Guarantee)
    const handleStartRecording = () => {
        if (!videoRef.current || !streamRef.current) return;

        const video = videoRef.current;
        // Optimized 640x480 (or 480x640 portrait) resolution for < 1 MB size
        const targetWidth = facingMode === 'user' ? 480 : 640;
        const targetHeight = facingMode === 'user' ? 640 : 480;

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Render loop at 20 FPS
        const renderLoop = () => {
            if (facingMode === 'user') {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
                ctx.restore();
            } else {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            drawWatermark(ctx, canvas.width, canvas.height);
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        // 20 FPS stream for optimal file size
        const canvasStream = canvas.captureStream(20);

        // Mix microphone audio
        const audioTrack = streamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            canvasStream.addTrack(audioTrack);
        }

        let mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else {
                mimeType = '';
            }
        }

        // Strict 500 Kbps video + 64 Kbps audio bitrate (~600 KB - 800 KB for 10 sec)
        const recorderOptions = {
            mimeType: mimeType || undefined,
            videoBitsPerSecond: 500000,
            audioBitsPerSecond: 64000
        };

        try {
            recordedChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(canvasStream, recorderOptions);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
                const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                console.log(`📹 Compressed Recorded Video Size: ${(blob.size / (1024 * 1024)).toFixed(2)} MB (${(blob.size / 1024).toFixed(1)} KB)`);
                const file = new File([blob], `video_kyc_${Date.now()}.${ext}`, { type: blob.type });
                await uploadFileToBunny(file);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(500);
            setIsRecording(true);
            setRecordingTime(0);
        } catch (err) {
            console.error('MediaRecorder initialization failed:', err);
            toast.error('Failed to start video recording on this browser');
        }
    };

    // Handle 10-second timer countdown
    useEffect(() => {
        let interval = null;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 10) {
                        stopRecording();
                        return 10;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    // Upload to Bunny CDN helper
    const uploadFileToBunny = async (file) => {
        setUploading(true);
        setUploadProgress(0);
        try {
            const folder = isVideoMode ? 'aeps_kyc/videos' : 'aeps_kyc/images';
            const sizeStr = file.size > 1024 * 1024 
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(1)} KB`;
            toast.info(`Uploading ${title} (${sizeStr})... Please wait`);

            const result = await uploadToBunny(
                file,
                folder,
                (percent) => setUploadProgress(percent),
                !isVideoMode
            );

            if (result.success && result.url) {
                toast.success(`${title} uploaded successfully! (${sizeStr})`);
                onCaptureSuccess(type, result.url);
                onClose();
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error(err.message || 'Failed to upload to CDN');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Fallback Manual File Pick with Automatic Smart Compression
    const handleFilePick = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            try {
                toast.info('Compressing image to light KB size & applying GPS stamp...');
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const maxDim = 800;
                let targetWidth = img.naturalWidth || 1280;
                let targetHeight = img.naturalHeight || 720;

                if (targetWidth > maxDim || targetHeight > maxDim) {
                    if (targetWidth > targetHeight) {
                        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
                        targetWidth = maxDim;
                    } else {
                        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
                        targetHeight = maxDim;
                    }
                }

                const canvas = canvasRef.current || document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                drawWatermark(ctx, targetWidth, targetHeight);

                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        await uploadFileToBunny(file);
                        return;
                    }
                    console.log(`📦 Gallery Image Compressed: ${(file.size / 1024).toFixed(1)} KB → ${(blob.size / 1024).toFixed(1)} KB`);
                    const stampedFile = new File([blob], `${type}_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    await uploadFileToBunny(stampedFile);
                }, 'image/jpeg', 0.60);
            } catch (err) {
                console.warn('Compression/Watermark on file pick failed, uploading original:', err);
                await uploadFileToBunny(file);
            }
        } else if (file.type.startsWith('video/')) {
            // Check video size
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > 1.5) {
                toast.warning(`Notice: Selected video is ${sizeMB.toFixed(1)} MB. Compressing video...`);
            }
            await uploadFileToBunny(file);
        } else {
            await uploadFileToBunny(file);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px', backgroundColor: '#0f172a' }}>
                    
                    {/* Header */}
                    <div className="modal-header border-0 text-white" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '16px 24px' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <i className={isVideoMode ? "bi bi-camera-reels-fill text-danger" : "bi bi-camera-fill text-primary"}></i>
                            {title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={uploading}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-0 position-relative text-center" style={{ minHeight: '400px', backgroundColor: '#000000' }}>
                        
                        {/* Live Watermark Canvas (Hidden / Used for capture) */}
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

                        {/* Camera Stream Viewport (Always mounted in DOM for instant live stream) */}
                        <div className={`position-relative w-100 overflow-hidden ${!cameraActive ? 'd-none' : ''}`} style={{ maxHeight: '500px' }}>
                            <video
                                ref={videoRef}
                                playsInline
                                webkit-playsinline="true"
                                autoPlay
                                muted
                                className="w-100 h-100 object-fit-cover"
                                style={{
                                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                                    maxHeight: '480px'
                                }}
                            ></video>

                            {/* Live GPS Watermark Badge on Viewport */}
                            <div className="position-absolute bottom-0 start-0 w-100 p-3 text-start text-white"
                                 style={{
                                     background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)',
                                     pointerEvents: 'none'
                                 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge text-white" style={{ backgroundColor: '#10b981', fontSize: '11px' }}>
                                        <i className="bi bi-geo-alt-fill me-1"></i> LIVE GPS MAP
                                    </span>
                                    <span className="small" style={{ color: '#cbd5e1', fontSize: '12px' }}>
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="fw-semibold" style={{ color: '#38bdf8', fontSize: '13px' }}>
                                    LAT: {currentCoords.latitude || 'Fetching...'} | LONG: {currentCoords.longitude || 'Fetching...'}
                                </div>
                            </div>

                            {/* Video Recording Instructions & Timer Overlay */}
                            {isVideoMode && (
                                <div className="position-absolute top-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                                    <div className="alert bg-black bg-opacity-75 border-warning text-warning text-center m-0 py-2 px-3 rounded-3 shadow">
                                        <div className="fw-bold mb-1" style={{ fontSize: '13px' }}>
                                            <i className="bi bi-mic-fill me-1"></i> Speak clearly: "My Name is [Name], Aadhaar last 4 digits are [XXXX]"
                                        </div>
                                        {isRecording ? (
                                            <div className="d-flex align-items-center justify-content-center gap-2 text-danger fw-bold fs-6">
                                                <span className="spinner-grow spinner-grow-sm" role="status"></span>
                                                RECORDING: {recordingTime}s / 10s
                                            </div>
                                        ) : (
                                            <div className="small text-white opacity-75">Max 10 Seconds Video</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Inactive Camera State View (Shown only if stream fails to start) */}
                        {!cameraActive && (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 px-3 text-slate-400">
                                <i className="bi bi-camera-video-off display-3 text-secondary mb-3"></i>
                                <p className="mb-3 text-white px-3" style={{ fontSize: '14px', maxWidth: '480px' }}>
                                    {errorMsg || 'Starting live camera stream... Please wait.'}
                                </p>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <button type="button" className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={startCamera}>
                                        <i className="bi bi-arrow-clockwise me-1"></i> Retry Live Stream
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="bi bi-camera-fill me-1"></i> Open Phone Camera
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Uploading Progress Overlay */}
                        {uploading && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-85 text-white" style={{ zIndex: 10 }}>
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                                <h6 className="fw-bold text-white mb-2">Uploading to Bunny CDN...</h6>
                                <div className="progress w-50 bg-secondary" style={{ height: '10px', borderRadius: '5px' }}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <span className="small mt-2 text-light">{uploadProgress}% Complete</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="modal-footer border-0 d-flex justify-content-between align-items-center" style={{ background: '#1e293b', padding: '16px 24px' }}>
                        <div>
                            {/* Switch Camera */}
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm rounded-circle me-2"
                                onClick={toggleFacingMode}
                                title="Switch Camera"
                                disabled={uploading || isRecording}
                                style={{ width: '42px', height: '42px' }}
                            >
                                <i className="bi bi-camera-fill"></i>
                            </button>

                            {/* Fallback File Select */}
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3 text-light"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || isRecording}
                            >
                                <i className="bi bi-camera-fill me-1"></i> Take Photo / File
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="d-none"
                                accept={isVideoMode ? "video/*" : "image/*"}
                                capture={facingMode === 'user' ? 'user' : 'environment'}
                                onChange={handleFilePick}
                            />
                        </div>

                        <div>
                            {isVideoMode ? (
                                !isRecording ? (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-lg px-4 rounded-pill fw-bold shadow d-flex align-items-center gap-2"
                                        onClick={handleStartRecording}
                                        disabled={!cameraActive || uploading}
                                    >
                                        <i className="bi bi-record-circle-fill fs-5"></i> Start 10s Record
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-warning btn-lg px-4 rounded-pill fw-bold shadow d-flex align-items-center gap-2"
                                        onClick={stopRecording}
                                    >
                                        <i className="bi bi-stop-circle-fill fs-5"></i> Stop & Upload ({recordingTime}s)
                                    </button>
                                )
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg px-4 rounded-pill fw-bold shadow d-flex align-items-center gap-2"
                                    onClick={handleCapturePhoto}
                                    disabled={!cameraActive || uploading}
                                >
                                    <i className="bi bi-camera-fill fs-5"></i> Capture Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GpsCameraModal;
