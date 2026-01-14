import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResetPassword } from "../../hooks/useLoginUser";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword, loading, error } = useResetPassword();
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (success) {
            // Redirect handled in handleSubmit, but just in case
            const timer = setTimeout(() => {
                setSuccess("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                // Assuming your hook can clear error or you can manage error state
                // But here just clearing error visually by setting success blank.
                // If you manage error locally, clear here instead.
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await resetPassword(token, password);
        if (res?.success) {
            setSuccess("Password reset successful. Redirecting...");
            setTimeout(() => navigate("/login"), 2000);
        }
    };

    return (
        <section
            aria-label="Reset password form"
            className="max-w-3xl mx-auto mt-16 p-12 border border-gray-300 rounded-xl shadow-lg bg-white
                 animate-fadeIn font-sans"
        >
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
      `}</style>

            <h2 className="text-center text-4xl font-extrabold mb-8 text-gray-900">
                Reset Your Password
            </h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                <div>
                    <label
                        htmlFor="password"
                        className="block text-2xl font-semibold mb-3 text-gray-800"
                    >
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-required="true"
                        className="w-full px-6 py-4 text-xl rounded-xl border border-gray-300 
                       focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500
                       transition-colors duration-300"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !password}
                    aria-busy={loading}
                    className={`w-full py-4 text-xl rounded-xl font-semibold text-white 
            transition-colors duration-300 
            ${loading || !password ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"}`}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            {error && (
                <p
                    role="alert"
                    className="mt-8 px-6 py-4 bg-red-700 text-white rounded-xl text-center text-lg font-semibold animate-fadeIn"
                >
                    {error}
                </p>
            )}

            {success && (
                <p
                    role="status"
                    className="mt-8 px-6 py-4 bg-green-700 text-white rounded-xl text-center text-lg font-semibold animate-fadeIn"
                >
                    {success}
                </p>
            )}
        </section>
    );
}
