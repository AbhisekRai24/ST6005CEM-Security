import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/api'; // ✅ Changed from 'axios'
import { Shield, Check, X, AlertCircle, Key, RefreshCw, Loader2 } from 'lucide-react';
import TwoFASetup from '../auth/twoFAset';

export default function TwoFASettings() {
    const [twoFAStatus, setTwoFAStatus] = useState({
        twoFactorEnabled: false,
        twoFactorEnabledAt: null,
        backupCodesRemaining: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSetup, setShowSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);

    useEffect(() => {
        fetch2FAStatus();
    }, []);

    const fetch2FAStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get('/2fa/status'); // ✅ Changed

            if (response.data && response.data.data) {
                setTwoFAStatus(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch 2FA status:', err);
            setError(err.response?.data?.message || 'Failed to load 2FA settings');
        } finally {
            setLoading(false);
        }
    };


    const handleSetupSuccess = () => {
        setShowSetup(false);
        fetch2FAStatus();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    // ✅ FIXED: Show error state if loading failed
    if (error && !loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-800">Failed to load 2FA settings</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                            <button
                                onClick={fetch2FAStatus}
                                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {showSetup && (
                <TwoFASetup
                    onClose={() => setShowSetup(false)}
                    onSuccess={handleSetupSuccess}
                />
            )}

            {showDisableModal && (
                <DisableTwoFAModal
                    onClose={() => setShowDisableModal(false)}
                    onSuccess={() => {
                        setShowDisableModal(false);
                        fetch2FAStatus();
                    }}
                />
            )}

            {showRegenerateModal && (
                <RegenerateBackupCodesModal
                    onClose={() => setShowRegenerateModal(false)}
                    onSuccess={() => {
                        setShowRegenerateModal(false);
                        fetch2FAStatus();
                    }}
                />
            )}

            <div className="bg-white rounded-lg shadow mt-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Two-Factor Authentication
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {twoFAStatus.twoFactorEnabled ? (
                        <div className="space-y-4">
                            {/* Status */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">
                                            Two-Factor Authentication Enabled
                                        </p>
                                        {twoFAStatus.twoFactorEnabledAt && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Enabled on {new Date(twoFAStatus.twoFactorEnabledAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Backup Codes Info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                Backup Codes
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {twoFAStatus.backupCodesRemaining || 0} codes remaining
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRegenerateModal(true)}
                                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Regenerate
                                    </button>
                                </div>
                            </div>

                            {/* Disable Button */}
                            <button
                                onClick={() => setShowDisableModal(true)}
                                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Disable Two-Factor Authentication
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800 mb-2">
                                            Why enable Two-Factor Authentication?
                                        </p>
                                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                            <li>Protect your account from unauthorized access</li>
                                            <li>Add an extra layer of security beyond your password</li>
                                            <li>Receive alerts about suspicious login attempts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Enable Button */}
                            <button
                                onClick={() => setShowSetup(true)}
                                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Shield className="w-5 h-5" />
                                Enable Two-Factor Authentication
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ==========================================
// DISABLE 2FA MODAL
// ==========================================
function DisableTwoFAModal({ onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDisable = async (e) => {
        e.preventDefault();

        if (!password || !token) {
            setError('Both password and 2FA code are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axiosInstance.post('/2fa/disable', { // ✅ Changed
                password,
                token
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Disable 2FA</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleDisable} className="p-6 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Disabling 2FA will make your account less secure.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            2FA Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// REGENERATE BACKUP CODES MODAL
// ==========================================
function RegenerateBackupCodesModal({ onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newCodes, setNewCodes] = useState([]);

    const handleRegenerate = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/2fa/regenerate-backup-codes', { // ✅ Changed
                password,
                token
            });
            setNewCodes(response.data.data.backupCodes);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to regenerate codes');
        } finally {
            setLoading(false);
        }
    };


    const downloadCodes = () => {
        const text = `RevModz 2FA Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${newCodes.join('\n')}\n\nIMPORTANT: Keep these codes secure.`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-codes.txt';
        a.click();
    };

    if (newCodes.length > 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800">New Backup Codes</h3>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-2">
                                {newCodes.map((code, i) => (
                                    <div key={i} className="bg-white px-3 py-2 rounded border text-center font-mono text-sm">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={downloadCodes}
                            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
                        >
                            Download Codes
                        </button>

                        <button
                            onClick={onSuccess}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Regenerate Backup Codes</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleRegenerate} className="p-6 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ This will invalidate your old backup codes.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            2FA Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate New Codes'}
                    </button>
                </form>
            </div>
        </div>
    );
}