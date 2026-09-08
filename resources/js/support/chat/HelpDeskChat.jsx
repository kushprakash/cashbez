import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';

const HelpDeskChat = () => {
    const { threadId } = useParams();
    const { userData: user, logout } = useContext(AuthContext);

    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const [thread, setThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [replyTo, setReplyTo] = useState(null);

    const [currentUser, setCurrentUser] = useState(user);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const lastMessageIdRef = useRef(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchMessages();

        // Start polling for new messages every 5 seconds
        pollIntervalRef.current = setInterval(() => {
            fetchNewMessages();
        }, 10000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [threadId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchCurrentUser = () => {
        setCurrentUser(user);
    };

    const fetchMessages = async (pageNum = 1, silent = false) => {
        try {
            if (!silent) setLoading(true);

            const res = await chatService.getMessages(threadId, pageNum);
            const response = res.data;
            if (response.status === 1) {
                const newMessages = response.data.messages || [];
                
                // Set messages and update last message ID
                const updatedMessages = pageNum === 1 ? newMessages : [...newMessages, ...messages];
                setMessages(updatedMessages);
                
                // Update last message ID to the highest message ID using ref
                if (updatedMessages.length > 0) {
                    const maxMessageId = Math.max(...updatedMessages.map(m => m.message_id));
                    lastMessageIdRef.current = maxMessageId;
                    console.log('Initial/Pagination - Updated lastMessageId to:', maxMessageId);
                }
                
                setThread(response.data.thread);
                setHasMore(response.data.has_more || false);

                // Mark messages as read (only if not already read) 
                const unreadMessages = newMessages.filter(msg => {
                    if (msg.is_own) return false; // Don't mark own messages
                    
                    // Check if message has receipts with read_at timestamp
                    const hasReadReceipt = msg.receipts?.some(
                        receipt => receipt.status === 'read' && receipt.read_at
                    );
                    
                    return !hasReadReceipt; // Only include if no read receipt exists
                });
                
                unreadMessages.forEach(msg => {
                    if (msg.message_id) {
                        chatService.markAsRead(msg.message_id).catch(console.error);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchNewMessages = async () => {
        const currentLastId = lastMessageIdRef.current;
        if (!currentLastId) {
            console.log('No lastMessageId set yet, skipping fetch');
            return;
        }

        console.log('Fetching new messages after ID:', currentLastId);

        try {
            const res = await chatService.getMessages(threadId, 1, currentLastId);
            const response = res.data;
            
            if (response.status === 1 && response.data.messages.length > 0) {
                const newMessages = response.data.messages;
                console.log('Received new messages:', newMessages.map(m => ({ id: m.message_id, content: m.content })));
                
                // Filter out duplicates and add new messages
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.message_id));
                    const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.message_id));
                    
                    if (uniqueNewMessages.length === 0) {
                        console.log('No unique new messages to add');
                        return prev;
                    }
                    
                    console.log('Adding unique new messages:', uniqueNewMessages.map(m => ({ id: m.message_id, content: m.content })));
                    
                    const updatedMessages = [...prev, ...uniqueNewMessages];
                    
                    // Update last message ID ref to the highest message ID
                    const maxMessageId = Math.max(...updatedMessages.map(m => m.message_id));
                    lastMessageIdRef.current = maxMessageId;
                    console.log('Updated lastMessageId ref to:', maxMessageId);
                    
                    return updatedMessages;
                });
                // Mark new unread messages as read
                const unreadMessages = newMessages.filter(msg => {
                    if (msg.is_own) return false;
                    
                    const hasReadReceipt = msg.receipts?.some(
                        receipt => receipt.status === 'read' && receipt.read_at
                    );
                    
                    return !hasReadReceipt;
                });
                
                unreadMessages.forEach(msg => {
                    if (msg.message_id) {
                        chatService.markAsRead(msg.message_id).catch(console.error);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching new messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!messageText.trim() && !selectedFile) {
            return;
        }

        try {
            setSending(true);

            const formData = new FormData();
            formData.append('thread_id', threadId);

            if (messageText.trim()) {
                formData.append('message_type', 'text');
                formData.append('content', messageText.trim());
                formData.append('localmsgid', threadId + '_' + Date.now());
            }

            if (selectedFile) {
                formData.append('message_type', selectedFile.type.startsWith('image/') ? 'image' : 'file');
                formData.append('attachment', selectedFile);
            }

            if (replyTo) {
                formData.append('reply_to_message_id', replyTo.message_id);
            }

            const res = await chatService.sendMessage(formData);
            const response = res.data;
            if (response.status === 1) {
                setMessageText('');
                clearFile();
                setReplyTo(null);
                // Fetch new messages instead of reloading all
                fetchNewMessages();
            } else {
                alert(response.message || 'Error sending message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message');
        } finally {
            setSending(false);
        }
    };

    const handleReply = (message) => {
        setReplyTo(message);
        document.getElementById('messageInput')?.focus();
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMessages(nextPage);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        const icons = {
            pdf: 'fa-file-pdf text-danger',
            doc: 'fa-file-word text-primary',
            docx: 'fa-file-word text-primary',
            xls: 'fa-file-excel text-success',
            xlsx: 'fa-file-excel text-success',
            zip: 'fa-file-archive text-warning',
            rar: 'fa-file-archive text-warning'
        };
        return icons[ext] || 'fa-file text-secondary';
    };

    const renderMessage = (message) => {
        const isOwn = message.is_own === true;
        const alignClass = isOwn ? 'justify-content-end' : 'justify-content-start';
        const bgClass = isOwn ? 'bg-primary text-white' : 'bg-light';

        return (
            <div key={message.message_id} className={`d-flex ${alignClass} mb-3`}>
                <div className={`message-bubble ${bgClass} rounded-3 p-3 shadow-sm`} style={{ maxWidth: '70%' }}>
                    {/* Sender Name */}
                    <div className={`fw-bold small mb-2 ${isOwn ? 'text-white-50' : 'text-primary'}`}>
                        {isOwn ? 'You' : message.sender_name}
                    </div>

                    {/* Reply Context */}
                    {message.reply_to && (
                        <div className={`reply-context p-2 rounded mb-2 ${isOwn ? 'bg-white bg-opacity-25' : 'bg-secondary bg-opacity-10'}`}>
                            <small className={isOwn ? 'text-white-50' : 'text-muted'}>
                                <i className="fas fa-reply me-1"></i>
                                Replying to {message.reply_to.sender_name}
                            </small>
                            <div className={`small ${isOwn ? 'text-white-50' : 'text-muted'}`}>
                                {message.reply_to.content?.substring(0, 50)}
                                {message.reply_to.content?.length > 50 && '...'}
                            </div>
                        </div>
                    )}

                    {/* Message Content */}
                    {message.message_type === 'text' && (
                        <div>{message.content}</div>
                    )}

                    {message.message_type === 'image' && message.attachments?.[0] && (
                        <div>
                            {message.content && (
                                <div className="mb-2">{message.content}</div>
                            )}
                            <img
                                src={message.attachments[0].file_path}
                                alt="Attachment"
                                className="img-fluid rounded"
                                style={{ maxHeight: '300px', cursor: 'pointer' }}
                                onClick={() => window.open(message.attachments[0].file_path, '_blank')}
                            />
                        </div>
                    )}

                    {(message.message_type === 'file' || message.message_type === 'document') && message.attachments?.[0] && (
                        <div>
                            {message.content && (
                                <div className="mb-2">{message.content}</div>
                            )}
                            <a
                                href={message.attachments[0].file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-decoration-none ${isOwn ? 'text-white' : 'text-primary'}`}
                            >
                                <i className={`fas ${getFileIcon(message.attachments[0].file_name)} me-2`}></i>
                                {message.attachments[0].file_name}
                            </a>
                        </div>
                    )}

                    {/* Message Footer */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className={isOwn ? 'text-white-50' : 'text-muted'}>
                            {formatTime(message.created_at)}
                        </small>
                        <div className="d-flex align-items-center">
                            {!isOwn && (
                                <button
                                    className="btn btn-sm btn-outline-secondary ms-2 py-0 px-2"
                                    onClick={() => handleReply(message)}
                                    title="Reply"
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    <i className="fas fa-reply"></i>
                                </button>
                            )}
                            {isOwn && (
                                <>
                                    {message.receipts?.some(r => r.status === 'read') ? (
                                        <i className="fas fa-check-double ms-2 text-white-50" title="Read"></i>
                                    ) : (
                                        <i className="fas fa-check ms-2 text-white-50" title="Sent"></i>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Pageheader mainheading="Chat" />
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
                mainheading={thread?.title || 'Chat'}
                parentfolder="Support"
                activepage="Chat"
            />

            <div className="page-content-box">
                <div className="page-content-box-inner">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card border-0 shadow-sm" style={{ height: 'calc(100vh - 250px)' }}>
                                {/* Chat Header */}
                                <div className="card-header bg-white border-bottom">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <button
                                                className="btn btn-link text-decoration-none me-3"
                                                onClick={() => navigate('/chat')}
                                            >
                                                <i className="fas fa-arrow-left"></i>
                                            </button>
                                            <div>
                                                <h6 className="mb-0">
                                                    {thread?.thread_type === 'support' && (
                                                        <i className="fas fa-headset text-primary me-2"></i>
                                                    )}
                                                    {thread?.title || 'Support Chat'}
                                                </h6>
                                                <small className="text-muted">
                                                    {thread?.participants?.length || 0} participants
                                                </small>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="badge bg-success">
                                                <i className="fas fa-circle fa-xs me-1"></i>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="card-body overflow-auto" style={{ flex: 1 }}>
                                    {/* Load More Button */}
                                    {hasMore && (
                                        <div className="text-center mb-3">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={loadMoreMessages}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-arrow-up me-2"></i>
                                                        Load Previous Messages
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Messages */}
                                    {messages.length > 0 ? (
                                        messages.map(renderMessage)
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-comments fa-4x text-muted mb-3"></i>
                                            <p className="text-muted">No messages yet. Start the conversation!</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="card-footer bg-white border-top">
                                    {/* Reply Banner */}
                                    {replyTo && (
                                        <div className="bg-light p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted">
                                                    <i className="fas fa-reply me-1"></i>
                                                    Replying to {replyTo.sender_name}
                                                </small>
                                                <div className="small text-truncate" style={{ maxWidth: '300px' }}>
                                                    {replyTo.content}
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-link text-secondary"
                                                onClick={cancelReply}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    )}

                                    {/* File Preview */}
                                    {selectedFile && (
                                        <div className="bg-light p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                {filePreview ? (
                                                    <img
                                                        src={filePreview}
                                                        alt="Preview"
                                                        className="rounded me-2"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <i className={`fas ${getFileIcon(selectedFile.name)} fa-2x me-2`}></i>
                                                )}
                                                <div>
                                                    <div className="small fw-bold">{selectedFile.name}</div>
                                                    <small className="text-muted">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </small>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-link text-danger"
                                                onClick={clearFile}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    )}

                                    {/* Message Form */}
                                    <form onSubmit={handleSendMessage}>
                                        <div className="input-group">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={sending}
                                            >
                                                <i className="fas fa-paperclip"></i>
                                            </button>
                                            <input
                                                type="text"
                                                id="messageInput"
                                                className="form-control"
                                                placeholder="Type your message..."
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={sending || (!messageText.trim() && !selectedFile)}
                                            >
                                                {sending ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="fas fa-paper-plane"></i>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpDeskChat;
