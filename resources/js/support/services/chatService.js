import ApiService from "../../core/services/ApiService";

const chatService = {
    // Get all threads
    getThreads: async () => {
        const apiService = ApiService();
        return await apiService.vGet('/api/chat/threads');
    },

    // Get messages for a thread
    getMessages: async (threadId, page = 1, afterMessageId = null) => {
        const apiService = ApiService();
        let url = `/api/chat/threads/${threadId}/messages?page=${page}`;
        if (afterMessageId) {
            url += `&after=${afterMessageId}`;
        }
        return await apiService.vGet(url);
    },

    // Send message
    sendMessage: async (data) => {
        const apiService = ApiService();
        return await apiService.vPost('/api/chat/messages', data);
    },

    // Mark message as read
    markAsRead: async (messageId) => {
        const apiService = ApiService();
        return await apiService.vPost(`/api/chat/messages/${messageId}/read`);
    },

    // Create thread
    createThread: async (data) => {
        const apiService = ApiService();
        return await apiService.vPost('/api/chat/threads', data);
    },

    // Upload file
    uploadFile: async (messageId, file) => {
        const apiService = ApiService();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message_id', messageId);
        return await apiService.vPost('/api/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default chatService;
