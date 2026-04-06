import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  youtubeUrl: {
    type: String,
    required: true
  },
  youtubeId: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  notes: [{
    title: {
      type: String,
      default: 'Notes'
    },
    url: {
      type: String,
      default: ''
    }
  }],
  videos: [videoSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['default', 'latest', 'popular'],
    default: 'default'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapters: [chapterSchema],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

courseSchema.index({ isPublished: 1, category: 1, createdAt: -1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ category: 1 });

export default mongoose.model('Course', courseSchema);
