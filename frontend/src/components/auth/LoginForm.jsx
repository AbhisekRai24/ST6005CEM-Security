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
             