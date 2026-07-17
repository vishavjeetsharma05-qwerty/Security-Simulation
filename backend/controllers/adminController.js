import User from '../models/userModel.js';
import History from '../models/historyModel.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSimulations = await History.countDocuments({ type: 'simulation' });
    const totalScans = await History.countDocuments({ type: 'scan' });
    const totalDefenses = await History.countDocuments({ type: 'defense' });
    const totalLogs = await History.countDocuments();

    const severityHigh = await History.countDocuments({ severity: 'High' });
    const severityCritical = await History.countDocuments({ severity: 'Critical' });
    const severityWarning = await History.countDocuments({ severity: 'Warning' });
    const severityInfo = await History.countDocuments({ severity: 'Info' });

    res.json({
      totalUsers,
      totalSimulations,
      totalScans,
      totalDefenses,
      totalLogs,
      severityAlerts: {
        high: severityHigh,
        critical: severityCritical,
        warning: severityWarning,
        info: severityInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  if (!role || !['Admin', 'Student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'activity',
      title: 'User Role Updated',
      details: `Updated role of user ${updatedUser.email} to ${role}`,
      status: 'Success',
      severity: 'Info'
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'activity',
      title: 'User Deleted',
      details: `Deleted user profile of: ${user.email}`,
      status: 'Success',
      severity: 'Warning'
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const logs = await History.find({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLogItem = async (req, res) => {
  const { logId } = req.params;
  try {
    const log = await History.findByIdAndDelete(logId);
    if (!log) {
      return res.status(404).json({ message: 'Log item not found' });
    }
    res.json({ message: 'Log item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
