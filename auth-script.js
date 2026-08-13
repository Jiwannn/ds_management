// DAKS SYSTEM - Authentication (COMPLETE WORKING)

const VALID_ACCESS_CODES = ['MYLYKES2026', 'ADMIN2026', 'DS2026', 'DAKS2026'];

// Toggle password visibility
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// Show login form
function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('registerBox').style.display = 'none';
  clearErrors();
}

// Show register form
function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'block';
  clearErrors();
}

// Clear all error messages
function clearErrors() {
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  
  if (loginError) loginError.style.display = 'none';
  if (registerError) registerError.style.display = 'none';
  if (registerSuccess) registerSuccess.style.display = 'none';
}

// Get error message
function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/email-already-in-use':
      return 'Email already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password is too weak (min 8 characters)';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase Console';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    default:
      return error.message || 'An error occurred';
  }
}

// LOGIN FORM
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');
  const submitBtn = this.querySelector('button[type="submit"]');
  
  loginError.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    // Check if Firebase is initialized
    if (typeof auth === 'undefined') {
      throw new Error('Firebase not initialized. Check firebase-config.js');
    }
    
    // Sign in
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ User signed in:', user.uid);
    
    // Check if admin exists in Firestore
    let adminData = null;
    
    try {
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      
      if (adminDoc.exists) {
        adminData = adminDoc.data();
      } else {
        // Auto-create admin document
        adminData = {
          name: email.split('@')[0],
          email: email,
          role: 'admin',
          status: 'active'
        };
        
        await db.collection('admins').doc(user.uid).set({
          ...adminData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Admin document created');
      }
    } catch (firestoreError) {
      console.warn('⚠️ Firestore error, using default admin data');
      adminData = {
        name: email.split('@')[0],
        email: email,
        role: 'admin',
        status: 'active'
      };
    }
    
    // Save session to localStorage (persistent - no expiry)
    const sessionData = {
      userId: user.uid,
      name: adminData.name || email.split('@')[0],
      email: user.email,
      role: 'admin',
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('daksSystemSession', JSON.stringify(sessionData));
    
    console.log('✅ Session saved');
    
    // Redirect to admin
    window.location.href = 'admin.html';
    
  } catch (error) {
    console.error('❌ Login error:', error.code, error.message);
    loginError.textContent = getErrorMessage(error);
    loginError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});

// REGISTER FORM
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const accessCode = document.getElementById('accessCode').value.trim();
  
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const submitBtn = this.querySelector('button[type="submit"]');
  
  // Clear previous messages
  registerError.style.display = 'none';
  registerSuccess.style.display = 'none';
  
  // Validate name
  if (name.length < 2) {
    registerError.textContent = 'Please enter your full name';
    registerError.style.display = 'block';
    return;
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    registerError.textContent = 'Passwords do not match';
    registerError.style.display = 'block';
    return;
  }
  
  // Validate password length
  if (password.length < 8) {
    registerError.textContent = 'Password must be at least 8 characters';
    registerError.style.display = 'block';
    return;
  }
  
  // Validate access code
  if (!VALID_ACCESS_CODES.includes(accessCode)) {
    registerError.textContent = 'Invalid access code. Contact administrator.';
    registerError.style.display = 'block';
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  
  try {
    // Check Firebase
    if (typeof auth === 'undefined') {
      throw new Error('Firebase not initialized');
    }
    
    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ User created:', user.uid);
    
    // Update profile
    await user.updateProfile({ displayName: name });
    
    // Save to Firestore
    await db.collection('admins').doc(user.uid).set({
      name: name,
      email: email,
      role: 'admin',
      status: 'active',
      accessCode: accessCode,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    });
    
    console.log('✅ Admin saved to Firestore');
    
    // Show success
    registerSuccess.textContent = 'Account created successfully! Redirecting to login...';
    registerSuccess.style.display = 'block';
    
    // Sign out the new user
    await auth.signOut();
    
    // Reset form
    document.getElementById('registerForm').reset();
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      showLogin();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Registration error:', error.code, error.message);
    registerError.textContent = getErrorMessage(error);
    registerError.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

// Check if already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
  const session = localStorage.getItem('daksSystemSession');
  
  if (session && window.location.pathname.includes('login')) {
    // Already logged in, redirect to admin
    window.location.href = 'admin.html';
  }
});