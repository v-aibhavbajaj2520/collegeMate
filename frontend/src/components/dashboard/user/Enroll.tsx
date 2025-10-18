import React from 'react';
import { motion } from 'framer-motion';

const Enroll: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enroll with Us</h1>
        <p className="text-gray-600 mt-1">Discover and enroll in our premium courses</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Enrollment</h2>
        <p className="text-gray-600 mb-6">Browse and enroll in our comprehensive course catalog</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Browse Courses
        </button>
      </motion.div>
    </div>
  );
};

export default Enroll;
