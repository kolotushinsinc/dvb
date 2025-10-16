import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

const router = Router();

// Get all categories with hierarchical structure
router.get('/', [
  query('includeProducts').optional().isBoolean(),
  query('hierarchical').optional().isBoolean(),
  query('level').optional().isInt({ min: 0 }),
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

    const includeProducts = req.query.includeProducts === 'true';
    const hierarchical = req.query.hierarchical !== 'false'; // По умолчанию иерархический вывод
    const level = req.query.level ? parseInt(req.query.level as string) : null;

    // Build query filter
    const filter: any = { isActive: true };
    if (level !== null) {
      filter.level = level;
    }

    // Get all categories
    const categories = await Category.find(filter)
      .sort({ parentId: 1, sortOrder: 1 })
      .lean();

    if (includeProducts) {
      // For each category, get products count and sample products
      for (const category of categories) {
        const [productsCount, products] = await Promise.all([
          Product.countDocuments({ categoryId: category._id, isActive: true }),
          Product.find({ categoryId: category._id, isActive: true })
            .limit(6)
            .lean()
        ]);

        (category as any).productsCount = productsCount;
        (category as any).products = products.map((product: any) => ({
          ...product,
          mainImage: product.images?.find((img: any) => img.isMain)?.url || null,
          images: undefined
        }));
      }
    } else {
      // Just get products count for each category
      for (const category of categories) {
        const productsCount = await Product.countDocuments({
          categoryId: category._id,
          isActive: true
        });
        (category as any).productsCount = productsCount;
      }
    }

    let formattedCategories = categories.map((category: any) => ({
      ...category,
      isActive: category.isActive,
      products: category.products || undefined
    }));

    // Build hierarchical structure if requested
    if (hierarchical) {
      const categoryMap = new Map<string, any>();
      const rootCategories: any[] = [];

      // Create map of all categories
      formattedCategories.forEach((category: any) => {
        categoryMap.set(category._id.toString(), { ...category, children: [] });
      });

      // Build hierarchy
      formattedCategories.forEach((category: any) => {
        const categoryWithChildren = categoryMap.get(category._id.toString());
        
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId.toString());
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      formattedCategories = rootCategories;
    }

    res.json({
      success: true,
      data: { categories: formattedCategories }
    });
  } catch (error) {
    next(error);
  }
});

// Get single category by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      isActive: true
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const productsCount = await Product.countDocuments({
      categoryId: (category as any)._id,
      isActive: true
    });

    const categoryData = {
      ...category,
      isActive: category.isActive,
      productsCount,
    };

    res.json({
      success: true,
      data: { category: categoryData }
    });
  } catch (error) {
    next(error);
  }
});

// Create new category
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('image').optional().isString(),
  body('slug').optional().isString(),
  body('sortOrder').optional().isInt(),
  body('parentId').optional().custom((value) => {
    if (value === null || value === '') {
      return true; // Allow null or empty string for root categories
    }
    if (Types.ObjectId.isValid(value)) {
      return true; // Valid MongoDB ObjectId
    }
    return false; // Invalid value
  }).withMessage('Valid parent category ID is required'),
  body('categoryType').isIn(['GLASSES', 'SHOES', 'CLOTHING', 'ACCESSORIES']).withMessage('Valid category type is required'),
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
      image,
      slug,
      sortOrder,
      parentId,
      categoryType
    } = req.body;

    // Check if category with same name already exists (case-insensitive)
    const existingCategoryByName = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingCategoryByName) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Check if slug is provided and if it already exists (case-insensitive)
    if (slug) {
      const existingCategoryBySlug = await Category.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, 'i') }
      });
      if (existingCategoryBySlug) {
        return res.status(400).json({
          success: false,
          error: 'Category with this slug already exists'
        });
      }
    }

    // If parentId is provided, check if parent category exists
    let level = 0;
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          error: 'Parent category not found'
        });
      }
      level = parentCategory.level + 1;
      
      // Подкатегория наследует тип категории от родителя
      if (parentCategory.categoryType !== categoryType) {
        return res.status(400).json({
          success: false,
          error: 'Subcategory must have the same type as parent category'
        });
      }
    }

    // Create slug from name if not provided (using lowercase name)
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create new category
    const category = new Category({
      name,
      description,
      image,
      slug: categorySlug,
      sortOrder: sortOrder || 0,
      parentId: parentId === '' ? null : parentId,
      level,
      categoryType
    });

    await category.save();

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject ? category.toObject() : category,
          isActive: category.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('image').optional().isString(),
  body('slug').optional().isString(),
  body('sortOrder').optional().isInt(),
  body('parentId').optional().custom((value) => {
    if (value === null || value === '') {
      return true; // Allow null or empty string for root categories
    }
    if (Types.ObjectId.isValid(value)) {
      return true; // Valid MongoDB ObjectId
    }
    return false; // Invalid value
  }).withMessage('Valid parent category ID is required'),
  body('categoryType').optional().isIn(['GLASSES', 'SHOES', 'CLOTHING', 'ACCESSORIES']),
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
    const {
      name,
      description,
      image,
      slug,
      sortOrder,
      parentId,
      categoryType
    } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if name is being changed and if the new name is already taken (case-insensitive)
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }

    // Check if slug is being changed and if the new slug is already taken (case-insensitive)
    if (slug && slug.toLowerCase() !== category.slug.toLowerCase()) {
      const existingCategory = await Category.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this slug already exists'
        });
      }
    }

    // If parentId is being changed, check if parent category exists and prevent circular references
    if (parentId !== undefined) {
      if (parentId === id) {
        return res.status(400).json({
          success: false,
          error: 'Category cannot be its own parent'
        });
      }

      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            error: 'Parent category not found'
          });
        }

        // Check for circular reference
        let currentParent: ICategory | null = parentCategory as ICategory;
        while (currentParent) {
          if ((currentParent._id as Types.ObjectId).toString() === id) {
            return res.status(400).json({
              success: false,
              error: 'Circular reference detected in category hierarchy'
            });
          }
          if (currentParent.parentId) {
            currentParent = await Category.findById(currentParent.parentId);
          } else {
            break;
          }
        }

        // Update level based on new parent
        category.level = parentCategory.level + 1;
        
        // Проверяем, что тип категории совпадает с типом родителя
        if (categoryType && parentCategory.categoryType !== categoryType) {
          return res.status(400).json({
            success: false,
            error: 'Category type must match parent category type'
          });
        }
      } else {
        // If parentId is set to null, this becomes a root category
        category.level = 0;
      }
    }

    // Update slug if provided, otherwise generate from name or keep existing
    const categorySlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : category.slug);

    // Update category
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    category.slug = categorySlug;
    category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;
    if (parentId !== undefined) {
      // Convert empty string to null for root categories
      category.parentId = parentId === '' ? null : parentId;
    }
    if (categoryType !== undefined) {
      category.categoryType = categoryType;
    }

    await category.save();

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject ? category.toObject() : category,
          isActive: category.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get categories by type
router.get('/by-type/:categoryType', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryType } = req.params;
    
    // Validate category type
    if (!['GLASSES', 'SHOES', 'CLOTHING', 'ACCESSORIES'].includes(categoryType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category type'
      });
    }
    
    const categories = await Category.find({ categoryType }).sort({ level: 1, sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ categoryId: id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with products'
      });
    }

    // Soft delete - mark as inactive instead of removing from database
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;