import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useContext } from "react";
import React from 'react';

export default function GuestRoute() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <>Loading...</>;

    if (user) {

        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'normal') return <Navigate to="/normal/home" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
