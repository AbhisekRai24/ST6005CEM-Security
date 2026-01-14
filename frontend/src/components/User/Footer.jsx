import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: "Home", path: "/normal/home" },
        { name: "All Products", path: "/normal/dash" },
        { name: "My Orders", path: "/normal/myorders" },
        { name: "Profile", path: "/normal/profile" },
    ];

    const categories = [
        { name: "Engine Parts", path: "/normal/user/category/1" },
        { name: "Suspension", path: "/normal/user/category/2" },
        { name: "Exhaust Systems", path: "/normal/user/category/3" },
        { name: "Accessories", path: "/normal/user/category/4" },
    ];

    return (
        <footer className="relative bg-[#0B2146] text-white mt-auto">
            <div className="max-w-screen-xl mx-auto px-6 py-12">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                                <span className="text-[#0B2146] font-bold text-2xl select-none">R</span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-400/20 to-transparent"></div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">RevModz</h3>
                                <p className="text-xs text-blue-200">Bike Parts Store</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Your trusted source for premium bike parts and modifications. Quality products, exceptional service.
                        </p>

                        {/* Social Media */}
                        <div className="flex gap-3 pt-2">
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                                <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    {/* <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                            Categories
                        </h4>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category.name}>
                                    <Link
                                        to={category.path}
                                        className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                                    >
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                            Contact Us
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-300">
                                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>123 Bike Street, Patan<br />Bagmati Province, Nepal</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <a href="tel:+977-1234567890" className="hover:text-white transition-colors">
                                    +977 123-456-7890
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <a href="mailto:info@revmodz.com" className="hover:text-white transition-colors">
                                    info@revmodz.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 my-8"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <p>
                        © {currentYear} RevModz. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/contact" className="hover:text-white transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
        </footer>
    );
}