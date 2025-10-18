import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const AboutPage = () => {
  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-blue-50 to-yellow-50">
      {/* About Us Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side - Text */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="text-6xl lg:text-8xl font-bold text-black leading-none">
                  ABOUT
                </h1>
                <div className="flex items-start space-x-4">
                  <h1 className="text-6xl lg:text-8xl font-bold text-black leading-none">
                    US
                  </h1>
                  <p className="text-lg text-black max-w-xs mt-4">
                    We're building India's first real peer-to-peer mentorship community for students.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Center - Large Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gray-900 rounded-3xl relative overflow-hidden h-72"
              >
                <img 
                  src="/tempimg.jpg" 
                  alt="UI/UX Design" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Right Side - Smaller Card and Text */}
            <div className="lg:col-span-3 space-y-6">
              {/* Smaller Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-gray-900 rounded-2xl p-6 relative overflow-hidden h-32"
              >
                <div className="absolute inset-0">
                  <img 
                    src="/tempimg.jpg" 
                    alt="UI/UX Design" 
                    className="w-full h-full object-cover opacity-20"
                  />
                </div>
                <div className="relative z-10">
                </div>
              </motion.div>

              {/* Our Belief Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-black">
                  Our Belief
                </h2>
                <p className="text-lg text-black">
                  We believe real advice comes from those who've lived it — not random blogs or paid counselors.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Journey Roadmap Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">
              Student Journey Roadmap
            </h2>
            <p className="text-xl text-black">
              Watch Your story Repeat
            </p>
          </motion.div>

          <div className="relative">
            {/* Central Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-300"></div>

            {/* Timeline Cards */}
            <div className="space-y-16">
              {[
                {
                  side: 'left',
                  title: 'Confused & Exploring',
                  question: 'Where should I go? Which college is right for me?',
                  description: 'Students discover CollegeMate while exploring colleges and looking for genuine peer advice.'
                },
                {
                  side: 'right',
                  title: 'Getting Guidance',
                  question: 'How do I choose the right course and college?',
                  description: 'Students connect with mentors who have been through similar experiences and get personalized advice.'
                },
                {
                  side: 'left',
                  title: 'Making Decisions',
                  question: 'Which path should I take for my future?',
                  description: 'With mentor guidance, students make informed decisions about their college and career path.'
                },
                {
                  side: 'right',
                  title: 'Preparing for College',
                  question: 'How do I prepare for college life?',
                  description: 'Students get practical tips and preparation guidance from their mentors for college life.'
                },
                {
                  side: 'left',
                  title: 'Thriving in College',
                  question: 'How do I make the most of my college years?',
                  description: 'Ongoing support and guidance helps students excel in their college journey.'
                },
                {
                  side: 'right',
                  title: 'Paying It Forward',
                  question: 'How can I help other students?',
                  description: 'Graduates become mentors themselves, continuing the cycle of peer-to-peer support.'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: item.side === 'left' ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${item.side === 'left' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-5/12 ${item.side === 'left' ? 'pr-8' : 'pl-8'}`}>
                    <div className="bg-gray-800 rounded-2xl p-6 relative">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-white/90 text-sm mb-4 italic">
                        "{item.question}"
                      </p>
                      <p className="text-white/80 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {/* Connection Line */}
                  <div className={`absolute ${item.side === 'left' ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gray-300`}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Brain Behind It Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-2">
              Meet the Brain Behind It
            </h2>
            <p className="text-xl text-black">
              Our Boss!
            </p>
          </motion.div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-[rgba(46,48,49,1)] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group max-w-md w-full relative mole-animation"
              style={{
                background: 'linear-gradient(45deg, #2e3031, #3a3c3d, #2e3031)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 3s ease infinite'
              }}
            >
              {/* HR Line */}
              <hr className="border-gray-600" />
              
              {/* Team Member Image */}
              <div className="relative h-48 flex items-center justify-center p-6">
                <motion.img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Shivam Mittal"
                  className="w-[90%] h-36 rounded-lg object-cover shadow-lg border-[1px] border-white mx-auto"
                  whileHover={{ scale: 1.05 }}
                />
                {/* <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium">⭐ 5.0</span>
                  </div>
                </div> */}
              </div>

              {/* HR Line between image and name */}
              <hr className="border-gray-600" />

              {/* Team Member Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Shivam Mittal</h3>
                <div className="flex items-center text-blue-400 mb-2">
                  <span className="text-sm font-normal">Founder</span>
                </div>
                <p className="text-gray-300 text-sm font-normal mb-3">Under Graduate</p>
                {/* <p className="text-gray-400 text-xs font-normal mb-4">
                  3 years experience • Entrepreneurship
                </p> */}
                
                {/* Rating */}
                {/* <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < 5 ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-300">(5.0)</span>
                </div> */}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  See more
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Ethics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">
              Our Ethics
            </h2>
            <p className="text-xl text-black">
              Our Moral Values, We stay Still On.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Authenticity',
                description: 'Real guidance from real students'
              },
              {
                title: 'Support',
                description: 'Every student deserves clarity.'
              },
              {
                title: 'Growth',
                description: 'We make you job-ready, not just college-ready.'
              },
              {
                title: 'Community',
                description: 'Learn, grow, and thrive together.'
              },
              {
                title: 'Innovation',
                description: 'Constantly evolving to serve students better.'
              },
              {
                title: 'Excellence',
                description: 'Committed to delivering the highest quality mentorship.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#2E3031] border-2 border-[#006CE6] rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#006CE6] rounded flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/80">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Mission CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 1000+ students shaping their college journey with CollegeMate.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 1 1 0 00.2-.38.8.8 0 01.15-.4L3.31 9.397zM6.25 13.62a8.969 8.969 0 002.18-.37l-2.18-2.18v2.55zM8.5 15.5a8.969 8.969 0 002.18-.37L8.5 13.12v2.38zM12.5 15.5a8.969 8.969 0 002.18-.37L12.5 13.12v2.38zM15 10.12l1.69-.723a1 1 0 00.2.38 1 1 0 01-.89.89 8.969 8.969 0 00-1.05.174V10.12z" />
                </svg>
                <span>Join Community</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Become a Mentor</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
