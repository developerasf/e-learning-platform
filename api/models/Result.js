import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examTitle: {
    type: String,
    required: true,
    trim: true
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

resultSchema.index({ course: 1, student: 1, examTitle: 1 }, { unique: true });
resultSchema.index({ course: 1 });
resultSchema.index({ student: 1 });

export default mongoose.model('Result', resultSchema);
