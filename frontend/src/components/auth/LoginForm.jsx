import React, { useState } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from '../../hooks/useLoginUser';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';
import SimpleCaptcha from '../../components/auth/SimpleCaptcha';

export default function LoginForm() {
    const { mutate, error, isPending } = useLoginUser();

    // 🔒 CAPTCHA State
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState(null);

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Please fill email"),
        password: Yup.string().min(8, "Password needs 8 characters").required("Please fill password")
    });

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema,
        onSubmit: (values) => {
            // 🔒 CHECK CAPTCHA if required
            if (showCaptcha && !captchaVerified) {
                alert("Please complete the CAPTCHA verification");
                return;
            }

            mutate(values, {
                onError: (err) => {
                    // 🔒 CHECK FOR RATE LIMITING
                    if (err?.rateLimited || err?.message?.includes('Too many')) {
                        return; // Already handled by error display
                    }

                    // 🔒 CHECK IF CAPTCHA SHOULD BE SHOWN
                    if (err?.requiresCaptcha || err?.message?.includes('3 attempt') || err?.message?.includes('2 attempt')) {
                        setShowCaptcha(true);
                        setCaptchaVerified(false);
                    }

                    // 🔒 SHOW ATTEMPTS REMAINING
                    if (err?.attemptsRemaining !== undefined) {
                        setAttemptsRemaining(err.attemptsRemaining);
                    } else if (err?.message?.includes('attempt')) {
                        // Extract number from message like "2 attempts remaining"
                        const match = err.message.match(/(\d+)\s+attempt/);
                        if (match) {
                            setAttemptsRemaining(parseInt(match[1]));
                        }
                    }
                }
            });
        }
    });

    // 🔒 CAPTCHA Handlers
    const handleCaptchaVerify = (verified) => {
        setCaptchaVerified(verified);
        if (verified) {
            // Auto-submit after CAPTCHA verification
            setTimeout(() => {
                formik.handleSubmit();
            }, 500);
        }
    };

    const handleCaptchaFail = () => {
        setCaptchaVerified(false);
    };

    // Check for various error states
    const isAccountLocked = error?.message?.includes('Account locked') ||
        error?.message?.includes('locked due to');

    const isPasswordExpired = error?.message?.includes('Password expired') ||
        error?.passwordExpired;

    const isRateLimited = error?.rateLimited ||
        error?.message?.includes('Too many login attempts') ||
        error?.message?.includes('Too many requests');

    return (
        <>
            {/* 🔒 CAPTCHA OVERLAY (Renders outside form, on top of everything) */}
            {showCaptcha && !isAccountLocked && !isRateLimited && (
                <SimpleCaptcha
                    onVerify={handleCaptchaVerify}
                    onFail={handleCaptchaFail}
                    onClose={() => {
                        setShowCaptcha(false);
                        setCaptchaVerified(false);
                    }}
                />
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            disabled={isAccountLocked || isRateLimited}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${isAccountLocked || isRateLimited
                                ? 'bg-gray-100 cursor-not-allowed'
                                : formik.touched.email && formik.errors.email
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                        />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                        <p className="text-red-600 text-sm mt-1.5">{formik.errors.email}</p>
                    )}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            disabled={isAccountLocked || isRateLimited}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${isAccountLocked || isRateLimited
                                ? 'bg-gray-100 cursor-not-allowed'
                                : formik.touched.password && formik.errors.password
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                        />
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <p className="text-red-600 text-sm mt-1.5">{formik.errors.password}</p>
                    )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                    <Link
                        to="/request-reset"
                        className="text-sm text-blue-400 hover:text-blue-500 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* 🔒 RATE LIMIT WARNING */}
                {isRateLimited && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-red-800 mb-1">
                                    Too Many Attempts
                                </h3>
                                <p className="text-sm text-red-700">
                                    {error.message}
                                </p>
                                <p className="text-sm text-red-600 mt-2 font-medium">
                                    ⏱️ Please wait {error.retryAfter || 15} minutes before trying again
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔒 ACCOUNT LOCKOUT WARNING */}
                {isAccountLocked && !isRateLimited && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-red-800 mb-1">
                                    Account Locked
                                </h3>
                                <p className="text-sm text-red-700">
                                    {error.message}
                                </p>
                                <p className="text-sm text-red-600 mt-2 font-medium">
                                    ⏱️ Try again in {error.lockTimeRemaining || 15} minutes
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔒 PASSWORD EXPIRED WARNING */}
                {isPasswordExpired && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-orange-800 mb-1">
                                    Password Expired
                                </h3>
                                <p className="text-sm text-orange-700">
                                    {error.message}
                                </p>
                                <Link
                                    to="/request-reset"
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
                                >
                                    Reset Password Now →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔒 ATTEMPTS REMAINING WARNING */}
                {attemptsRemaining !== null && attemptsRemaining <= 2 && !isAccountLocked && !isRateLimited && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                                    Warning
                                </h3>
                                <p className="text-sm text-yellow-700">
                                    ⚠️ {attemptsRemaining} login {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                                    before your account is locked for 15 minutes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔒 REGULAR ERROR (with attempt counter) */}
                {error && !isAccountLocked && !isPasswordExpired && !isRateLimited && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-red-600 text-sm">
                                    {error.message || "Login failed. Please try again."}
                                </p>
                                {/* Show remaining attempts if message contains number */}
                                {error.message?.includes('attempt') && (
                                    <p className="text-red-500 text-xs mt-1">
                                        ⚠️ Your account will be locked after too many failed attempts.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending || isAccountLocked || isRateLimited || (showCaptcha && !captchaVerified)}
                    className="w-full py-3 bg-[#0B2146] text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Logging in...</span>
                        </>
                    ) : (
                        <>
                            <LogIn className="w-5 h-5" />
                            <span>Login</span>
                        </>
                    )}
                </button>

                {/* Register Link */}
                <p className="text-sm text-center text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/register"
                        className="text-blue-400 hover:text-blue-500 font-medium transition-colors"
                    >
                        Register here
                    </Link>
                </p>
            </form>
        </>
    );
}