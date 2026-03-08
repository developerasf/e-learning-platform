import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import VideoPlayer from './pages/VideoPlayer';
import Login from './pages/Login';
import Register from './pages/Register';
import MyCourses from './pages/MyCourses';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourseForm from './pages/AdminCourseForm';
import AdminUsers from './pages/AdminUsers';
import CourseStudents from './pages/CourseStudents';
import PendingEnrollments from './pages/PendingEnrollments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/videos/:videoId" element={<VideoPlayer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses/new" element={<AdminCourseForm />} />
            <Route path="/admin/courses/:id/edit" element={<AdminCourseForm />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses/:id/students" element={<CourseStudents />} />
            <Route path="/admin/enrollments" element={<PendingEnrollments />} />
          </Routes>
        </div>
        <SpeedInsights />
      </Router>
    </AuthProvider>
  );
}

export default App;
