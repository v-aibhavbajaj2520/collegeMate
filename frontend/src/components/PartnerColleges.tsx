import React, { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

const PartnerColleges = () => {
  const colleges = [
    { name: "IIT Delhi", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=IIT+Delhi" },
    { name: "IILM University", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=IILM" },
    { name: "Sharda University", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=Sharda" },
    { name: "NSUT Delhi", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=NSUT" },
    { name: "DU", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=DU" },
    { name: "JNU", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=JNU" },
    { name: "BITS Pilani", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=BITS" },
    { name: "VIT", logo: "https://via.placeholder.com/200x120/0066FF/FFFFFF?text=VIT" },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true
    },
    [AutoScroll({ 
      speed: 1,
      startDelay: 1000,
      direction: 'forward',
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false
    })]
  );

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-6xl font-bold mb-1 text-[#000000]">
            Partner Colleges
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-normal">
            Trusted by students from top universities across India
          </p>
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.div
            className="flex space-x-6"
            animate={{ x: [0, -100 * colleges.length] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...colleges, ...colleges].map((college, index) => (
              <motion.div
                key={`${college.name}-${index}`}
                whileHover={{ scale: 1.05, y: -8 }}
                className="bg-white/20 backdrop-blur-md p-8 min-w-[280px] h-[200px] text-center rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-center items-center border border-white/30"
              >
                <div className="mb-6 w-full h-16 flex items-center justify-center">
                  <img 
                    src={college.logo} 
                    alt={college.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{college.name}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#4690FE] rounded-full mx-auto"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Trust Indicators */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { icon: "🎓", title: "50+ Universities", description: "Partnered with top institutions" },
            { icon: "👥", title: "10,000+ Students", description: "Successfully guided" },
            { icon: "⭐", title: "4.9/5 Rating", description: "Student satisfaction" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
};

export default PartnerColleges;
