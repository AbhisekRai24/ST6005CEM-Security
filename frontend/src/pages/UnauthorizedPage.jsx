import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, Home, MoveLeft, LockKeyhole } from 'lucide-react';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
                
                <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                        <LockKeyhole className="w-32 h-32 text-red-500" strokeWidth={1.5} />
                    </div>
                </div>

             
                <div className="text-left">
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wider uppercase">
                        Error 403
                    </span>
                    <h1 className="text-5xl font-extrabold text-gray-900 mt-4 mb-2">
                        Access Restricted
                    </h1>
                    <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                        Oops! It looks like you've reached a restricted area.
                        This page is reserved for authorized administrators only.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-medium transition-all transform hover:-translate-y-1"
                        >
                            <MoveLeft className="w-5 h-5" />
                            Go Back
                        </button>

                        <Link
                            to="/normal/home"
                            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 rounded-xl font-medium transition-all"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </Link>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <div className="flex items-start gap-3 text-gray-400">
                            <ShieldX className="w-5 h-5 mt-0.5 text-red-400" />
                            <p className="text-sm">
                                Your IP and access attempt have been logged for security monitoring.
                                If you believe this is an error, please contact your system provider.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}