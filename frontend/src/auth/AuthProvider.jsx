import { createContext, useState, useEffect } from "react";
import { getCurrentUserService } from "../services/authService";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔒 UPDATED: Login function (NO TOKEN PARAMETER)
    // Token is now stored in HTTP-only cookie automatically
    const login = (userData) => {
        console.log("🔐 LOGIN FUNCTION CALLED");
        console.log("👤 userData:", userData);

        if (!userData) {
            console.error("❌ Missing userData in login function!");
            return;
        }

        try {
            // 🔒 REMOVED: localStorage.setItem("token", token)
            // Token is in HTTP-only cookie, NOT localStorage
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            console.log("✅ User saved to localStorage");
            console.log("✅ Verify user:", localStorage.getItem("user"));
        } catch (error) {
            console.error("❌ Error saving to localStorage:", error);
        }
    };

    // 🔒 UPDATED: Logout function (only clears user data)
    // Backend clears the HTTP-only cookie
    const logout = () => {
        console.log("🚪 LOGOUT FUNCTION CALLED");
        // 🔒 REMOVED: localStorage.removeItem("token")
        // Token is in HTTP-only cookie, cleared by backend
        localStorage.removeItem("user");
        setUser(null);
    };

    // 🔒 UPDATED: Check authentication on app load
    useEffect(() => {
        const checkUser = async () => {
            console.log("🔍 Checking for existing user session...");

            const storedUser = localStorage.getItem("user");

            console.log("Stored user found:", !!storedUser);

            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);

                    // 🔒 CHANGED: Verify session by calling backend
                    // This checks if HTTP-only cookie is still valid
                    console.log("📡 Verifying session with backend...");
                    const currentUser = await getCurrentUserService();

                    // If backend responds successfully, session is valid
                    setUser(currentUser);
                    console.log("✅ Session valid - user restored");
                } catch (error) {
                    console.log("❌ Session invalid or expired, logging out");
                    console.log("Error:", error.response?.data?.message || error.message);

                    // Clear invalid session data
                    logout();
                }
            } else {
                console.log("ℹ️ No stored user found");
            }

            setLoading(false);
        };

        checkUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AuthContext.Provider
            value={{ user, login, logout, loading, isAuthenticated: !!user }}
        >
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;