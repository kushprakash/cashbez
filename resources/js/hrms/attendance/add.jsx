import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';

const AddAttendance = () => {
    const [showGpsPrompt, setShowGpsPrompt] = useState(false);
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        address: '',
        accuracy: null
    });
    const [selfie, setSelfie] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [todayStatus, setTodayStatus] = useState({
        has_checked_in: false,
        has_checked_out: false,
        attendance: null
    });
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [error, setError] = useState('');
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    
    const navigate = useNavigate();
    const apiService = ApiService();

    useEffect(() => {
        fetchTodayStatus();
        getCurrentLocation();
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const fetchTodayStatus = async () => {
        try {
            const response = await apiService.vGet('/api/attendance/today-status');
            if (response.data && response.data.status === 1) {
                const att = response.data.data;
                setTodayStatus({
                    attendance: att,
                    has_checked_in: !!att?.check_in,
                    has_checked_out: !!att?.check_out,
                    total_hours: att?.total_hours !== undefined && att?.total_hours !== null
                        ? (typeof att.total_hours === 'number' ? `${Math.floor(att.total_hours)}:${Math.round((att.total_hours % 1) * 60).toString().padStart(2, '0')}:00` : att.total_hours)
                        : '00:00:00'
                });
            } else {
                setTodayStatus({
                    has_checked_in: false,
                    has_checked_out: false,
                    attendance: null,
                    total_hours: '00:00:00'
                });
            }
        } catch (error) {
            setTodayStatus({
                has_checked_in: false,
                has_checked_out: false,
                attendance: null,
                total_hours: '00:00:00'
            });
            console.error('Error fetching today status:', error);
        }
    };

    // Use Google Maps Geolocation API for premium accuracy
    const getCurrentLocation = async () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation({
                        latitude: lat,
                        longitude: lng,
                        address: 'Getting address...',
                        accuracy: position.coords.accuracy
                    });
                    try {
                        const address = await getAddressFromCoordinates(lat, lng);
                        setLocation(prev => ({
                            ...prev,
                            address: address
                        }));
                    } catch (error) {
                        setLocation(prev => ({
                            ...prev,
                            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
                        }));
                    }
                    setLoadingLocation(false);
                },
                (error) => {
                    setError('Could not get your location. Please enable GPS/location and try again.');
                    setLoadingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setError('Geolocation is not supported by this browser. Please use a modern browser and enable location services.');
            setLoadingLocation(false);
        }
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
          
            // Use Google Maps Geocoding API (premium features if enabled on your key)
            const apiKey = 'AIzaSyALI8Lb6FwzpfqxoBSVq1cGo9gXmN2KQTw'; // <-- Replace with your Google Maps API key
            // Add result_type and location_type for more specific/premium results
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en&result_type=street_address|premise|point_of_interest|establishment|neighborhood|sublocality|locality|postal_code&location_type=ROOFTOP|RANGE_INTERPOLATED`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const components = data.results[0].address_components;
                let premise = '';
                let school = '';
                let sublocality = '';
                let village = '';
                let locality = '';
                let block = '';
                let district = '';
                let state = '';
                let country = '';
                let postal_code = '';

                components.forEach(comp => {
                    if (comp.types.includes('premise')) premise = comp.long_name;
                    if (comp.types.includes('point_of_interest') || comp.types.includes('establishment')) school = comp.long_name;
                    if (comp.types.includes('sublocality_level_1')) sublocality = comp.long_name;
                    if (comp.types.includes('neighborhood')) village = comp.long_name;
                    if (comp.types.includes('locality')) locality = comp.long_name;
                    if (comp.types.includes('administrative_area_level_3')) block = comp.long_name;
                    if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
                    if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
                    if (comp.types.includes('country')) country = comp.long_name;
                    if (comp.types.includes('postal_code')) postal_code = comp.long_name;
                });

                // Build address in order: school/premise, village, sublocality, locality, block, district, state, country, postal_code
                let addressParts = [];
                if (school) addressParts.push(school);
                if (premise && premise !== school) addressParts.push(premise);
                if (village) addressParts.push(village);
                if (sublocality) addressParts.push(sublocality);
                if (locality) addressParts.push(locality);
                if (block) addressParts.push(block);
                if (district) addressParts.push(district);
                if (state) addressParts.push(state);
                if (country) addressParts.push(country);
                if (postal_code) addressParts.push(postal_code);

                let address = addressParts.join(', ');
                // Fallback to formatted_address if custom address is too short
                if (!address || address.split(',').length < 4) {
                    address = data.results[0].formatted_address;
                }
                return address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            } else {
                return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
        } catch (error) {
            throw error;
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user' // Front camera for selfie
                } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setShowCamera(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error('Please allow camera access to take selfie');
        }
    };

    const takeSelfie = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (canvas && video) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            // Convert to base64
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            setSelfie(dataURL);
            
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            setShowCamera(false);
        }
    };

    const retakeSelfie = () => {
        setSelfie(null);
        startCamera();
    };

    const handleCheckIn = async () => {
        if (!location.latitude || !location.longitude) {
            toast.error('Location is required for check-in');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                notes: notes
            };
            if (selfie) payload.selfie = selfie;

            const response = await apiService.vPost('/api/attendance/check-in', payload, true, true);
            
            if (response.data && response.data.status === 1) {
                toast.success('Checked in successfully!');
                fetchTodayStatus(); // Refresh status
                // Clear form
                setSelfie(null);
                setNotes('');
            } else {
                toast.error(response.data.message || 'Failed to check in');
            }
        } catch (error) {
            console.error('Error checking in:', error);
            if (error?.response?.data?.error) {
                Object.values(error.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(error?.response?.data?.message || 'Error checking in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!location.latitude || !location.longitude) {
            toast.error('Location is required for check-out');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                notes: notes
            };
            if (selfie) payload.selfie = selfie;

            const response = await apiService.vPost('/api/attendance/check-out', payload, true, true);
            
            if (response.data && response.data.status === 1) {
                toast.success('Checked out successfully!');
                fetchTodayStatus(); // Refresh status
                // Clear form
                setSelfie(null);
                setNotes('');
            } else {
                toast.error(response.data.message || 'Failed to check out');
            }
        } catch (error) {
            console.error('Error checking out:', error);
            if (error?.response?.data?.error) {
                Object.values(error.response.data.error).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(error?.response?.data?.message || 'Error checking out. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
         
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            <Pageheader mainheading="Attendance Management" parentfolder="HRMS" activepage="Mark Attendance" />
            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                                    <span className="d-flex align-items-center">
                                        <i className="bi bi-clock me-2" style={{ fontSize: '1.3rem' }}></i>
                                        <h5 className="mb-0 fw-semibold">Mark Attendance</h5>
                                    </span>
                                    <Link to="/hrms/attendance/list" className="btn btn-primary text-white d-flex align-items-center">
                                        <i className="fa fa-list me-1"></i> Attendance List
                                    </Link>
                                </div>
                                <div className="card-body p-4">
                                    
                                    {/* Today's Status */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="alert alert-info">
                                                <h6 className="mb-2">Today's Status</h6>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <strong>Check In:</strong> {todayStatus.attendance?.check_in ? 
                                                            new Date(todayStatus.attendance.check_in).toLocaleString() : 'Not checked in'}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <strong>Check Out:</strong> {todayStatus.attendance?.check_out ? 
                                                            new Date(todayStatus.attendance.check_out).toLocaleString() : 'Not checked out'}
                                                    </div>
                                                    <div className="col-md-4">
                                                        <strong>Total Hours:</strong> {todayStatus.total_hours || '00:00:00'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        {/* Location Section */}
                                        <div className="col-md-6 mb-4">
                                            <div className="card border">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="fa fa-map-marker-alt me-2"></i>Current Location
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    {loadingLocation ? (
                                                        <div className="text-center">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <p className="mt-2">Getting your location...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {location.latitude && location.longitude ? (
                                                                <>
                                                                    <p><strong>Address:</strong> {location.address}</p>
                                                                    <p><strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                                                                    {location.accuracy !== null && (
                                                                        <p><strong>Accuracy:</strong> {location.accuracy} meters</p>
                                                                    )}
                                                                    <button 
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        onClick={getCurrentLocation}
                                                                    >
                                                                        <i className="fa fa-refresh me-1"></i>Refresh Location
                                                                    </button>
                                                                    {location.accuracy !== null && location.accuracy > 50 && (
                                                                        <div className="alert alert-warning mt-2">
                                                                            <strong>Location accuracy is low.</strong> Please move to an open area or enable GPS/high-accuracy mode and try again.
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <button 
                                                                    className="btn btn-primary"
                                                                    onClick={getCurrentLocation}
                                                                >
                                                                    <i className="fa fa-map-marker-alt me-1"></i>Get Current Location
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selfie Section */}
                                        <div className="col-md-6 mb-4">
                                            <div className="card border">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="fa fa-camera me-2"></i>Take Selfie
                                                    </h6>
                                                </div>
                                                <div className="card-body text-center">
                                                    {showCamera ? (
                                                        <div>
                                                            <video 
                                                                ref={videoRef} 
                                                                autoPlay 
                                                                muted 
                                                                className="img-fluid mb-3"
                                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                            />
                                                            <br />
                                                            <button 
                                                                className="btn btn-success me-2"
                                                                onClick={takeSelfie}
                                                            >
                                                                <i className="fa fa-camera me-1"></i>Capture
                                                            </button>
                                                            <button 
                                                                className="btn btn-secondary"
                                                                onClick={() => {
                                                                    if (stream) {
                                                                        stream.getTracks().forEach(track => track.stop());
                                                                        setStream(null);
                                                                    }
                                                                    setShowCamera(false);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : selfie ? (
                                                        <div>
                                                            <img 
                                                                src={selfie} 
                                                                alt="Selfie" 
                                                                className="img-fluid mb-3"
                                                                style={{ maxWidth: '300px', borderRadius: '8px' }}
                                                            />
                                                            <br />
                                                            <button 
                                                                className="btn btn-outline-primary"
                                                                onClick={retakeSelfie}
                                                            >
                                                                <i className="fa fa-redo me-1"></i>Retake Selfie
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-primary"
                                                            onClick={startCamera}
                                                        >
                                                            <i className="fa fa-camera me-1"></i>Take Selfie
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="col-12 mb-4">
                                            <div className="card border">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="fa fa-sticky-note me-2"></i>Notes (Optional)
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        placeholder="Add any notes about your work today..."
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-12">
                                            <div className="d-flex gap-3">
                                                {!todayStatus.has_checked_in ? (
                                                    <button 
                                                        className="btn btn-success btn-lg flex-fill"
                                                        onClick={handleCheckIn}
                                                        disabled={loading || !location.latitude}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Checking In...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fa fa-sign-in-alt me-2"></i>Check In
                                                            </>
                                                        )}
                                                    </button>
                                                ) : !todayStatus.has_checked_out ? (
                                                    <button 
                                                        className="btn btn-danger btn-lg flex-fill"
                                                        onClick={handleCheckOut}
                                                        disabled={loading || !location.latitude}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Checking Out...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fa fa-sign-out-alt me-2"></i>Check Out
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="alert alert-success w-100 text-center">
                                                        <h5><i className="fa fa-check-circle me-2"></i>Attendance Completed for Today!</h5>
                                                        <p className="mb-0">You have successfully checked in and out for today.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Hidden canvas for capturing selfie */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </>
    );
};

export default AddAttendance;
