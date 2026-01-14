import React, { useState } from 'react';



// Option 1: Simple built-in strength checker (No extra package needed)
const calculatePasswordStrength = (password) => {
    let score = 0;

    if (!password) return { score: 0, label: 'No Password', color: 'bg-gray-300' };

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;

    // Determine strength level
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
};

const PasswordStrengthMeter = ({ password }) => {
    const strength = calculatePasswordStrength(password);
    const widthPercentage = (strength.score / 4) * 100;

    return (
        <div className="mt-2">
            {/* Strength bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${widthPercentage}%` }}
                />
            </div>

            {/* Strength label */}
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-600">
                    Password Strength: <span className="font-semibold">{strength.label}</span>
                </p>
                <p className="text-xs text-gray-500">{strength.score}/4</p>
            </div>

            {/* Password requirements checklist */}
            {password && (
                <div className="mt-3 space-y-1 text-xs">
                    <RequirementCheck
                        met={password.length >= 8}
                        text="At least 8 characters"
                    />
                    <RequirementCheck
                        met={/[A-Z]/.test(password)}
                        text="Contains uppercase letter"
                    />
                    <RequirementCheck
                        met={/[a-z]/.test(password)}
                        text="Contains lowercase letter"
                    />
                    <RequirementCheck
                        met={/[0-9]/.test(password)}
                        text="Contains number"
                    />
                    <RequirementCheck
                        met={/[@$!%*?&#]/.test(password)}
                        text="Contains special character (@$!%*?&#)"
                    />
                </div>
            )}
        </div>
    );
};

const RequirementCheck = ({ met, text }) => (
    <div className="flex items-center gap-2">
        <span className={met ? 'text-green-600' : 'text-gray-400'}>
            {met ? '✓' : '○'}
        </span>
        <span className={met ? 'text-green-600' : 'text-gray-500'}>
            {text}
        </span>
    </div>
);


export default PasswordStrengthMeter;