import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCourses(data.enrolledCourses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">My Courses</h1>
        
        {courses.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">You haven't enrolled in any course yet.</p>
            <Link to="/courses" className="text-violet-600 dark:text-violet-400 hover:underline text-base sm:text-lg">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 dark:border-gray-700">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                )}
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-xl font-semibold mb-2 text-gray-800 dark:text-white line-clamp-1">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="mb-3 sm:mb-4">
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
                  
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      By {course.createdBy?.name || 'Unknown'}
                    </span>
                    <Link 
                      to={`/courses/${course._id}`}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
