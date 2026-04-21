import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Settings, Users, FileText, Plus, Trash2, Edit, Eye, EyeOff, CheckCircle, Clock, BarChart3, BookOpen, Loader2, CreditCard } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminDashboard = memo(() => {
  const [courses, setCourses] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, courseId: null, title: '', message: '' });
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
      }).then(r => r.json())
    ])
      .then(([coursesData, enrollmentsData]) => {
        setCourses(coursesData.courses || coursesData);
        setPendingCount(enrollmentsData.enrollments?.length || enrollmentsData.length || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      courseId: id,
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.'
    });
  };

  const confirmDelete = async () => {
    const id = confirmDialog.courseId;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setCourses(courses.filter(c => c._id !== id));
      toast.success('Course deleted successfully');
    } else {
      toast.error('Failed to delete course');
    }
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
      toast.success(currentStatus ? 'Course unpublished successfully' : 'Course published successfully');
    } else {
      toast.error('Failed to update course status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Admin' }
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your courses and content</p>
          </div>
          <div className="w-full sm:w-auto flex flex-wrap gap-3">
            <Link
              to="/admin/enrollments"
              className="flex-1 sm:flex-none relative inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Requests
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin/users"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
            <Link
              to="/admin/payments"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Payments
            </Link>
            <Link
              to="/admin/courses/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Course
            </Link>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Courses ({courses.length})</h2>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-6">No courses yet</p>
              <Link
                to="/admin/courses/new"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Create First Course
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Course Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Modules</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Enrolled</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {courses.map(course => (
                      <tr key={course._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{course.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{course.description?.slice(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                          {course.chapters?.length || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/courses/${course._id}/students`}
                            className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-semibold text-sm transition duration-200 cursor-pointer"
                          >
                            {course.enrolledStudents}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                            {course.isPublished ? <><CheckCircle className="w-3 h-3" /> Published</> : <><Clock className="w-3 h-3" /> Draft</>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/courses/${course._id}/edit`}
                              className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium text-sm transition duration-200 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => togglePublish(course._id, course.isPublished)}
                              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 font-medium text-sm transition duration-200 cursor-pointer"
                            >
                              {course.isPublished ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish</>}
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition duration-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {courses.map(course => (
                  <div key={course._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150">
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{course.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{course.description?.slice(0, 80)}...</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Modules</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{course.chapters?.length || 0}</div>
                      </div>
                      <Link
                        to={`/admin/courses/${course._id}/students`}
                        className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition duration-200 cursor-pointer"
                      >
                        <div className="text-xs text-slate-500 dark:text-slate-400">Enrolled</div>
                        <div className="text-xl font-bold text-violet-600 dark:text-violet-400">{course.enrolledStudents}</div>
                      </Link>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/courses/${course._id}/edit`}
                        className="flex-1 text-center text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 py-2.5 rounded-xl font-medium text-xs transition duration-200 cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(course._id, course.isPublished)}
                        className="flex-1 text-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 rounded-xl font-medium text-xs transition duration-200 cursor-pointer"
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="flex-1 text-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-xl font-medium text-xs transition duration-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;