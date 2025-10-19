import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';

const FAQs = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('general');

  const faqs = [
    {
      id: 1,
      question: "How do I pay for the services?",
      answer: "You can pay through various secure methods including credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed through encrypted channels to ensure your financial information is safe.",
      category: "general"
    },
    {
      id: 2,
      question: "Can I cancel a booking or course enrollment?",
      answer: "Yes, you can cancel your booking up to 24 hours before the scheduled session. For course enrollments, you have a 7-day cooling-off period. A full refund will be processed within 5-7 business days to your original payment method.",
      category: "bookings"
    },
    {
      id: 3,
      question: "When do individual mentor slots open?",
      answer: "Individual mentor slots are released every Monday at 10 AM IST. We recommend booking early as slots fill up quickly. You can set up notifications to be alerted when new slots become available.",
      category: "bookings"
    },
    {
      id: 4,
      question: "What is your refund policy?",
      answer: "We offer a 30-day money-back guarantee for all our courses and services. If you're not satisfied with your experience, you can request a full refund within 30 days of enrollment. Some restrictions may apply to personalized services.",
      category: "refunds"
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    activeFilter === 'general' || faq.category === activeFilter
  );

  const filters = [
    { key: 'general', label: 'General', count: faqs.filter(f => f.category === 'general').length },
    { key: 'refunds', label: 'Refunds', count: faqs.filter(f => f.category === 'refunds').length },
    { key: 'bookings', label: 'Bookings & Confirmations', count: faqs.filter(f => f.category === 'bookings').length },
    { key: 'pricing', label: 'Pricing', count: 0 }
  ];

  return (
    <section className="py-20 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-[#000000]">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-normal">
              Everything you need to know about our services, pricing, and policies. Can't find what you're looking for? Contact our support team.
            </p>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {filters.map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-full font-normal transition-all duration-300 relative ${
                    activeFilter === filter.key
                      ? 'text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:scale-105'
                  }`}
                  style={{
                    background: activeFilter === filter.key 
                      ? 'rgba(46, 48, 49, 0.9)' 
                      : 'rgba(46, 48, 49, 0.8)',
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(rgba(46, 48, 49, 0.8), rgba(46, 48, 49, 0.8)), linear-gradient(90deg, #026372, #CBF3FF, #026372)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box'
                  }}
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <span className="ml-2 text-xs opacity-75">({filter.count})</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Contact Support Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0066ff 0%, #192B2E 50%, #000000 100%)'
              }}
            >
              <h3 className="text-xl font-bold mb-4 text-white">Still have questions?</h3>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Contact our support team and we'll make sure everything is clear and intuitive for you. We're here to help 24/7.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#2D9BFB',
                  color: 'white'
                }}
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Column - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #0066ff 0%, #192B2E 50%, #000000 100%)'
                  }}
                >
                  <motion.div
                    className="p-6 cursor-pointer"
                    onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: activeAccordion === faq.id ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        {activeAccordion === faq.id ? (
                          <FaMinus className="text-white" />
                        ) : (
                          <FaPlus className="text-gray-300" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {activeAccordion === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <p className="text-gray-200 leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State for Pricing */}
            {activeFilter === 'pricing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pricing Information</h3>
                <p className="text-gray-600 mb-6">
                  Our pricing varies based on the services you choose. Contact us for a personalized quote.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  Get Pricing Details
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
