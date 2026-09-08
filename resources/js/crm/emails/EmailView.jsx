import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Avatar,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Reply as ReplyIcon,
    ReplyAll as ReplyAllIcon,
    Forward as ForwardIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    AttachFile as AttachFileIcon,
    Download as DownloadIcon,
    Print as PrintIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import ApiService from '../../core/services/ApiService';

const EmailView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const apiService = ApiService();
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEmail();
        }
    }, [id]);

    const fetchEmail = async () => {
        try {
            const response = await apiService.vGet(`/api/crm/emails/${id}`);
            setEmail(response.data);
        } catch (error) {
            console.error('Error fetching email:', error);
            navigate('/crm/emails/sent');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleReply = () => {
        navigate(`/crm/emails/compose?reply=${id}`);
    };

    const handleReplyAll = () => {
        navigate(`/crm/emails/compose?replyall=${id}`);
    };

    const handleForward = () => {
        navigate(`/crm/emails/compose?forward=${id}`);
    };

    const handleDelete = async () => {
        try {
            await apiService.vDelete(`/api/crm/emails/${id}`);
            navigate('/crm/emails/sent');
        } catch (error) {
            console.error('Error deleting email:', error);
        }
        setDeleteDialog(false);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePrint = () => {
        window.print();
        handleMenuClose();
    };

    const downloadAttachment = async (attachment) => {
        try {
            const response = await apiService.vGet(
                `/api/crm/emails/attachments/${attachment.id}/download`,
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.original_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading attachment:', error);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'PPP p');
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const getFileSizeHuman = (bytes) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let i = 0;
        
        while (size > 1024 && i < sizes.length - 1) {
            size /= 1024;
            i++;
        }
        
        return `${Math.round(size * 100) / 100} ${sizes[i]}`;
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading email...</Typography>
            </Box>
        );
    }

    if (!email) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Email not found</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleBack}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {email.subject}
                        </Typography>
                        {email.priority !== 'normal' && (
                            <Chip
                                label={email.priority}
                                size="small"
                                color={getPriorityColor(email.priority)}
                                variant="outlined"
                            />
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate('/emails/sent')}
                        >
                            Sent List
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate('/emails')}
                        >
                            All
                        </Button>
                        
                        <Tooltip title="Reply">
                            <IconButton onClick={handleReply}>
                                <ReplyIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Reply All">
                            <IconButton onClick={handleReplyAll}>
                                <ReplyAllIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Forward">
                            <IconButton onClick={handleForward}>
                                <ForwardIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                            <IconButton onClick={() => setDeleteDialog(true)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <IconButton onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Email Content */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {/* Sender Info */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar src={email.sender?.avatar} sx={{ width: 48, height: 48 }}>
                            {email.sender?.name?.charAt(0)}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                                {email.sender?.name || 'Unknown Sender'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {email.sender?.email}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                                to {email.recipients?.filter(r => r.recipient_type === 'to')
                                    .map(r => r.user?.name).join(', ')}
                                {email.recipients?.some(r => r.recipient_type === 'cc') && (
                                    <>
                                        <br />
                                        cc {email.recipients?.filter(r => r.recipient_type === 'cc')
                                            .map(r => r.user?.name).join(', ')}
                                    </>
                                )}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {formatDate(email.sent_at || email.created_at)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Attachments */}
                {email.attachments?.length > 0 && (
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Attachments ({email.attachments.length})
                        </Typography>
                        <List dense>
                            {email.attachments.map((attachment) => (
                                <ListItem
                                    key={attachment.id}
                                    button
                                    onClick={() => downloadAttachment(attachment)}
                                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                                >
                                    <ListItemIcon>
                                        <AttachFileIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={attachment.original_name}
                                        secondary={getFileSizeHuman(attachment.file_size)}
                                    />
                                    <IconButton size="small">
                                        <DownloadIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Email Body */}
                <Box sx={{ p: 3 }}>
                    <Typography
                        variant="body1"
                        component="div"
                        sx={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: 1.6
                        }}
                        dangerouslySetInnerHTML={{ __html: email.body }}
                    />
                </Box>

                {/* Reply History */}
                {email.reply_to && (
                    <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" gutterBottom>
                            In reply to:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                From: {email.reply_to.sender?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Date: {formatDate(email.reply_to.sent_at || email.reply_to.created_at)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {email.reply_to.subject}
                            </Typography>
                        </Paper>
                    </Box>
                )}
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handlePrint}>
                    <PrintIcon sx={{ mr: 1 }} />
                    Print
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Email?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this email? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default EmailView;
