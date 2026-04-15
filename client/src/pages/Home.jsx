import { ArrowRight, Award, BookOpen, Play, Star, Video } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePreload } from "../context/PreloadContext";

const Home = memo(() => {
  const { preloadedCourses, preloading } = usePreload();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (preloadedCourses) {
      setCourses(preloadedCourses);
    } else if (!preloading) {
      fetch("/api/courses?page=1&limit=6")
        .then((r) => r.json())
        .then((coursesData) => {
          const courses = coursesData.courses || coursesData;
          setCourses(courses.slice(0, 6));
        })
        .catch(console.error);
    }
  }, [preloadedCourses, preloading]);

  const features = [
    {
      icon: BookOpen,
      title: "Expert Teachers",
      desc: "Learn from industry experts with years of experience",
      color: "bg-violet-100 text-violet-600",
      hoverColor: "group-hover:bg-violet-600 group-hover:text-white",
    },
    {
      icon: Video,
      title: "Video Lessons",
      desc: "High-quality video content accessible anytime, anywhere",
      color: "bg-emerald-100 text-emerald-600",
      hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
      icon: Award,
      title: "Earn Certificates",
      desc: "Complete courses and earn certificates to showcase your skills",
      color: "bg-amber-100 text-amber-600",
      hoverColor: "group-hover:bg-amber-500 group-hover:text-white",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-violet-800 to-violet-600" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 right-20 w-72 h-72 bg-violet-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              Start Your Learning Journey
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-emerald-400">Bipul's Classroom</span>
            </h1>

            <p className="text-lg sm:text-xl mb-8 max-w-2xl text-violet-100">
              Unlock your potential with expert-led video courses. Learn at your
              own pace, anywhere, anytime.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                Browse Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Stats */}
            {/* <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-violet-100">Students</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-violet-100">Courses</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">5K+</div>
                  <div className="text-sm text-violet-100">Certificates</div>
                </div>
              </div>
            </div>  */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${feature.color} ${feature.hoverColor} flex items-center justify-center mb-6 transition-all duration-300`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Courses */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Featured Courses
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Start learning from our most popular courses
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold hover:gap-3 transition-all cursor-pointer"
            >
              View All Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {preloading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No courses available yet.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-700"
                >
                  <div className="h-48 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/30 dark:to-emerald-900/30">
                        <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-700/80 flex items-center justify-center">
                          <Play className="w-8 h-8 text-violet-600 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-sm font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm">
                      {course.price === 0 ? "Free" : `BDT ${course.price} / month`}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-slate-500 dark:text-slate-500">
                        By{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {course.createdBy?.name || "Unknown"}
                        </span>
                      </span>
                    </div>
                    <div className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all duration-200 hover:shadow-md cursor-pointer">
                      Enroll Now <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on Bipul's Classroom
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            Sign Up Now - It's Free!
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
});

export default Home;
