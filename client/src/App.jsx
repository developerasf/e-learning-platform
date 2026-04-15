import { lazy, Suspense, useState } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PreloadProvider } from "./context/PreloadContext";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import RegisterWithOTP from "./pages/RegisterWithOTP";

const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCourseForm = lazy(() => import("./pages/AdminCourseForm"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const CourseStudents = lazy(() => import("./pages/CourseStudents"));
const PendingEnrollments = lazy(() => import("./pages/PendingEnrollments"));
const Tracking = lazy(() => import("./pages/Tracking"));
const CourseProgress = lazy(() => import("./pages/CourseProgress"));
const StudentProgress = lazy(() => import("./pages/StudentProgress"));
const VideoRatings = lazy(() => import("./pages/VideoRatings"));
const AdminAttendance = lazy(() => import("./pages/AdminAttendance"));
const AdminCourseAttendance = lazy(() => import("./pages/AdminCourseAttendance"));
const AdminResults = lazy(() => import("./pages/AdminResults"));
const AdminCourseResults = lazy(() => import("./pages/AdminCourseResults"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));

const RoutePreloader = () => {
  const location = useLocation();
  const [preloaded, setPreloaded] = useState(false);

  useState(() => {
    if (preloaded) return;
    
    const preloadPriority = ['/courses', '/my-courses'];
    const shouldPreload = preloadPriority.some(p => location.pathname.startsWith(p));
    
    if (shouldPreload && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        CourseDetail.preload();
        setPreloaded(true);
      });
    }
  }, [location.pathname]);

  return null;
};

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PreloadProvider>
          <SpeedInsights />
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
              <Navbar />
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route
                  path="/courses/:courseId/videos/:videoId"
                  element={<VideoPlayer />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterWithOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/admin/courses/new"
                  element={<AdminCourseForm />}
                />
                <Route
                  path="/admin/courses/:id/edit"
                  element={<AdminCourseForm />}
                />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route
                  path="/admin/courses/:id/students"
                  element={<CourseStudents />}
                />
                <Route
                  path="/admin/enrollments"
                  element={<PendingEnrollments />}
                />
                <Route path="/admin/tracking" element={<Tracking />} />
                <Route
                  path="/admin/tracking/:courseId"
                  element={<CourseProgress />}
                />
                <Route
                  path="/admin/tracking/:courseId/student/:studentId"
                  element={<StudentProgress />}
                />
                <Route
                  path="/admin/tracking/:courseId/ratings"
                  element={<VideoRatings />}
                />
                <Route path="/admin/attendance" element={<AdminAttendance />} />
                <Route
                  path="/admin/attendance/:courseId"
                  element={<AdminCourseAttendance />}
                />
                <Route path="/admin/results" element={<AdminResults />} />
                <Route
                  path="/admin/results/:courseId"
                  element={<AdminCourseResults />}
                />
                <Route path="/admin/payments" element={<AdminPayments />} />
              </Routes>
            </Suspense>
            <Footer />
            <Toast />
          </div>
        </Router>
        </PreloadProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;