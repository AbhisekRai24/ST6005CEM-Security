// 🔐 2FA VERIFICATION MODAL (Used during login)
// Location: frontend/src/components/auth/TwoFAVerifyModal.jsx

import React, { useState } from 'react';
import { Shield, X, AlertCircle, KeyRound } from 'lucide-react';

export default function TwoFAVerifyModal({ 
    userId, 
    onVerify, 
    onCancel, 
    backupCodesAvailable = false 
}) {
    const [code, setCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!code || code.length < 6) {
            setError(useBackupCode ? 'Please enter an 8-character backup code' : 'Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onVerify(code, useBackupCode);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Two-Factor Authentication
                        </h2>
                    </div>
                    <button 
                        onClick={onCancel} 
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        {useBackupCode 
                            ? 'Enter one of your backup codes to continue.'
                            : 'Enter the 6-digit code from your authenticator app.'}
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {useBackupCode ? 'Backup Code' : 'Authentication Code'}
                        </label>
                        <input
                            type="text"
                            maxLength={useBackupCode ? 8 : 6}
                            value={code}
                            onChange={(e) => {
                                const value = useBackupCode 
                                    ? e.target.value.toUpperCase()
                                    : e.target.value.replace(/\D/g, '');
                                setCode(value);
                                setError('');
                            }}
                            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
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
                        disabled={loading || code.length < (useBackupCode ? 8 : 6)}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                            </>
                        ) : (
                            'Verify & Login'
                        )}
                    </button>

                    {backupCodesAvailable && (
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackupCode(!useBackupCode);
                                setCode('');
                                setError('');
                            }}
                            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
                        >
                            <KeyRound className="w-4 h-4" />
                            {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}