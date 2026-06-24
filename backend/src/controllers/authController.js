const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const sendEmail = require('../utils/sendEmail');

// REGISTER — send OTP, account pending
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'staff',
        verifyOtp: otp,
        verifyOtpExpiry: expiry,
        isVerified: false,
        isApproved: false,
        approvalStatus: 'pending',
      },
    });

    await sendEmail(
      email,
      'VyaparSathi - Verify Your Email',
      `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #4f46e5;">VyaparSathi</h2>
        <p>Hello ${name},</p>
        <p>Your OTP to verify your email is:</p>
        <h1 style="letter-spacing: 4px; color: #111827;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>After verification, your account will be reviewed by an admin before you can login.</p>
      </div>`
    );

    res.status(201).json({
      message: 'Registration successful! Please verify your email with the OTP sent.',
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// VERIFY OTP — mark as verified, notify admin
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.verifyOtpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, verifyOtp: null, verifyOtpExpiry: null },
    });

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin', isActive: true },
    });

    for (const admin of admins) {
      await sendEmail(
        admin.email,
        'VyaparSathi - New User Awaiting Approval',
        `<div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #4f46e5;">VyaparSathi</h2>
          <p>Hello ${admin.name},</p>
          <p>A new user has verified their email and is waiting for your approval:</p>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Role:</strong> ${user.role}</li>
          </ul>
          <p>Please login to VyaparSathi and go to User Management to approve or reject this request.</p>
        </div>`
      );
    }

    res.status(200).json({
      message: 'Email verified successfully! Your account is pending admin approval.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiry: expiry },
    });

    await sendEmail(
      email,
      'VyaparSathi - Password Reset OTP',
      `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #4f46e5;">VyaparSathi</h2>
        <p>Your OTP to reset your password is:</p>
        <h1 style="letter-spacing: 4px; color: #111827;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>`
    );

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetOtp: null, resetOtpExpiry: null },
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, verifyOtp, forgotPassword, resetPassword };