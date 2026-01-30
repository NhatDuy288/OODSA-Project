import axiosInstance from "./axiosInstance";

// GET /api/posts
export const getPosts = () => {
    return axiosInstance.get(`/posts`);
};

// POST /api/posts
export const createPost = (payload) => {
    return axiosInstance.post(`/posts`, payload);
};

// POST /api/posts/{postId}/comments
export const addComment = (postId, payload) => {
    return axiosInstance.post(`/posts/${postId}/comments`, payload);
};

// POST /api/posts/{postId}/reactions/toggle
export const toggleReaction = (postId, payload) => {
    return axiosInstance.post(`/posts/${postId}/reactions/toggle`, payload);
};
