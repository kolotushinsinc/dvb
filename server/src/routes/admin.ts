import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { auth } from '../middleware/auth';

const router = Router();

// Middleware to check if user is admin
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req.user as any).isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get all users (admin only) - for managers page
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('isAdmin').optional().isBoolean(),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;
    const isAdmin = req.query.isAdmin as string;

    const where: Record<string, any> = {
      $or: [
        { isAdmin: true },
        { isManager: true }
      ]
    };
    
    if (search) {
      where.$and = [
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isAdmin !== undefined) {
      where.isAdmin = isAdmin === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(where)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(where)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('isAdmin').optional().isBoolean(),
  body('isManager').optional().isBoolean(),
  body('isClient').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, isAdmin, isManager, isClient, isActive } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      isAdmin: isAdmin || false,
      isManager: isManager || false,
      isClient: isClient !== undefined ? isClient : true,
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    const userResponse = await User.findById(user._id).select('-password').lean();

    res.status(201).json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/users/:id', [
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('isAdmin').optional().isBoolean(),
  body('isManager').optional().isBoolean(),
  body('isClient').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { email, password, firstName, lastName, phone, isAdmin, isManager, isClient, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (email) user.email = email;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isManager !== undefined) user.isManager = isManager;
    if (isClient !== undefined) user.isClient = isClient;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = await User.findById(user._id).select('-password').lean();

    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting yourself
    const userId = (req.user as any).userId;
    const userIdStr = user._id ? user._id.toString() : '';
    if (userIdStr === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete yourself'
      });
    }

    // Prevent deleting superadmin
    if (user.email === 'admin@dvberry.com') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete superadmin'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get all customers (admin only)
router.get('/customers', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: Record<string, any> = {
      isAdmin: { $ne: true },
      isManager: { $ne: true }
    };
    
    if (search) {
      where.$and = [
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(where)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(where)
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single customer by ID (admin only)
router.get('/customers/:id', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id).select('-password').lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { user: customer }
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin only)
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: Record<string, any> = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      Order.find(where)
        .populate({
          path: 'userId',
          select: 'firstName lastName email'
        })
        .populate({
          path: 'items.productId',
          populate: {
            path: 'categoryId',
            select: 'name slug'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(where)
    ]);

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: {
          ...item.productId,
          mainImage: item.productId.images?.find((img: any) => img.isMain)?.url || null,
          images: undefined
        }
      }))
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update order status (admin only)
router.put('/orders/:id/status', [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
], auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.status = status;
    
    // Update timestamps based on status
    if (status === 'SHIPPED' && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (status === 'DELIVERED' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Populate the order data
    await order.populate({
      path: 'userId',
      select: 'firstName lastName email'
    });

    await order.populate({
      path: 'items.productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    const orderObj = order.toObject() as any;

    const formattedOrder = {
      ...orderObj,
      items: orderObj.items.map((item: any) => ({
        ...item,
        product: {
          ...item.productId,
          mainImage: item.productId.images?.find((img: any) => img.isMain)?.url || null,
          images: undefined
        }
      }))
    };

    res.json({
      success: true,
      data: { order: formattedOrder }
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats (admin only)
router.get('/dashboard/stats', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total counts
    const [totalCustomers, totalOrders, totalProducts, totalCategories] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true })
    ]);

    // Calculate total revenue
    const orders = await Order.find({ 
      status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } 
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentOrders = recentOrders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: {
          ...item.productId,
          mainImage: item.productId.images?.find((img: any) => img.isMain)?.url || null,
          images: undefined
        }
      }))
    }));

    // Get top products by orders count
    const topProductsPipeline = [
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 0, product: 1, count: 1 } }
    ];

    const topProductsData = await Order.aggregate(topProductsPipeline as any);
    const topProducts = topProductsData.map((item: any) => ({
      ...item.product,
      mainImage: item.product.images?.find((img: any) => img.isMain)?.url || null,
      images: undefined,
      orderCount: item.count
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
          recentOrders: formattedRecentOrders,
          topProducts
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
