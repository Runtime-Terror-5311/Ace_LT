import mongoose from 'mongoose';

const inductedMemberSchema = new mongoose.Schema({
  email: { type: String, lowercase: true },
  name: { type: String },
  phone: { type: String },
  regNo: { type: String, required: true, unique: true },
  isInducted: { type: Boolean, default: true }
}, { timestamps: true });

export const InductedMember = mongoose.model('InductedMember', inductedMemberSchema);
