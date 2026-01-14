import React from 'react';
import RegisterForm from '../components/auth/RegisterForm'; // Adjust path if needed

const Register = () => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-20 p-6 border border-red-500 rounded-lg shadow-md font-sans">
      <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
      <RegisterForm />
    </div>
  );
};

export default Register;
