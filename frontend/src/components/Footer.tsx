import { motion } from 'framer-motion';

const Footer = () => {
  const footerLinks = {
    mentors: [
      'Browse Mentors',
      'Become a Mentor',
      'Mentor Guidelines',
      'Success Stories'
    ],
    careers: [
      'Job Openings',
      'Internships',
      'Company Culture',
      'Benefits'
    ],
    support: [
      'FAQs',
      'Contact Us',
      'Live Chat',
      'Help Center'
    ],
    blogs: [
      'Official Blog',
      'Student Stories',
      'Career Tips',
      'Industry News'
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: '#' },
    { name: 'LinkedIn', icon: 'in', href: '#' },
    { name: 'Instagram', icon: 'ig', href: '#' },
    { name: 'Facebook', icon: 'fb', href: '#' }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">C</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CollegeMate</h3>
                  <p className="text-sm text-gray-400">Your College Journey Mate</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                Your College Journey Mate - Before, During & Beyond. We help students make informed decisions about their education and career paths.
              </p>
              
              <p className="text-gray-400 mb-8 text-sm">
                If you're new to college planning, you can work with us on a single consultation or comprehensive guidance package.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                  >
                    <span className="text-sm font-medium">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: (categoryIndex + 1) * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-bold mb-6 capitalize">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <motion.li
                      key={link}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <a
                        href="#"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {link}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="py-8 border-t border-gray-800"
        >
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-xl font-bold mb-4">Stay Updated</h4>
            <p className="text-gray-400 mb-6 text-sm">
              Get the latest updates on courses, mentorship opportunities, and career guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="py-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © 2025 CollegeMate. All Rights Reserved. Developed and Managed by{' '}
                <span className="text-blue-400 font-medium">theYukt</span>
              </p>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
    </footer>
  );
};

export default Footer;
