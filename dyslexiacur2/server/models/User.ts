import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  age?: number;
  schoolName?: string;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'admin'],
    default: 'student',
  },
  age: {
    type: Number,
    min: [5, 'Age must be at least 5'],
    max: [100, 'Age must be less than 100'],
  },
  schoolName: {
    type: String,
    trim: true,
  },
  grade: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Remove password from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);
