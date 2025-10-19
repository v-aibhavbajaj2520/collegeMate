import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  course: string;
  college: string;
  hasTakenMentorship: boolean | null;
  benefitsConfirmed: boolean;
  termsConfirmed: boolean;
}

const partnerColleges = [
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'NIT Trichy',
  'NIT Warangal',
  'NIT Surathkal',
  'BITS Pilani',
  'IIIT Hyderabad',
  'IIIT Bangalore',
  'IIIT Delhi',
  'VIT Vellore',
  'Manipal Institute of Technology',
  'SRM University',
  'Amity University',
  'Other'
];

const benefits = [
  {
    icon: '🎯',
    title: 'Personalized Admission Guidance',
    description: 'Get tailored advice based on your profile and preferences'
  },
  {
    icon: '📝',
    title: 'Application Review Support',
    description: 'Expert review of your applications before submission'
  },
  {
    icon: '💰',
    title: 'Exclusive Scholarship Information',
    description: 'Access to scholarship opportunities not available elsewhere'
  },
  {
    icon: '👥',
    title: 'Mentor Network Access',
    description: 'Connect with current students and alumni for insights'
  },
  {
    icon: '📊',
    title: 'Career Planning Support',
    description: 'Guidance on course selection and career paths'
  },
  {
    icon: '🔗',
    title: 'Industry Connections',
    description: 'Networking opportunities with professionals in your field'
  }
];

const EnrollmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    course: '',
    college: '',
    hasTakenMentorship: null,
    benefitsConfirmed: false,
    termsConfirmed: false
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      nextStep(); // Move to success step
      setIsSubmitting(false);
    }, 1000);
  };

  const isStep1Valid = () => {
    return formData.fullName.trim() !== '' &&
           formData.phoneNumber.trim() !== '' &&
           formData.email.trim() !== '' &&
           formData.course.trim() !== '' &&
           formData.college !== '' &&
           formData.hasTakenMentorship !== null;
  };

  const isStep2Valid = () => {
    return formData.benefitsConfirmed;
  };

  const isStep3Valid = () => {
    return formData.termsConfirmed;
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Admission Details</h2>
        <p className="text-gray-600">Please provide your information to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Course *
          </label>
          <input
            type="text"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science Engineering"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select College *
          </label>
          <select
            value={formData.college}
            onChange={(e) => handleInputChange('college', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose your preferred college</option>
            {partnerColleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Have you taken a mentor session from us? *
        </h3>
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="mentorship"
              checked={formData.hasTakenMentorship === true}
              onChange={() => handleInputChange('hasTakenMentorship', true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="mentorship"
              checked={formData.hasTakenMentorship === false}
              onChange={() => handleInputChange('hasTakenMentorship', false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={!isStep1Valid()}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            isStep1Valid()
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Benefits with CollegeMate</h2>
        <p className="text-gray-600">Here's what you'll get when you enroll with us</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{benefit.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.benefitsConfirmed}
            onChange={(e) => handleInputChange('benefitsConfirmed', e.target.checked)}
            className="w-5 h-5 text-green-600 focus:ring-green-500 mt-1"
          />
          <span className="text-gray-700 font-medium">
            I have read and understood the benefits I will receive by enrolling with CollegeMate.
          </span>
        </label>
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={!isStep2Valid()}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            isStep2Valid()
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Final Confirmation</h2>
        <p className="text-gray-600">Please review and confirm your enrollment</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Name:</strong> {formData.fullName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phoneNumber}</p>
          <p><strong>Course:</strong> {formData.course}</p>
          <p><strong>College:</strong> {formData.college}</p>
          <p><strong>Mentorship Session:</strong> {formData.hasTakenMentorship ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <p className="text-gray-700 mb-4">
          Please read our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
            Terms and Conditions
          </Link>{' '}
          before proceeding.
        </p>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.termsConfirmed}
            onChange={(e) => handleInputChange('termsConfirmed', e.target.checked)}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500 mt-1"
          />
          <span className="text-gray-700 font-medium">
            I agree to the CollegeMate Terms and Conditions.
          </span>
        </label>
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!isStep3Valid() || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            isStep3Valid() && !isSubmitting
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Enrollment Submitted Successfully!</h2>
        <p className="text-gray-600 text-lg">
          Thank you for enrolling with us. Your details have been received, and a member of our team will get back to you shortly.
        </p>
      </div>

      <div className="space-y-4">
        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            Go to Dashboard
          </motion.button>
        </Link>
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
