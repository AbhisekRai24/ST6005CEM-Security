"use client"
import React from "react"
import { useNotifications } from "../hooks/useNotification"
import { useContext } from "react"
import { AuthContext } from "../auth/AuthProvider"
import { Link } from "react-router-dom"
import { Bell, CheckCircle, Clock, Package, ArrowLeft, Check } from "lucide-react"
import { motion } from "framer-motion"

export default function Notifications() {
  const { user } = useContext(AuthContext)
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
  } = useNotifications(user?._id)

  // Mark all notifications as read
  const markAllRead = () => {
    notifications
      .filter((n) => !n.read)
      .forEach((notif) => markAsRead(notif._id))
  }

  // Format time and date with relative time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    let relativeTime = ""
    if (diffMins < 1) relativeTime = "Just now"
    else if (diffMins < 60) relativeTime = `${diffMins}m ago`
    else if (diffHours < 24) relativeTime = `${diffHours}h ago`
    else if (diffDays < 7) relativeTime = `${diffDays}d ago`
    else relativeTime = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })

    const fullDateTime = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return { relativeTime, fullDateTime }
  }

  // Get status config based on notification message
  function getStatusConfig(message) {
    if (/pending/i.test(message)) {
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: <Clock className="w-5 h-5" />,
      }
    }
    if (/processing/i.test(message)) {
      return {
        color: "text-blue-400",
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: <Package className="w-5 h-5" />,
      }
    }
    if (/completed|delivered/i.test(message)) {
      return {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-5 h-5" />,
      }
    }
    return {
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: <Bell className="w-5 h-5" />,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl w-64"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-8">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600">
            We couldn't retrieve your notifications. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/normal/dash"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? (
                    <>
                      You have <span className="font-semibold text-blue-400">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}
                    </>
                  ) : (
                    "You're all caught up!"
                  )}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-5 h-5" />
                Mark all as read
              </button>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-16 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Notifications</h2>
            <p className="text-gray-600">
              You don't have any notifications yet. Check back later!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, index) => {
              const statusConfig = getStatusConfig(notif.message)
              const { relativeTime, fullDateTime } = formatDateTime(notif.createdAt)

              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-6 border-2 transition-all duration-200 ${notif.read
                    ? "border-gray-200 hover:border-gray-300"
                    : "border-blue-300 bg-blue-50/30 hover:border-blue-400 shadow-md"
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 ${statusConfig.bg} rounded-xl flex items-center justify-center ${statusConfig.color} border ${statusConfig.border}`}>
                      {statusConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-gray-900 ${notif.read ? "" : "font-semibold"}`}>
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="flex-shrink-0 text-blue-400 hover:text-blue-500 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Mark read
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {relativeTime}
                        </p>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-gray-400">{fullDateTime}</p>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notif.read && (
                      <div className="flex-shrink-0 w-3 h-3 bg-blue-400 rounded-full shadow-lg"></div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}