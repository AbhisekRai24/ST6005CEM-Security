import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import loginBg from '../assets/images/login_pic.png';


export default function Login() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Image Side */}
            <div
                className="hidden md:block md:w-1/2 bg-cover bg-center"
                style={{ backgroundImage: `url(${loginBg})` }}
            />

            {/* Right Form Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-6">
                <div className="w-full max-w-lg">
                    <h2 className="text-3xl font-bold mb-6 text-center">Welcome</h2>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
