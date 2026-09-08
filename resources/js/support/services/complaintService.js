import ApiService from "../../core/services/ApiService";

const complaintService = {
    // Get dashboard data
    getDashboard: async () => {
        const apiService = ApiService();
        return await apiService.vGet('/api/complaints/dashboard');
    },

    // Get all complaints with filters
    getComplaints: async (filters = {}) => {
        const apiService = ApiService();
        const queryParams = new URLSearchParams(filters).toString();
        return await apiService.vGet(`/api/complaints?${queryParams}`);
    },

    // Get single complaint
    getComplaint: async (id) => {
        const apiService = ApiService();
        return await apiService.vGet(`/api/complaints/${id}`);
    },

    // Create complaint
    createComplaint: async (data) => {
        const apiService = ApiService();
        return await apiService.vPost('/api/complaints', data);
    },

    // Update complaint status
    updateStatus: async (id, status, remarks) => {
        const apiService = ApiService();
        return await apiService.vPut(`/api/complaints/${id}/status`, { status, remarks });
    },

    // Assign complaint
    assignComplaint: async (id, assigned_to, remarks) => {
        const apiService = ApiService();
        return await apiService.vPut(`/api/complaints/${id}/assign`, { assigned_to, remarks });
    },

    // Add comment
    addComment: async (id, comment_text, is_internal = false) => {
        const apiService = ApiService();
        return await apiService.vPost(`/api/complaints/${id}/comments`, { comment_text, is_internal });
    },

    // Send help desk message
    sendMessage: async (id, message, attach_to_complaint = true) => {
        const apiService = ApiService();
        return await apiService.vPost(`/api/complaints/${id}/send-message`, { 
            message, 
            attach_to_complaint 
        });
    },

    // Link chat message to complaint
    linkChatMessage: async (id, message_id, link_type, notes) => {
        const apiService = ApiService();
        return await apiService.vPost(`/api/complaints/${id}/link-message`, { 
            message_id, 
            link_type, 
            notes 
        });
    },

    // Get workload report
    getWorkloadReport: async (role = 'HelpDesk') => {
        const apiService = ApiService();
        return await apiService.vGet(`/api/complaints/workload-report?role=${role}`);
    },

    // Upload files
    uploadFiles: async (complaintId, files) => {
        const apiService = ApiService();
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });
        return await apiService.vPost(`/api/complaints/${complaintId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default complaintService;
