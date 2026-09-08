import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';

const ChatThreadsList = () => {
    const { userData: user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchThreads();

        // Poll for updates every 10 seconds
        const interval = setInterval(() => {
            fetchThreads(true);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchThreads = async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const res = await chatService.getThreads();
            const response = res.data;

            if (response.status === 1) {
                setThreads(response.data || []);
            } else {
                console.error('Error fetching threads:', response.message);
            }
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleThreadClick = (threadId) => {
        navigate(`/chat/${threadId}`);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getAvatarInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getThreadTypeIcon = (threadType) => {
        switch (threadType) {
            case 'support':
                return 'fa-headset';
            case 'group':
                return 'fa-users';
            case 'direct':
            default:
                return 'fa-user';
        }
    };

    const filteredThreads = threads.filter(thread =>
        thread.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Chats" />
                <div className="page-content-box">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Pageheader
                mainheading="Chats"
                parentfolder="Support"
                activepage="Messages"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                {/* Search Header */}
                                <div className="card-header bg-white border-bottom">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            <i className="fas fa-comments text-primary me-2"></i>
                                            Messages
                                        </h5>
                                      
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="fas fa-search text-muted"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 bg-light"
                                            placeholder="Search conversations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Threads List */}
                                <div className="card-body p-0" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                                    {filteredThreads.length > 0 ? (
                                        filteredThreads.map((thread, index) => (
                                            <div
                                                key={thread.thread_id}
                                                className={`thread-item d-flex align-items-start p-3 border-bottom ${
                                                    thread.unread_count > 0 ? 'bg-light bg-opacity-50' : ''
                                                }`}
                                                onClick={() => handleThreadClick(thread.thread_id)}
                                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = thread.unread_count > 0 ? 'rgba(248, 249, 250, 0.5)' : 'transparent'}
                                            >
                                                {/* Avatar */}
                                                <div className="flex-shrink-0 me-3">
                                                    {thread.avatar_url ? (
                                                        <img
                                                            src={thread.avatar_url}
                                                            alt={thread.title}
                                                            className="rounded-circle"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                            style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: '600' }}
                                                        >
                                                            {getAvatarInitials(thread.title)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thread Info */}
                                                <div className="flex-grow-1 min-width-0">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className={`mb-0 text-truncate ${thread.unread_count > 0 ? 'fw-bold' : ''}`}>
                                                            <i className={`fas ${getThreadTypeIcon(thread.thread_type)} me-2 text-muted small`}></i>
                                                            {thread.title || 'Unknown'}
                                                        </h6>
                                                        <small className={`text-nowrap ms-2 ${thread.unread_count > 0 ? 'text-primary fw-semibold' : 'text-muted'}`}>
                                                            {formatTime(thread.updated_at)}
                                                        </small>
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <p
                                                            className={`mb-0 text-truncate small ${
                                                                thread.unread_count > 0 ? 'fw-semibold text-dark' : 'text-muted'
                                                            }`}
                                                            style={{ maxWidth: '70%' }}
                                                        >
                                                            {thread.last_message?.content || 'No messages yet'}
                                                        </p>

                                                        {thread.unread_count > 0 && (
                                                            <span
                                                                className="badge bg-primary rounded-pill"
                                                                style={{ fontSize: '0.7rem', minWidth: '20px' }}
                                                            >
                                                                {thread.unread_count > 99 ? '99+' : thread.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                                            <p className="text-muted">
                                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                            </p>
                                            {!searchQuery && (
                                                <button 
                                                    className="btn btn-primary mt-2"
                                                    onClick={() => navigate('/chat/new')}
                                                >
                                                    <i className="fas fa-plus me-2"></i>
                                                    Start a Conversation
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .thread-item:hover {
                    background-color: #f8f9fa !important;
                }
                
                .thread-item:active {
                    background-color: #e9ecef !important;
                }

                .min-width-0 {
                    min-width: 0;
                }

                /* Custom scrollbar */
                .card-body::-webkit-scrollbar {
                    width: 6px;
                }

                .card-body::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .card-body::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }

                .card-body::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </>
    );
};

export default ChatThreadsList;
