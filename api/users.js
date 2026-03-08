import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect, admin } from '../middleware/auth.js';
import connectDB from '../lib/db.js';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().substring(0, 500);
  }
  return input;
};

const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  if (path.startsWith('/api/users')) {
    path = path.substring(10);
  }
  return path || '/';
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed: ' + error.message });
  }

  const { method } = req;
  const path = getPath(req.url);

  const userIdMatch = path && path.match(/^\/([^/]+)$/);
  const trackingCourseMatch = path && path.match(/^\/tracking\/([^/]+)$/);
  const trackingStudentMatch = path && path.match(/^\/tracking\/([^/]+)\/student\/([^/]+)$/);

  // GET /api/users - list all users (admin)
  if (method === 'GET' && (path === '/' || path === '')) {
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    const { page = 1, limit = 15, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -verificationOTP -passwordResetOTP')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await User.countDocuments(query);

    return res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }

  // GET /api/users/profile - get current user profile with progress
  if (method === 'GET' && path === '/profile') {
    const authError = await protect(req, res);
    if (authError) return authError;

    const user = await User.findById(req.user._id)
      .select('-password -verificationOTP -passwordResetOTP');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrollments = await Enrollment.find({
      student: user._id,
      status: 'approved'
    }).populate({
      path: 'course',
      populate: { path: 'createdBy', select: 'name' }
    });

    const coursesWithProgress = enrollments.map(enrollment => {
      const course = enrollment.course;
      if (!course) return null;

      const totalVideos = course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0);
      const watchedCount = enrollment.watchedVideos.length;
      const progress = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

      return {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        progress,
        totalVideos,
        watchedVideos: watchedCount,
        enrolledAt: enrollment.createdAt
      };
    }).filter(Boolean);

    return res.json({
      user,
      enrolledCourses: coursesWithProgress
    });
  }

  // GET /api/admin/tracking - get all courses with student progress
  if (method === 'GET' && path === '/tracking') {
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    const courses = await Course.find({ isPublished: true })
      .select('title description category enrolledStudents')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const enrollments = await Enrollment.find({
        course: course._id,
        status: 'approved'
      });

      let totalWatched = 0;
      enrollments.forEach(e => {
        totalWatched += e.watchedVideos.length;
      });

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        createdBy: course.createdBy,
        totalStudents: course.enrolledStudents?.length || 0,
        totalWatchedVideos: totalWatched,
        avgWatchedPerStudent: course.enrolledStudents?.length > 0 
          ? Math.round(totalWatched / course.enrolledStudents.length) 
          : 0
      };
    }));

    return res.json(coursesWithStats);
  }

  // GET /api/admin/tracking/:courseId - get students progress for specific course
  if (method === 'GET' && trackingCourseMatch && !path.includes('/student/')) {
    const courseId = trackingCourseMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    const course = await Course.findById(courseId)
      .populate('createdBy', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollments = await Enrollment.find({
      course: courseId,
      status: 'approved'
    }).populate('student', 'name email');

    const totalVideos = course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0);

    let totalWatchTime = 0;
    const studentsWithProgress = enrollments.map(enrollment => {
      const watchedCount = enrollment.watchedVideos.length;
      totalWatchTime += watchedCount;
      const progress = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

      return {
        studentId: enrollment.student._id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        watchedVideos: watchedCount,
        totalVideos,
        progress,
        lastWatched: enrollment.watchedVideos.length > 0 
          ? enrollment.watchedVideos[enrollment.watchedVideos.length - 1].watchedAt 
          : null
      };
    });

    const avgWatchTime = enrollments.length > 0 
      ? Math.round(totalWatchTime / enrollments.length) 
      : 0;

    return res.json({
      course: {
        _id: course._id,
        title: course.title,
        totalVideos,
        totalStudents: enrollments.length
      },
      avgWatchTime,
      students: studentsWithProgress
    });
  }

  // GET /api/admin/tracking/:courseId/student/:studentId - get specific student's progress
  if (method === 'GET' && trackingStudentMatch) {
    const courseId = trackingStudentMatch[1];
    const studentId = trackingStudentMatch[2];
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await User.findById(studentId).select('name email');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
      status: 'approved'
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Calculate daily watch time
    const dailyWatchTime = {};
    enrollment.watchedVideos.forEach(v => {
      const date = new Date(v.watchedAt).toISOString().split('T')[0];
      dailyWatchTime[date] = (dailyWatchTime[date] || 0) + 1;
    });

    // Format for graph
    const graphData = Object.entries(dailyWatchTime)
      .map(([date, count]) => ({ date, watched: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get video details
    const videoDetails = {};
    course.chapters.forEach(ch => {
      ch.videos.forEach(v => {
        videoDetails[v._id.toString()] = {
          title: v.title,
          chapterTitle: ch.title
        };
      });
    });

    const watchedVideos = enrollment.watchedVideos.map(w => ({
      videoId: w.videoId,
      title: videoDetails[w.videoId]?.title || 'Unknown',
      chapterTitle: videoDetails[w.videoId]?.chapterTitle || 'Unknown',
      watchedAt: w.watchedAt
    }));

    const totalVideos = course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0);
    const progress = totalVideos > 0 ? Math.round((enrollment.watchedVideos.length / totalVideos) * 100) : 0;

    return res.json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      },
      course: {
        _id: course._id,
        title: course.title
      },
      progress: {
        watchedVideos: enrollment.watchedVideos.length,
        totalVideos,
        percentage: progress
      },
      graphData,
      watchedVideosList: watchedVideos
    });
  }

  // GET /api/users/:id - get specific user
  if (method === 'GET' && userIdMatch) {
    const userId = userIdMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    const user = await User.findById(userId)
      .select('-password -verificationOTP -passwordResetOTP');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  }

  return res.status(404).json({ message: 'Endpoint not found: ' + path });
}
