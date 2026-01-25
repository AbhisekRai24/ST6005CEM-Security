import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5050/api",
    timeout: 10000,
    withCredentials: true
});

// 🔒 Get CSRF token from cookie
const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
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
                console.log("   🔒 CSRF Token added");
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

        // 🔒 Handle CSRF errors
        if (error.response?.status === 403 && errorMessage.includes('CSRF')) {
            console.log("⚠️ CSRF token invalid. Refreshing page...");
            window.location.reload();
            return;
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