import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminDashboard = memo(() => {
  const [courses, setCourses] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('/api/courses/admin/all?page=1&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/courses/enrollments/pending?page=1&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/upload/banner').then(r => r.json())
    ])
      .then(([coursesData, enrollmentsData, bannerData]) => {
        setCourses(coursesData.courses || coursesData);
        setPendingCount(enrollmentsData.enrollments?.length || enrollmentsData.length || 0);
        setBanner(bannerData.url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBannerUploading(true);
    const formData = new FormData();
    formData.append('banner', file);
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/upload/banner', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setBanner(data.url);
        toast.success('Banner uploaded successfully!');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    }
    setBannerUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setCourses(courses.filter(c => c._id !== id));
  };

  const togglePublish = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isPublished: !currentStatus })
    });
    if (res.ok) {
      setCourses(courses.map(c => c._id === id ? { ...c, isPublished: !currentStatus } : c));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Manage Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link
            to="/admin/enrollments"
            className="bg-orange-500 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-orange-600 relative text-sm"
          >
            Requests
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/users"
            className="bg-purple-600 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-purple-700 text-sm"
          >
            Users
          </Link>
          <Link
            to="/admin/courses/new"
            className="bg-blue-600 text-white px-3 sm:px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Course
          </Link>
        </div>
      </div>

      {/* Banner Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Home Page Banner</h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={bannerUploading}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 1920x500px</p>
          </div>
          <div className="w-full md:w-2/3">
            {banner ? (
              <div className="relative">
                <img src={banner} alt="Banner Preview" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
                <button
                  onClick={() => setBanner('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="h-24 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                No banner uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courses Table - Responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chapters</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map(course => (
                <tr key={course._id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{course.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{course.description?.slice(0, 40)}...</div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {course.chapters?.length || 0}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/courses/${course._id}/students`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      {course.enrolledStudents}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${course.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/courses/${course._id}/edit`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(course._id, course.isPublished)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm"
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        Delete
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
          {courses.map(course => (
            <div key={course._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{course.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${course.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{course.description?.slice(0, 60)}...</p>
              <div className="flex flex-wrap gap-3 text-xs mb-3">
                <span className="text-gray-600 dark:text-gray-400">{course.chapters?.length || 0} chapters</span>
                <Link to={`/admin/courses/${course._id}/students`} className="text-blue-600 dark:text-blue-400 font-medium">
                  {course.enrolledStudents} students
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/admin/courses/${course._id}/edit`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => togglePublish(course._id, course.isPublished)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-xs"
                >
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No courses yet. Create your first course!
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AdminDashboard;
