import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5050/api",
    timeout: 10000,
    withCredentials: true // 🔒 NEW: Send cookies with requests
});

axiosInstance.interceptors.request.use(
    (config) => {
        // 🔒 REMOVED: No longer reading token from localStorage
        console.log("🚀 AXIOS INTERCEPTOR - REQUEST");
        console.log("   URL:", config.url);
        console.log("   Method:", config.method);
        console.log("   Cookies will be sent automatically");

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

        if (error.response?.status === 401) {
            if (errorMessage.includes("expired") ||
                errorMessage.includes("Invalid token") ||
                errorMessage.includes("Not authorized") ||
                errorMessage.includes("Please login")) {

                console.log("⚠️ Session expired. Clearing and redirecting...");
                localStorage.removeItem("user"); // 🔒 Only clear user data, NOT token

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

        if (error.response?.status === 403) {
            console.error("403 Forbidden Error:", error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;