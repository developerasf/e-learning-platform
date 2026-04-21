import { useState, useEffect, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VideoRatings = memo(() => {
  const { courseId } = useParams();
  const [ratings, setRatings] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchRatings();
  }, [user, courseId, authLoading]);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/ratings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRatings(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/admin/tracking" 
            className="text-violet-600 dark:text-violet-400 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Tracking
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Video Ratings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
            View ratings for each video in this course
          </p>
        </div>

        {selectedVideo ? (
          <div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mb-4 text-violet-600 dark:text-violet-400 hover:underline text-sm"
            >
              ← Back to all videos
            </button>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedVideo.chapterTitle}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderStars(Math.round(selectedVideo.averageRating))}
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVideo.averageRating}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({selectedVideo.totalRatings} ratings)
                  </span>
                </div>
              </div>

              {selectedVideo.ratings && selectedVideo.ratings.length > 0 ? (
                <div className="space-y-3">
                  {selectedVideo.ratings.map((rating, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {renderStars(rating.rating)}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(rating.ratedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No ratings yet
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Chapter
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Total Ratings
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {ratings.map((video) => (
                    <tr key={video.videoId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {video.title}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          {video.chapterTitle}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(Math.round(video.averageRating))}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {video.averageRating}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          {video.totalRatings}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {ratings.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No videos or ratings found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const ProtectedVideoRatings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  if (user.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  return <VideoRatings />;
};

export default ProtectedVideoRatings;
