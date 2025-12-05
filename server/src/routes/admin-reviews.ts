import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

// Get all reviews (admin only)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'PENDING', 'PUBLISHED']),
  query('isFictional').optional().isBoolean(),
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
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.isFictional !== undefined) filter.isFictional = req.query.isFictional === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate({
          path: 'userId',
          select: 'firstName lastName email'
        })
        .populate({
          path: 'productId',
          select: 'name slug images'
        })
        .populate({
          path: 'addedBy',
          select: 'firstName lastName email'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter)
    ]);

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
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all users for selection (admin only)
router.get('/users', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string || '';
    
    const filter: any = {
      isClient: true,
      isActive: true
    };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('firstName lastName email')
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// Get all products for selection (admin only)
router.get('/products', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string || '';
    
    const filter: any = {
      isActive: true
    };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter)
      .select('name slug images')
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
});

// Create review (admin only)
router.post('/', [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().isLength({ max: 2000 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('status').isIn(['DRAFT', 'PENDING', 'PUBLISHED']),
  body('isFictional').isBoolean(),
  body('userId').optional().isString(),
  body('productId').optional().isString(),
  body('fictionalAuthor').optional().isObject(),
  body('fictionalAuthor.name').if(body('isFictional').equals('true')).notEmpty().trim(),
  body('fictionalAuthor.age').optional().isInt({ min: 1, max: 120 }),
  body('fictionalAuthor.city').optional().trim(),
  body('fictionalAuthor.avatar').optional().trim(),
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

    const { 
      rating, 
      comment, 
      title, 
      status, 
      isFictional, 
      userId, 
      productId,
      fictionalAuthor 
    } = req.body;

    // Validate author data
    if (isFictional) {
      if (!fictionalAuthor || !fictionalAuthor.name) {
        return res.status(400).json({
          success: false,
          error: 'Fictional author name is required'
        });
      }
    } else {
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required for real reviews'
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user already reviewed this product (if productId provided)
      if (productId) {
        const existingReview = await Review.findOne({
          userId,
          productId,
          isFictional: false
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            error: 'User has already reviewed this product'
          });
        }
      }
    }

    // Check if product exists (if provided)
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
    }

    const reviewData: any = {
      rating,
      comment,
      title: title || undefined,
      status,
      isFictional,
      addedByAdmin: true,
      addedBy: (req.user as any).userId,
      isApproved: status === 'PUBLISHED',
      isVerified: !isFictional
    };

    if (isFictional) {
      reviewData.fictionalAuthor = {
        name: fictionalAuthor.name,
        age: fictionalAuthor.age || undefined,
        city: fictionalAuthor.city || undefined,
        avatar: fictionalAuthor.avatar || undefined
      };
    } else {
      reviewData.userId = userId;
    }

    if (productId) {
      reviewData.productId = productId;
    }

    const review = await Review.create(reviewData);

    // Populate references
    await review.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'productId', select: 'name slug images' },
      { path: 'addedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Update review (admin only)
router.put('/:id', [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().notEmpty().isLength({ max: 2000 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('status').optional().isIn(['DRAFT', 'PENDING', 'PUBLISHED']),
  body('isFictional').optional().isBoolean(),
  body('userId').optional().isString(),
  body('productId').optional().isString(),
  body('fictionalAuthor').optional().isObject(),
  body('fictionalAuthor.name').optional().trim(),
  body('fictionalAuthor.age').optional().isInt({ min: 1, max: 120 }),
  body('fictionalAuthor.city').optional().trim(),
  body('fictionalAuthor.avatar').optional().trim(),
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
    const { 
      rating, 
      comment, 
      title, 
      status, 
      isFictional, 
      userId, 
      productId,
      fictionalAuthor 
    } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Validate author change
    if (isFictional !== undefined) {
      if (isFictional) {
        if (!fictionalAuthor || !fictionalAuthor.name) {
          return res.status(400).json({
            success: false,
            error: 'Fictional author name is required'
          });
        }
      } else {
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'User ID is required for real reviews'
          });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        // Check for duplicate review (if changing to real user)
        if (productId || review.productId) {
          const targetProductId = productId || review.productId;
          const existingReview = await Review.findOne({
            _id: { $ne: id },
            userId,
            productId: targetProductId,
            isFictional: false
          });

          if (existingReview) {
            return res.status(400).json({
              success: false,
              error: 'User has already reviewed this product'
            });
          }
        }
      }
    }

    // Check if product exists (if changing)
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (title !== undefined) review.title = title || undefined;
    if (status !== undefined) {
      review.status = status;
      review.isApproved = status === 'PUBLISHED';
    }
    if (productId !== undefined) review.productId = productId || undefined;

    // Handle author change
    if (isFictional !== undefined) {
      review.isFictional = isFictional;
      
      if (isFictional) {
        review.userId = undefined;
        review.fictionalAuthor = {
          name: fictionalAuthor.name,
          age: fictionalAuthor.age || undefined,
          city: fictionalAuthor.city || undefined,
          avatar: fictionalAuthor.avatar || undefined
        };
        review.isVerified = false;
      } else {
        review.userId = userId;
        review.fictionalAuthor = undefined;
        review.isVerified = true;
      }
    } else if (review.isFictional && fictionalAuthor) {
      // Update fictional author data
      review.fictionalAuthor = {
        name: fictionalAuthor.name || review.fictionalAuthor?.name || '',
        age: fictionalAuthor.age !== undefined ? fictionalAuthor.age : review.fictionalAuthor?.age,
        city: fictionalAuthor.city !== undefined ? fictionalAuthor.city : review.fictionalAuthor?.city,
        avatar: fictionalAuthor.avatar !== undefined ? fictionalAuthor.avatar : review.fictionalAuthor?.avatar
      };
    } else if (!review.isFictional && userId) {
      // Update real user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      review.userId = userId;
    }

    await review.save();

    // Populate references
    await review.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'productId', select: 'name slug images' },
      { path: 'addedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

// Delete review (admin only)
router.delete('/:id', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    await Review.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get single review (admin only)
router.get('/:id', auth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'productId',
        select: 'name slug images'
      })
      .populate({
        path: 'addedBy',
        select: 'firstName lastName email'
      })
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
