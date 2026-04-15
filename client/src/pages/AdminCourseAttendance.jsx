import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X, Save, Calendar, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminCourseAttendance = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const getLocalDateString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [activeTab, setActiveTab] = useState('mark');
  const [summaryData, setSummaryData] = useState(null);
  const [summaryMonth, setSummaryMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCourse();
  }, [user, courseId]);

  useEffect(() => {
    if (activeTab === 'mark') {
      fetchAttendance();
    } else {
      fetchSummary();
    }
  }, [selectedDate, activeTab, summaryMonth]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/attendance/summary?month=${summaryMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s._id === studentId) {
        const nextStatus = s.status === 'present' ? 'absent' : 'present';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const markAllAbsent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'absent' })));
  };

  const saveAttendance = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const records = students.map(s => ({
        studentId: s._id,
        status: s.status === 'unmarked' ? 'absent' : s.status
      }));

      const res = await fetch(`/api/courses/${courseId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: selectedDate, records })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Attendance saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Error saving attendance');
      }
    } catch (error) {
      setMessage('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days) => {
    const d = new Date(`${selectedDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const changeMonth = (dir) => {
    const [y, m] = summaryMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setSummaryMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/admin/attendance')} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Management</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition cursor-pointer ${activeTab === 'mark' ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition cursor-pointer ${activeTab === 'summary' ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Monthly Summary
          </button>
        </div>

        {activeTab === 'mark' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                  <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={markAllPresent} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition cursor-pointer">
                    All Present
                  </button>
                  <button onClick={markAllAbsent} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition cursor-pointer">
                    All Absent
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                  Present: {presentCount}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                  Absent: {absentCount}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                  Total: {students.length}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No students enrolled in this course</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">#</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Student</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{student.name}</span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleStatus(student._id)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition cursor-pointer ${
                                student.status === 'present'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                  : student.status === 'absent'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {student.status === 'present' ? (
                                <><Check className="w-4 h-4" /> Present</>
                              ) : student.status === 'absent' ? (
                                <><X className="w-4 h-4" /> Absent</>
                              ) : (
                                'Unmarked'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  {message && (
                    <p className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {message}
                    </p>
                  )}
                  <div className="ml-auto">
                    <button
                      onClick={saveAttendance}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'summary' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  type="month"
                  value={summaryMonth}
                  onChange={e => setSummaryMonth(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
                {summaryData && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                    Total class days: <strong className="text-gray-900 dark:text-white">{summaryData.totalClasses}</strong>
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent"></div>
              </div>
            ) : !summaryData || summaryData.students.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No attendance data for this month</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">#</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Student</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Present</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Absent</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.students.map((student, idx) => {
                        const pct = student.totalClasses > 0 ? Math.round((student.present / student.totalClasses) * 100) : 0;
                        return (
                          <tr key={student._id} className="border-b border-gray-100 dark:border-gray-700/50">
                            <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{student.name}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                {student.present}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                                {student.absent}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-semibold ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCourseAttendance;
