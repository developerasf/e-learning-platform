import { useState, useEffect, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentProgress = memo(() => {
  const { courseId, studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProgress();
  }, [user, courseId, studentId]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/tracking/${courseId}/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!data?.student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Student not found</p>
            <Link to="/admin/tracking" className="text-violet-600 hover:underline mt-2 inline-block">
              Back to Tracking
            </Link>
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
            to={`/admin/tracking/${courseId}`} 
            className="text-violet-600 dark:text-violet-400 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Course Progress
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {data.student.name}'s Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
            {data.student.email} • {data.course.title}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</p>
            <p className="text-2xl sm:text-3xl font-bold text-violet-600 dark:text-violet-400">
              {data.progress.percentage}%
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Videos Watched</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {data.progress.watchedVideos}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">out of {data.progress.totalVideos}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Total Days Active</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {data.graphData.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Daily Watch Time</h2>
          {data.graphData && data.graphData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <Line
                data={{
                  labels: data.graphData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                  datasets: [
                    {
                      label: 'Videos Watched',
                      data: data.graphData.map(d => d.watched),
                      borderColor: '#8B5CF6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      fill: true,
                      tension: 0.3,
                      pointBackgroundColor: '#8B5CF6',
                      pointBorderColor: '#8B5CF6',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: '#1F2937',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderRadius: 8,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: '#374151',
                      },
                      ticks: {
                        color: '#9CA3AF',
                        font: { size: 12 },
                      },
                    },
                    y: {
                      grid: {
                        color: '#374151',
                      },
                      ticks: {
                        color: '#9CA3AF',
                        font: { size: 12 },
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No watch data available yet</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Watched Videos</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {data.watchedVideosList && data.watchedVideosList.length > 0 ? (
              data.watchedVideosList.map((video, index) => (
                <div key={index} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                      {video.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {video.chapterTitle}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {new Date(video.watchedAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No videos watched yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default StudentProgress;
