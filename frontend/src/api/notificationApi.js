import axios from "./api"

export const getNotificationsByUserApi = (userId) =>
  axios.get(`/notifications/user/${userId}`)

export const markNotificationAsReadApi = (notificationId) =>
  axios.put(`/notifications/${notificationId}/read`)