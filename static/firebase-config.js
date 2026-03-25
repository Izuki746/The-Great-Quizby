// ============================================
// FIREBASE CONFIGURATION
// ============================================
// This file handles all Firebase Authentication operations
// Firebase manages user authentication (login/signup) while SQLite stores user profiles
// import { initializeApp as firebase_init } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
// import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
// Your web app's Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAXZe1a0MselJmXOgbn-9nuZ3IG2HhsavA",
  authDomain: "the-great-quizby.firebaseapp.com",
  projectId: "the-great-quizby",
  storageBucket: "the-great-quizby.firebasestorage.app",
  messagingSenderId: "290451649305",
  appId: "1:290451649305:web:2e6ae9baee44113feccb88",
  measurementId: "G-S3D8XZKBJG"
};
console.log("Firebase config loaded");
console.log("projectId:", firebaseConfig.projectId);
console.log("authDomain:", firebaseConfig.authDomain);
// Initialize Firebase SDK with your config
// This must be called before using any Firebase services
// This must be called before using any Firebase services
firebase.initializeApp(firebaseConfig);
// const firebaseApp = firebase_init(firebaseConfig);
// const auth = getAuth(firebaseApp);
// Get reference to Firebase Authentication service
const auth = firebase.auth();

// ============================================
// FIREBASE AUTHENTICATION HELPER FUNCTIONS
// ============================================
// These functions wrap Firebase Auth methods for easier use throughout the app

export const firebaseAuth = {
  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password (min 6 characters for Firebase)
   * @returns {Object} - { success: boolean, user: FirebaseUser, token: string } or { success: false, error: string }
   */
  signup: async (email, password) => {
    try {
      // Create new user account in Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Get ID token for backend verification (JWT token)
      const token = await userCredential.user.getIdToken();
      
      return { success: true, user: userCredential.user, token };
    } catch (error) {
      // Return error message (e.g., "Email already in use", "Weak password")
      return { success: false, error: error.message };
    }
  },

  /**
   * Login existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, user: FirebaseUser, token: string } or { success: false, error: string }
   */
  login: async (email, password) => {
    try {
      // Authenticate user with Firebase
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      
      // Get ID token to send to backend for verification
      const token = await userCredential.user.getIdToken();
      
      return { success: true, user: userCredential.user, token };
    } catch (error) {
      // Return error message (e.g., "Wrong password", "User not found")
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out the current user
   * @returns {Object} - { success: boolean } or { success: false, error: string }
   */
  logout: async () => {
    try {
      // Sign out from Firebase (clears Firebase session)
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get the currently logged-in user
   * @returns {FirebaseUser|null} - Current user object or null if not logged in
   */
  getCurrentUser: () => {
    return auth.currentUser;
  },

  /**
   * Get ID token for the current user (for authenticated API requests)
   * @returns {string|null} - ID token or null if no user is logged in
   */
  getIdToken: async () => {
    const user = auth.currentUser;
    if (user) {
      // Get fresh ID token (Firebase refreshes it automatically if expired)
      return await user.getIdToken();
    }
    return null;
  },

  /**
   * Listen for authentication state changes
   * @param {Function} callback - Called when user logs in or out
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged(callback);
  },

  /**
   * Send password reset email to user
   * @param {string} email - User's email address
   * @returns {Object} - { success: boolean } or { success: false, error: string }
   */
  resetPassword: async (email) => {
    try {
      // Send password reset email via Firebase
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      // Return error message (e.g., "User not found", "Invalid email")
      return { success: false, error: error.message };
    }
  }
};

// ============================================
// TOKEN MANAGEMENT (LocalStorage)
// ============================================
// These functions manage the Firebase ID token in browser's localStorage
// The token is sent with API requests to verify user identity on the backend

/**
 * Store Firebase ID token in localStorage
 * @param {string} token - Firebase ID token (JWT)
 */
export const storeToken = (token) => {
  localStorage.setItem('firebaseToken', token);
};

/**
 * Retrieve stored Firebase ID token from localStorage
 * @returns {string|null} - Token or null if not found
 */
export const getStoredToken = () => {
  return localStorage.getItem('firebaseToken');
};

/**
 * Remove Firebase ID token from localStorage (used on logout)
 */
export const clearStoredToken = () => {
  localStorage.removeItem('firebaseToken');
};