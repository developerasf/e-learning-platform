import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'paid' // we only really store it if they are paid or explicitly toggled
  },
  paidDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a student can only have one payment record per month/year
paymentSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });
paymentSchema.index({ month: 1, year: 1 });

export default mongoose.model('Payment', paymentSchema);
