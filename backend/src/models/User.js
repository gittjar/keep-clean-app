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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  frozenUntil: {
    type: Date,
    default: null,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('pin')) return;
  this.pin = await bcrypt.hash(this.pin, 10);
});

userSchema.methods.comparePin = async function (inputPin) {
  return bcrypt.compare(inputPin, this.pin);
};

export default mongoose.model('User', userSchema);
