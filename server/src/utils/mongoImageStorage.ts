import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface ImageDocument {
  _id?: string;
  imageId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  data: string; // Base64 encoded image data
  folder: string;
  uploadedAt: Date;
}

interface UploadResult {
  success: boolean;
  imageId?: string;
  url?: string;
  error?: string;
}

interface MultipleUploadResult {
  success: boolean;
  urls?: string[];
  successful?: number;
  failed?: number;
  errors?: string[];
}

/**
 * Convert image buffer to Base64 string
 */
export function bufferToBase64(buffer: Buffer, mimetype: string): string {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

/**
 * Upload single image to MongoDB
 */
export async function uploadImageToMongoDB(
  db: any,
  file: Express.Multer.File,
  folder: string = 'images'
): Promise<UploadResult> {
  try {
    console.log('Starting MongoDB image upload:', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder
    });

    // Generate unique ID and filename
    const imageId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${imageId}${extension}`;

    // Convert buffer to Base64
    const base64Data = bufferToBase64(file.buffer, file.mimetype);

    // Create image document
    const imageDoc: ImageDocument = {
      imageId,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: base64Data,
      folder,
      uploadedAt: new Date()
    };

    // Insert into MongoDB
    const result = await db.collection('images').insertOne(imageDoc);

    if (result.insertedId) {
      // Return the Base64 data URL directly (can be used in img src)
      const imageUrl = base64Data;
      
      console.log('✅ Image uploaded successfully:', {
        imageId,
        filename,
        size: file.size
      });

      return {
        success: true,
        imageId,
        url: imageUrl
      };
    } else {
      throw new Error('Failed to insert image into database');
    }

  } catch (error: any) {
    console.error('❌ MongoDB image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload multiple images to MongoDB
 */
export async function uploadMultipleImagesToMongoDB(
  db: any,
  files: Express.Multer.File[],
  folder: string = 'images'
): Promise<MultipleUploadResult> {
  try {
    console.log(`Attempting to upload ${files.length} images to MongoDB...`);

    const results: UploadResult[] = [];
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = await uploadImageToMongoDB(db, file, folder);
      results.push(result);

      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(result.error || 'Unknown upload error');
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Upload complete: ${successful} successful, ${failed} failed`);

    const result: MultipleUploadResult = {
      success: successful > 0,
      urls,
      successful,
      failed
    };

    if (errors.length > 0) {
      result.errors = errors;
    }

    return result;

  } catch (error: any) {
    console.error('❌ Multiple image upload error:', error);
    return {
      success: false,
      urls: [],
      successful: 0,
      failed: files.length,
      errors: [error.message]
    };
  }
}

/**
 * Get image by ID from MongoDB
 */
export async function getImageFromMongoDB(
  db: any,
  imageId: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const image = await db.collection('images').findOne({ imageId });

    if (!image) {
      return {
        success: false,
        error: 'Image not found'
      };
    }

    return {
      success: true,
      data: image.data // Base64 data URL
    };

  } catch (error: any) {
    console.error('❌ Error retrieving image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete image from MongoDB
 */
export async function deleteImageFromMongoDB(
  db: any,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await db.collection('images').deleteOne({ imageId });

    if (result.deletedCount > 0) {
      console.log('✅ Image deleted successfully:', imageId);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Image not found'
      };
    }

  } catch (error: any) {
    console.error('❌ Error deleting image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract image ID from Base64 data URL (if stored with metadata)
 * For simple Base64 URLs, this might not be applicable
 */
export function extractImageIdFromUrl(url: string): string | null {
  // For MongoDB storage, we return the Base64 directly
  // So we might need to store a mapping or use a different approach
  // For now, return null as we're storing complete Base64 URLs
  return null;
}

/**
 * Clean up old images (utility function)
 */
export async function cleanupOldImages(
  db: any,
  olderThanDays: number = 30
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await db.collection('images').deleteMany({
      uploadedAt: { $lt: cutoffDate },
      // Add additional conditions here if needed (e.g., unused images)
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old images`);

    return {
      success: true,
      deletedCount: result.deletedCount
    };

  } catch (error: any) {
    console.error('❌ Error cleaning up images:', error);
    return {
      success: false,
      error: error.message
    };
  }
}