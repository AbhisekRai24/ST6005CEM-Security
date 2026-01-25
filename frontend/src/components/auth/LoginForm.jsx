import React, { useState } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from '../../hooks/useLoginUser';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';
import TwoFAVerifyModal from '../auth/twoFAVerifyModal';

export default function LoginForm() {
    const { mutate, error, isPending } = useLoginUser();

    // 🔒 CAPTCHA State (Cloudflare Turnstile)
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [attemptsRemaining, setAttemptsRemaining] = useState(null);

    // 🔐 2FA State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFAUserId, setTwoFAUserId] = useState(null);
    const [backupCodesAvailable, setBackupCodesAvailable] = useState(false);
    const [loginCredentials, setLoginCredentials] = useState(null);

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
            if (showCaptcha && !captchaToken) {
                return; // Don't submit without CAPTCHA token
            }

            // Store credentials for 2FA retry
            setLoginCredentials(values);

            const payload = {
                ...values,
                ...(showCaptcha && captchaToken ? { captchaToken, requiresCaptcha: true } : {})
            };

            mutate(payload, {
                onSuccess: (data) => {
                    // 🔐 CHECK IF 2FA IS REQUIRED
                    if (data?.requires2FA) {
                        setTwoFAUserId(data.userId);
                        setBackupCodesAvailable(data.backupCodesAvailable || false);
                        setShow2FAModal(true);
                        return;
                    }
                    // Normal login success - redirect handled by useLoginUser hook
                    // Reset captcha on success
                    setShowCaptcha(false);
                    setCaptchaToken(null);
                },
                onError: (err) => {
                    console.log('Login Error:', err);

                    // Reset captcha token on error
                    setCaptchaToken(null);

                    // 🔒 CHECK FOR RATE LIMITING
                    if (err?.rateLimited || err?.message?.includes('Too many')) {
                        return;
                    }

                    // 🔒 CHECK IF CAPTCHA SHOULD BE SHOWN
                    if (err?.requiresCaptcha) {
                        console.log('🔒 CAPTCHA required by backend');
                        setShowCaptcha(true);
                    }

                    // 🔒 SHOW ATTEMPTS REMAINING
                    if (err?.attemptsRemaining !== undefined) {
                        setAttemptsRemaining(err.attemptsRemaining);

                        // Show CAPTCHA when 2 or fewer attempts remain
                        if (err.attemptsRemaining <= 2) {
                            console.log('🔒 CAPTCHA triggered - attempts remaining:', err.attemptsRemaining);
                            setShowCaptcha(true);
                        }
                    }
                }
            });
        }
    });

    // 🔐 HANDLE 2FA VERIFICATION
    const handle2FAVerification = async (code, isBackupCode) => {
        if (!loginCredentials || !twoFAUserId) return;

        mutate({
            ...loginCredentials,
            twoFactorToken: code,
            isBackupCode: isBackupCode
        }, {
            onSuccess: () => {
                setShow2FAModal(false);
            },
            onError: (err) => {
                throw err;
            }
        });
    };

    // 🔒 Cloudflare Turnstile Handlers
    const handleCaptchaVerify = (token) => {
        console.log('✅ CAPTCHA verified, token received');
        setCaptchaToken(token);
    };

    const handleCaptchaError = () => {
        console.log('❌ CAPTCHA error');
        setCaptchaToken(null);
    };

    const handleCaptchaExpire = () => {
        console.log('⏰ CAPTCHA expired');
        setCaptchaToken(null);
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
            {/* 🔐 2FA VERIFICATION MODAL */}
            {show2FAModal && (
                <TwoFAVerifyModal
                    userId={twoFAUserId}
                    onVerify={handle2FAVerification}
                    onCancel={() => setShow2FAModal(false)}
                    backupCodesAvailable={backupCodesAvailable}
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

                {/* 🔒 CLOUDFLARE TURNSTILE CAPTCHA - Only show when triggered */}
                {showCaptcha && !isAccountLocked && !isRateLimited && (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <p className="text-sm text-gray-700 mb-3 font-medium">
                            ⚠️ Please verify you're human to continue
                        </p>
                        <TurnstileWidget
                            key="turnstile-widget" // ✅ Add unique key
                            onVerify={handleCaptchaVerify}
                            onError={handleCaptchaError}
                            onExpire={handleCaptchaExpire}
                        />
                        {!captchaToken && (
                            <p className="text-xs text-red-600 mt-2">
                                Complete the verification above to login
                            </p>
                        )}
                    </div>
                )}

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

                {/* 🔒 REGULAR ERROR */}
                {error && !isAccountLocked && !isPasswordExpired && !isRateLimited && !error.requires2FA && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-red-600 text-sm">
                                    {error.message || "Login failed. Please try again."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending || isAccountLocked || isRateLimited || (showCaptcha && !captchaToken)}
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