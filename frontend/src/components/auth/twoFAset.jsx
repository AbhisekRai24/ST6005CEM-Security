// 🔐 2FA SETUP COMPONENT
// Location: frontend/src/components/auth/TwoFASetup.jsx

import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/api';
import { Shield, Copy, Check, Download, AlertCircle, X } from 'lucide-react';

export default function TwoFASetup({ onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: QR Code, 2: Verify, 3: Backup Codes
    const [qrCode, setQrCode] = useState('');
    const [manualKey, setManualKey] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [downloadedBackupCodes, setDownloadedBackupCodes] = useState(false);

    // ✅ Prevent duplicate calls
    const hasFetchedRef = useRef(false);

    // Step 1: Get QR Code - ✅ FIXED: Now checks hasFetchedRef
    useEffect(() => {
        if (step === 1 && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchQRCode();
        }
    }, [step]);

    const fetchQRCode = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.post('/2fa/setup', {});

            setQrCode(response.data.data.qrCode);
            setManualKey(response.data.data.manualEntryKey);
        } catch (err) {
            console.error('QR Code Error:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to generate QR code');
            hasFetchedRef.current = false; // ✅ Reset on error so they can retry
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify and Enable
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('🔍 Sending verification request with token:', verificationCode);

            const response = await axiosInstance.post('/2fa/verify-enable', {
                token: verificationCode
            });

            console.log('✅ Verification successful:', response.data);
            setBackupCodes(response.data.data.backupCodes);
            setStep(3);
        } catch (err) {
            console.error('❌ Verification failed:', err.response?.data);
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    // Copy manual key
    const copyManualKey = () => {
        navigator.clipboard.writeText(manualKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Download backup codes
    const downloadBackupCodes = () => {
        const text = `RevModz 2FA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nIMPORTANT: Keep these codes secure. Each code can only be used once.`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'revmodz-backup-codes.txt';
        a.click();
        setDownloadedBackupCodes(true);
    };

    const handleFinish = () => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Enable Two-Factor Authentication
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        {[1, 2, 3].map((num) => (
                            <React.Fragment key={num}>
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {num}
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${step >= num ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {num === 1 ? 'Scan' : num === 2 ? 'Verify' : 'Backup'}
                                    </span>
                                </div>
                                {num < 3 && <div className="flex-1 h-1 mx-2 bg-gray-200"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Step 1: QR Code */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Scan this QR code with Google Authenticator, Authy, or any TOTP authenticator app.
                            </p>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : qrCode ? (
                                <>
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex justify-center">
                                        <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-2 font-medium">
                                            Can't scan? Enter this code manually:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono">
                                                {manualKey}
                                            </code>
                                            <button
                                                onClick={copyManualKey}
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                disabled={!qrCode}
                                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next: Verify Code
                            </button>
                        </div>
                    )}

                    {/* Step 2: Verify */}
                    {step === 2 && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Enter the 6-digit code from your authenticator app to complete setup.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Enable 2FA'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Backup Codes */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800 mb-1">
                                            Save These Backup Codes
                                        </p>
                                        <p className="text-xs text-yellow-700">
                                            Use these codes if you lose access to your authenticator app. Each code can only be used once.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, index) => (
                                        <div key={index} className="bg-white px-3 py-2 rounded border border-gray-300 text-center font-mono text-sm">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={downloadBackupCodes}
                                className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Backup Codes
                            </button>

                            <button
                                onClick={handleFinish}
                                disabled={!downloadedBackupCodes}
                                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloadedBackupCodes ? 'Finish Setup' : 'Download codes to continue'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}