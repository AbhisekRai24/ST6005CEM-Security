import {
  getNotificationsByUserApi,
  markNotificationAsReadApi,
} from "../api/notificationApi"

export const fetchUserNotifications = async (userId) => {
  try {
    const response = await getNotificationsByUserApi(userId)
    return response.data
  } catch (error) {
    throw error
  }
}

export const markNotificationRead = async (notificationId) => {
  try {
    const response = await markNotificationAsReadApi(notificationId)
    return response.data
  } catch (error) {
    throw error
  }
}
