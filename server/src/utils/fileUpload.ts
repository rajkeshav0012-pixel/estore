// Firebase file upload utilities - DEPRECATED
// This app now uses MongoDB for image storage via mongoImageStorage.ts
// This file provides stub functions for backward compatibility

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * DEPRECATED: Upload a single image file to Firebase Storage
 * Use mongoImageStorage.uploadImageToMongoDB instead
 */
export const uploadImage = async (): Promise<UploadResult> => {
  return {
    success: false,
    error: 'Firebase upload deprecated. Use MongoDB storage instead.'
  };
};

/**
 * DEPRECATED: Upload multiple image files to Firebase Storage  
 * Use mongoImageStorage.uploadMultipleImagesToMongoDB instead
 */
export const uploadMultipleImages = async (): Promise<UploadResult[]> => {
  return [{
    success: false,
    error: 'Firebase upload deprecated. Use MongoDB storage instead.'
  }];
};

/**
 * DEPRECATED: Delete an image from Firebase Storage
 * Use mongoImageStorage.deleteImageFromMongoDB instead
 */
export const deleteImage = async (): Promise<boolean> => {
  console.warn('Firebase deleteImage deprecated. Use MongoDB storage instead.');
  return false;
};

/**
 * DEPRECATED: Delete multiple images from Firebase Storage
 * Use mongoImageStorage.deleteImageFromMongoDB instead
 */
export const deleteMultipleImages = async (): Promise<boolean[]> => {
  console.warn('Firebase deleteMultipleImages deprecated. Use MongoDB storage instead.');
  return [false];
};

/**
 * Validate image file - still used by MongoDB storage
 */
export const validateImageFile = (mimetype: string, size: number) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
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