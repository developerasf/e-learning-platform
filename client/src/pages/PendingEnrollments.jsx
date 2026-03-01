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
    fetch('/api/courses/enrollments/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEnrollments(data);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Manage</Link>
        <h1 className="text-3xl font-bold">Enrollment Requests</h1>
        <p className="text-gray-600">Pending student enrollment requests</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          No pending enrollment requests.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map(enrollment => (
                <tr key={enrollment._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{enrollment.student?.name}</div>
                    <div className="text-sm text-gray-500">{enrollment.student?.email}</div>
                  </td>
                  <td className="px-6 py-4">{enrollment.course?.title}</td>
                  <td className="px-6 py-4 text-gray-500">
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
      )}
    </div>
  );
};

export default PendingEnrollments;
