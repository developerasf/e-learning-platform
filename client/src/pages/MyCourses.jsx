import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Play, ArrowRight, Plus, Clock, CheckCircle, BarChart3 } from 'lucide-react';

const MyCourses = memo(() => {
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
      console.log('Profile data:', data);
      if (data.enrolledCourses) {
        setCourses(data.enrolledCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                My Courses
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Continue learning from where you left off
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {courses.length} enrolled
              </span>
            </div>
          </div>
        </div>
        
        {courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 py-16 px-8 text-center">
            <div className="w-24 h-24 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No courses yet</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Explore Courses
            </Link>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                const progress = course.progress || 0;
                const watchedVideos = course.watchedVideos || 0;
                const totalVideos = course.totalVideos || 0;
                
                return (
                  <div 
                    key={course._id} 
                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/30 dark:to-emerald-900/30">
                          <div className="w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center shadow-lg">
                            <Play className="w-10 h-10 text-violet-600 ml-1" />
                          </div>
                        </div>
                      )}
                      {/* Progress Badge */}
                      <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                        progress === 100 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/90 dark:bg-slate-800/90 text-violet-600 dark:text-violet-400'
                      }`}>
                        {progress === 100 ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </span>
                        ) : (
                          `${progress}%`
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition duration-200">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                        {course.description}
                      </p>
                      
                      {/* Progress Section */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {watchedVideos}/{totalVideos} videos
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress === 100 
                                ? 'bg-emerald-500' 
                                : 'bg-gradient-to-r from-violet-600 to-emerald-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{watchedVideos} videos watched</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          By {course.createdBy?.name || 'Unknown'}
                        </span>
                        <Link 
                          to={`/courses/${course._id}`}
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Browse More */}
            {courses.length > 0 && (
              <div className="text-center mt-12">
                <Link 
                  to="/courses" 
                  className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition duration-200 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Explore More Courses
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

MyCourses.displayName = 'MyCourses';
export default MyCourses;