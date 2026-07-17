import History from '../models/historyModel.js';

export const getUserHistory = async (req, res) => {
  const { showDeleted } = req.query;
  const isDeletedFilter = showDeleted === 'true';
  try {
    const query = { isDeleted: isDeletedFilter };
    if (req.user.role !== 'Admin') {
      query.userId = req.user._id;
    }
    const history = await History.find(query);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteHistoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await History.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'History item not found' });
    }
    if (req.user.role !== 'Admin' && item.userId !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await History.findByIdAndUpdate(id, { isDeleted: true });
    res.json({ message: 'Item moved to trash' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const restoreHistoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await History.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'History item not found' });
    }
    if (req.user.role !== 'Admin' && item.userId !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await History.findByIdAndUpdate(id, { isDeleted: false });
    res.json({ message: 'Item restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const permanentDeleteHistoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await History.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'History item not found' });
    }
    if (req.user.role !== 'Admin' && item.userId !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await History.findByIdAndDelete(id);
    res.json({ message: 'Item permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
