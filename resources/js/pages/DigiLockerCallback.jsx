import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Stack,
    Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ComputerIcon from '@mui/icons-material/Computer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { retrieveTokenAndUserData, storeTokenAndUserData } from '../core/auth/tokenManager';
import { toast, ToastContainer } from 'react-toastify';


const DigiLockerCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [attemptedDeepLink, setAttemptedDeepLink] = useState(false);

    // Extract parameters from URL
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const accessToken = searchParams.get('access_token');
    const userName = searchParams.get('name');
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'login' or 'register'
    const roleName = searchParams.get('role_name');
    const logo = searchParams.get('logo');

    const isSuccess = status === '1' && accessToken;
    const isError = status === '0' || error;

    // Build deep link URL for mobile app
    const buildDeepLink = () => {
        const params = new URLSearchParams();
        params.set('status', status || '0');

        if (isSuccess) {
            params.set('access_token', accessToken);
            params.set('type', type || 'login');
            if (userName) params.set('name', userName);
            if (userId) params.set('user_id', userId);
            if (roleName) params.set('role_name', roleName);
            if (logo) params.set('logo', logo);
        } else {
            if (error) params.set('error', error);
            if (errorDescription) params.set('error_description', errorDescription);
        }

        return `cashbez://digilocker?${params.toString()}`;
    };

    // Try to open the app automatically
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        // Try deep link automatically
        if (!attemptedDeepLink) {
            setAttemptedDeepLink(true);
            const deepLink = buildDeepLink();

            // Create a hidden iframe to try opening the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLink;
            document.body.appendChild(iframe);

            // Also try direct navigation
            setTimeout(() => {
                window.location.href = deepLink;
            }, 100);

            // Clean up iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }

        return () => clearTimeout(timer);
    }, []);

    const handleOpenApp = () => {
        window.location.href = buildDeepLink();
    };

    // Verify token and store user data
    const handleContinueWeb = async () => {
        if (isSuccess && accessToken) {
            setIsLoading(true);
            try {
                // Verify token and get user details
                const response = await axios.post('/api/userdata', {}, { headers: { Authorization: `Bearer ${accessToken}`, Token: accessToken } });

                if (response.data && response.data.status === 1 && response.data.user) {
                    const user = response.data.user || {};
                    if (user.name && user.mid) {
                        toast.success(`Welcome, ${user.name}! Login successful via DigiLocker.`);
                        localStorage.setItem('token', user.remember_token);
                        storeTokenAndUserData(user.remember_token, user);

                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 1500);

                    } else {
                        console.error('Failed to fetch user data');
                        navigate('/signin');
                    }

                } else {
                    console.error('Failed to fetch user data');
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                navigate('/signin');
            } finally {
                setIsLoading(false);
            }
        } else {
            navigate('/signin');
        }
    };

    const handleRetry = () => {
        navigate('/signin');
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        maxWidth: 400,
                    }}
                >
                    <CircularProgress size={60} sx={{ color: '#1e3a8a', mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                        Processing DigiLocker Response
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please wait while we verify your authentication...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSuccess
                    ? 'linear-gradient(135deg, #047857 0%, #10b981 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                    }}
                >
                    {/* DigiLocker Logo */}
                    <Box sx={{ mb: 3 }}>
                        <VerifiedUserIcon
                            sx={{
                                fontSize: 48,
                                color: '#1e3a8a',
                                mb: 1
                            }}
                        />
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: '#1e3a8a',
                                fontWeight: 600,
                                letterSpacing: 1
                            }}
                        >
                            DigiLocker
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Status Icon */}
                    {isSuccess ? (
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: '#10b981',
                                mb: 2
                            }}
                        />
                    ) : (
                        <ErrorIcon
                            sx={{
                                fontSize: 80,
                                color: '#dc2626',
                                mb: 2
                            }}
                        />
                    )}

                    {/* Status Message */}
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {isSuccess
                            ? (type === 'register'
                                ? 'Account Created Successfully!'
                                : 'Login Successful!')
                            : 'Authentication Failed'
                        }
                    </Typography>

                    {/* User Info or Error Details */}
                    {isSuccess ? (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Welcome{userName ? `, ${userName}` : ''}!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your DigiLocker verification was successful.
                            </Typography>
                        </Box>
                    ) : (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                textAlign: 'left',
                                '& .MuiAlert-message': { width: '100%' }
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="bold">
                                {error || 'Unknown Error'}
                            </Typography>
                            <Typography variant="body2">
                                {errorDescription || 'An unexpected error occurred during DigiLocker authentication.'}
                            </Typography>
                        </Alert>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Action Buttons */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {isSuccess
                            ? 'Choose how you want to continue:'
                            : 'What would you like to do?'
                        }
                    </Typography>

                    <Stack spacing={2}>
                        {isSuccess && (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PhoneAndroidIcon />}
                                    onClick={handleOpenApp}
                                    sx={{
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                                        }
                                    }}
                                >
                                    Open in Cashbez App
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<ComputerIcon />}
                                    onClick={handleContinueWeb}
                                    sx={{
                                        borderColor: '#1e3a8a',
                                        color: '#1e3a8a',
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: '#1e40af',
                                            backgroundColor: 'rgba(30, 58, 138, 0.04)',
                                        }
                                    }}
                                >
                                    Continue on Web
                                </Button>
                            </>
                        )}

                        {isError && (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleRetry}
                                    sx={{
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Try Again
                                </Button>

                                <Button
                                    variant="text"
                                    onClick={() => navigate('/signin')}
                                    sx={{
                                        color: '#666',
                                        textTransform: 'none',
                                    }}
                                >
                                    Back to Login
                                </Button>
                            </>
                        )}
                    </Stack>

                    {/* App Download Link */}
                    {isSuccess && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                            <Typography variant="caption" color="text.secondary">
                                Don't have the app?{' '}
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.enexa.erpcashbez"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1e3a8a', fontWeight: 600 }}
                                >
                                    Download from Play Store
                                </a>
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Footer */}
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        textAlign: 'center',
                        mt: 2,
                        color: 'rgba(255,255,255,0.8)'
                    }}
                >
                    Powered by DigiLocker • MeriPehchaan
                </Typography>
            </Container>
        </Box>
    );
};

export default DigiLockerCallback;
