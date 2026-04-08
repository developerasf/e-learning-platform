import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, BookOpen, Video, CheckCircle, Clock, ArrowRight, BarChart3 } from 'lucide-react';

const Profile = memo(() => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVideosWatched = profile?.enrolledCourses?.reduce((acc, c) => acc + (c.watchedVideos || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account and track your learning progress
          </p>
        </div>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border border-slate-100 dark:border-slate-700">
          {/* User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {profile?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {profile?.user?.name}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile?.user?.email}</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.user?.isVerified 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {profile?.user?.isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Unverified
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {profile?.enrolledCourses?.length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Courses</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalVideosWatched}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Videos</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {profile?.enrolledCourses?.filter(c => (c.progress || 0) === 100).length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            My Enrolled Courses
          </h2>
          <Link 
            to="/courses" 
            className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm cursor-pointer"
          >
            Browse More
          </Link>
        </div>
        
        {profile?.enrolledCourses?.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">You haven't enrolled in any course yet.</p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Browse Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {profile?.enrolledCourses?.map((course) => (
              <div key={course._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">{course.title}</h3>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          (course.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-emerald-500'
                        }`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      {course.watchedVideos || 0} of {course.totalVideos || 0} videos watched
                    </p>
                  </div>
                  
                  <Link 
                    to={`/courses/${course._id}`}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';
export default Profile;