import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VideoPlayer = () => {
  const { courseId, videoId } = useParams();
  const { user, isEnrolled, checkEnrollment } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [videoRating, setVideoRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        for (const chapter of data.chapters || []) {
          const video = chapter.videos?.find(v => v._id === videoId);
          if (video) {
            setCurrentVideo(video);
            setCurrentChapter(chapter);
            break;
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [courseId, videoId]);

  useEffect(() => {
    if (user && courseId) {
      const checkEnrolled = async () => {
        if (isEnrolled(courseId)) {
          setEnrolled(true);
          fetchProgress();
        } else {
          const result = await checkEnrollment(courseId);
          setEnrolled(result);
          if (result) {
            fetchProgress();
          }
        }
      };
      checkEnrolled();
    }
  }, [user, courseId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWatchedVideos(data.watchedVideos?.map(v => v.videoId) || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchVideoRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/chapters/${currentChapter?._id}/videos/${videoId}/rating`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVideoRating(data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  useEffect(() => {
    if (currentChapter && videoId && enrolled) {
      fetchVideoRating();
    }
  }, [currentChapter, videoId, enrolled]);

  const handleMarkAsWatched = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      });
      
      if (res.ok) {
        setWatchedVideos([...watchedVideos, videoId]);
        toast.success('Video marked as watched!');
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
      toast.error('Failed to mark as watched');
    }
  };

  const handleRateVideo = async (rating) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/chapters/${currentChapter?._id}/videos/${videoId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });
      
      if (res.ok) {
        setUserRating(rating);
        toast.success('Rating submitted!');
        fetchVideoRating();
      }
    } catch (error) {
      console.error('Error rating video:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Course not found</div>
      </div>
    );
  }

  if (!user || !enrolled) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center">
          <p className="text-base sm:text-xl mb-4">You need to enroll to watch this video.</p>
          <Link to={`/courses/${courseId}`} className="text-violet-600 hover:underline text-sm sm:text-base">
            Go to Course Page
          </Link>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Video not found</div>
      </div>
    );
  }

  const isWatched = watchedVideos.includes(videoId);

  const getAllVideos = () => {
    const videos = [];
    course.chapters?.forEach(chapter => {
      chapter.videos?.forEach(video => {
        videos.push({ ...video, chapterTitle: chapter.title });
      });
    });
    return videos;
  };

  const allVideos = getAllVideos();
  const currentIndex = allVideos.findIndex(v => v._id === videoId);
  const nextVideo = allVideos[currentIndex + 1];
  const prevVideo = allVideos[currentIndex - 1];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <div ref={videoContainerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?playback_speed=${playbackSpeed}`}
              title={currentVideo.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            <div className="absolute top-2 right-2 flex gap-2">
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded backdrop-blur-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
              
              <button
                onClick={toggleFullscreen}
                className="bg-black/70 text-white p-1.5 sm:p-2 rounded backdrop-blur-sm hover:bg-black/90"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm12-1a1 1 0 00-1 1v3a1 1 0 102 0V5h3a1 1 0 100-2h-4zm-9 12a1 1 0 011 1v3h3a1 1 0 110 2H4a1 1 0 01-1-1v-4a1 1 0 011-1zm12 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm12-1a1 1 0 00-1 1v3a1 1 0 102 0V5h3a1 1 0 100-2h-4zm-9 12a1 1 0 011 1v3h3a1 1 0 110 2H4a1 1 0 01-1-1v-4a1 1 0 011-1zm12 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4">
            <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">{currentVideo.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Chapter: {currentChapter?.title}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
            {!isWatched && (
              <button
                onClick={handleMarkAsWatched}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mark as Watched
              </button>
            )}
            {isWatched && (
              <span className="bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Watched
              </span>
            )}
            
            <button
              onClick={() => setShowRating(!showRating)}
              className="bg-violet-100 text-violet-700 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-violet-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Rate Video
            </button>
          </div>
          
          {showRating && (
            <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Rate this video</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRateVideo(star)}
                    disabled={submitting}
                    className={`p-1 ${userRating >= star ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'} transition`}
                  >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              {videoRating && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Average: {videoRating.averageRating}/5 ({videoRating.totalRatings} ratings)
                </p>
              )}
            </div>
          )}
          
          {currentChapter?.notes && currentChapter.notes.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chapter Notes</h3>
              <div className="space-y-2">
                {currentChapter.notes.map((note, index) => (
                  <a 
                    key={index}
                    href={note.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{note.title || 'Notes ' + (index + 1)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
            {prevVideo && (
              <Link
                to={`/courses/${courseId}/videos/${prevVideo._id}`}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ← Previous
              </Link>
            )}
            {nextVideo && (
              <Link
                to={`/courses/${courseId}/videos/${nextVideo._id}`}
                className="bg-violet-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-violet-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
        
        <div className="lg:w-80">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-3 text-left flex justify-between items-center"
          >
            <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">Course Content</span>
            <span className="text-gray-500">{showSidebar ? '▲' : '▼'}</span>
          </button>
          
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Course Content</h2>
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {course.chapters?.map((chapter, chapterIndex) => (
                <div key={chapter._id}>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 py-2 border-b dark:border-gray-700 text-sm sm:text-base">
                    Chapter: {chapter.title}
                  </h3>
                  {chapter.videos?.map((video, videoIndex) => (
                    <Link
                      key={video._id}
                      to={`/courses/${courseId}/videos/${video._id}`}
                      className={`flex items-center p-2 rounded text-xs sm:text-sm ${
                        video._id === videoId
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                          : watchedVideos.includes(video._id)
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="mr-1 sm:mr-2">{videoIndex + 1}.</span>
                      <span className="flex-1 truncate">{video.title}</span>
                      {video._id === videoId && <span>▶</span>}
                      {watchedVideos.includes(video._id) && (
                        <svg className="w-3 h-3 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
