import { useState, useEffect } from "react";
import { useResetPassword } from "../../hooks/useLoginUser";
import { useNavigate } from "react-router-dom";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const { requestReset, loading, error } = useResetPassword();
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    const res = await requestReset(email);
    if (res?.success) setSuccess("A reset link has been sent to your email.");
  };

  return (
    <section
      aria-label="Request password reset form"
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
        Request Password Reset
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div>
          <label
            htmlFor="email"
            className="block text-2xl font-semibold mb-3 text-gray-800"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            className="w-full px-6 py-4 text-xl rounded-xl border border-gray-300 
                       focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500
                       transition-colors duration-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          aria-busy={loading}
          className={`w-full py-4 text-xl rounded-xl font-semibold text-white 
            transition-colors duration-300 
            ${loading || !email ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"}`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
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

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mt-12 block mx-auto px-8 py-3 bg-gray-700 text-white rounded-xl text-lg font-semibold 
                   hover:bg-gray-800 shadow-md transition-colors duration-300"
      >
        &larr; Back to Login
      </button>
    </section>
  );
}
