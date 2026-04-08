import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize, Star, CheckCircle, ChevronDown, ChevronUp, FileText, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const VideoPlayer = memo(() => {
  const { courseId, videoId } = useParams();
  const { user, isEnrolled, checkEnrollment } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [videoRating, setVideoRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState({});
  
  const videoContainerRef = useRef(null);
  const playerRef = useRef(null);
  const hasAutoMarkedRef = useRef(false);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYoutubeApiReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      setYoutubeApiReady(true);
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

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
          if (result) fetchProgress();
        }
      };
      checkEnrolled();
    }
  }, [user, courseId, isEnrolled, checkEnrollment]);

  const fetchProgress = useCallback(async () => {
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
  }, [courseId]);

  const fetchVideoRating = useCallback(async () => {
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
  }, [courseId, currentChapter, videoId]);

  useEffect(() => {
    if (currentChapter && videoId && enrolled) {
      fetchVideoRating();
    }
  }, [currentChapter, videoId, enrolled, fetchVideoRating]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const markAsWatched = useCallback(async () => {
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
        setWatchedVideos(prev => [...prev, videoId]);
        toast.success('Video completed!');
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
    }
  }, [courseId, videoId]);

  useEffect(() => {
    if (!currentVideo?.youtubeId || !youtubeApiReady) return;

    hasAutoMarkedRef.current = false;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: currentVideo.youtubeId,
      playerVars: {
        autoplay: 0,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {},
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            if (!watchedVideos.includes(videoId) && !hasAutoMarkedRef.current) {
              hasAutoMarkedRef.current = true;
              markAsWatched();
            }
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentVideo?.youtubeId, youtubeApiReady, videoId]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  const handleRateVideo = useCallback(async (rating) => {
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
  }, [submitting, courseId, currentChapter, videoId, fetchVideoRating]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleChapter = (chapterId) => {
    setSidebarCollapsed(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const allVideos = useMemo(() => {
    if (!course?.chapters) return [];
    const videos = [];
    course.chapters.forEach(chapter => {
      chapter.videos?.forEach(video => {
        videos.push({ ...video, chapterTitle: chapter.title });
      });
    });
    return videos;
  }, [course]);

  const currentIndex = useMemo(() => allVideos.findIndex(v => v._id === videoId), [allVideos, videoId]);
  const nextVideo = useMemo(() => allVideos[currentIndex + 1], [allVideos, currentIndex]);
  const prevVideo = useMemo(() => allVideos[currentIndex - 1], [allVideos, currentIndex]);
  const isWatched = watchedVideos.includes(videoId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Course not found</p>
          <Link to="/courses" className="text-violet-600 dark:text-violet-400 font-medium mt-4 inline-block cursor-pointer">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !enrolled) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 text-amber-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">You need to enroll to watch this video.</p>
          <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer">
            Go to Course Page
          </Link>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900">
      {/* Video Container */}
      <div ref={videoContainerRef} className="relative w-full h-[50vw] sm:h-[45vw] md:h-[40vw] lg:h-[500px] xl:h-[600px] bg-black">
        <div id="youtube-player" className="w-full h-full"></div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-black/80 text-white text-sm px-3 py-2 rounded-xl backdrop-blur-sm cursor-pointer border border-white/10"
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
            className="bg-black/80 text-white p-2.5 rounded-xl backdrop-blur-sm hover:bg-black/90 transition cursor-pointer border border-white/10"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Back to Course */}
            <Link 
              to={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 text-sm mb-4 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentVideo.title}</h1>
              <p className="text-slate-400 text-base">Chapter: {currentChapter?.title}</p>
            </div>
            
            {/* Status Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {isWatched && (
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
              
              <button
                onClick={() => setShowRating(!showRating)}
                className="inline-flex items-center gap-2 bg-violet-600/20 text-violet-400 px-4 py-2 rounded-xl text-sm font-medium border border-violet-600/30 hover:bg-violet-600/30 transition cursor-pointer"
              >
                <Star className="w-4 h-4" />
                Rate Video
              </button>
            </div>
            
            {/* Rating Section */}
            {showRating && (
              <div className="mb-6 p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Rate this video</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateVideo(star)}
                      disabled={submitting}
                      className={`p-1 transition cursor-pointer ${
                        userRating >= star 
                          ? 'text-amber-400' 
                          : 'text-slate-600 hover:text-amber-400'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                {videoRating && (
                  <p className="text-xs text-slate-500 mt-3">
                    Average: {videoRating.averageRating}/5 ({videoRating.totalRatings} ratings)
                  </p>
                )}
              </div>
            )}
            
            {/* Chapter Notes */}
            {currentChapter?.notes && currentChapter.notes.length > 0 && (
              <div className="mb-6 p-5 bg-blue-900/20 rounded-2xl border border-blue-800/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3">
                  <FileText className="w-4 h-4" />
                  Chapter Notes
                </h3>
                <div className="space-y-2">
                  {currentChapter.notes.map((note, index) => {
                    const isGoogleDrive = note.url?.includes('drive.google.com') || note.url?.includes('docs.google.com');
                    return (
                      <a 
                        key={index}
                        href={note.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition cursor-pointer"
                      >
                        {isGoogleDrive ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span>{note.title || 'Notes ' + (index + 1)}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-wrap gap-3">
              {prevVideo && (
                <Link
                  to={`/courses/${courseId}/videos/${prevVideo._id}`}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                  Previous
                </Link>
              )}
              {nextVideo && (
                <Link
                  to={`/courses/${courseId}/videos/${nextVideo._id}`}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition hover:shadow-lg cursor-pointer"
                >
                  Next
                  <SkipForward className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-96">
            {/* Toggle Button */}
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl mb-3 text-white cursor-pointer"
            >
              <span className="font-semibold">Course Content</span>
              {showSidebar ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {/* Course Content List */}
            <div className={`bg-slate-800 rounded-2xl border border-slate-700 p-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
              <h2 className="text-lg font-bold text-white mb-4">Course Content</h2>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {course.chapters?.map((chapter, chapterIndex) => {
                  const chapterWatched = chapter.videos?.every(v => watchedVideos.includes(v._id));
                  const isCollapsed = sidebarCollapsed[chapter._id];
                  
                  return (
                    <div key={chapter._id} className="rounded-xl overflow-hidden border border-slate-700">
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            chapterWatched 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-violet-600 text-white'
                          }`}>
                            {chapterIndex + 1}
                          </div>
                          <span className="text-white font-medium text-sm text-left line-clamp-1">
                            {chapter.title}
                          </span>
                        </div>
                        {chapterWatched && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                      </button>

                      {!isCollapsed && (
                        <div className="divide-y divide-slate-700">
                          {chapter.videos?.map((video, videoIndex) => {
                            const isCurrentVideo = video._id === videoId;
                            const isWatchedVideo = watchedVideos.includes(video._id);
                            
                            return (
                              <Link
                                key={video._id}
                                to={`/courses/${courseId}/videos/${video._id}`}
                                className={`flex items-center gap-3 p-3 pl-12 transition cursor-pointer ${
                                  isCurrentVideo
                                    ? 'bg-violet-600/20 text-violet-400'
                                    : isWatchedVideo
                                      ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30'
                                      : 'text-slate-400 hover:bg-slate-700/50'
                                }`}
                              >
                                <span className="text-xs w-5">{videoIndex + 1}.</span>
                                <span className="flex-1 text-sm line-clamp-1">{video.title}</span>
                                {isWatchedVideo && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;