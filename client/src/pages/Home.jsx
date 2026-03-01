import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to TutorHub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Learn from expert teachers with our comprehensive video courses. 
          Master new skills at your own pace.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/courses"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Browse Courses
          </Link>
          <Link
            to="/register"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg hover:bg-gray-300 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Expert Teachers</h3>
          <p className="text-gray-600">Learn from industry experts with years of experience.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold mb-2">Video Lessons</h3>
          <p className="text-gray-600">High-quality video content accessible anytime, anywhere.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">Earn Certificates</h3>
          <p className="text-gray-600">Complete courses and earn certificates to showcase your skills.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
