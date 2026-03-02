import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
const bcrypt = bcryptjs;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    minlength: 4,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hajautetaan PIN ennen tallennusta
userSchema.pre('save', async function () {
  if (!this.isModified('pin')) return;
  this.pin = await bcrypt.hash(this.pin, 10);
});

// Vertaa syötettyä PIN-koodia hajautettuun
userSchema.methods.comparePin = async function (inputPin) {
  return bcrypt.compare(inputPin, this.pin);
};

export default mongoose.model('User', userSchema);
