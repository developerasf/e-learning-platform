import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, BookOpen, Video, CheckCircle, Clock, ArrowRight, BarChart3, Calendar, FileText } from 'lucide-react';

const Profile = memo(() => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVideosWatched = profile?.enrolledCourses?.reduce((acc, c) => acc + (c.watchedVideos || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account and track your learning progress
          </p>
        </div>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 border border-slate-100 dark:border-slate-700">
          {/* User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {profile?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {profile?.user?.name}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile?.user?.email}</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.user?.isVerified 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {profile?.user?.isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Unverified
                    </>
                  )}
                </div>
                {profile?.lastMonthPayment && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.lastMonthPayment.status === 'paid' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {profile.lastMonthPayment.status === 'paid' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Prev. Month: Paid
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Prev. Month: Unpaid
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {profile?.enrolledCourses?.length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Courses</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalVideosWatched}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Videos</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {profile?.enrolledCourses?.filter(c => (c.progress || 0) === 100).length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            My Enrolled Courses
          </h2>
          <Link 
            to="/courses" 
            className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium text-sm cursor-pointer"
          >
            Browse More
          </Link>
        </div>
        
        {profile?.enrolledCourses?.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">You haven't enrolled in any course yet.</p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Browse Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {profile?.enrolledCourses?.map((course) => (
              <div key={course._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-1">{course.title}</h3>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          (course.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-emerald-500'
                        }`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      {course.watchedVideos || 0} of {course.totalVideos || 0} videos watched
                    </p>
                  </div>
                  
                  <Link 
                    to={`/courses/${course._id}`}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monthly Attendance */}
        <div className="mt-12 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-500" />
            Monthly Attendance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {!profile?.attendanceSummary || profile.attendanceSummary.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
            No attendance records found for this month.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.attendanceSummary.map((att) => {
              const pct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
              return (
                <div key={att.courseId} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 line-clamp-1">{att.courseName}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Present</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{att.present} / {att.total} days</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right">
                     <span className={`text-xs font-bold ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                       {pct}% Attendance
                     </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Results */}
        <div className="mt-12 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            My Results
          </h2>
        </div>

        {!profile?.resultsSummary || profile.resultsSummary.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
            No exam results published yet.
          </div>
        ) : (
          <div className="space-y-6">
            {profile.resultsSummary.map((group) => {
              const totalObtained = group.exams.reduce((sum, e) => sum + e.obtainedMarks, 0);
              const totalMax = group.exams.reduce((sum, e) => sum + e.totalMarks, 0);
              const avgPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

              return (
                <div key={group.courseId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{group.courseName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${avgPct >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : avgPct >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      Average: {avgPct}%
                    </span>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3 font-medium">Exam Title</th>
                          <th className="px-6 py-3 font-medium text-center">Marks</th>
                          <th className="px-6 py-3 font-medium text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.exams.map((exam) => (
                          <tr key={exam._id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{exam.examTitle}</td>
                            <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{exam.obtainedMarks} / {exam.totalMarks}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-semibold ${exam.percentage >= 80 ? 'text-emerald-500' : exam.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {exam.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';
export default Profile;