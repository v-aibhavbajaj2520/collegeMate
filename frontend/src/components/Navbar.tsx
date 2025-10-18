import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Browse Mentors', href: '/mentors' },
    { name: 'Book a Call', href: '#contact' },
    { name: 'Courses', href: '#courses' },
  ];

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      case 'user':
        return '/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-6xl transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-md bg-black/80 shadow-xl' : 'backdrop-blur-sm bg-black/60 shadow-lg'
        } rounded-full`}
      >
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
          

          {/* Center - Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="CollegeMate" 
                className="h-8 w-auto"
              />
            </div>
          </motion.div>

          {/* Right Side - Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {item.name === 'About Us' || item.name === 'Browse Mentors' ? (
                  <Link
                    to={item.href}
                    className="text-white hover:text-blue-300 font-medium transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="text-white hover:text-blue-300 font-medium transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              // Guest View - Show Login and Register buttons
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 text-white hover:text-blue-300 font-medium transition-colors duration-300"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
                    </svg>
                    <span>Register</span>
                  </motion.button>
                </Link>
              </>
            ) : (
              // Authenticated View - Show Enroll button and Profile icon
              <>
                <Link to="/enroll">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
                    </svg>
                    <span>Enroll with Us</span>
                  </motion.button>
                </Link>
                <Link to={getDashboardPath()}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    title={`Go to ${user.role} dashboard`}
                  >
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            y: isMobileMenuOpen ? 0 : -20,
            scale: isMobileMenuOpen ? 1 : 0.95
          }}
          transition={{ duration: 0.3 }}
          className={`fixed top-20 left-4 right-4 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl z-50 lg:hidden ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="p-6 space-y-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 pb-4 border-b border-white/20">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CollegeMate</h1>
                <p className="text-xs text-gray-300">Your College Journey Mate: Before, During & Beyond</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              {navItems.map((item) => (
                item.name === 'About Us' || item.name === 'Browse Mentors' ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-3 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
            
            {/* Mobile Auth Buttons */}
            <div className="mt-6 space-y-3">
              {!user ? (
                // Guest View - Show Login and Register buttons
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center px-6 py-3 text-white hover:text-blue-300 font-medium transition-colors duration-300 border border-white/20 rounded-lg"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
                      </svg>
                      <span>Register</span>
                    </motion.button>
                  </Link>
                </>
              ) : (
                // Authenticated View - Show Enroll button and Profile
                <>
                  <div className="text-center mb-4">
                    <p className="text-white text-sm">Welcome, {user.name}!</p>
                    <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                  </div>
                  <Link to="/enroll" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
                      </svg>
                      <span>Enroll with Us</span>
                    </motion.button>
                  </Link>
                  <Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Dashboard</span>
                    </motion.button>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
