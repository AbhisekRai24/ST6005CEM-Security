import React from 'react';
import { FaUtensils, FaClipboardList, FaChartBar, FaCog, FaHome, FaPlusSquare } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>
      <nav className="space-y-6">
        <SidebarItem icon={<FaHome />} label="Dashboard" to="/" />
        <SidebarItem icon={<FaClipboardList />} label="Orders" />
        <SidebarItem icon={<FaUtensils />} label="Menu Items" />
        <SidebarItem icon={<FaChartBar />} label="Analytics" />
        <SidebarItem icon={<FaCog />} label="Settings" />
        <SidebarItem icon={<FaPlusSquare />} label="Add Product" to="/add-product" />
      </nav>
      <p className="text-sm text-gray-400 mt-10">Servzz Admin Panel</p>
    </div>
  );
};

const SidebarItem = ({ icon, label, to = "#" }) => (
  <Link to={to} className="block">
    <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 cursor-pointer">
      <span>{icon}</span>
      <span className="font-normal">{label}</span>
    </div>
  </Link>
);

export default Sidebar;
