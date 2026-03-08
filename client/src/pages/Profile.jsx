import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">My Profile</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 sm:gap-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
              {profile?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{profile?.user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{profile?.user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-violet-600 dark:text-violet-400">{profile?.enrolledCourses?.length || 0}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Videos</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {profile?.enrolledCourses?.reduce((acc, c) => acc + (c.watchedVideos || 0), 0) || 0}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Account Status</p>
              <p className={`text-lg sm:text-xl font-bold ${profile?.user?.isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {profile?.user?.isVerified ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">My Enrolled Courses</h2>
        
        {profile?.enrolledCourses?.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">You haven't enrolled in any course yet.</p>
            <Link 
              to="/courses" 
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {profile?.enrolledCourses?.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                )}
                <div className="p-4 sm:p-5">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-white line-clamp-1">{course.title}</h3>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-violet-600 dark:text-violet-400">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {course.watchedVideos || 0} of {course.totalVideos || 0} videos watched
                    </p>
                  </div>
                  
                  <Link 
                    to={`/courses/${course._id}`}
                    className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
