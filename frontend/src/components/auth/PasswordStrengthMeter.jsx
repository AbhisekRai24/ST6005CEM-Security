import React, { useState } from 'react';




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



export default PasswordStrengthMeter;