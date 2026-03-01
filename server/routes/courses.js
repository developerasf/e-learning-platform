const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let courses = [];
    
    if (!user) {
      return res.json([]);
    }

    const enrollments = await Enrollment.find({ 
      student: req.user._id, 
      status: 'approved' 
    }).populate({
      path: 'course',
      populate: {
        path: 'createdBy',
        select: 'name'
      }
    });
    
    if (enrollments.length > 0) {
      courses = enrollments.map(e => e.course).filter(c => c);
    }
    
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      const legacyCourses = await Course.find({ _id: { $in: user.enrolledCourses } })
        .populate('createdBy', 'name');
      
      const existingIds = courses.map(c => c?._id?.toString()).filter(Boolean);
      legacyCourses.forEach(c => {
        if (c && !existingIds.includes(c._id.toString())) {
          courses.push(c);
        }
      });
    }
    
    res.json(courses.filter(c => c));
  } catch (error) {
    console.error('my-courses error:', error);
    res.status(500).json({ message: error.message, courses: [] });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    });
    
    if (existingEnrollment) {
      if (existingEnrollment.status === 'approved') {
        return res.status(400).json({ message: 'Already enrolled' });
      } else if (existingEnrollment.status === 'pending') {
        return res.status(400).json({ message: 'Enrollment request already pending' });
      } else if (existingEnrollment.status === 'rejected') {
        existingEnrollment.status = 'pending';
        await existingEnrollment.save();
        return res.json({ message: 'Enrollment request submitted' });
      }
    }
    
    await Enrollment.create({
      student: req.user._id,
      course: req.params.id,
      status: 'pending'
    });
    
    res.json({ message: 'Enrollment request sent. Waiting for admin approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, thumbnail, price } = req.body;
    
    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnail || '',
      price: price || 0,
      createdBy: req.user._id,
      chapters: []
    });
    
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, thumbnail, price, isPublished } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.title = title || course.title;
    course.description = description || course.description;
    course.thumbnail = thumbnail || course.thumbnail;
    course.price = price || course.price;
    course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/chapters', protect, admin, async (req, res) => {
  try {
    const { title, order } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.chapters.push({
      title,
      order: order || course.chapters.length,
      videos: []
    });
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/chapters/:chapterId', protect, admin, async (req, res) => {
  try {
    const { title, order } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(req.params.chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    chapter.title = title || chapter.title;
    chapter.order = order !== undefined ? order : chapter.order;
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/chapters/:chapterId', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.chapters.pull(req.params.chapterId);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/chapters/:chapterId/videos', protect, admin, async (req, res) => {
  try {
    const { title, youtubeUrl, duration } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(req.params.chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    chapter.videos.push({
      title,
      youtubeUrl,
      youtubeId,
      duration: duration || 0,
      order: chapter.videos.length
    });
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/chapters/:chapterId/videos/:videoId', protect, admin, async (req, res) => {
  try {
    const { title, youtubeUrl, duration, order } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(req.params.chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const video = chapter.videos.id(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    video.title = title || video.title;
    if (youtubeUrl) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (youtubeId) {
        video.youtubeUrl = youtubeUrl;
        video.youtubeId = youtubeId;
      }
    }
    video.duration = duration !== undefined ? duration : video.duration;
    video.order = order !== undefined ? order : video.order;
    
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/chapters/:chapterId/videos/:videoId', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(req.params.chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    chapter.videos.pull(req.params.videoId);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('createdBy', 'name')
      .populate('enrolledStudents', 'name email')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/students', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email createdAt');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course.enrolledStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/students', protect, admin, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }
    
    course.enrolledStudents.push(studentId);
    await course.save();
    
    if (!student.enrolledCourses.includes(course._id)) {
      student.enrolledCourses.push(course._id);
      await student.save();
    }
    
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/students', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email createdAt');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const enrollments = await Enrollment.find({ course: req.params.id, status: 'approved' })
      .populate('student', 'name email createdAt');
    
    res.json(enrollments.map(e => e.student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/enrollments/pending', protect, admin, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'pending' })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/enrollments/:enrollmentId/approve', protect, admin, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }
    
    if (enrollment.course.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Course mismatch' });
    }
    
    enrollment.status = 'approved';
    await enrollment.save();
    
    const student = await User.findById(enrollment.student);
    if (!student.enrolledCourses.includes(enrollment.course)) {
      student.enrolledCourses.push(enrollment.course);
      await student.save();
    }
    
    res.json({ message: 'Enrollment approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/enrollments/:enrollmentId/reject', protect, admin, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }
    
    if (enrollment.course.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Course mismatch' });
    }
    
    enrollment.status = 'rejected';
    await enrollment.save();
    
    res.json({ message: 'Enrollment rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/students/:studentId', protect, admin, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      course: req.params.id,
      student: req.params.studentId,
      status: 'approved'
    });
    
    if (enrollment) {
      enrollment.status = 'rejected';
      await enrollment.save();
    }
    
    const student = await User.findById(req.params.studentId);
    if (student) {
      student.enrolledCourses.pull(req.params.id);
      await student.save();
    }
    
    res.json({ message: 'Student removed from course' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/students', protect, admin, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    let enrollment = await Enrollment.findOne({ student: studentId, course: req.params.id });
    
    if (enrollment) {
      enrollment.status = 'approved';
      await enrollment.save();
    } else {
      await Enrollment.create({
        student: studentId,
        course: req.params.id,
        status: 'approved'
      });
    }
    
    if (!student.enrolledCourses.includes(course._id)) {
      student.enrolledCourses.push(course._id);
      await student.save();
    }
    
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
