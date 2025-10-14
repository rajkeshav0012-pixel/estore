import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Allowed image file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a single image file to Firebase Storage
 * @param file - The file buffer
 * @param mimetype - The file MIME type
 * @param originalName - Original filename
 * @param folder - Storage folder (default: 'products')
 * @returns Promise<UploadResult>
 */
export const uploadImage = async (
  file: Buffer,
  mimetype: string,
  originalName: string,
  folder: string = 'products'
): Promise<UploadResult> => {
  try {
    console.log('Starting file upload:', { originalName, mimetype, size: file.length, folder });

    // Validate file type
    if (!ALLOWED_TYPES.includes(mimetype)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.'
      };
    }

    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Generate unique filename
    const fileExtension = path.extname(originalName) || '.jpg';
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Generated file path:', filePath);

    // Create storage reference
    const storageRef = ref(storage, filePath);
    console.log('Created storage reference');

    // Upload file with metadata
    const metadata = {
      contentType: mimetype,
      customMetadata: {
        originalName: originalName,
        uploadedAt: new Date().toISOString()
      }
    };

    console.log('Uploading file...');
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('File uploaded successfully:', snapshot.metadata.fullPath);

    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);

    return {
      success: true,
      url: downloadURL
    };
  } catch (error: any) {
    console.error('Upload error details:', {
      message: error.message,
      code: error.code,
      customData: error.customData,
      status: error.status_,
      serverResponse: error.customData?.serverResponse
    });
    
    let errorMessage = 'Failed to upload image';
    
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Unauthorized: Please check Firebase Storage rules and authentication';
    } else if (error.code === 'storage/unknown') {
      errorMessage = 'Storage service unavailable. Please check Firebase configuration';
    } else if (error.code === 'storage/invalid-argument') {
      errorMessage = 'Invalid file or storage path';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Upload multiple image files to Firebase Storage
 * @param files - Array of file objects with buffer, mimetype, and originalName
 * @param folder - Storage folder (default: 'products')
 * @returns Promise<UploadResult[]>
 */
export const uploadMultipleImages = async (
  files: Array<{ buffer: Buffer; mimetype: string; originalName: string }>,
  folder: string = 'products'
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => 
    uploadImage(file.buffer, file.mimetype, file.originalName, folder)
  );

  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The full download URL of the image
 * @returns Promise<boolean>
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/o/');
    if (pathParts.length < 2) {
      throw new Error('Invalid Firebase Storage URL format');
    }
    
    const pathWithQuery = pathParts[1];
    if (!pathWithQuery) {
      throw new Error('Invalid Firebase Storage URL format');
    }
    
    const encodedPath = pathWithQuery.split('?')[0];
    if (!encodedPath) {
      throw new Error('Invalid Firebase Storage URL format');
    }
    
    const filePath = decodeURIComponent(encodedPath);
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Delete the file
    await deleteObject(storageRef);
    
    return true;
  } catch (error: any) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Delete multiple images from Firebase Storage
 * @param imageUrls - Array of image URLs to delete
 * @returns Promise<boolean[]>
 */
export const deleteMultipleImages = async (imageUrls: string[]): Promise<boolean[]> => {
  const deletePromises = imageUrls.map(url => deleteImage(url));
  return Promise.all(deletePromises);
};

/**
 * Validate image file
 * @param mimetype - File MIME type
 * @param size - File size in bytes
 * @returns Object with validation result
 */
export const validateImageFile = (mimetype: string, size: number) => {
  const errors: string[] = [];

  if (!ALLOWED_TYPES.includes(mimetype)) {
    errors.push('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.');
  }

  if (size > MAX_FILE_SIZE) {
    errors.push('File size too large. Maximum size is 5MB.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};