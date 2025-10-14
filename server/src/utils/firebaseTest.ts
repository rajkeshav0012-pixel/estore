import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase Storage connection...');
    
    // Create a test reference
    const testRef = ref(storage, 'test/connection-test.txt');
    const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in bytes
    
    console.log('📁 Storage bucket:', storage.app.options.storageBucket);
    console.log('🔗 Test reference path:', testRef.fullPath);
    
    // Try to upload a small test file
    const snapshot = await uploadBytes(testRef, testData);
    console.log('✅ Test upload successful:', snapshot.metadata.name);
    
    // Try to get download URL
    const downloadURL = await getDownloadURL(testRef);
    console.log('🌐 Download URL generated:', downloadURL);
    
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error('❌ Firebase Storage test failed:', {
      message: error.message,
      code: error.code,
      status: error.status,
      serverResponse: error.serverResponse
    });
    return { success: false, error: error.message };
  }
};