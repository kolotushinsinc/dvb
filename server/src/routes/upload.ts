import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create thumbnails directory
const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 10 // Max 10 files per request
  }
});

// Helper function to compress image and create thumbnail
const compressImage = async (inputPath: string, outputPath: string, thumbnailPath: string) => {
  try {
    // Compress main image
    await sharp(inputPath)
      .jpeg({ quality: 80, progressive: true })
      .toFile(outputPath);
    
    // Create thumbnail (300x300)
    await sharp(inputPath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
    
    // Delete original file
    fs.unlinkSync(inputPath);
    
    return {
      success: true,
      filename: path.basename(outputPath),
      thumbnailFilename: path.basename(thumbnailPath)
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, just use the original file
    return {
      success: false,
      filename: path.basename(inputPath),
      thumbnailFilename: path.basename(inputPath)
    };
  }
};

// Upload single image
router.post('/image', adminAuth, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const extension = path.extname(filename);
    const baseFilename = path.basename(filename, extension);
    
    // Create paths for compressed image and thumbnail
    const compressedFilename = `${baseFilename}-compressed${extension}`;
    const thumbnailFilename = `${baseFilename}-thumb${extension}`;
    const compressedPath = path.join(uploadsDir, compressedFilename);
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    // Compress image and create thumbnail
    const compressionResult = await compressImage(originalPath, compressedPath, thumbnailPath);

    const fileUrl = `https://api.dvberry.ru/uploads/${compressionResult.filename}`;
    const thumbnailUrl = `https://api.dvberry.ru/uploads/thumbnails/${compressionResult.thumbnailFilename}`;

    res.json({
      success: true,
      message: 'Image uploaded and compressed successfully',
      data: {
        filename: compressionResult.filename,
        thumbnailFilename: compressionResult.thumbnailFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        thumbnailUrl: thumbnailUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload multiple images
router.post('/images', adminAuth, upload.array('images', 10), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Process each file to create compressed versions and thumbnails
    const uploadedFiles = await Promise.all(files.map(async (file) => {
      const originalPath = file.path;
      const filename = file.filename;
      const extension = path.extname(filename);
      const baseFilename = path.basename(filename, extension);
      
      // Create paths for compressed image and thumbnail
      const compressedFilename = `${baseFilename}-compressed${extension}`;
      const thumbnailFilename = `${baseFilename}-thumb${extension}`;
      const compressedPath = path.join(uploadsDir, compressedFilename);
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

      // Compress image and create thumbnail
      const compressionResult = await compressImage(originalPath, compressedPath, thumbnailPath);

      return {
        filename: compressionResult.filename,
        thumbnailFilename: compressionResult.thumbnailFilename,
        originalName: file.originalname,
        size: file.size,
        url: `https://api.dvberry.ru/uploads/${compressionResult.filename}`,
        thumbnailUrl: `https://api.dvberry.ru/uploads/thumbnails/${compressionResult.thumbnailFilename}`
      };
    }));

    res.json({
      success: true,
      message: `${files.length} images uploaded and compressed successfully`,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    next(error);
  }
});

// Delete uploaded file
router.delete('/:filename', adminAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    const extension = path.extname(filename);
    const baseFilename = path.basename(filename, extension);
    
    // Check if it's a compressed file and get the original filename
    let actualFilename = filename;
    if (filename.includes('-compressed')) {
      actualFilename = `${baseFilename}${extension}`;
    }
    
    // Also check for thumbnail
    const thumbnailFilename = `${baseFilename}-thumb${extension}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    // Check if main file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete main file
    fs.unlinkSync(filePath);
    
    // Delete thumbnail if it exists
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.json({
      success: true,
      message: 'File and thumbnail deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Handle multer errors
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files'
      });
    }
  }
  next(error);
});

export default router;