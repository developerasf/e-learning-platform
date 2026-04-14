import User from './_models/User.js';
import Course from './_models/Course.js';
import Enrollment from './_models/Enrollment.js';
import Attendance from './_models/Attendance.js';
import Result from './_models/Result.js';
import Payment from './_models/Payment.js';
import { protect, admin } from './_middleware/auth.js';
import connectDB from './_lib/db.js';

const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  if (path.startsWith('/api/users')) {
    path = path.substring(10);
  }
  return path || '/';
};

export default async function handler(req, res) {
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    return res.status(413).json({ message: 'Request too large' });
  }
  
  try {
    await connectDB();
  } catch (error) {
    console.error('DB Error:', error.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { method } = req;
  const path = getPath(req.url);

  try {
    const userIdMatch = path && path.match(/^\/([^/]+)$/);
    const trackingCourseMatch = path && path.match(/^\/tracking\/([^/]+)$/);
    const trackingStudentMatch = path && path.match(/^\/tracking\/([^/]+)\/student\/([^/]+)$/);

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

    if (method === 'GET' && path === '/profile') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const user = await User.findById(req.user._id)
        .select('-password -verificationOTP -passwordResetOTP -enrolledCourses');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const enrollments = await Enrollment.find({
        student: user._id,
        status: 'approved'
      }).populate({
        path: 'course',
        select: 'title description thumbnail createdBy chapters',
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

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const attendanceRecords = await Attendance.find({
        student: user._id,
        date: { $gte: monthStart, $lt: monthEnd }
      }).populate('course', 'title');

      const attendanceMap = {};
      attendanceRecords.forEach(r => {
        if (!r.course) return; // Prevent crash if course was deleted
        const key = r.course._id.toString();
        if (!attendanceMap[key]) {
          attendanceMap[key] = { courseId: r.course._id, courseName: r.course.title, present: 0, absent: 0, total: 0 };
        }
        attendanceMap[key].total++;
        if (r.status === 'present') attendanceMap[key].present++;
        if (r.status === 'absent') attendanceMap[key].absent++;
      });

      const attendanceSummary = Object.values(attendanceMap);

      const results = await Result.find({ student: user._id })
        .populate('course', 'title')
        .sort('-createdAt');

      const resultsGrouped = {};
      results.forEach(r => {
        if (!r.course) return; // Prevent crash if course was deleted
        const key = r.course._id.toString();
        if (!resultsGrouped[key]) {
          resultsGrouped[key] = { courseId: r.course._id, courseName: r.course.title, exams: [] };
        }
        resultsGrouped[key].exams.push({
          _id: r._id,
          examTitle: r.examTitle,
          obtainedMarks: r.obtainedMarks,
          totalMarks: r.totalMarks,
          percentage: Math.round((r.obtainedMarks / r.totalMarks) * 100),
          publishedAt: r.createdAt
        });
      });

      const resultsSummary = Object.values(resultsGrouped);

      // Fetch last month's payment status
      const currentDate = new Date();
      let lastMonth = currentDate.getMonth(); // 0-based month equals 1-based previous month
      let lastYear = currentDate.getFullYear();
      if (lastMonth === 0) {
        lastMonth = 12;
        lastYear -= 1;
      }
      
      const lastMonthPaymentRec = await Payment.findOne({
        student: user._id,
        month: lastMonth,
        year: lastYear
      });

      const paymentStatus = lastMonthPaymentRec ? lastMonthPaymentRec.status : 'unpaid';

      return res.json({
        user,
        enrolledCourses: coursesWithProgress,
        attendanceSummary,
        resultsSummary,
        lastMonthPayment: {
          status: paymentStatus,
          month: lastMonth,
          year: lastYear
        }
      });
    }

    if (method === 'GET' && path === '/tracking') {
      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const courses = await Course.find({ isPublished: true })
        .select('title description category enrolledStudents')
        .populate('createdBy', 'name')
        .sort('-createdAt');

      const courseIds = courses.map(c => c._id);
      const enrollments = await Enrollment.find({
        course: { $in: courseIds },
        status: 'approved'
      }).populate('student', 'role');

      const enrollmentByCourse = enrollments.reduce((acc, e) => {
        if (e.student && e.student.role === 'admin') return acc;
        const key = e.course.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(e);
        return acc;
      }, {});

      const coursesWithStats = courses.map(course => {
        const courseEnrollments = enrollmentByCourse[course._id.toString()] || [];
        const totalWatched = courseEnrollments.reduce((sum, e) => sum + e.watchedVideos.length, 0);
        
        const allVideoRatings = courseEnrollments.flatMap(e => e.videoRatings || []);
        const avgRating = allVideoRatings.length > 0 
          ? (allVideoRatings.reduce((acc, r) => acc + r.rating, 0) / allVideoRatings.length).toFixed(1)
          : 0;

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          createdBy: course.createdBy,
          totalStudents: courseEnrollments.length,
          totalWatchedVideos: totalWatched,
          avgWatchedPerStudent: courseEnrollments.length > 0 
            ? Math.round(totalWatched / courseEnrollments.length) 
            : 0,
          averageRating: parseFloat(avgRating),
          totalRatings: allVideoRatings.length
        };
      });

      return res.json(coursesWithStats);
    }

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
      }).populate('student', 'name email role');

      const totalVideos = course.chapters.reduce((acc, ch) => acc + ch.videos.length, 0);

      let totalWatchTime = 0;
      const studentsWithProgress = enrollments
        .filter(e => e.student.role !== 'admin')
        .map(enrollment => {
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

      const avgWatchTime = studentsWithProgress.length > 0 
        ? Math.round(totalWatchTime / studentsWithProgress.length) 
        : 0;

      return res.json({
        course: {
          _id: course._id,
          title: course.title,
          totalVideos,
          totalStudents: studentsWithProgress.length
        },
        avgWatchTime,
        students: studentsWithProgress
      });
    }

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

      const dailyWatchTime = {};
      enrollment.watchedVideos.forEach(v => {
        const date = new Date(v.watchedAt).toISOString().split('T')[0];
        dailyWatchTime[date] = (dailyWatchTime[date] || 0) + 1;
      });

      const graphData = Object.entries(dailyWatchTime)
        .map(([date, count]) => ({ date, watched: count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

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
  } catch (error) {
    console.error('Handler error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
