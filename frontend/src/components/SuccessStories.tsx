import React from 'react';
import { motion } from 'framer-motion';

const SuccessStories = () => {
  const testimonials = [
    {
      name: "Shivam Mittal",
      title: "Founder & CEO",
      company: "TechStart Inc.",
      image: "https://i.pravatar.cc/150?u=shivam",
      quote: "CollegeMate helped me make the right choice for my computer science degree. The mentorship program connected me with industry experts who guided me through my entire college journey.",
      rating: 5,
      university: "IIT Delhi"
    },
    {
      name: "Priya Singh",
      title: "Software Engineer",
      company: "Google",
      image: "https://i.pravatar.cc/150?u=priya",
      quote: "The career guidance and placement support was exceptional. I landed my dream job at Google right after graduation, thanks to the personalized roadmap they provided.",
      rating: 5,
      university: "IILM University"
    },
    {
      name: "Raj Kumar",
      title: "Data Scientist",
      company: "Microsoft",
      image: "https://i.pravatar.cc/150?u=raj",
      quote: "The premium courses and certifications I got through CollegeMate gave me a competitive edge. The practical knowledge was immediately applicable in my career.",
      rating: 5,
      university: "NSUT Delhi"
    },
    {
      name: "Anita Sharma",
      title: "Product Manager",
      company: "Amazon",
      image: "https://i.pravatar.cc/150?u=anita",
      quote: "The mentorship program was a game-changer. My mentor helped me transition from engineering to product management, and I couldn't be happier with my career choice.",
      rating: 5,
      university: "Sharda University"
    },
    {
      name: "Amit Verma",
      title: "UX Designer",
      company: "Adobe",
      image: "https://i.pravatar.cc/150?u=amit",
      quote: "The UI/UX course I took through CollegeMate was comprehensive and industry-relevant. It helped me build a strong portfolio that impressed recruiters.",
      rating: 5,
      university: "IIT Delhi"
    },
    {
      name: "Neha Gupta",
      title: "Marketing Manager",
      company: "Meta",
      image: "https://i.pravatar.cc/150?u=neha",
      quote: "The career guidance helped me discover my passion for marketing. The digital marketing course and placement support were exactly what I needed to succeed.",
      rating: 5,
      university: "IILM University"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-[#000000]">
            Success Stories
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-normal">
            Hear from students who made it to their dream companies and universities
          </p>
        </motion.div>

        {/* Top Row - Scroll Right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="overflow-hidden mb-8"
        >
          <motion.div
            className="flex space-x-6"
            animate={{ x: [0, -100 * testimonials.length] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={`top-${testimonial.name}-${index}`}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 w-[240px] h-[220px] flex-shrink-0 text-white"
                style={{
                  background: 'linear-gradient(135deg, #0066ff 0%, #192B2E 50%, #000000 100%)'
                }}
              >
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 mb-2"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-300 text-xs">⭐</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 font-normal mb-1">{testimonial.title} at {testimonial.company}</p>
                    <p className="text-xs text-gray-300 font-normal mb-2">Alumni of {testimonial.university}</p>
                    <p className="text-gray-200 text-xs leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom Row - Scroll Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="overflow-hidden"
        >
          <motion.div
            className="flex space-x-6"
            animate={{ x: [-100 * testimonials.length, 0] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={`bottom-${testimonial.name}-${index}`}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 w-[240px] h-[220px] flex-shrink-0 text-white"
                style={{
                  background: 'linear-gradient(135deg, #0066ff 0%, #192B2E 50%, #000000 100%)'
                }}
              >
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 mb-2"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-300 text-xs">⭐</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 font-normal mb-1">{testimonial.title} at {testimonial.company}</p>
                    <p className="text-xs text-gray-300 font-normal mb-2">Alumni of {testimonial.university}</p>
                    <p className="text-gray-200 text-xs leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { number: "1000+", label: "Success Stories", icon: "🎉" },
            { number: "95%", label: "Placement Rate", icon: "📈" },
            { number: "50+", label: "Top Companies", icon: "🏢" },
            { number: "4.9/5", label: "Student Rating", icon: "⭐" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-blue-600 mb-1">{stat.number}</div>
              <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessStories;
