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

    const now = new Date();
    const formattedCartItems = cartItems.map((item: any) => {
      // Определяем актуальную цену
      let currentPrice = item.productId.price;
      let isPriceLocked = false;
      let priceChanged = false;

      // Проверяем, есть ли зарезервированная цена и не истекла ли она
      if (item.reservedPrice && item.priceLockedUntil && new Date(item.priceLockedUntil) > now) {
        currentPrice = item.reservedPrice;
        isPriceLocked = true;
      } else if (item.reservedPrice && item.reservedPrice !== item.productId.price) {
        // Цена изменилась после истечения резервации
        priceChanged = true;
      }

      return {
        id: item._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        reservedPrice: item.reservedPrice,
        priceLockedUntil: item.priceLockedUntil,
        isPriceLocked,
        priceChanged,
        product: {
          ...item.productId,
          mainImage: item.productId.images?.find((img: any) => img.isMain)?.url || null,
          images: undefined,
          currentPrice // Актуальная цена для отображения
        }
      };
    });

    // Calculate totals using actual prices
    const totalItems = cartItems.length;
    const totalQuantity = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalPrice = formattedCartItems.reduce((sum: number, item: any) => {
      const price = item.isPriceLocked ? item.reservedPrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);

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

    // Check product status
    if (product.status === 'OUT_OF_STOCK') {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock'
      });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({
      userId: (req.user as any).userId,
      productId,
      size: size || null,
      color: color || null
    });

    // Set price reservation (1 minute from now for testing)
    const lockDuration = 1 * 60 * 1000; // 1 minute for testing (change to 30 * 60 * 1000 for production)
    const priceLockedUntil = new Date(Date.now() + lockDuration);
    const reservedPrice = product.status === 'PRE_ORDER' ? (product.basePrice || product.price) : product.price;

    if (existingItem) {
      // Update quantity and refresh price lock
      const updatedItem = await CartItem.findByIdAndUpdate(
        existingItem._id,
        { 
          quantity: existingItem.quantity + quantity,
          reservedPrice,
          priceLockedUntil
        },
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
            reservedPrice: updatedItemObj.reservedPrice,
            priceLockedUntil: updatedItemObj.priceLockedUntil,
            product: {
              ...updatedItemObj.productId,
              mainImage: updatedItemObj.productId.images?.find((img: any) => img.isMain)?.url || null,
              images: undefined
            }
          }
        }
      });
    }

    // Create new cart item with price reservation
    const cartItem = await CartItem.create({
      userId: (req.user as any).userId,
      productId,
      quantity,
      size: size || null,
      color: color || null,
      reservedPrice,
      priceLockedUntil
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

// Lock prices for checkout (reserve prices for 30 minutes)
router.post('/lock-prices', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartItems = await CartItem.find({ userId: (req.user as any).userId })
      .populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Lock prices for 1 minute (testing)
    const lockDuration = 1 * 60 * 1000; // 1 minute for testing (change to 30 * 60 * 1000 for production)
    const priceLockedUntil = new Date(Date.now() + lockDuration);

    // Update all cart items with reserved prices
    const updatePromises = cartItems.map(async (item: any) => {
      return CartItem.findByIdAndUpdate(
        item._id,
        {
          reservedPrice: item.productId.price,
          priceLockedUntil
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Prices locked for 30 minutes',
      data: {
        priceLockedUntil,
        lockDurationMinutes: 30
      }
    });
  } catch (error) {
    next(error);
  }
});

// Unlock prices (cancel reservation)
router.post('/unlock-prices', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CartItem.updateMany(
      { userId: (req.user as any).userId },
      {
        $unset: {
          reservedPrice: 1,
          priceLockedUntil: 1
        }
      }
    );

    res.json({
      success: true,
      message: 'Price locks removed'
    });
  } catch (error) {
    next(error);
  }
});

// Validate cart before checkout
router.post('/validate', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartItems = await CartItem.find({ userId: (req.user as any).userId })
      .populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    const now = new Date();
    const issues: any[] = [];
    const validItems: any[] = [];
    
    // Set price reservation (1 minute from now for testing)
    const lockDuration = 1 * 60 * 1000; // 1 minute for testing
    const priceLockedUntil = new Date(Date.now() + lockDuration);

    for (const item of cartItems) {
      const product = item.productId as any;
      const issue: any = {
        itemId: item._id,
        productId: product._id,
        productName: product.name,
        quantity: item.quantity
      };

      // Check if product is out of stock
      if (product.status === 'OUT_OF_STOCK') {
        issue.type = 'OUT_OF_STOCK';
        issue.message = `Товар "${product.name}" отсутствует в наличии`;
        issues.push(issue);
        continue;
      }

      // Check if price has changed and reservation expired
      if (item.reservedPrice && item.priceLockedUntil) {
        const lockDate = new Date(item.priceLockedUntil);
        const isLockExpired = lockDate <= now;
        const priceChanged = item.reservedPrice !== product.price;

        if (isLockExpired && priceChanged) {
          issue.type = 'PRICE_CHANGED';
          issue.oldPrice = item.reservedPrice;
          issue.newPrice = product.price;
          issue.message = `Цена товара "${product.name}" изменилась с ${item.reservedPrice}₽ на ${product.price}₽`;
          issues.push(issue);
          
          // Update reservation with new price for this item
          await CartItem.findByIdAndUpdate(
            item._id,
            {
              reservedPrice: product.price,
              priceLockedUntil
            }
          );
          
          continue;
        }
      }

      // Item is valid
      const lockDate = item.priceLockedUntil ? new Date(item.priceLockedUntil) : null;
      const useReservedPrice = item.reservedPrice && lockDate && lockDate > now;
      
      validItems.push({
        itemId: item._id,
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: useReservedPrice ? item.reservedPrice : product.price,
        status: product.status
      });
    }

    res.json({
      success: true,
      data: {
        isValid: issues.length === 0,
        issues,
        validItems,
        totalIssues: issues.length,
        totalValidItems: validItems.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
