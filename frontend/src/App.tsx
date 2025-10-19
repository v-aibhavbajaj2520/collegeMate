import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PartnerColleges from './components/PartnerColleges';
import MeetYourMentors from './components/MeetYourMentors';
import Perks from './components/Perks';
import PremiumCourses from './components/PremiumCourses';
import SuccessStories from './components/SuccessStories';
import FAQs from './components/FAQs';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import BrowseMentorsPage from './pages/BrowseMentorsPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/shared/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <Routes>
          {/* Public Routes - with main navbar */}
          <Route path="/*" element={
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main className="pt-24">
                <Routes>
                  <Route path="/" element={
                    <>
                      <Hero />
                      <PartnerColleges />
                      <MeetYourMentors />
                      <Perks />
                      <PremiumCourses />
                      <SuccessStories />
                      <FAQs />
                      <Footer />
                    </>
                  } />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/mentors" element={<BrowseMentorsPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>
              </main>
            </div>
          } />
          
          {/* Dashboard Routes - completely isolated with DashboardLayout */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentor/dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['MENTOR']}>
                <MentorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
