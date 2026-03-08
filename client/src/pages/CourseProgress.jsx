import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseProgress = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProgress();
  }, [user, courseId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/tracking/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching progress:', error);
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

  if (!data?.course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Course not found</p>
            <Link to="/admin/tracking" className="text-violet-600 hover:underline mt-2 inline-block">
              Back to Tracking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <Link to="/admin/tracking" className="text-violet-600 dark:text-violet-400 hover:underline text-sm mb-2 inline-block">
              ← Back to Tracking
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {data.course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
              {data.course.totalStudents} students • {data.course.totalVideos} videos
            </p>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl">
            <p className="text-xs sm:text-sm opacity-80">Average Watch Time</p>
            <p className="text-xl sm:text-2xl font-bold">{data.avgWatchTime} videos</p>
            <p className="text-xs opacity-70">per student</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Videos Watched
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Last Watched
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.students?.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {student.watchedVideos} / {student.totalVideos}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {student.lastWatched 
                          ? new Date(student.lastWatched).toLocaleDateString() 
                          : '-'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Link
                        to={`/admin/tracking/${courseId}/student/${student.studentId}`}
                        className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.students?.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No students enrolled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
