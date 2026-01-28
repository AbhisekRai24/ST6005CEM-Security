"use client"

import React, { useState } from "react"
import { Bell, Clock, CheckCircle, Package, X, Shield, LogIn, ArrowRight, BellRing } from "lucide-react"
import { Link } from "react-router-dom"
import { useNotifications } from "../hooks/useNotification"

export default function NotificationDropdown({ userId }) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead } = useNotifications(userId)

  const handleToggle = () => setIsOpen(!isOpen)
  const handleClose = () => setIsOpen(false)

  function formatNotification(notif) {
    const isOrderNotification = /order/i.test(notif.message) ||
      notif.type === "order" ||
      ["pending", "processing", "completed", "shipped", "delivered"].includes(notif.status)

    let orderId = null
    let shortOrderId = null

    if (isOrderNotification) {
      const orderIdMatch = notif.message.match(/order[:\s#]*([a-zA-Z0-9]{8,})/i)
      orderId = orderIdMatch ? orderIdMatch[1] : null
      shortOrderId = orderId ? orderId.slice(-4) : null
    }

    const status = notif.status || (() => {
      if (/pending/i.test(notif.message)) return "pending"
      if (/processing/i.test(notif.message)) return "processing"
      if (/completed|delivered/i.test(notif.message)) return "completed"
      return null
    })()

    let baseMsg = notif.message
    if (isOrderNotification && status) {
      switch (status) {
        case "pending": baseMsg = "Order pending confirmation"; break
        case "processing": baseMsg = "Order is being prepared"; break
        case "completed": baseMsg = "Order delivered. Enjoy!"; break
      }
    }

    return {
      message: baseMsg,
      orderTag: shortOrderId ? `#${shortOrderId}` : null
    }
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  function getStatusConfig(notif) {
    const message = notif.message?.toLowerCase() || ""
    const status = notif.status

    if (message.includes("password")) {
      return { color: "text-purple-600", bg: "bg-purple-100", icon: <Shield className="w-4 h-4" /> }
    }
    if (message.includes("login") || message.includes("device")) {
      return { color: "text-indigo-600", bg: "bg-indigo-100", icon: <LogIn className="w-4 h-4" /> }
    }

    switch (status) {
      case "pending": return { color: "text-amber-600", bg: "bg-amber-100", icon: <Clock className="w-4 h-4" /> }
      case "processing": return { color: "text-blue-600", bg: "bg-blue-100", icon: <Package className="w-4 h-4" /> }
      case "completed": return { color: "text-emerald-600", bg: "bg-emerald-100", icon: <CheckCircle className="w-4 h-4" /> }
      default: return { color: "text-slate-600", bg: "bg-slate-100", icon: <Bell className="w-4 h-4" /> }
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"
          }`}
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 && !isOpen ? "animate-swing" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  {unreadCount > 0 ? `You have ${unreadCount} new alerts` : "No new alerts"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <BellRing className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">All caught up!</p>
                  <p className="text-gray-500 text-xs mt-1">Check back later for new updates.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 8).map((notif) => {
                    const statusConfig = getStatusConfig(notif)
                    const { message, orderTag } = formatNotification(notif)
                    return (
                      <button
                        key={notif._id}
                        onClick={() => {
                          markAsRead(notif._id)
                          handleClose()
                        }}
                        className={`w-full text-left px-5 py-4 flex gap-4 transition-all hover:bg-blue-50/30 group ${!notif.read ? "bg-blue-50/20" : ""
                          }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 ${statusConfig.bg} rounded-xl flex items-center justify-center ${statusConfig.color} transition-transform group-hover:scale-110`}>
                          {statusConfig.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className={`text-sm leading-snug ${!notif.read ? "text-gray-900 font-bold" : "text-gray-600 font-medium"}`}>
                              {message}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1.5" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {orderTag && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {orderTag}
                              </span>
                            )}
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50/50 border-t border-gray-100">
              <Link
                to="/normal/notification"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                See all notifications
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-swing { animation: swing 2s ease-in-out infinite; transform-origin: top center; }
      `}</style>
    </div>
  )
}