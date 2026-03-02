import mongoose from 'mongoose';

const toiletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  toiletId: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastCleaned: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtuaalikenttä: aika siivottu (ms) - lasketaan reaaliajassa
toiletSchema.virtual('timeSinceCleaned').get(function () {
  return Date.now() - this.lastCleaned.getTime();
});

export default mongoose.model('Toilet', toiletSchema);
