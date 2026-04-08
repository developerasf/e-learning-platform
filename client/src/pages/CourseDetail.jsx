import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CourseDetail = memo(() => {
  const { id } = useParams();
  const { user, isEnrolled, checkEnrollment, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">Course not found</div>
      </div>
    );
  }

  const enrolled = isUserEnrolled;

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mx-1 sm:mx-0">
        <div className="h-40 sm:h-56 md:h-72 lg:h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-400 dark:text-gray-500">📚</span>
          )}
        </div>
        <div className="p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">{course.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 text-sm sm:text-base md:text-lg">{course.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-5 sm:mb-6">
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">By {course.createdBy?.name || 'Unknown'}</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {course.price === 0 ? 'Free' : `BDT ${course.price}`}
            </span>
          </div>
          
          {!enrolled && !enrollmentStatus && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-blue-600 dark:bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition w-full sm:w-auto disabled:opacity-50"
            >
              {enrolling ? 'Sending...' : 'Enroll Now'}
            </button>
          )}

          {enrollmentStatus === 'pending' && (
            <div className="text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl w-full sm:w-auto text-center">
              Requested - Waiting for Approval
            </div>
          )}

          {enrolled && (
            <Link
              to={`/courses/${course._id}/videos/${course.chapters[0]?.videos[0]?._id || ''}`}
              className="bg-green-600 dark:bg-green-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl hover:bg-green-700 dark:hover:bg-green-700 transition inline-block w-full sm:w-auto text-center"
            >
              Start Learning
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 md:mt-10 px-1 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-900 dark:text-white">Course Content</h2>
        {course.chapters?.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No chapters added yet.</p>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {course.chapters?.map((chapter, chapterIndex) => (
              <div key={chapter._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    Chapter: {chapter.title}
                  </h3>
                </div>

                {chapter.videos?.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No videos in this chapter.</p>
                ) : (
                  <div className="space-y-2">
                    {chapter.videos?.map((video, videoIndex) => (
                      <Link
                        key={video._id}
                        to={enrolled ? `/courses/${course._id}/videos/${video._id}` : '#'}
                        className={`flex items-center p-2 sm:p-3 rounded ${enrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed opacity-50'}`}
                        onClick={(e) => !enrolled && e.preventDefault()}
                      >
                        <span className="text-gray-500 dark:text-gray-400 mr-2 sm:mr-3 text-sm">{videoIndex + 1}.</span>
                        <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{video.title}</span>
                        {enrolled && <span className="ml-auto text-blue-600 dark:text-blue-400">▶</span>}
                      </Link>
                    ))}
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
