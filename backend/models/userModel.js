import mongoose from 'mongoose';
import { isUsingJsonDb } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  role: { type: String, enum: ['Admin', 'Student'], default: 'Student' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date, default: null },
  theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  language: { type: String, default: 'en' },
  notificationsEnabled: { type: Boolean, default: true },
  privacyEnabled: { type: Boolean, default: false }
}, { timestamps: true });

const UserModelProxy = new Proxy({}, {
  get(target, prop) {
    const model = isUsingJsonDb()
      ? getCollection('users')
      : (mongoose.models.User || mongoose.model('User', userSchema));
    return model[prop];
  }
});

export default UserModelProxy;
