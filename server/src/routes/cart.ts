import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { CartItem, ICartItem } from '../models/CartItem';
import { Product, IProduct } from '../models/Product';
import { auth } from '../middleware/auth';

const router = Router();

// Get user's cart items
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartItems = await CartItem.find({ userId: (req.user as any).userId })
      .populate({
        path: 'productId',
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      })
      .lean();

    const formattedCartItems = cartItems.map((item: any) => ({
      id: item._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      product: {
        ...item.productId,
        mainImage: item.productId.images?.find((img: any) => img.isMain)?.url || null,
        images: undefined
      }
    }));

    // Calculate totals
    const totalItems = cartItems.length;
    const totalQuantity = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum: number, item: any) => sum + (item.productId.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        items: formattedCartItems,
        summary: {
          totalItems,
          totalQuantity,
          totalPrice
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/add', [
  body('productId').isString().notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('size').optional().isString(),
  body('color').optional().isString(),
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

    const { productId, quantity, size, color } = req.body;

    // Check if product exists and is active
    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      userId: (req.user as any).userId,
      productId,
      size: size || null,
      color: color || null
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await CartItem.findByIdAndUpdate(
        existingItem._id,
        { quantity: existingItem.quantity + quantity },
        { new: true }
      ).populate({
        path: 'productId',
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      });

      const updatedItemObj = updatedItem?.toObject() as any;

      return res.json({
        success: true,
        message: 'Cart item updated',
        data: {
          item: {
            id: updatedItemObj._id,
            quantity: updatedItemObj.quantity,
            size: updatedItemObj.size,
            color: updatedItemObj.color,
            product: {
              ...updatedItemObj.productId,
              mainImage: updatedItemObj.productId.images?.find((img: any) => img.isMain)?.url || null,
              images: undefined
            }
          }
        }
      });
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      userId: (req.user as any).userId,
      productId,
      quantity,
      size: size || null,
      color: color || null
    });

    // Populate the product data
    await cartItem.populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    const cartItemObj = cartItem.toObject() as any;

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        item: {
          id: cartItemObj._id,
          quantity: cartItemObj.quantity,
          size: cartItemObj.size,
          color: cartItemObj.color,
          product: {
            ...cartItemObj.productId,
            mainImage: cartItemObj.productId.images?.find((img: any) => img.isMain)?.url || null,
            images: undefined
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/:id', [
  body('quantity').isInt({ min: 1 }),
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

    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartItem.findOne({
      _id: id,
      userId: (req.user as any).userId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    const updatedItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    const updatedItemObj = updatedItem?.toObject() as any;

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        item: {
          id: updatedItemObj._id,
          quantity: updatedItemObj.quantity,
          size: updatedItemObj.size,
          color: updatedItemObj.color,
          product: {
            ...updatedItemObj.productId,
            mainImage: updatedItemObj.productId.images?.find((img: any) => img.isMain)?.url || null,
            images: undefined
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cartItem = await CartItem.findOne({
      _id: id,
      userId: (req.user as any).userId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    await CartItem.deleteOne({
      _id: id,
      userId: (req.user as any).userId
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CartItem.deleteMany({
      userId: (req.user as any).userId
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
});

export default router;