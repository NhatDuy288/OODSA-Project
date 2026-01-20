import axiosInstance from "./axiosInstance";

const conversationApi = {
    getConversations: async () => axiosInstance.get("/conversations"),
    getConversationById: async (conversationId) =>
        axiosInstance.get(`/conversations/${conversationId}`),

    getMessages: async (conversationId) =>
        axiosInstance.get(`/conversations/${conversationId}/messages`),

    createGroup: async (payload) => axiosInstance.post("/conversations/groups", payload),

    //  mute/unmute
    updateMute: async (conversationId, muted) =>
        axiosInstance.patch(`/conversations/${conversationId}/mute`, { muted }),

    // group actions
    addMembers: async (conversationId, memberIds) =>
        axiosInstance.post(`/conversations/${conversationId}/members`, { memberIds }),

    kickMember: async (conversationId, memberId) =>
        axiosInstance.post(`/conversations/${conversationId}/kick/${memberId}`),

    transferAdmin: async (conversationId, newAdminId) =>
        axiosInstance.post(`/conversations/${conversationId}/transfer-admin`, { newAdminId }),

    leaveGroup: async (conversationId, newAdminId) =>
        axiosInstance.post(
            `/conversations/${conversationId}/leave`,
            newAdminId ? { newAdminId } : {}
        ),

    dissolveGroup: async (conversationId) =>
        axiosInstance.delete(`/conversations/${conversationId}`),

    // search messages
    searchMessages: async (conversationId, q, limit = 20) =>
        axiosInstance.get(`/conversations/${conversationId}/messages/search`, {
            params: { q, limit },
        }),
};

export default conversationApi;
