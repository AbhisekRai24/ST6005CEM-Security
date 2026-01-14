import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';  // ✅ PORTAL IMPORT
import { RefreshCw, X } from 'lucide-react';

const SimpleCaptcha = ({ onVerify, onFail, onClose }) => {  // ✅ Has onClose
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');

    // Generate random CAPTCHA text
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(result);
        setUserInput('');
        setError('');
        setIsVerified(false);
    };

    // Generate initial CAPTCHA on mount
    useEffect(() => {
        generateCaptcha();
    }, []);

    // Handle verification
    const handleVerify = () => {
        if (userInput === captchaText) {
            setIsVerified(true);
            setError('');
            onVerify(true);
        } else {
            setError('Incorrect CAPTCHA. Please try again.');
            setIsVerified(false);
            onFail();
            generateCaptcha(); // Generate new CAPTCHA on failure
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleVerify();
        }
    };

    return createPortal(  // ✅ PORTAL WRAPPING
        <>
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="w-full max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 shadow-lg border-2 border-orange-200">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                        title="Close CAPTCHA"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-500 rounded-full">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Security Verification</h3>
                            <p className="text-sm text-gray-600">Please verify you're human</p>
                        </div>
                    </div>

                    {/* CAPTCHA Display */}
                    <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200 relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                                backgroundSize: '10px 10px'
                            }}></div>
                        </div>

                        {/* CAPTCHA Text */}
                        <div className="relative flex items-center justify-center">
                            <span className="text-3xl font-bold tracking-widest select-none" style={{
                                letterSpacing: '0.3em',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                                fontFamily: 'monospace',
                                color: '#2d3748',
                                transform: 'skewX(-5deg)'
                            }}>
                                {captchaText.split('').map((char, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            display: 'inline-block',
                                            transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 6 - 3}px)`,
                                            color: ['#f97316', '#ea580c', '#dc2626', '#2563eb', '#7c3aed'][Math.floor(Math.random() * 5)]
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </span>

                            {/* Refresh Button */}
                            <button
                                onClick={generateCaptcha}
                                className="absolute right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Generate new CAPTCHA"
                            >
                                <RefreshCw className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Input Field */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter the characters above"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-center text-lg font-mono tracking-widest"
                            disabled={isVerified}
                        />

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {isVerified && (
                            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Verification successful!</span>
                            </div>
                        )}

                        {/* Verify Button */}
                        {!isVerified && (
                            <button
                                onClick={handleVerify}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verify
                            </button>
                        )}
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Can't read? Click the refresh icon to get a new CAPTCHA
                    </p>
                </div>
            </div>
        </>, document.body);  // ✅ Render to body for full-screen overlay
};

export default SimpleCaptcha

