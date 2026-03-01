import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = () => {
  const { courseId, videoId } = useParams();
  const { user, isEnrolled } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        for (const chapter of data.chapters || []) {
          const video = chapter.videos?.find(v => v._id === videoId);
          if (video) {
            setCurrentVideo(video);
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

  if (!user || !isEnrolled(courseId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl mb-4">You need to enroll to watch this video.</p>
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
            Go to Course Page
          </Link>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Video not found</div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}`}
              title={currentVideo.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
            <p className="text-gray-600">{currentVideo.chapterTitle}</p>
          </div>
          <div className="flex gap-4 mt-4">
            {prevVideo && (
              <Link
                to={`/courses/${courseId}/videos/${prevVideo._id}`}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                ← Previous
              </Link>
            )}
            {nextVideo && (
              <Link
                to={`/courses/${courseId}/videos/${nextVideo._id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Course Content</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.chapters?.map((chapter, chapterIndex) => (
                <div key={chapter._id}>
                  <h3 className="font-medium text-gray-700 py-2 border-b">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  {chapter.videos?.map((video, videoIndex) => (
                    <Link
                      key={video._id}
                      to={`/courses/${courseId}/videos/${video._id}`}
                      className={`flex items-center p-2 rounded text-sm ${
                        video._id === videoId
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{chapterIndex + 1}.{videoIndex + 1}</span>
                      <span className="flex-1 truncate">{video.title}</span>
                      {video._id === videoId && <span>▶</span>}
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
