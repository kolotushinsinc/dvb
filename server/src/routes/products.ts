import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Product, IProduct } from '../models/Product';
import { Category, ICategory } from '../models/Category';
import { Review, IReview } from '../models/Review';
import { optionalAuth } from '../middleware/auth';
import { Document, Types } from 'mongoose';

const router = Router();

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('categoryPath').optional().isString(), // Фильтр по пути категорий
  query('search').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['price', 'name', 'createdAt', 'rating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('isBrandNew').optional().isBoolean(),
  query('isOnSale').optional().isBoolean(),
  // Фильтры по атрибутам
  query('gender').optional().isIn(['MALE', 'FEMALE', 'UNISEX']),
  query('color').optional().isString(),
  query('season').optional().isIn(['SPRING_SUMMER', 'AUTUMN_WINTER', 'ALL_SEASON']),
  query('brand').optional().isString(),
  query('frameMaterial').optional().isString(),
  query('frameStyle').optional().isIn(['FULL_RIM', 'RIMLESS', 'SEMI_RIMLESS']),
  query('lensType').optional().isString(),
  query('shoeSizeSystem').optional().isIn(['RUS', 'EU', 'US', 'CM']),
  query('shoeSize').optional().isString(),
  query('upperMaterial').optional().isString(),
  query('soleType').optional().isString(),
  query('brandTechnology').optional().isString(),
  query('clothingSizeSystem').optional().isIn(['INT', 'RUS', 'US']),
  query('clothingSize').optional().isString(),
  query('fabric').optional().isString(),
  query('pattern').optional().isString(),
  query('style').optional().isString(),
  query('availability').optional().isIn(['IN_STOCK', 'PRE_ORDER']),
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const {
      category,
      categoryPath,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isBrandNew,
      isOnSale,
      gender,
      color,
      season,
      brand,
      frameMaterial,
      frameStyle,
      lensType,
      shoeSizeSystem,
      shoeSize,
      upperMaterial,
      soleType,
      brandTechnology,
      clothingSizeSystem,
      clothingSize,
      fabric,
      pattern,
      style,
      availability
    } = req.query;

    // Build where clause
    const where: Record<string, any> = {
      isActive: true,
    };

    if (category) {
      // Find category by slug first
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        where.categoryId = categoryDoc._id;
      } else {
        // Return empty result if category not found
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
              hasNext: false,
              hasPrev: false,
            }
          }
        });
      }
    }

    // Filter by category path (includes all subcategories)
    if (categoryPath) {
      const categoryDoc = await Category.findOne({ slug: categoryPath });
      if (categoryDoc) {
        // Find all subcategories
        const subCategories = await Category.find({
          categoryPath: categoryDoc._id
        }).select('_id');
        
        const categoryIds = [categoryDoc._id, ...subCategories.map(cat => cat._id)];
        where.categoryId = { $in: categoryIds };
      }
    }

    if (search) {
      where.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { brand: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.$lte = parseFloat(maxPrice as string);
    }

    if (isBrandNew === 'true') where.isBrandNew = true;
    if (isOnSale === 'true') where.isOnSale = true;

    // Add attribute filters based on category type
    if (gender) where['attributes.gender'] = gender;
    if (color) where['attributes.color'] = { $regex: color as string, $options: 'i' };
    if (season) where['attributes.season'] = season;
    if (brand) where.brand = { $regex: brand as string, $options: 'i' };
    
    // Glasses specific filters
    if (frameMaterial) where['attributes.frameMaterial'] = { $regex: frameMaterial as string, $options: 'i' };
    if (frameStyle) where['attributes.frameStyle'] = frameStyle;
    if (lensType) where['attributes.lensType'] = { $regex: lensType as string, $options: 'i' };
    
    // Shoes specific filters
    if (shoeSizeSystem) where['attributes.shoeSizeSystem'] = shoeSizeSystem;
    if (shoeSize) {
      // Handle shoe size as range or exact match
      const sizeValue = parseFloat(shoeSize as string);
      if (!isNaN(sizeValue)) {
        where['attributes.shoeSize'] = sizeValue;
      }
    }
    if (upperMaterial) where['attributes.upperMaterial'] = { $regex: upperMaterial as string, $options: 'i' };
    if (soleType) where['attributes.soleType'] = { $regex: soleType as string, $options: 'i' };
    if (brandTechnology) where['attributes.brandTechnology'] = { $in: (brandTechnology as string).split(',') };
    
    // Clothing specific filters
    if (clothingSizeSystem) where['attributes.clothingSizeSystem'] = clothingSizeSystem;
    if (clothingSize) where['attributes.clothingSize'] = clothingSize;
    if (fabric) where['attributes.fabric'] = { $regex: fabric as string, $options: 'i' };
    if (pattern) where['attributes.pattern'] = { $regex: pattern as string, $options: 'i' };
    
    // Common style filter
    if (style) where['attributes.style'] = { $regex: style as string, $options: 'i' };
    if (availability) where['attributes.availability'] = availability;

    // Build sort clause
    const sort: Record<string, any> = {};
    if (sortBy === 'rating') {
      // For rating, we'll handle it separately after fetching products
      sort['createdAt'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    const [products, total] = await Promise.all([
      Product.find(where)
        .populate({
          path: 'categoryId',
          select: 'name slug'
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(where)
    ]);

    // Get reviews for all products to calculate ratings
    const productIds = products.map((p: any) => p._id);
    const reviews = await Review.find({
      productId: { $in: productIds },
      isApproved: true
    }).lean();

    // Calculate average rating for each product
    const productsWithRating = products.map((product: any) => {
      const productReviews = reviews.filter((r: IReview) => r.productId.toString() === product._id.toString());
      const avgRating = productReviews.length > 0
        ? productReviews.reduce((sum: number, review: IReview) => sum + review.rating, 0) / productReviews.length
        : 0;

      // Return image URLs as paths only (they will be proxied by the client)
      const mainImage = product.images?.find((img: any) => img.isMain);
      const mainImageUrl = mainImage?.url ?
        (mainImage.url.startsWith('http') ? mainImage.url : mainImage.url) : null;

      return {
        ...product,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: productReviews.length,
        mainImage: mainImageUrl,
        reviews: undefined, // Remove reviews from response
        images: undefined, // Remove images array from response
      };
    });

    // If sorting by rating, sort the products array by calculated rating
    if (sortBy === 'rating') {
      productsWithRating.sort((a: any, b: any) => {
        return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      });
    }

    res.json({
      success: true,
      data: {
        products: productsWithRating,
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

// Get single product by ID or slug
router.get('/:identifier', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is a valid ID or slug
    const whereClause = identifier.match(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId length
      ? { _id: identifier }
      : { slug: identifier };

    const product = await Product.findOne({
      ...whereClause,
      isActive: true,
    })
    .populate({
      path: 'categoryId',
      select: 'name slug'
    })
    .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Fetch reviews separately
    const reviews = await Review.find({
      productId: product._id,
      isApproved: true
    })
    .populate({
      path: 'userId',
      select: 'firstName lastName'
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, review: IReview) => sum + review.rating, 0) / reviews.length
      : 0;

    // Get related products from same category
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      isActive: true,
    })
    .lean()
    .limit(4);

    // Return image URLs as paths only (they will be proxied by the client)
    const processedImages = product.images?.map((img: any) => ({
      ...img,
      url: img.url?.startsWith('http') ? img.url : img.url,
      thumbnailUrl: img.thumbnailUrl?.startsWith('http') ? img.thumbnailUrl : img.thumbnailUrl
    })) || [];

    const productData = {
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: reviews.length,
      reviews: reviews,
      images: processedImages,
      relatedProducts: relatedProducts.map((p: IProduct & { images?: any[] }) => {
        const relatedMainImage = p.images?.find((img: any) => img.isMain);
        const relatedMainImageUrl = relatedMainImage?.url ?
          (relatedMainImage.url.startsWith('http') ? relatedMainImage.url : relatedMainImage.url) : null;
        
        return {
          ...p,
          mainImage: relatedMainImageUrl,
          images: undefined
        };
      }),
      _count: undefined
    };

    res.json({
      success: true,
      data: { product: productData }
    });
  } catch (error) {
    next(error);
  }
});

// Search products with suggestions
router.get('/search/suggestions', [
  query('q').notEmpty().isLength({ min: 2 }),
  query('limit').optional().isInt({ min: 1, max: 10 }),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 5;

    const suggestions = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q as string, $options: 'i' } },
        { brand: { $regex: q as string, $options: 'i' } },
      ]
    })
    .select('name slug price images')
    .limit(limit)
    .lean();

    const formattedSuggestions = suggestions.map((product: IProduct & { images?: any[] }) => {
      const mainImage = product.images?.find((img: any) => img.isMain);
      const mainImageUrl = mainImage?.url ?
        (mainImage.url.startsWith('http') ? mainImage.url : mainImage.url) : null;
        
      return {
        ...product,
        image: mainImageUrl,
        images: undefined
      };
    });

    res.json({
      success: true,
      data: { suggestions: formattedSuggestions }
    });
  } catch (error) {
    next(error);
  }
});

// Create new product (for CRM)
router.post('/', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('brand').optional().isString(),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('isBrandNew').optional().isBoolean(),
  body('isOnSale').optional().isBoolean(),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('features').optional().isArray(),
  body('attributes').optional().isObject(),
], async (req: Request, res: Response, next: NextFunction) => {
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
      name,
      description,
      price,
      categoryId,
      brand,
      images = [],
      variants = [],
      isBrandNew = false,
      isOnSale = false,
      originalPrice,
      stock = 0,
      features = [],
      attributes = {},
      slug,
      shortDescription,
      sku,
      weight,
      dimensions,
      material,
      country,
      seoTitle,
      seoDescription,
      isFeatured = false,
      sortOrder = 0
    } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Generate slug if not provided
    const productSlug = slug || name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: productSlug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Product with this slug already exists'
      });
    }

    // Prepare product data with category type
    const productData: any = {
      name,
      description,
      shortDescription,
      price,
      originalPrice: isOnSale ? originalPrice : undefined,
      categoryId,
      brand,
      slug: productSlug,
      images,
      variants,
      isBrandNew,
      isOnSale,
      stock,
      features,
      isActive: true,
      sku,
      weight,
      dimensions,
      material,
      country,
      seoTitle,
      seoDescription,
      isFeatured,
      sortOrder
    };

    // Set category type based on category
    productData.categoryType = category.categoryType;

    // Add attributes based on category type
    if (attributes) {
      productData.attributes = attributes;
    }

    // Create new product with proper schema structure
    const newProduct = new Product(productData);

    const savedProduct = await newProduct.save();

    // Populate category for response
    await savedProduct.populate({
      path: 'categoryId',
      select: 'name slug'
    });

    res.status(201).json({
      success: true,
      data: {
        product: savedProduct
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update product (for CRM)
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().isString(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isMongoId().withMessage('Valid category ID is required'),
  body('brand').optional().isString(),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('isBrandNew').optional().isBoolean(),
  body('isOnSale').optional().isBoolean(),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('features').optional().isArray(),
  body('attributes').optional().isObject(),
], async (req: Request, res: Response, next: NextFunction) => {
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
    const updateData = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // If category is being updated, check if it exists and update categoryType
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category not found'
        });
      }
      
      // Update category type when category changes
      updateData.categoryType = category.categoryType;
    }

    // Update slug if name is changed and slug is not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'categoryId',
      select: 'name slug'
    });

    res.json({
      success: true,
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete product (for CRM)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;