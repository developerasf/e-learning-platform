import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, ArrowLeft, Loader2, User, BookOpen, Calendar } from 'lucide-react';

const PendingEnrollments = memo(() => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadEnrollments();
  }, [user]);

  const loadEnrollments = () => {
    const token = localStorage.getItem('token');
    fetch('/api/courses/enrollments/pending?page=1&limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEnrollments(data.enrollments || data);
        setLoading(false);
      });
  };

  const handleApprove = async (enrollmentId, courseId) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${courseId}/enrollments/${enrollmentId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadEnrollments();
  };

  const handleReject = async (enrollmentId, courseId) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${courseId}/enrollments/${enrollmentId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadEnrollments();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Enrollment Requests</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pending student enrollment requests</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">No pending enrollment requests</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Requested</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {enrollments.map(enrollment => (
                    <tr key={enrollment._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {enrollment.student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{enrollment.student?.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{enrollment.student?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <BookOpen className="w-4 h-4 text-violet-500" />
                          {enrollment.course?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(enrollment._id, enrollment.course._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition hover:shadow-lg cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(enrollment._id, enrollment.course._id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition hover:shadow-lg cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
              {enrollments.map(enrollment => (
                <div key={enrollment._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                      {enrollment.student?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{enrollment.student?.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{enrollment.student?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    {enrollment.course?.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Requested: {new Date(enrollment.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(enrollment._id, enrollment.course._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(enrollment._id, enrollment.course._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PendingEnrollments;