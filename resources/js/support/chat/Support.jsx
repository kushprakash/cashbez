import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';

const Support = () => {
    const { userData: user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStartChat = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call the API to create a thread
            const res = await chatService.createThread({
                recipient_id: "1" // Assuming '1' is the support team user ID
            });

            const response = res.data;

            if (response.status === 1) {
                // Redirect to the chat page with the thread ID
                const threadId = response.data.thread_id;
                navigate(`/chat/${threadId}`);
            } else {
                setError(response.message || 'Failed to create chat thread');
            }
        } catch (err) {
            console.error('Error creating thread:', err);
            setError('An error occurred while starting the chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Pageheader
                mainheading="Support"
                parentfolder="Help"
                activepage="Chat Support"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <div className="mb-4">
                                        <i className="fas fa-headset fa-5x text-primary"></i>
                                    </div>
                                    
                                    <h3 className="mb-3">Need Help?</h3>
                                    <p className="text-muted mb-4">
                                        Start a chat with our support team. We're here to help you with any questions or issues.
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleStartChat}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Starting Chat...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-comments me-2"></i>
                                                Start Chat
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">
                                        <i className="fas fa-info-circle text-info me-2"></i>
                                        Quick Help
                                    </h5>
                                    <ul className="list-unstyled mb-0">
                                        <li className="mb-2">
                                            <i className="fas fa-clock text-muted me-2"></i>
                                            <strong>Response Time:</strong> Usually within 5 minutes
                                        </li>
                                        <li className="mb-2">
                                            <i className="fas fa-user-clock text-muted me-2"></i>
                                            <strong>Availability:</strong> 24/7
                                        </li>
                                        <li className="mb-0">
                                            <i className="fas fa-shield-alt text-muted me-2"></i>
                                            <strong>Secure:</strong> Your conversations are encrypted
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Support;
