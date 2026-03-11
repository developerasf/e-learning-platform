import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';

const Home = memo(() => {
  const [banner, setBanner] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/upload/banner').then(r => r.json()),
      fetch('/api/courses?page=1&limit=6').then(r => r.json())
    ])
      .then(([bannerData, coursesData]) => {
        if (bannerData.url) setBanner(bannerData.url);
        const courses = coursesData.courses || coursesData;
        setCourses(courses.slice(0, 6));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <div className="relative h-56 sm:h-80 md:h-96 w-full overflow-hidden">
        {banner ? (
          <img 
            src={banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex flex-col items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
              Welcome to EduSpace
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow">
              Unlock your potential with expert-led video courses
            </p>
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap px-4">
            <Link
              to="/courses"
              className="bg-violet-500 hover:bg-violet-600 text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="bg-white/10 hover:bg-white/20 text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition-all backdrop-blur-sm border border-white/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-10 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-violet-500 transition">
                <span className="text-2xl sm:text-3xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Expert Teachers</h3>
              <p className="text-gray-600 text-sm sm:text-base">Learn from industry experts with years of experience.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-indigo-500 transition">
                <span className="text-2xl sm:text-3xl">🎥</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Video Lessons</h3>
              <p className="text-gray-600 text-sm sm:text-base">High-quality video content accessible anytime, anywhere.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-purple-500 transition">
                <span className="text-2xl sm:text-3xl">🏆</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Earn Certificates</h3>
              <p className="text-gray-600 text-sm sm:text-base">Complete courses and earn certificates to showcase your skills.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
            <p className="text-gray-600 text-sm sm:text-base">Start learning from our most popular courses</p>
          </div>
          
          {courses.length === 0 ? (
            <p className="text-center text-gray-600">No courses available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {courses.map(course => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="h-36 sm:h-48 bg-gray-200 overflow-hidden relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                        <span className="text-5xl sm:text-6xl">📚</span>
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-violet-600">
                      {course.price === 0 ? 'Free' : `BDT ${course.price}`}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 group-hover:text-violet-600 transition">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 sm:mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                      <span>By {course.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {courses.length > 0 && (
            <div className="text-center mt-10">
              <Link
                to="/courses"
                className="inline-flex items-center text-violet-600 font-medium hover:text-violet-700 transition"
              >
                View All Courses
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-10 sm:py-16 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Start Learning?</h2>
          <p className="text-sm sm:text-lg mb-6 sm:mb-8 opacity-90">Join thousands of students already learning on EduSpace</p>
          <Link
            to="/register"
            className="inline-block bg-white text-violet-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
          >
            Sign Up Now - It's Free!
          </Link>
        </div>
      </div>
    </div>
  );
});

export default Home;
