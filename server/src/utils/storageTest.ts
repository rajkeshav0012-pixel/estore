import { ref, listAll } from 'firebase/storage';
import { storage } from '../firebase.js';

/**
 * Test Firebase Storage connection
 */
export const testStorageConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Firebase Storage connection...');
    
    // Try to list files in the root directory
    const storageRef = ref(storage, '/');
    const result = await listAll(storageRef);
    
    console.log('Storage connection successful. Found', result.items.length, 'items and', result.prefixes.length, 'folders');
    
    return { success: true };
  } catch (error: any) {
    console.error('Storage connection test failed:', {
      message: error.message,
      code: error.code,
      customData: error.customData
    });
    
    return { 
      success: false, 
      error: `Storage connection failed: ${error.message || error.code || 'Unknown error'}` 
    };
  }
};

/**
 * Initialize storage bucket (create if doesn't exist)
 */
export const initializeStorageBucket = async (): Promise<void> => {
  try {
    // Test connection first
    const testResult = await testStorageConnection();
    
    if (testResult.success) {
      console.log('✓ Firebase Storage is properly configured');
      
      // Create product folder if it doesn't exist
      const productsRef = ref(storage, 'products/');
      try {
        await listAll(productsRef);
        console.log('✓ Products folder exists');
      } catch (error) {
        console.log('ℹ Products folder will be created when first file is uploaded');
      }
    } else {
      console.error('✗ Firebase Storage configuration issue:', testResult.error);
      throw new Error(testResult.error);
    }
  } catch (error: any) {
    console.error('Failed to initialize storage bucket:', error.message);
    throw error;
  }
};