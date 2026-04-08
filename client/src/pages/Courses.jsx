import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ChevronLeft, ChevronRight, Filter, Play, X } from 'lucide-react';

const Courses = memo(() => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPage(1);
    fetchCourses(1, '', '');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            All Courses
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our comprehensive video courses and start learning today
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full lg:w-48 px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="default">Default</option>
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Active Filters */}
          {(search || category) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm">
                  Search: {search}
                  <button type="button" onClick={() => { setSearch(''); setPage(1); fetchCourses(1, '', category); }} className="ml-1 hover:text-violet-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
                  {category}
                  <button type="button" onClick={() => { setCategory(''); setPage(1); fetchCourses(1, search, ''); }} className="ml-1 hover:text-emerald-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                type="button"
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xl mb-2">No courses found.</p>
            <p className="text-slate-500 dark:text-slate-500 text-base mb-6">Try adjusting your search or filter.</p>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{courses.length}</span> courses
                {pagination && pagination.total > 0 && (
                  <span className="text-slate-500"> of {pagination.total}</span>
                )}
              </p>
            </div>

            {/* Course Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700"
                >
                  <div className="h-52 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/30 dark:to-emerald-900/30">
                        <div className="w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center shadow-md">
                          <Play className="w-10 h-10 text-violet-600 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-sm font-bold text-emerald-600 dark:text-emerald-400 shadow-md">
                      {course.price === 0 ? 'Free' : `BDT ${course.price}`}
                    </div>
                    {course.category && course.category !== 'default' && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-violet-600 text-white text-xs font-semibold shadow-md capitalize">
                        {course.category}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-sm text-slate-500 dark:text-slate-500">
                        By <span className="font-medium text-slate-700 dark:text-slate-300">{course.createdBy?.name || 'Unknown'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition">
                        View Course
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition cursor-pointer ${
                          page === pageNum
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default Courses;