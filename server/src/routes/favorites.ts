import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Favorite, IFavorite } from '../models/Favorite';
import { Product, IProduct } from '../models/Product';
import { auth } from '../middleware/auth';

const router = Router();

// Get user's favorite items
router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await Favorite.find({ userId: (req.user as any).userId })
      .populate({
        path: 'productId',
        populate: {
          path: 'categoryId',
          select: 'name slug'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedFavorites = favorites.map((favorite: any) => ({
      id: favorite._id,
      createdAt: favorite.createdAt,
      product: {
        ...favorite.productId,
        mainImage: favorite.productId.images?.find((img: any) => img.isMain)?.url || null,
        images: undefined
      }
    }));

    res.json({
      success: true,
      data: { favorites: formattedFavorites }
    });
  } catch (error) {
    next(error);
  }
});

// Add product to favorites
router.post('/add', [
  body('productId').isString().notEmpty(),
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

    const { productId } = req.body;

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

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: (req.user as any).userId,
      productId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Product already in favorites'
      });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      userId: (req.user as any).userId,
      productId
    });

    // Populate the product data
    await favorite.populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        select: 'name slug'
      }
    });

    const favoriteObj = favorite.toObject() as any;

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      data: {
        favorite: {
          id: favoriteObj._id,
          createdAt: favoriteObj.createdAt,
          product: {
            ...favoriteObj.productId,
            mainImage: favoriteObj.productId.images?.find((img: any) => img.isMain)?.url || null,
            images: undefined
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Remove product from favorites
router.delete('/:productId', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      userId: (req.user as any).userId,
      productId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in favorites'
      });
    }

    await Favorite.deleteOne({
      userId: (req.user as any).userId,
      productId
    });

    res.json({
      success: true,
      message: 'Product removed from favorites'
    });
  } catch (error) {
    next(error);
  }
});

// Check if product is in favorites
router.get('/check/:productId', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      userId: (req.user as any).userId,
      productId
    });

    res.json({
      success: true,
      data: { isFavorite: !!favorite }
    });
  } catch (error) {
    next(error);
  }
});

export default router;