import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PendingEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
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

  if (loading) return <div className="p-4 sm:p-8 text-center text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block text-sm">← Back to Manage</Link>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Enrollment Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Pending student enrollment requests</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          No pending enrollment requests.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Requested Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {enrollments.map(enrollment => (
                  <tr key={enrollment._id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{enrollment.student?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{enrollment.student?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{enrollment.course?.title}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(enrollment._id, enrollment.course._id)}
                          className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(enrollment._id, enrollment.course._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
                        >
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
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {enrollments.map(enrollment => (
              <div key={enrollment._id} className="p-4">
                <div className="mb-3">
                  <div className="font-medium text-gray-900 dark:text-white">{enrollment.student?.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{enrollment.student?.email}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Course:</span> {enrollment.course?.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Requested: {new Date(enrollment.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(enrollment._id, enrollment.course._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(enrollment._id, enrollment.course._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 flex-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingEnrollments;
