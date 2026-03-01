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
      fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([courseData, studentsData, usersData]) => {
      setCourse(courseData);
      setStudents(studentsData);
      setAllUsers(usersData.filter(u => u.role === 'student'));
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Manage</Link>
        <h1 className="text-3xl font-bold">{course?.title}</h1>
        <p className="text-gray-600">Enrolled Students</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-lg">
          Total Students: <span className="font-bold">{students.length}</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Student to Course</h2>
          {availableUsers.length === 0 ? (
            <p className="text-gray-500">All students are already enrolled or no students available.</p>
          ) : (
            <div className="flex gap-4">
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                <option value="">Select a student</option>
                {availableUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button
                onClick={handleEnroll}
                disabled={!selectedUser}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Enroll
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No students enrolled yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map(student => (
                <tr key={student._id}>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{student.email}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemove(student._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourseStudents;
