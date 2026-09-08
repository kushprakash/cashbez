import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Chip,
    Autocomplete,
    Divider,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    FormatAlignLeft as FormatAlignLeftIcon,
    FormatAlignCenter as FormatAlignCenterIcon,
    FormatAlignRight as FormatAlignRightIcon,
    FormatListBulleted as FormatListBulletedIcon,
    FormatListNumbered as FormatListNumberedIcon,
    Link as LinkIcon,
    FormatSize as FormatSizeIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';

const EmailCompose = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For editing emails
    const fileInputRef = useRef(null);
    const apiService = ApiService();
    
    const [formData, setFormData] = useState({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        priority: 'normal',
        attachments: []
    });
    
    const [users, setUsers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [contactOptions, setContactOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const editorRef = useRef(null);

    // Text formatting state
    const [isFormattingActive, setIsFormattingActive] = useState({
        bold: false,
        italic: false,
        underline: false
    });

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const response = await apiService.vGet('/api/crm/emails/contacts');
            const data = response.data;
            
            // Separate users and leads from the response
            const usersData = data.users || [];
            const leadsData = data.leads || [];
            
            setUsers(usersData);
            setLeads(leadsData);
            updateContactOptions(usersData, leadsData);
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    };

    const updateContactOptions = (usersData, leadsData) => {
        const formattedUsers = usersData.map(user => ({
            ...user,
            type: 'user',
            id: user.unique_id, // Use unique_id instead of original id
            original_id: user.id, // Keep original id for backend processing
            label: `${user.name} (${user.email})`,
            category: 'Users',
            displayInfo: `${user.role_name || 'No Role'} • ${user.designation_title || 'No Designation'}`
        }));
        
        // Filter leads to only include those with email addresses
        const leadsWithEmail = leadsData.filter(lead => lead.email);
        const formattedLeads = leadsWithEmail.map(lead => ({
            ...lead,
            type: 'lead',
            id: lead.unique_id, // Use unique_id instead of original id
            original_id: lead.id, // Keep original id for backend processing
            label: `${lead.name} (${lead.email})`,
            category: 'Leads',
            displayInfo: `Lead #${lead.original_id} • ${new Date(lead.created_at).toLocaleDateString()}`
        }));

        const combined = [...formattedUsers, ...formattedLeads];
        setContactOptions(combined);
        setUserOptions(combined); // Keep for backward compatibility
    };

    const handleUserSearch = async (query) => {
        if (!query) {
            updateContactOptions(users, leads);
            return;
        }
        
        try {
            const response = await apiService.vGet('/api/crm/emails/contacts', {
                params: { search: query }
            });
            const data = response.data;
            
            // Separate users and leads from the response
            const usersData = data.users || [];
            const leadsData = data.leads || [];
            
            updateContactOptions(usersData, leadsData);
        } catch (error) {
            console.error('Error searching contacts:', error);
        }
    };

    const handleFileAttach = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.to.length || !formData.subject.trim() || !formData.body.trim()) {
            setError('Please fill in all required fields (To, Subject, Body)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            
            // Parse recipients to separate users and leads
            const parseRecipients = (recipientIds) => {
                const users = [];
                const leads = [];
                
                recipientIds.forEach(id => {
                    const contact = contactOptions.find(c => c.id === id);
                    if (contact) {
                        if (contact.type === 'user') {
                            users.push(contact.original_id);
                        } else if (contact.type === 'lead') {
                            leads.push(contact.original_id);
                        }
                    }
                });
                
                return { users, leads };
            };
            
            // Parse and add recipients
            const toRecipients = parseRecipients(formData.to);
            toRecipients.users.forEach(userId => submitData.append('to_users[]', userId));
            toRecipients.leads.forEach(leadId => submitData.append('to_leads[]', leadId));
            
            if (formData.cc.length) {
                const ccRecipients = parseRecipients(formData.cc);
                ccRecipients.users.forEach(userId => submitData.append('cc_users[]', userId));
                ccRecipients.leads.forEach(leadId => submitData.append('cc_leads[]', leadId));
            }
            
            if (formData.bcc.length) {
                const bccRecipients = parseRecipients(formData.bcc);
                bccRecipients.users.forEach(userId => submitData.append('bcc_users[]', userId));
                bccRecipients.leads.forEach(leadId => submitData.append('bcc_leads[]', leadId));
            }
            
            submitData.append('subject', formData.subject);
            submitData.append('body', formData.body);
            submitData.append('priority', formData.priority);
            
            // Add attachments
            formData.attachments.forEach(file => {
                if (file instanceof File) {
                    submitData.append('attachments[]', file);
                }
            });

            const response = await apiService.vPost('/api/crm/emails/compose', submitData);

            navigate('/crm/emails/sent');
        } catch (error) {
            console.error('Error sending email:', error);
            setError(error.response?.data?.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        handleSubmit();
    };

    const handleClose = () => {
        if (formData.to.length || formData.subject || formData.body) {
            setConfirmDialog(true);
        } else {
            navigate('/crm/emails/sent');
        }
    };

    const confirmClose = () => {
        setConfirmDialog(false);
        navigate('/crm/emails/sent');
    };

    const cancelClose = () => {
        setConfirmDialog(false);
    };

    // Text formatting functions
    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        updateFormattingState();
    };

    const updateFormattingState = () => {
        setIsFormattingActive({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });
    };

    const handleEditorInput = (e) => {
        setFormData(prev => ({ ...prev, body: e.target.innerHTML }));
        updateFormattingState();
    };

    const handleEditorKeyUp = () => {
        updateFormattingState();
    };

    const handleEditorMouseUp = () => {
        updateFormattingState();
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        Compose Email
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/crm/emails/sent')}
                        >
                            Sent List
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/crm/emails')}
                        >
                            All
                        </Button>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Form */}
            <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
                {/* Recipients */}
                <Box sx={{ mb: 2 }}>
                    <Autocomplete
                        multiple
                        options={contactOptions}
                        getOptionLabel={(option) => option.label || `${option.name} (${option.email})`}
                        groupBy={(option) => option.category}
                        value={contactOptions.filter(contact => formData.to.includes(contact.id))}
                        onChange={(event, newValue) => {
                            setFormData(prev => ({
                                ...prev,
                                to: newValue.map(contact => contact.id)
                            }));
                        }}
                        onInputChange={(event, newInputValue) => {
                            handleUserSearch(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="To *"
                                placeholder="Select recipients (Users and Leads)"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    variant="outlined"
                                    label={option.type === 'lead' 
                                        ? `${option.name} (Lead #${option.original_id})` 
                                        : `${option.name} (${option.role_name || option.designation_title || 'No Role/Designation'})`
                                    }
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    color={option.type === 'lead' ? 'secondary' : 'primary'}
                                />
                            ))
                        }
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {option.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.email}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {option.displayInfo}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        size="small" 
                                        label={option.type === 'lead' ? 'Lead' : 'User'}
                                        color={option.type === 'lead' ? 'secondary' : 'primary'}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                        )}
                    />
                    
                    <Box sx={{ mt: 1 }}>
                        {!showCc && (
                            <Button size="small" onClick={() => setShowCc(true)}>
                                Add Cc
                            </Button>
                        )}
                        {!showBcc && (
                            <Button size="small" onClick={() => setShowBcc(true)} sx={{ ml: 1 }}>
                                Add Bcc
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* CC Field */}
                {showCc && (
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            multiple
                            options={contactOptions}
                            getOptionLabel={(option) => option.label || `${option.name} (${option.email})`}
                            groupBy={(option) => option.category}
                            value={contactOptions.filter(contact => formData.cc.includes(contact.id))}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    cc: newValue.map(contact => contact.id)
                                }));
                            }}
                            onInputChange={(event, newInputValue) => {
                                handleUserSearch(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Cc"
                                    placeholder="Select CC recipients (Users and Leads)"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.type === 'lead' 
                                            ? `${option.name} (Lead #${option.id})` 
                                            : `${option.name} (${option.role_name || option.designation_title || 'No Role/Designation'})`
                                        }
                                        {...getTagProps({ index })}
                                        key={option.id}
                                        color={option.type === 'lead' ? 'secondary' : 'primary'}
                                    />
                                ))
                            }
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {option.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {option.displayInfo}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            size="small" 
                                            label={option.type === 'lead' ? 'Lead' : 'User'}
                                            color={option.type === 'lead' ? 'secondary' : 'primary'}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            )}
                        />
                    </Box>
                )}

                {/* BCC Field */}
                {showBcc && (
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            multiple
                            options={contactOptions}
                            getOptionLabel={(option) => option.label || `${option.name} (${option.email})`}
                            groupBy={(option) => option.category}
                            value={contactOptions.filter(contact => formData.bcc.includes(contact.id))}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    bcc: newValue.map(contact => contact.id)
                                }));
                            }}
                            onInputChange={(event, newInputValue) => {
                                handleUserSearch(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Bcc"
                                    placeholder="Select BCC recipients (Users and Leads)"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.type === 'lead' 
                                            ? `${option.name} (Lead #${option.original_id})` 
                                            : `${option.name} (${option.role_name || option.designation_title || 'No Role/Designation'})`
                                        }
                                        {...getTagProps({ index })}
                                        key={option.id}
                                        color={option.type === 'lead' ? 'secondary' : 'primary'}
                                    />
                                ))
                            }
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {option.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {option.displayInfo}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            size="small" 
                                            label={option.type === 'lead' ? 'Lead' : 'User'}
                                            color={option.type === 'lead' ? 'secondary' : 'primary'}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            )}
                        />
                    </Box>
                )}

                {/* Subject and Priority */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Subject *"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={formData.priority}
                            label="Priority"
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Message with Text Formatting */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Message *
                    </Typography>
                    
                    {/* Text Formatting Toolbar */}
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 1, 
                            mb: 1, 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.5,
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        {/* Bold, Italic, Underline */}
                        <Tooltip title="Bold">
                            <IconButton
                                size="small"
                                onClick={() => formatText('bold')}
                                color={isFormattingActive.bold ? 'primary' : 'default'}
                                sx={{ 
                                    backgroundColor: isFormattingActive.bold ? 'primary.light' : 'transparent',
                                    '&:hover': { backgroundColor: 'primary.light' }
                                }}
                            >
                                <FormatBoldIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Italic">
                            <IconButton
                                size="small"
                                onClick={() => formatText('italic')}
                                color={isFormattingActive.italic ? 'primary' : 'default'}
                                sx={{ 
                                    backgroundColor: isFormattingActive.italic ? 'primary.light' : 'transparent',
                                    '&:hover': { backgroundColor: 'primary.light' }
                                }}
                            >
                                <FormatItalicIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Underline">
                            <IconButton
                                size="small"
                                onClick={() => formatText('underline')}
                                color={isFormattingActive.underline ? 'primary' : 'default'}
                                sx={{ 
                                    backgroundColor: isFormattingActive.underline ? 'primary.light' : 'transparent',
                                    '&:hover': { backgroundColor: 'primary.light' }
                                }}
                            >
                                <FormatUnderlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Text Alignment */}
                        <Tooltip title="Align Left">
                            <IconButton
                                size="small"
                                onClick={() => formatText('justifyLeft')}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <FormatAlignLeftIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Align Center">
                            <IconButton
                                size="small"
                                onClick={() => formatText('justifyCenter')}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <FormatAlignCenterIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Align Right">
                            <IconButton
                                size="small"
                                onClick={() => formatText('justifyRight')}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <FormatAlignRightIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Lists */}
                        <Tooltip title="Bullet List">
                            <IconButton
                                size="small"
                                onClick={() => formatText('insertUnorderedList')}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <FormatListBulletedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Numbered List">
                            <IconButton
                                size="small"
                                onClick={() => formatText('insertOrderedList')}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <FormatListNumberedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Font Size */}
                        <Tooltip title="Font Size">
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                                <Select
                                    defaultValue="3"
                                    onChange={(e) => formatText('fontSize', e.target.value)}
                                    variant="outlined"
                                    sx={{ 
                                        height: 32,
                                        '& .MuiSelect-select': { 
                                            py: 0.5,
                                            fontSize: '0.875rem'
                                        }
                                    }}
                                >
                                    <MenuItem value="1">Small</MenuItem>
                                    <MenuItem value="3">Normal</MenuItem>
                                    <MenuItem value="5">Large</MenuItem>
                                    <MenuItem value="7">X-Large</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>

                        {/* Link */}
                        <Tooltip title="Insert Link">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    const url = prompt('Enter URL:');
                                    if (url) formatText('createLink', url);
                                }}
                                sx={{ '&:hover': { backgroundColor: 'primary.light' } }}
                            >
                                <LinkIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Paper>

                    {/* Rich Text Editor */}
                    <Box
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning={true}
                        onInput={handleEditorInput}
                        onKeyUp={handleEditorKeyUp}
                        onMouseUp={handleEditorMouseUp}
                        dangerouslySetInnerHTML={{ __html: formData.body }}
                        sx={{
                            minHeight: 300,
                            maxHeight: 400,
                            overflow: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                            backgroundColor: 'background.paper',
                            '&:focus': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: -2
                            },
                            '& *': {
                                maxWidth: '100%'
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto'
                            }
                        }}
                    />
                </Box>

                {/* Attachments */}
                {formData.attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Attachments:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.attachments.map((file, index) => (
                                <Chip
                                    key={index}
                                    label={file.name || file.original_name}
                                    onDelete={() => removeAttachment(index)}
                                    deleteIcon={<DeleteIcon />}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        onClick={handleSend}
                        disabled={loading}
                    >
                        Send
                    </Button>
                    <Tooltip title="Attach files">
                        <IconButton onClick={handleFileAttach}>
                            <AttachFileIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleFileSelect}
            />

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog} onClose={cancelClose}>
                <DialogTitle>Discard Email?</DialogTitle>
                <DialogContent>
                    <Typography>
                        You have unsaved changes. Are you sure you want to discard this email?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelClose}>Cancel</Button>
                    <Button onClick={confirmClose} color="error">
                        Discard
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default EmailCompose;
