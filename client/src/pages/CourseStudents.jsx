import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseStudents = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [id, user]);

  const loadData = () => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`/api/courses/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/courses/${id}/students`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/users?page=1&limit=100', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([courseData, studentsData, usersData]) => {
      setCourse(courseData);
      setStudents(studentsData);
      const users = usersData.users || usersData;
      setAllUsers(users.filter(u => u.role === 'student'));
      setLoading(false);
    });
  };

  const handleEnroll = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${id}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ studentId: selectedUser })
    });
    setSelectedUser('');
    setShowAddForm(false);
    loadData();
  };

  const handleRemove = async (studentId) => {
    if (!confirm('Remove this student from the course?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${id}/students/${studentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadData();
  };

  const enrolledIds = students.map(s => s._id);
  const availableUsers = allUsers.filter(u => !enrolledIds.includes(u._id));

  if (loading) return <div className="p-4 sm:p-8 text-center text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block text-sm">← Back to Manage</Link>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{course?.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">Enrolled Students</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
          Total Students: <span className="font-bold text-gray-900 dark:text-white">{students.length}</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 text-sm w-full sm:w-auto"
        >
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Add Student to Course</h2>
          {availableUsers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">All students are already enrolled or no students available.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a student</option>
                {availableUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button
                onClick={handleEnroll}
                disabled={!selectedUser}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
              >
                Enroll
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">No students enrolled yet.</div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map(student => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{student.email}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemove(student._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(student => (
                <div key={student._id} className="p-4">
                  <div className="mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Enrolled: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                  </div>
                  <button
                    onClick={() => handleRemove(student._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseStudents;
