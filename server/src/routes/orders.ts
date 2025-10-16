import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Order, IOrder } from '../models/Order';
import { Product, IProduct } from '../models/Product';
import { CartItem } from '../models/CartItem';
import { auth } from '../middleware/auth';

const router = Router();

// Get user's orders
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const where: Record<string, any> = { userId: (req.user as any).userId };
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

    const formattedOrders = orders.map((order: IOrder & { items: any[] }) => ({
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

// Get single order by ID
router.get('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: (req.user as any).userId
    })
    .populate({
      path: 'items.productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    })
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const formattedOrder = {
      ...order,
      items: (order as IOrder & { items: any[] }).items.map((item: any) => ({
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

// Create new order (checkout)
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isString().notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('items.*.size').optional().isString(),
  body('items.*.color').optional().isString(),
  body('shippingAddress').isObject(),
  body('shippingAddress.firstName').notEmpty(),
  body('shippingAddress.lastName').notEmpty(),
  body('shippingAddress.address').notEmpty(),
  body('shippingAddress.city').notEmpty(),
  body('shippingAddress.zip').notEmpty(),
  body('shippingAddress.country').notEmpty(),
  body('customerEmail').isEmail(),
  body('customerPhone').optional().isMobilePhone('any'),
  body('paymentMethod').optional().isString(),
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

    const {
      items,
      shippingAddress,
      billingAddress,
      customerEmail,
      customerPhone,
      paymentMethod = 'card'
    } = req.body;

    // Generate order number
    const orderNumber = `DVB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderData = {
      orderNumber,
      userId: (req.user as any).userId,
      status: 'PENDING' as const,
      totalAmount,
      shippingCost: 0, // Free shipping
      taxAmount: 0,
      discountAmount: 0,
      customerEmail,
      customerPhone: customerPhone || null,
      shippingFirstName: shippingAddress.firstName,
      shippingLastName: shippingAddress.lastName,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state || null,
      shippingZip: shippingAddress.zip,
      shippingCountry: shippingAddress.country,
      billingFirstName: billingAddress?.firstName || shippingAddress.firstName,
      billingLastName: billingAddress?.lastName || shippingAddress.lastName,
      billingAddress: billingAddress?.address || shippingAddress.address,
      billingCity: billingAddress?.city || shippingAddress.city,
      billingState: billingAddress?.state || shippingAddress.state || null,
      billingZip: billingAddress?.zip || shippingAddress.zip,
      billingCountry: billingAddress?.country || shippingAddress.country,
      paymentMethod,
      paymentStatus: 'PENDING' as const,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        color: item.color || null,
      }))
    };

    const order = await Order.create(orderData);

    // Populate the product data
    await order.populate({
      path: 'items.productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    // Clear user's cart after successful order
    await CartItem.deleteMany({
      userId: (req.user as any).userId
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

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: formattedOrder }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId: (req.user as any).userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
});

export default router;