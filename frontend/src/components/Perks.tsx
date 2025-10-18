import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Perks = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const perks = [
    {
      icon: "📚",
      title: "Coursera Upskilling Courses",
      description: "Access to premium courses from top universities and industry leaders",
      color: "from-blue-500 to-blue-600",
      details: "Get unlimited access to 5000+ courses, specializations, and professional certificates"
    },
    {
      icon: "🎯",
      title: "Career Guidance",
      description: "Expert career counseling and personalized roadmap",
      color: "from-green-500 to-green-600",
      details: "One-on-one sessions with industry experts to plan your career path"
    },
    {
      icon: "🤝",
      title: "Mentorship Program",
      description: "Connect with successful alumni and industry professionals",
      color: "from-purple-500 to-purple-600",
      details: "Get matched with mentors who share your interests and career goals"
    },
    {
      icon: "💼",
      title: "Job Placement",
      description: "Direct job opportunities with partner companies",
      color: "from-orange-500 to-orange-600",
      details: "Exclusive access to job openings from 200+ partner companies"
    },
    {
      icon: "📖",
      title: "Study Materials",
      description: "Comprehensive study resources and practice tests",
      color: "from-teal-500 to-teal-600",
      details: "Curated study materials, mock tests, and exam preparation guides"
    },
    {
      icon: "🏆",
      title: "Certifications",
      description: "Industry-recognized certificates and credentials",
      color: "from-pink-500 to-pink-600",
      details: "Earn valuable certificates that boost your resume and career prospects"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-[#000000]">
            Your Perks Inside
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal">
            Hover over the cards to discover the amazing benefits waiting for you
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`relative group cursor-pointer transition-all duration-500 ${
                hoveredCard === index ? '' : 'blur-sm scale-95'
              } ${hoveredCard === index ? 'scale-105 z-10' : ''}`}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="bg-[#2E3031] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-[300px] flex flex-col"
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-5">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      rotate: [360, 0],
                      scale: [1, 0.8, 1]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"
                  />
                </div>

                {/* Blurred Overlay - Default State */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: hoveredCard === index ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-[#2E3031]/95 to-[#2E3031]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 rounded-2xl"
                >
                  {/* Animated Lock Icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl mb-4 filter drop-shadow-lg"
                  >
                    🔒
                  </motion.div>
                  
                  {/* Teasing Text */}
                  <motion.h3
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    {perk.title}
                  </motion.h3>
                  
                  <motion.p
                    animate={{ opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-gray-300 font-normal mb-4"
                  >
                    {perk.description}
                  </motion.p>
                  
                  {/* Hover Hint */}
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center space-x-2 text-blue-400"
                  >
                    <span className="text-sm font-normal">Hover to discover more</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                  
                  {/* Glowing Effect */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl"
                  />
                </motion.div>

                {/* Clear Content - On Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {/* Success Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: hoveredCard === index ? 1 : 0,
                      rotate: hoveredCard === index ? 0 : -180
                    }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-6xl mb-4 filter drop-shadow-lg"
                  >
                    {perk.icon}
                  </motion.div>
                  
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: hoveredCard === index ? 0 : 20,
                      opacity: hoveredCard === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-3"
                  >
                    {perk.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: hoveredCard === index ? 0 : 20,
                      opacity: hoveredCard === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-gray-300 text-sm leading-relaxed font-normal"
                  >
                    {perk.details}
                  </motion.p>
                  
                  {/* Unlock Success Indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredCard === index ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Unlock These Benefits?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students who have already started their journey with us
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default Perks;
