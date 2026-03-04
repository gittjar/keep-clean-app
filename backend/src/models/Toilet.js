import mongoose from 'mongoose';

const cleaningEntrySchema = new mongoose.Schema(
  {
    cleanedAt: { type: Date, default: Date.now },
    cleanedBy: { type: String, required: true },
  },
  { _id: false }
);

const toiletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    toiletId: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    cleaningLog: { type: [cleaningEntrySchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

toiletSchema.virtual('lastCleaned').get(function () {
  if (this.cleaningLog.length === 0) return this.createdAt;
  return this.cleaningLog[this.cleaningLog.length - 1].cleanedAt;
});

export default mongoose.model('Toilet', toiletSchema);
