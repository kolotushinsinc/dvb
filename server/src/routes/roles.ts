import { Router, Request } from 'express';
import { Role } from '../models/Role';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { adminAuth } from '../middleware/auth';

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

// Get all roles
router.get('/', adminAuth, async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single role
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create new role
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    const role = await Role.create({
      name,
      description,
      permissions,
      createdBy: req.user?.userId,
      updatedBy: req.user?.userId
    });

    // Log audit
    await logAudit(
      req.user!.userId,
      `${currentUser.firstName} ${currentUser.lastName}`,
      'create',
      'role',
      role._id.toString(),
      name,
      undefined,
      req
    );

    const roleResponse = await Role.findById(role._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    res.status(201).json(roleResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update role
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent editing system roles
    if (role.isSystem) {
      return res.status(400).json({ message: 'Cannot edit system roles' });
    }

    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    const changes: any[] = [];

    // Track changes
    if (name && name !== role.name) {
      changes.push({ field: 'name', oldValue: role.name, newValue: name });
      role.name = name;
    }
    if (description !== undefined && description !== role.description) {
      changes.push({ field: 'description', oldValue: role.description, newValue: description });
      role.description = description;
    }
    if (permissions) {
      changes.push({ 
        field: 'permissions', 
        oldValue: JSON.stringify(role.permissions), 
        newValue: JSON.stringify(permissions) 
      });
      role.permissions = permissions;
    }

    role.updatedBy = req.user?.userId as any;
    await role.save();

    // Log audit
    if (changes.length > 0) {
      await logAudit(
        req.user!.userId,
        `${currentUser.firstName} ${currentUser.lastName}`,
        'update',
        'role',
        role._id.toString(),
        role.name,
        changes,
        req
      );
    }

    const updatedRole = await Role.findById(role._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    res.json(updatedRole);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete role
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }

    // Check if any users have this role
    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role.` 
      });
    }

    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    await Role.findByIdAndDelete(req.params.id);

    // Log audit
    await logAudit(
      req.user!.userId,
      `${currentUser.firstName} ${currentUser.lastName}`,
      'delete',
      'role',
      role._id.toString(),
      role.name,
      undefined,
      req
    );

    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
