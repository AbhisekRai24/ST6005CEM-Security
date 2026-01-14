// src/components/NotificationDropdown.jsx
"use client"

import React, { useState } from "react"
import { Bell, Clock, CheckCircle, Package, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useNotifications } from "../hooks/useNotification"

export default function NotificationDropdown({ userId }) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead } = useNotifications(userId)

  const handleToggle = () => setIsOpen(!isOpen)
  const handleClose = () => setIsOpen(false)

  // Format message and status
  function formatNotification(notif) {
    const orderIdMatch = notif.message.match(/([a-zA-Z0-9]{8,})/)
    const orderId = orderIdMatch ? orderIdMatch[1] : null
    const shortOrderId = orderId ? orderId.slice(-4) : null

    const status =
      notif.status ||
      (() => {
        if (/pending/i.test(notif.message)) return "pending"
        if (/processing/i.test(notif.message)) return "processing"
        if (/completed/i.test(notif.message)) return "completed"
        return null
      })()

    let baseMsg = ""
    switch (status) {
      case "pending":
        baseMsg = "Your order is pending confirmation"
        break
      case "processing":
        baseMsg = "Your order is being prepared"
        break
      case "completed":
        baseMsg = "Your order has been delivered. Enjoy your meal!"
        break
      default:
        baseMsg = notif.message
    }

    return shortOrderId ? `${baseMsg}. Order #${shortOrderId}` : baseMsg
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
  }

  function getStatusConfig(status) {
    switch (status) {
      case "pending":
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          icon: <Clock className="w-4 h-4" />,
        }
      case "processing":
        return {
          color: "text-blue-400",
          bg: "bg-blue-50",
          icon: <Package className="w-4 h-4" />,
        }
      case "completed":
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: <Bell className="w-4 h-4" />,
        }
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-600">{unreadCount} unread</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notif) => {
                  const statusConfig = getStatusConfig(notif.status)
                  return (
                    <button
                      key={notif._id}
                      onClick={() => {
                        markAsRead(notif._id)
                        handleClose()
                      }}
                      className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-blue-50/50" : ""
                        }`}
                    >
                      <div className="flex gap-3">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 ${statusConfig.bg} rounded-full flex items-center justify-center ${statusConfig.color}`}>
                          {statusConfig.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notif.read ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
                            {formatNotification(notif)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(notif.createdAt)}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notif.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <Link
                  to="/normal/notification"
                  onClick={handleClose}
                  className="text-blue-400 hover:text-blue-500 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  View all notifications
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}