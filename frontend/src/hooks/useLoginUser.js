import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    loginUserService,
    logoutUserService, // 🔒 NEW
    updateUserService,
    getUserService,
    requestResetService,
    resetPasswordService
} from "../services/authService";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestReset = async (email) => {
        setLoading(true);
        try {
            const res = await requestResetService(email);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, password) => {
        setLoading(true);
        try {
            const res = await resetPasswordService(token, password);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, requestReset, resetPassword };
};

// 🔒 UPDATED: Login Hook (HTTP-only Cookie Version)
export const useLoginUser = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: loginUserService,
        mutationKey: ["login_key"],

        onSuccess: (data) => {
            console.log("🔍 Login Response:", data);

            const user = data?.data;
            const role = user?.role;

            console.log("👤 User:", user);
            console.log("👮 Role:", role);

            if (!user) {
                console.error("❌ Missing user in response!");
                toast.error("Login failed: Invalid response from server");
                return;
            }

            // 🔒 CRITICAL FIX: Call the login function from AuthContext
            // This updates the user state AND saves to localStorage
            console.log("💾 Calling AuthContext login()...");
            login(user); // ← THIS WAS MISSING!

            // ✅ VERIFY user was saved
            const savedUser = localStorage.getItem("user");
            console.log("✅ User saved?", !!savedUser);

            toast.success(data?.message || "Login Success");

            // Navigate based on role
            console.log("🧭 Navigating to dashboard...");
            setTimeout(() => {
                if (role?.toLowerCase() === "admin") {
                    console.log("→ Admin dashboard");
                    navigate("/admin/dashboard");
                } else {
                    console.log("→ Normal dashboard");
                    navigate("/normal/dash");
                }
            }, 100);
        },

        onError: (err) => {
            console.error("❌ Login Error:", err);
            toast.error(err?.message || "Login Failed");
        },
    });
};
// 🔒 NEW: Logout Hook
export const useLogoutUser = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutUserService,
        mutationKey: ["logout_key"],

        onSuccess: () => {
            console.log("✅ Logout successful");

            // Clear user data from localStorage
            localStorage.removeItem("user");

            // Call AuthContext logout (if you have additional cleanup)
            if (logout) {
                logout();
            }

            // Clear React Query cache
            queryClient.clear();

            toast.success("Logged out successfully");

            // Redirect to login
            navigate("/login");
        },

        onError: (err) => {
            console.error("❌ Logout Error:", err);
            // Even if logout API fails, clear local data
            localStorage.removeItem("user");
            navigate("/login");
            toast.error("Logout failed, but you've been logged out locally");
        },
    });
};

export const useUser = (userId) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: () => getUserService(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateUser = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => updateUserService(userId, formData),
        onSuccess: (data) => {
            toast.success(data?.message || "Profile updated successfully");
            // Invalidate user query to refresh updated data
            queryClient.invalidateQueries(["user", userId]);
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update profile");
        },
    });
};