import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminCourseResults = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    examTitle: '',
    obtainedMarks: '',
    totalMarks: ''
  });
  const [editingResultId, setEditingResultId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch course info
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Fetch enrolled students for dropdown
      const studentsRes = await fetch(`/api/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData || []);

      // Fetch existing results
      fetchResults();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!formData.studentId || !formData.examTitle || formData.obtainedMarks === '' || !formData.totalMarks) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingResultId 
        ? `/api/courses/${courseId}/results/${editingResultId}`
        : `/api/courses/${courseId}/results`;
        
      const method = editingResultId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          examTitle: formData.examTitle,
          obtainedMarks: Number(formData.obtainedMarks),
          totalMarks: Number(formData.totalMarks)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(editingResultId ? 'Result updated successfully' : 'Result published successfully');
        resetForm();
        fetchResults();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Error saving result');
      }
    } catch (error) {
      setMessage('Network error. Failed to save result.');
    }
  };

  const handleDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/results/${resultId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setResults(results.filter(r => r._id !== resultId));
      } else {
        const data = await res.json();
        setMessage(data.message || 'Error deleting result');
      }
    } catch (error) {
      setMessage('Error deleting result');
    }
  };

  const startEdit = (result) => {
    setEditingResultId(result._id);
    setFormData({
      studentId: result.student?._id || result.student,
      examTitle: result.examTitle,
      obtainedMarks: result.obtainedMarks,
      totalMarks: result.totalMarks
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingResultId(null);
    setFormData({
      studentId: '',
      examTitle: '',
      obtainedMarks: '',
      totalMarks: ''
    });
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin/results')} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Results Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {editingResultId ? (
                  <><Edit2 className="w-5 h-5 text-amber-500" /> Edit Result</>
                ) : (
                  <><Plus className="w-5 h-5 text-amber-500" /> Publish Result</>
                )}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
                  <select
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    disabled={!!editingResultId}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    <option value="">Select a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Midterm, Quiz 1"
                    value={formData.examTitle}
                    onChange={e => setFormData({ ...formData, examTitle: e.target.value })}
                    disabled={!!editingResultId} // Do not allow editing exam title to avoid duplicate confusion, just delete and recreate if needed or allow it based on your rules. The backend PUT allows it, but it's simpler to disable. Let's enable it since backend allows it, but unique constraint might complain if changing to an existing one. We will keep it enabled.
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Obtained</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.obtainedMarks}
                      onChange={e => setFormData({ ...formData, obtainedMarks: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total</label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={formData.totalMarks}
                      onChange={e => setFormData({ ...formData, totalMarks: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message}
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingResultId ? 'Update Result' : 'Save Result'}
                  </button>
                  {editingResultId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Published Results <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">{results.length}</span>
                </h3>
              </div>
              
              {loading && results.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                </div>
              ) : results.length === 0 ? (
                 <div className="text-center py-12">
                   <p className="text-gray-500 dark:text-gray-400">No results published yet.</p>
                 </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3">Student</th>
                        <th className="px-6 py-3">Exam Title</th>
                        <th className="px-6 py-3 text-center">Marks</th>
                        <th className="px-6 py-3 text-center">Percentage</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => {
                        const pct = Math.round((result.obtainedMarks / result.totalMarks) * 100);
                        return (
                          <tr key={result._id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                              {result.student?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                              {result.examTitle}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {result.obtainedMarks} / {result.totalMarks}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => startEdit(result)} className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition mr-2 cursor-pointer">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(result._id)} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseResults;
