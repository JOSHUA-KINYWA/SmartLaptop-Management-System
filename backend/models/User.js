const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
  },
  resetPasswordCode: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');

// ✅ Hash password before saving (only if changed)
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const rawPassword = this.password;
      if (!isBcryptHash(rawPassword)) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(rawPassword, salt);
      }
    } catch (err) {
      return next(err);
    }
  }

  if (this.isModified('resetPasswordCode') && this.resetPasswordCode) {
    try {
      const rawCode = this.resetPasswordCode;
      if (!isBcryptHash(rawCode)) {
        const salt = await bcrypt.genSalt(8);
        this.resetPasswordCode = await bcrypt.hash(rawCode, salt);
      }
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// ✅ Password comparison method (for login)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  if (isBcryptHash(this.password)) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  if (this.password === candidatePassword) {
    this.password = candidatePassword;
    await this.save();
    return true;
  }

  return false;
};

UserSchema.methods.compareResetCode = async function (candidateCode) {
  if (!candidateCode || !this.resetPasswordCode || !this.resetPasswordExpires) {
    return false;
  }

  if (Date.now() > new Date(this.resetPasswordExpires).getTime()) {
    return false;
  }

  if (isBcryptHash(this.resetPasswordCode)) {
    return await bcrypt.compare(candidateCode, this.resetPasswordCode);
  }

  if (this.resetPasswordCode === candidateCode) {
    this.resetPasswordCode = candidateCode;
    await this.save();
    return true;
  }

  return false;
};

module.exports = mongoose.model('User', UserSchema);
