import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import History from '../models/historyModel.js';

const generateToken = (id, rememberMe) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: rememberMe ? '7d' : '1d'
  });
};

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      verificationToken
    });
    await History.create({
      userId: user._id,
      userName: user.name,
      type: 'activity',
      title: 'Account Registration',
      details: `User registered with email ${email}`,
      status: 'Success',
      severity: 'Info'
    });
    res.status(201).json({
      message: 'Registration successful. Verification token generated.',
      verificationToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await History.create({
        userId: user._id,
        userName: user.name,
        type: 'login',
        title: 'Failed Login Attempt',
        details: `Failed login attempt for email ${email}`,
        status: 'Failed',
        severity: 'Warning'
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id, rememberMe);
    await History.create({
      userId: user._id,
      userName: user.name,
      type: 'login',
      title: 'Successful Login',
      details: `Logged in from IP`,
      status: 'Success',
      severity: 'Info'
    });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profilePicture: user.profilePicture,
        role: user.role,
        isVerified: user.isVerified,
        theme: user.theme,
        language: user.language,
        notificationsEnabled: user.notificationsEnabled,
        privacyEnabled: user.privacyEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token required' });
  }
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationToken: ''
    });
    await History.create({
      userId: user._id,
      userName: user.name,
      type: 'activity',
      title: 'Email Verified',
      details: 'Email verification completed',
      status: 'Success',
      severity: 'Info'
    });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    const resetToken = Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000);
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires
    });
    res.json({
      message: 'Reset token generated successfully',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password required' });
  }
  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ message: 'Reset token expired' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: '',
      resetPasswordExpires: null
    });
    await History.create({
      userId: user._id,
      userName: user.name,
      type: 'activity',
      title: 'Password Reset',
      details: 'Password was reset via verification token',
      status: 'Success',
      severity: 'Warning'
    });
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password required' });
  }
  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    await History.create({
      userId: user._id,
      userName: user.name,
      type: 'activity',
      title: 'Password Changed',
      details: 'Password was manually updated from profile',
      status: 'Success',
      severity: 'Info'
    });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, bio, theme, language, notificationsEnabled, privacyEnabled } = req.body;
  try {
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;
    if (theme !== undefined) updateFields.theme = theme;
    if (language !== undefined) updateFields.language = language;
    if (notificationsEnabled !== undefined) updateFields.notificationsEnabled = notificationsEnabled;
    if (privacyEnabled !== undefined) updateFields.privacyEnabled = privacyEnabled;
    
    if (req.file) {
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true });
    await History.create({
      userId: req.user._id,
      userName: updatedUser.name,
      type: 'activity',
      title: 'Profile Updated',
      details: 'Profile settings updated',
      status: 'Success',
      severity: 'Info'
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
