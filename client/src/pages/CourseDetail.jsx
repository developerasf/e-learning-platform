import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isEnrolled } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

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

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    
    const res = await fetch(`/api/courses/enrollments/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const pending = await res.json();
    const isPending = pending.some(e => e.course._id === id && e.student._id === user._id);
    if (isPending) {
      setEnrollmentStatus('pending');
    } else {
      setEnrollmentStatus(null);
    }
  };

  useEffect(() => {
    if (user) checkEnrollmentStatus();
  }, [user, id]);

  const handleEnroll = async () => {
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
      alert(data.message);
      setEnrollmentStatus('pending');
    } else {
      alert(data.message);
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  const enrolled = isEnrolled(course._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-64 bg-gray-200 flex items-center justify-center">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl text-gray-400">📚</span>
          )}
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-500">By {course.createdBy?.name || 'Unknown'}</span>
            <span className="text-2xl font-bold text-blue-600">
              {course.price === 0 ? 'Free' : `BDT ${course.price}`}
            </span>
          </div>
          
          {!enrolled && !enrollmentStatus && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition w-full md:w-auto disabled:opacity-50"
            >
              {enrolling ? 'Sending...' : 'Enroll Now'}
            </button>
          )}

          {enrollmentStatus === 'pending' && (
            <div className=" text-orange-700bg-orange-100 px-8 py-3 rounded-lg text-lg w-full md:w-auto text-center">
              Requested - Waiting for Approval
            </div>
          )}

          {enrolled && (
            <Link
              to={`/courses/${course._id}/videos/${course.chapters[0]?.videos[0]?._id || ''}`}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition inline-block"
            >
              Start Learning
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        {course.chapters?.length === 0 ? (
          <p className="text-gray-600">No chapters added yet.</p>
        ) : (
          <div className="space-y-4">
            {course.chapters?.map((chapter, chapterIndex) => (
              <div key={chapter._id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Chapter {chapterIndex + 1}: {chapter.title}
                </h3>
                {chapter.videos?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No videos in this chapter.</p>
                ) : (
                  <div className="space-y-2">
                    {chapter.videos?.map((video, videoIndex) => (
                      <Link
                        key={video._id}
                        to={enrolled ? `/courses/${course._id}/videos/${video._id}` : '#'}
                        className={`flex items-center p-2 rounded ${enrolled ? 'hover:bg-gray-100' : 'cursor-not-allowed opacity-50'}`}
                        onClick={(e) => !enrolled && e.preventDefault()}
                      >
                        <span className="text-gray-500 mr-3">{chapterIndex + 1}.{videoIndex + 1}</span>
                        <span>{video.title}</span>
                        {enrolled && <span className="ml-auto text-blue-600">▶</span>}
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
};

export default CourseDetail;
