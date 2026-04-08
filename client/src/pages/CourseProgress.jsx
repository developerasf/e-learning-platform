import { useState, useEffect, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, BookOpen, Users, Clock, TrendingUp, Eye } from 'lucide-react';

const CourseProgress = memo(() => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchProgress();
  }, [user, courseId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/tracking/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      setData(await res.json());
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
    </div>
  );

  if (!data?.course) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Course not found</p>
        <Link to="/admin/tracking" className="text-violet-600 dark:text-violet-400 mt-4 inline-block cursor-pointer">Back to Tracking</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/tracking" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{data.course.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{data.course.totalStudents} students • {data.course.totalVideos} videos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.course.totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Videos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.course.totalVideos}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-emerald-500 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Avg Watch Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{data.avgWatchTime}</p>
            <p className="text-xs text-white/70">videos per student</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Videos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Last Watched</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.students?.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div className="bg-gradient-to-r from-violet-600 to-emerald-500 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{student.watchedVideos} / {student.totalVideos}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{student.lastWatched ? new Date(student.lastWatched).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/tracking/${courseId}/student/${student.studentId}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition cursor-pointer">
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.students?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No students enrolled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CourseProgress;