// 🔒 ADMIN ROUTE GUARD - Frontend Protection
// Location: frontend/src/routes/AdminRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useContext } from "react";
import React from 'react';

/**
 * AdminRoute Component
 * Protects admin-only routes on the frontend
 * 
 * IMPORTANT: This is UX protection only!
 * Real security is enforced on the backend with authorize() middleware
 */

export default function AdminRoute() {
    const { user, loading } = useContext(AuthContext);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin - redirect to unauthorized page
    if (user.role !== "admin") {
        return <Navigate to="/unauthorized" replace />;
    }

    // User is admin - allow access
    return <Outlet />;
}