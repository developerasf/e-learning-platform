import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BookOpen, User, Clock, Play, CheckCircle, AlertCircle, ArrowRight, FileVideo, GraduationCap } from 'lucide-react';

const CourseDetail = memo(() => {
  const { id } = useParams();
  const { user, isEnrolled, checkEnrollment, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (course?.chapters) {
      const initial = {};
      course.chapters.forEach(ch => { initial[ch._id] = true; });
      setExpandedChapters(initial);
    }
  }, [course]);

  const checkEnrollmentStatus = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/courses/${id}/enrollment-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'pending') {
          setEnrollmentStatus('pending');
        } else if (data.status === 'approved') {
          setEnrollmentStatus('approved');
          setIsUserEnrolled(true);
        } else {
          setEnrollmentStatus(null);
        }
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  }, [user, id]);

  useEffect(() => {
    if (user) {
      if (isEnrolled(id)) {
        setIsUserEnrolled(true);
        setEnrollmentStatus('approved');
      } else {
        checkEnrollment(id).then(result => {
          setIsUserEnrolled(result);
          if (result) {
            setEnrollmentStatus('approved');
          } else {
            checkEnrollmentStatus();
          }
        });
      }
    }
  }, [user, id, isEnrolled, checkEnrollment, checkEnrollmentStatus]);

  const handleEnroll = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setEnrollmentStatus('pending');
      refreshUser();
    } else {
      if (data.message === 'Already enrolled') {
        setEnrollmentStatus('approved');
        setIsUserEnrolled(true);
        refreshUser();
      } else if (data.message === 'Please verify your email before enrolling') {
        toast.error(data.message);
      } else {
        toast.error(data.message);
      }
    }
    setEnrolling(false);
  }, [user, id, navigate, refreshUser]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalVideos = course?.chapters?.reduce((acc, ch) => acc + (ch.videos?.length || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Course not found</p>
          <Link to="/courses" className="inline-flex items-center gap-2 mt-4 text-violet-600 dark:text-violet-400 font-medium cursor-pointer">
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const enrolled = isUserEnrolled;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Course Info */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Course Details
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-violet-100 mb-6 max-w-xl">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-6 text-violet-100">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{course.createdBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5" />
                  <span>{totalVideos} Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>{course.chapters?.length || 0} Chapters</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Course Price</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {course.price === 0 ? (
                    <span className="text-emerald-500">Free</span>
                  ) : (
                    <>BDT <span className="text-emerald-500">{course.price}</span></>
                  )}
                </div>
              </div>

              {!enrolled && !enrollmentStatus && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {enrolling ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enrolling...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Enroll Now <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
              )}

              {enrollmentStatus === 'pending' && (
                <div className="flex items-center justify-center gap-3 w-full py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-2xl font-semibold">
                  <Clock className="w-5 h-5" />
                  Pending Approval
                </div>
              )}

              {enrolled && (
                <Link
                  to={`/courses/${course._id}/videos/${course.chapters[0]?.videos[0]?._id || ''}`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <Play className="w-5 h-5" />
                  Start Learning
                </Link>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mt-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Course Content
        </h2>
        
        {course.chapters?.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <FileVideo className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">No chapters added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.chapters?.map((chapter, chapterIndex) => (
              <div 
                key={chapter._id} 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700"
              >
                <button
                  onClick={() => toggleChapter(chapter._id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-bold">{chapterIndex + 1}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {chapter.videos?.length || 0} videos
                      </p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-700 transition-transform duration-200 ${expandedChapters[chapter._id] ? 'rotate-180' : ''}`}>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                  </div>
                </button>

                {expandedChapters[chapter._id] && (
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    {chapter.videos?.length === 0 ? (
                      <div className="p-6 text-slate-500 dark:text-slate-400 text-sm">
                        No videos in this chapter.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {chapter.videos?.map((video, videoIndex) => (
                          <Link
                            key={video._id}
                            to={enrolled ? `/courses/${course._id}/videos/${video._id}` : '#'}
                            className={`flex items-center gap-4 p-4 pl-6 transition cursor-pointer ${
                              enrolled 
                                ? 'hover:bg-violet-50 dark:hover:bg-violet-900/20' 
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={(e) => !enrolled && e.preventDefault()}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400">
                              {videoIndex + 1}
                            </div>
                            <span className="flex-1 text-slate-700 dark:text-slate-300">
                              {video.title}
                            </span>
                            {enrolled && (
                              <Play className="w-5 h-5 text-violet-500" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default CourseDetail;