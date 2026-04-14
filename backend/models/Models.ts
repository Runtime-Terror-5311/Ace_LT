import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  type: { type: String, required: true },
  category: { type: String, enum: ['Singles', 'Doubles'], default: 'Singles' },
  court: { type: String },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player1Name: { type: String, required: true },
  player1bId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player1bName: { type: String },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  player2Name: { type: String, required: true },
  player2bId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player2bName: { type: String },
  score1: { type: String, default: '0' },
  score2: { type: String, default: '0' },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tossWinner: { type: String },
  tossChoice: { type: String, enum: ['serve', 'side'] },
  gameHistory: [{
    gameNumber: Number,
    serverInitials: String,
    score: String
  }],
  scheduledAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  isNormalMatch: { type: Boolean, default: false }
}, { timestamps: true });

export const Match = mongoose.model('Match', matchSchema);

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }
}, { timestamps: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);

const financialLogSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  source: { type: String, enum: ['Alumni', 'College', 'Member', 'Other'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const FinancialLog = mongoose.model('FinancialLog', financialLogSchema);

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  urgent: { type: Boolean, default: false }
}, { timestamps: true });

export const Announcement = mongoose.model('Announcement', announcementSchema);

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  contact: { type: String, required: true },
  imageUrl: { type: String, required: true },
  batch: { type: String, required: true }
}, { timestamps: true });

export const Alumni = mongoose.model('Alumni', alumniSchema);

const equipmentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  itemId: { type: String, required: true },
  itemDescription: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export const EquipmentRequest = mongoose.model('EquipmentRequest', equipmentRequestSchema);

const calendarEventSchema = new mongoose.Schema({
  event: { type: String, required: true },
  dateString: { type: String, required: true },
  time: { type: String, required: true },
  court: { type: String, required: true },
  dayOfMonth: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true }
}, { timestamps: true });

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  presentCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  submittedBy: { type: String, required: true },
  lastEditedBy: { type: String },
  supervisors: [String],
  statuses: { type: Map, of: Boolean, required: true }
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);

