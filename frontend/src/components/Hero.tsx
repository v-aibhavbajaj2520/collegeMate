import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaPhone, FaWhatsapp } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="home" className="pt-40 pb-20 min-h-screen flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl lg:text-5xl font-bold mb-8 leading-tight"
          >
            <span className="text-gray-800">Smart College Choices,</span>
            <br />
            <span className="gradient-text">Smarter Career Benefits</span>
          </motion.h1>
          
          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-normal"
          >
            Get authentic peer insights from current students, expert admission support, and exclusive career benefits that make you job-ready, not just college-ready.
          </motion.p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center mb-12"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/150?u=${i})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
            <p className="ml-6 text-gray-700 font-normal">Over 500+ Alumni's as Mentors</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <FaGraduationCap className="text-xl" />
              <span>Enroll Through Us</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline flex items-center justify-center space-x-2 text-lg px-8 py-4"
            >
              <FaPhone className="text-xl" />
              <span>Book a Call</span>
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '500+', label: 'Alumni Mentors' },
              { number: '50+', label: 'Partner Colleges' },
              { number: '1000+', label: 'Success Stories' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div> */}
        </div>
      </div>

      {/* Floating WhatsApp Icon */}
      <motion.a
        href="https://wa.me/+919034206304"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
      >
        <FaWhatsapp className="text-white text-2xl" />
      </motion.a>
    </section>
  );
};

export default Hero;
