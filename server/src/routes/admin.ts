import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
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

    const where: Record<string, any> = {};
    
    if (search) {
      where.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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