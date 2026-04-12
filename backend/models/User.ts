import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true },
  designation: { type: String },
  currentYear: { type: Number },
  year: { type: Number },
  role: { 
    type: String, 
    enum: ['admin', 'captain', 'viceCaptain', 'member'], 
    default: 'member' 
  },
  gender: { type: String, enum: ['boys', 'girls', 'Boys', 'Girls'], required: true },
  isInducted: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  avatar: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash((this as any).password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
