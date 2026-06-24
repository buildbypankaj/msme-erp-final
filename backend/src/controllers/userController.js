const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const sendEmail = require('../utils/sendEmail');

// CREATE user (by admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        isApproved: true,
        approvalStatus: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE user (role / active status)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, role, isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// APPROVE or REJECT user
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isApproved = action === 'approve';
    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    const isActive = action === 'approve';

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isApproved, approvalStatus, isActive },
    });

    // Notify user via email
    await sendEmail(
      user.email,
      `VyaparSathi - Account ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #4f46e5;">VyaparSathi</h2>
        <p>Hello ${user.name},</p>
        ${action === 'approve'
          ? `<p style="color: #059669;">🎉 Your account has been <strong>approved</strong>! You can now login to VyaparSathi.</p>`
          : `<p style="color: #dc2626;">❌ Your account request has been <strong>rejected</strong>. Please contact admin for more information.</p>`
        }
      </div>`
    );

    res.status(200).json({ message: `User ${action}d successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser, approveUser };