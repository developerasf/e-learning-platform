import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, ArrowLeft, Loader2, BookOpen, Users, TrendingUp } from 'lucide-react';

const Tracking = memo(() => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchCourses();
  }, [user, authLoading]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/tracking', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setCourses(data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/admin" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Student Progress Tracking</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor student enrollment and progress</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <Link key={course._id} to={`/admin/tracking/${course._id}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{course.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{course.enrolledStudents?.length || 0} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium text-sm">
                  <TrendingUp className="w-4 h-4" />
                  View Progress
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default Tracking;