import axiosInstance from "./axiosInstance";

// gửi lời mời kết bạn: POST /api/friends/request
export const sendFriendRequest = (username) => {
  return axiosInstance.post("/friends/request", { username });
};

// danh sách lời mời đến: GET /api/friends/requests
export const getFriendRequests = () => {
  return axiosInstance.get("/friends/requests");
};

// chấp nhận: POST /api/friends/{id}/accept
export const acceptFriendRequest = (id) => {
  return axiosInstance.post(`/friends/${id}/accept`);
};

// từ chối: POST /api/friends/{id}/reject
export const rejectFriendRequest = (id) => {
  return axiosInstance.post(`/friends/${id}/reject`);
};

// danh sách bạn bè: GET /api/friends
export const getMyFriends = () => {
  return axiosInstance.get("/friends");
};

// lời mời đã gửi: GET /api/friends/requests/sent
export const getSentFriendRequests = () => {
  return axiosInstance.get("/friends/requests/sent");
};

// thu hồi: POST /api/friends/{id}/cancel
export const cancelFriendRequest = (id) => {
  return axiosInstance.post(`/friends/${id}/cancel`);
};
