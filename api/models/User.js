import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const constantTimeEqual = (a, b) => {
  if (typeof a === 'string') a = Buffer.from(a);
  if (typeof b === 'string') b = Buffer.from(b);
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) return false;
  if (a.length !== b.length) return false;
  return Buffer.compare(a, b) === 0;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    code: String,
    expiresAt: Date
  },
  passwordResetOTP: {
    code: String,
    expiresAt: Date
  },
  googleId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ createdAt: -1 });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOTP = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  return otp;
};

userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  return otp;
};

userSchema.methods.verifyOTP = function(otp, type = 'verification') {
  const otpField = type === 'verification' ? 'verificationOTP' : 'passwordResetOTP';
  const otpData = this[otpField];
  if (!otpData || !otpData.code || !otpData.expiresAt) {
    return false;
  }
  if (new Date() > otpData.expiresAt) {
    return false;
  }
  return constantTimeEqual(otpData.code, otp);
};

userSchema.methods.clearOTP = function(type = 'verification') {
  if (type === 'verification') {
    this.verificationOTP = undefined;
  } else {
    this.passwordResetOTP = undefined;
  }
};

export default mongoose.model('User', userSchema);
