import React, { useState, useEffect } from "react";
import { useUpdateUser, useGetUserById } from "../../hooks/admin/useAdminUser";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useGetUserById(id);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
  });

  const { mutate: updateUser, isPending } = useUpdateUser({
    onSuccess: () => navigate("/admin/user"),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ id, data: formData });
  };

  if (isLoading) return <p>Loading user data...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Update User</h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 text-left mt-6">
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
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Update User"}
        </button>
      </form>
    </div>
  );
}
