import React, { useState, useEffect } from 'react';
import { useRegisterUser } from '../../hooks/useRegisterUser';
import logo from '../../assets/images/logo.png';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';

export default function RegisterForm() {
  const { register, isLoading, data, error } = useRegisterUser();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '' // 🔒 Added confirm password
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // 🔒 Local validation

  // Update preview when profileImage changes
  useEffect(() => {
    if (!profileImage) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // 🔒 FRONTEND VALIDATION
  const validateForm = () => {
    const errors = {};

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Validate before submitting
    if (!validateForm()) {
      return;
    }

    const formPayload = new FormData();
    formPayload.append('username', formData.username);
    formPayload.append('email', formData.email);
    formPayload.append('firstName', formData.firstName);
    formPayload.append('lastName', formData.lastName);
    formPayload.append('password', formData.password);

    if (profileImage) {
      formPayload.append('profileImage', profileImage);
    }

    const response = await register(formPayload);
    if (response) {
      console.log('User registered:', response);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="mx-auto mb-6 w-32 h-auto"
      />

      {preview && (
        <img
          src={preview}
          alt="Profile Preview"
          className="mx-auto mb-4 w-24 h-24 rounded-full object-cover border border-gray-300"
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 text-left mt-6"
      >
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image (Optional)
          </label>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleFileChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Username */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username *"
            value={formData.username}
            onChange={handleChange}
            required
            className="px-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Last Name */}
        <div>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password with Strength Meter */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
          />

          {/* 🔒 PASSWORD STRENGTH METER */}
          <PasswordStrengthMeter password={formData.password} />

          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {validationErrors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">
              {error.message || 'Registration failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Success Message */}
        {data && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm font-medium">
              Registration successful! Please login.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}