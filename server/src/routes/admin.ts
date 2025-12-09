import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = Router();

// Get all orders for CRM (admin only)
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 10000 }),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
], auth, async (req: Request, res: Response, next: NextFunction) => {
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

// Get all customers for CRM (admin only)
router.get('/customers', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().isString(),
], auth, async (req: Request, res: Response, next: NextFunction) => {
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

// Get customer by ID
router.get('/customers/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
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

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Import Product model
    const { Product } = await import('../models/Product');
    
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      pendingOrders,
      recentOrders,
      topProducts
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ status: 'PENDING' }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.productId', 'name')
        .lean(),
      Product.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalCustomers,
          totalProducts,
          totalRevenue: revenue,
          pendingOrders,
          recentOrders,
          topProducts
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
