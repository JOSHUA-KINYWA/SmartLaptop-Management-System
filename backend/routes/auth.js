const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// ⚠️ Optional: fallback secret in dev
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;

  const trimmedEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  return emailPattern.test(trimmedEmail) && !trimmedEmail.toLowerCase().endsWith('@example.com');
};

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address. Placeholder addresses like example.com are not allowed.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: 'We could not find an account for this email. Please check the email address or create a new account.'
      });
    }

    const resetCode = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[PASSWORD RESET] Email: ${user.email} | Code: ${resetCode}`);

    try {
      if (global.emailService) {
        await global.emailService.sendPasswordResetEmail(user.email, {
          firstName: user.firstName,
          resetCode,
        });
      }
    } catch (emailError) {
      console.error('[FORGOT PASSWORD EMAIL ERROR]', emailError);
    }

    const response = {
      message: 'If an account exists for that email, a reset code has been sent.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetCode = resetCode;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Unable to process password reset request.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset request.' });
    }

    const validCode = await user.compareResetCode(code.toString());
    if (!validCode) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful. Please log in with your new password.'
    });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Unable to reset password.' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email,firstName,lastName, password, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, first name, last name and password are required.' });
     
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address. Placeholder addresses like example.com are not allowed.' });
    }

    // Normalize email and check if user exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create and save new user (password is hashed in model)
    user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: ['student', 'admin'].includes(role) ? role : 'student',
    });

    await user.save();

    // Generate JWT
    const payload = { id: user._id, role: user.role }; // <-- FIXED
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Normalize and find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password using schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { id: user._id, role: user.role }; // <-- FIXED
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;