import { Router, Request } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { AuditLog } from '../models/AuditLog';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

// Helper function to log audit
async function logAudit(
  userId: string,
  userName: string,
  action: 'create' | 'update' | 'delete',
  entityType: 'user' | 'role' | 'permission',
  entityId: string,
  entityName: string,
  changes?: any[],
  req?: Request
) {
  await AuditLog.create({
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityName,
    changes,
    ipAddress: req?.ip,
    userAgent: req?.get('user-agent')
  });
}

// Get all users with filters
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { search, role, isActive, page = 1, limit = 10 } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('role', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, isAdmin, isActive } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      isAdmin: isAdmin || false,
      isActive: isActive !== undefined ? isActive : true
    });

    // Log audit
    await logAudit(
      (req as any).user._id,
      `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      'create',
      'user',
      user._id.toString(),
      email,
      undefined,
      req
    );

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('role');

    res.status(201).json(userResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, isAdmin, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const changes: any[] = [];

    // Track changes
    if (email && email !== user.email) {
      changes.push({ field: 'email', oldValue: user.email, newValue: email });
      user.email = email;
    }
    if (firstName && firstName !== user.firstName) {
      changes.push({ field: 'firstName', oldValue: user.firstName, newValue: firstName });
      user.firstName = firstName;
    }
    if (lastName && lastName !== user.lastName) {
      changes.push({ field: 'lastName', oldValue: user.lastName, newValue: lastName });
      user.lastName = lastName;
    }
    if (phone && phone !== user.phone) {
      changes.push({ field: 'phone', oldValue: user.phone, newValue: phone });
      user.phone = phone;
    }
    if (role && role !== user.role?.toString()) {
      changes.push({ field: 'role', oldValue: user.role?.toString(), newValue: role });
      user.role = role;
    }
    if (isAdmin !== undefined && isAdmin !== user.isAdmin) {
      changes.push({ field: 'isAdmin', oldValue: user.isAdmin, newValue: isAdmin });
      user.isAdmin = isAdmin;
    }
    if (isActive !== undefined && isActive !== user.isActive) {
      changes.push({ field: 'isActive', oldValue: user.isActive, newValue: isActive });
      user.isActive = isActive;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      changes.push({ field: 'password', oldValue: '***', newValue: '***' });
      user.password = hashedPassword;
    }

    await user.save();

    // Log audit
    if (changes.length > 0) {
      await logAudit(
        (req as any).user._id,
        `${(req as any).user.firstName} ${(req as any).user.lastName}`,
        'update',
        'user',
        user._id.toString(),
        user.email,
        changes,
        req
      );
    }

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('role');

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === (req as any).user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log audit
    await logAudit(
      (req as any).user._id,
      `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      'delete',
      'user',
      user._id.toString(),
      user.email,
      undefined,
      req
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
