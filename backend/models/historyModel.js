import mongoose from 'mongoose';
import { isUsingJsonDb } from '../config/db.js';
import { getCollection } from '../config/jsonDb.js';

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, default: 'Success' },
  severity: { type: String, default: 'Info' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const HistoryModelProxy = new Proxy({}, {
  get(target, prop) {
    const model = isUsingJsonDb()
      ? getCollection('history')
      : (mongoose.models.History || mongoose.model('History', historySchema));
    return model[prop];
  }
});

export default HistoryModelProxy;
