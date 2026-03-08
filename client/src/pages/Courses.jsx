import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchCourses = async (pageNum = 1, searchTerm = search, cat = category) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 15);
      if (searchTerm) params.append('search', searchTerm);
      if (cat) params.append('category', cat);

      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      
      if (data.courses) {
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(1, search, category);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
    fetchCourses(1, search, e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">All Courses</h1>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our comprehensive video courses and start learning today
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Categories</option>
              <option value="default">Default</option>
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-10 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-violet-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">No courses found.</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {courses.map(course => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <div className="h-40 sm:h-52 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30">
                        <span className="text-5xl sm:text-6xl">📚</span>
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400 shadow-sm">
                      {course.price === 0 ? 'Free' : `BDT ${course.price}`}
                    </div>
                    {course.category && course.category !== 'default' && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-violet-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                        {course.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <h2 className="text-base sm:text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition line-clamp-1">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 sm:mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        By <span className="font-medium text-gray-700 dark:text-gray-300">{course.createdBy?.name || 'Unknown'}</span>
                      </span>
                      <span className="text-violet-600 dark:text-violet-400 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 sm:mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
