import React from 'react';
import { motion } from 'framer-motion';

const PremiumCourses = () => {
  const courses = [
    {
      id: 1,
      title: "UI/UX Designing Course",
      provider: "Meta",
      duration: "8 months",
      features: "Certificate + Job Support",
      image: "🎨",
      price: "₹15,999",
      originalPrice: "₹25,999",
      rating: 4.8,
      students: "2.5k",
      color: "from-blue-500 to-purple-600",
      description: "Master the fundamentals of user interface and user experience design"
    },
    {
      id: 2,
      title: "Data Science Specialization",
      provider: "Google",
      duration: "6 months",
      features: "Certificate + Portfolio",
      image: "📊",
      price: "₹18,999",
      originalPrice: "₹29,999",
      rating: 4.9,
      students: "3.2k",
      color: "from-green-500 to-teal-600",
      description: "Learn data analysis, machine learning, and statistical modeling"
    },
    {
      id: 3,
      title: "Machine Learning Engineer",
      provider: "IBM",
      duration: "10 months",
      features: "Certificate + Mentorship",
      image: "🤖",
      price: "₹22,999",
      originalPrice: "₹35,999",
      rating: 4.7,
      students: "1.8k",
      color: "from-orange-500 to-red-600",
      description: "Build and deploy machine learning models in production"
    }
  ];

  return (
    <section id="courses" className="py-16 grid-pattern relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-[#000000]">
            Explore Premium Courses
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-normal">
            Curated Coursera courses with special offers and industry-recognized certificates
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Course Image */}
              <div className={`h-36 bg-gradient-to-br ${course.color} flex items-center justify-center relative overflow-hidden`}>
                <div className="text-4xl text-white group-hover:scale-110 transition-transform duration-300">
                  {course.image}
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {Math.round(((parseInt(course.originalPrice.replace(/[₹,]/g, '')) - parseInt(course.price.replace(/[₹,]/g, ''))) / parseInt(course.originalPrice.replace(/[₹,]/g, ''))) * 100)}% OFF
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-blue-600 font-normal mb-2 text-sm">by {course.provider}</p>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{course.description}</p>
                
                {/* Course Details */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.students} students</span>
                </div>

                {/* Features */}
                <div className="mb-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {course.features}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-800">{course.price}</span>
                    <span className="text-xs text-gray-500 line-through ml-2">{course.originalPrice}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-primary text-sm py-2"
                >
                  View More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Courses Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-outline text-base px-6 py-3"
          >
            View All Courses
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumCourses;
