// Firebase Configuration for DAKS SYSTEM
// Using environment variables with fallback to actual values

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCMKpB_BwOQ_KxwUKI9v-l3ND_n5FQQQbE",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "dsmanagement-bb22c.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "dsmanagement-bb22c",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "dsmanagement-bb22c.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "917825703936",
  appId: process.env.FIREBASE_APP_ID || "1:917825703936:web:657a3024ef2a66580d48e5",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-RYVZ13EMEG"
};

// Initialize Firebase
try {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized');
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // Set persistence to LOCAL (stay logged in)
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log('✅ Auth persistence: LOCAL'))
    .catch((error) => console.warn('⚠️ Persistence:', error.message));

  // Enable offline persistence
  db.enablePersistence()
    .then(() => console.log('✅ Firestore persistence enabled'))
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs - persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Browser does not support persistence');
      }
    });

  // Make globally available
  window.auth = auth;
  window.db = db;

  console.log('✅ Firebase ready');
  console.log('✅ Project:', firebaseConfig.projectId);

} catch (error) {
  console.error('❌ Firebase error:', error.message);
}