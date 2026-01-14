import React, { useState } from 'react';
import { useCreateUser } from '../../hooks/admin/useAdminUser';
import { useNavigate } from 'react-router-dom';
export default function CreateUserForm() {
     const navigate = useNavigate();
    const { mutate: createUser, isPending, isSuccess, isError, error } = useCreateUser({
        onSuccess: () => {
            navigate("/admin/user"); 
        }
    });
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createUser(formData);
    };

    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-4 text-left mt-6"
            >
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    disabled={isPending}
                >
                    {isPending ? 'Creating...' : 'Create User'}
                </button>

                {isError && <p className="text-red-500">Error: {error.message}</p>}
                {isSuccess && <p className="text-green-500">User created successfully!</p>}
            </form>
        </div>
    );
}
