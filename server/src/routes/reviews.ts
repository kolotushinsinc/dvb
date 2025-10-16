import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Review, IReview } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { auth, optionalAuth } from '../middleware/auth';

const router = Router();

// Get reviews for a product
router.get('/product/:productId', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('rating').optional().isInt({ min: 1, max: 5 }),
], optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

    const where: Record<string, any> = {
      productId,
      isApproved: true
    };

    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      Review.find(where)
        .populate({
          path: 'userId',
          select: 'firstName lastName'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(where)
    ]);

    // Calculate average rating
    const allReviews = await Review.find({ productId, isApproved: true }).lean();
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum: number, review: IReview) => sum + review.rating, 0) / allReviews.length
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        summary: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: allReviews.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create a review
router.post('/', [
  body('productId').isString().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
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

    const { productId, rating, title, comment } = req.body;

    // Check if product exists
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

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      userId: (req.user as any).userId,
      productId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product'
      });
    }

    // Check if user has ordered this product (verified purchase)
    const userOrder = await Order.findOne({
      userId: (req.user as any).userId,
      status: 'DELIVERED',
      'items.productId': productId
    });

    const review = await Review.create({
      userId: (req.user as any).userId,
      productId,
      rating,
      title: title || null,
      comment: comment || null,
      isVerified: !!userOrder,
      isApproved: true // Auto-approve for now
    });

    // Populate user data
    await review.populate({
      path: 'userId',
      select: 'firstName lastName'
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Update a review
router.put('/:id', [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
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
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: id,
      userId: (req.user as any).userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title || null;
    if (comment !== undefined) updateData.comment = comment || null;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'userId',
      select: 'firstName lastName'
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    next(error);
  }
});

// Delete a review
router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      userId: (req.user as any).userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await Review.deleteOne({
      _id: id,
      userId: (req.user as any).userId
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's reviews
router.get('/my-reviews', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const [reviews, total] = await Promise.all([
      Review.find({ userId: (req.user as any).userId })
        .populate({
          path: 'productId',
          select: 'name slug images'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ userId: (req.user as any).userId })
    ]);

    const formattedReviews = reviews.map((review: any) => ({
      ...review,
      product: {
        ...review.productId,
        mainImage: review.productId.images?.find((img: any) => img.isMain)?.url || null,
        images: undefined
      }
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
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

export default router;