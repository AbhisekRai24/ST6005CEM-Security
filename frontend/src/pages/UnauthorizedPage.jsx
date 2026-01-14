

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="inline-flex p-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6 shadow-2xl">
                    <ShieldAlert className="w-16 h-16 text-white" />
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-800 mb-2">403</h1>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Access Denied
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page.
                    This area is restricted to administrators only.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>

                    <Link
                        to="/normal/home"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                {/* Security Notice */}
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                        <strong>Security Notice:</strong> This attempt has been logged.
                        Repeated unauthorized access attempts may result in account suspension.
                    </p>
                </div>
            </div>
        </div>
    );
}