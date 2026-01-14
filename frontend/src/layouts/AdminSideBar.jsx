import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useContext, useState } from "react";
import Header from './AdminHeader'
import {
    FaHome,
    FaClipboardList,
    FaCog,
    FaPlusSquare,
    FaOptinMonster,
    FaImage,
    FaChevronRight,
} from "react-icons/fa";

export default function AdminLayout() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <Header user={user} logout={logout} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-900 shadow-2xl overflow-auto border-r-4 border-[#0B2146] transition-all duration-300`}>
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            {!isSidebarCollapsed && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0B2146] rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-[#E5BA41] font-bold text-lg">A</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#0B2146] dark:text-white">Admin Panel</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Management Hub</p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <FaChevronRight className={`text-gray-600 dark:text-gray-400 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-2">
                        <SidebarItem
                            icon={<FaHome />}
                            label="Dashboard"
                            to="/admin/dashboard"
                            active={isActive("/admin/dashboard")}
                            collapsed={isSidebarCollapsed}
                        />
                        <SidebarItem
                            icon={<FaClipboardList />}
                            label="Users"
                            to="/admin/user"
                            active={isActive("/admin/user")}
                            collapsed={isSidebarCollapsed}
                        />
                        <SidebarItem
                            icon={<FaCog />}
                            label="Product Add"
                            to="/admin/addproduct"
                            active={isActive("/admin/addproduct")}
                            collapsed={isSidebarCollapsed}
                        />
                        <SidebarItem
                            icon={<FaPlusSquare />}
                            label="Product List"
                            to="/admin/products"
                            active={isActive("/admin/products")}
                            collapsed={isSidebarCollapsed}
                        />
                        <SidebarItem
                            icon={<FaOptinMonster />}
                            label="Category Add"
                            to="/admin/category"
                            active={isActive("/admin/category")}
                            collapsed={isSidebarCollapsed}
                        />
                        <SidebarItem
                            icon={<FaImage />}
                            label="Banner"
                            to="/admin/banner/create"
                            active={isActive("/admin/banner/create")}
                            collapsed={isSidebarCollapsed}
                        />
                    </nav>

                    {/* Sidebar Footer */}
                    {!isSidebarCollapsed && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="bg-[#0B2146] rounded-xl p-4 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 bg-[#E5BA41] rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold">System Status</span>
                                </div>
                                <p className="text-xs text-gray-300">All systems operational</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors">
                    <Outlet />
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-[#0B2146] text-white py-6 border-t-4 border-[#E5BA41]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E5BA41] rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-[#0B2146] font-bold text-lg">R</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-wide">RevModz</h2>
                                <p className="text-xs text-gray-300">Bike Parts & Accessories</p>
                            </div>
                        </div>

                        <div className="text-center md:text-right">
                            <p className="text-sm">
                                © {new Date().getFullYear()} RevModz. All rights reserved.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Premium bike parts and accessories for riders
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Enhanced SidebarItem component
const SidebarItem = ({ icon, label, to = "#", active, collapsed }) => (
    <Link to={to} className="block group">
        <div className="relative">
            {/* Active indicator bar */}
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5BA41] rounded-r-full"></div>
            )}

            <div
                className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-4'} px-4 py-3.5 rounded-xl transition-all duration-200
                    ${active
                        ? "bg-[#0B2146] text-white shadow-lg shadow-[#0B2146]/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-[#0B2146]/5 dark:hover:bg-[#0B2146]/10"
                    }
                `}
            >
                <span className={`text-xl ${active ? 'text-[#E5BA41]' : ''} transition-colors`}>
                    {icon}
                </span>

                {!collapsed && (
                    <>
                        <span className="font-semibold flex-1">{label}</span>

                        {active && (
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-[#E5BA41] rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-[#E5BA41] rounded-full opacity-60"></div>
                                <div className="w-1.5 h-1.5 bg-[#E5BA41] rounded-full opacity-30"></div>
                            </div>
                        )}

                        {!active && (
                            <FaChevronRight className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </>
                )}
            </div>

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-[#0B2146] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0B2146]"></div>
                </div>
            )}
        </div>
    </Link>
);