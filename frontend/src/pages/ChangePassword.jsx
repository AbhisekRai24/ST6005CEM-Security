import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { useChangePassword } from "../hooks/useLoginUser";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react";

export default function ChangePassword() {
    const { user } = useContext(AuthContext);
    const userId = user?._id;
    const { mutateAsync: changePassword, isPending } = useChangePassword(userId);

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [errors, setErrors] = useState({});

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        const strengthMap = {
            0: { label: "Very Weak", color: "bg-red-500" },
            1: { label: "Weak", color: "bg-orange-500" },
            2: { label: "Fair", color: "bg-yellow-500" },
            3: { label: "Good", color: "bg-blue-500" },
            4: { label: "Strong", color: "bg-green-500" },
            5: { label: "Very Strong", color: "bg-green-600" },
        };

        return { strength, ...strengthMap[strength] };
    };

    const passwordStrength = getPasswordStrength(form.newPassword);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.currentPassword) {
            newErrors.currentPassword = "Current password is required";
        }

        if (!form.newPassword) {
            newErrors.newPassword = "New password is required";
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(form.newPassword)) {
                newErrors.newPassword =
                    "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)";
            }
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (form.newPassword !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
            newErrors.newPassword = "New password must be different from current password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            // Clear form on success
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            console.error("Password change error:", err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                </div>
                <p className="text-gray-600 text-sm">
                    Keep your account secure by using a strong, unique password
                </p>
            </div>

            {/* Security Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Password Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>At least 8 characters long</li>
                            <li>Contains uppercase and lowercase letters</li>
                            <li>Includes at least one number</li>
                            <li>Has at least one special character (@$!%*?&)</li>
                            <li>Cannot reuse any of your last 5 passwords</li>
                        </ul>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={form.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all ${errors.currentPassword ? "border-red-500" : "border-gray-300 focus:border-blue-400"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPasswords.current ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.currentPassword}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all ${errors.newPassword ? "border-red-500" : "border-gray-300 focus:border-blue-400"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPasswords.new ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {form.newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Password Strength:</span>
                                <span className={`text-xs font-semibold ${passwordStrength.strength >= 4 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.newPassword}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-blue-400"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPasswords.confirm ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>

                    {form.confirmPassword && form.newPassword === form.confirmPassword && !errors.confirmPassword && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Passwords match
                        </p>
                    )}

                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-[#0B2146] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Changing Password...</span>
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                <span>Change Password</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}