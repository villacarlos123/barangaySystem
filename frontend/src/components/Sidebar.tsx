import { motion } from 'framer-motion';
import { FaTachometerAlt, FaUserTie, FaUsers, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    return (
        <motion.aside 
            initial={{ x: -250 }} 
            animate={{ x: 0 }} 
            transition={{ duration: 0.5 }}
            className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between p-4"
        >
            {/* Logo */}
            <div className="text-center text-xl font-bold text-gray-700">Barangay Name</div>

            {/* Navigation */}
            <nav className="flex flex-col space-y-4 mt-6 h-[60vh]">
                <NavItem icon={<FaTachometerAlt />} label="Dashboard" />
                <NavItem icon={<FaUserTie />} label="Officials" />
                <NavItem icon={<FaUsers />} label="Residents" />
                <NavItem icon={<FaFileAlt />} label="Documents Request" />
                <NavItem icon={<FaSignOutAlt />} label="Logout" />
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-3 border-t pt-4 mt-6">
                <img src="https://via.placeholder.com/40" alt="User" className="w-10 h-10 rounded-full" />
                <div>
                    <p className="text-sm font-semibold text-gray-700">John Doe</p>
                    <p className="text-xs text-gray-500">Admin</p>
                </div>
            </div>
        </motion.aside>
    );
};

const NavItem = ({ icon, label }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center space-x-3 p-3 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-lg transition"
            onClick={() => {
                if (label !== "Logout") {
                  window.location.href = `/${label.toLowerCase()}`;
                } else {
                sessionStorage.removeItem('user');
                window.location.href = "/"
                }
              }}
              
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </motion.div>
    );
};

export default Sidebar;
