// 🔐 AXIOS CONFIGURATION WITH IMPROVED CSRF HANDLING
// Location: frontend/src/api/api.js

import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5050/api",
    timeout: 10000,
    withCredentials: true
});

// 🔒 Get CSRF token from cookie (improved)
const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    const token = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
    
    if (!token) {
        console.warn("⚠️ CSRF token not found in cookies");
        console.log("   Available cookies:", document.cookie);
    }
    
    return token;
};

// ✅ NEW: Fetch CSRF token before app starts
let csrfTokenFetched = false;

export const initializeCsrfToken = async () => {
    if (csrfTokenFetched) return;
    
    try {
        console.log("🔒 Fetching initial CSRF token...");
        // Make a GET request to any endpoint to get CSRF token in cookie
        await axios.get("http://localhost:5050/api/auth/me", {
            withCredentials: true
        }).catch(() => {
            // It's okay if this fails (user not logged in)
            console.log("   CSRF token cookie should be set now");
        });
        
        csrfTokenFetched = true;
        console.log("✅ CSRF token initialized");
    } catch (err) {
        console.error("❌ Failed to initialize CSRF token:", err);
    }
};

axiosInstance.interceptors.request.use(
    (config) => {
        console.log("🚀 AXIOS INTERCEPTOR - REQUEST");
        console.log("   URL:", config.url);
        console.log("   Method:", config.method);

        // 🔒 Add CSRF token to state-changing requests
        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
            const csrfToken = getCsrfToken();
            
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
                console.log("   ✅ CSRF Token added:", csrfToken.substring(0, 10) + "...");
            } else {
                console.error("   ❌ CSRF Token missing! Request may fail.");
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorMessage = error.response?.data?.message || "";

        console.log("❌ AXIOS INTERCEPTOR - RESPONSE ERROR");
        console.log("   Status:", error.response?.status);
        console.log("   Message:", errorMessage);
        console.log("   URL:", error.config?.url);

        // 🔒 Handle CSRF errors
        if (error.response?.status === 403) {
            if (errorMessage.includes('CSRF') || error.response?.data?.error === 'INVALID_CSRF_TOKEN') {
                console.log("⚠️ CSRF token invalid. Refreshing page...");
                alert("Security token expired. Page will refresh.");
                window.location.reload();
                return Promise.reject(error);
            }
        }

        if (error.response?.status === 401) {
            if (errorMessage.includes("expired") ||
                errorMessage.includes("Invalid token") ||
                errorMessage.includes("Not authorized") ||
                errorMessage.includes("Please login")) {

                console.log("⚠️ Session expired. Clearing and redirecting...");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "/login";
                }, 500);
            } else if (errorMessage.includes("Password recently changed")) {
                console.log("⚠️ Password changed. Please login again.");
                alert("Your password was recently changed. Please login again.");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;