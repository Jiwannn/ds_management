// DAKS SYSTEM - Authentication with Persistent Session

const VALID_ACCESS_CODES = ['MYLYKES2026', 'ADMIN2026', 'DS2026', 'DAKS2026'];

// Check if already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
  const session = localStorage.getItem('daksSystemSession');
  if (session && window.location.pathname.includes('login')) {
    // Already logged in, go to admin
    window.location.href = 'admin.html';
  }
});

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

function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('registerBox').style.display = 'none';
}

function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'block';
}

// Login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  errorDiv.style.display = 'none';
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    
    let adminData;
    if (!adminDoc.exists) {
      adminData = {
        name: email.split('@')[0],
        email: email,
        role: 'admin',
        status: 'active'
      };
      await db.collection('admins').doc(user.uid).set({
        ...adminData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      adminData = adminDoc.data();
    }
    
    // Save session with NO expiry (persistent)
    localStorage.setItem('daksSystemSession', JSON.stringify({
      userId: user.uid,
      name: adminData.name || 'Admin',
      email: user.email,
      role: 'admin',
      loginTime: new Date().toISOString()
    }));
    
    window.location.href = 'admin.html';
    
  } catch (error) {
    errorDiv.textContent = getErrorMessage(error);
    errorDiv.style.display = 'block';
  }
});

// Register
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const accessCode = document.getElementById('accessCode').value.trim();
  const errorDiv = document.getElementById('registerError');
  const successDiv = document.getElementById('registerSuccess');
  
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }
  
  if (!VALID_ACCESS_CODES.includes(accessCode)) {
    errorDiv.textContent = 'Invalid access code';
    errorDiv.style.display = 'block';
    return;
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    await db.collection('admins').doc(user.uid).set({
      name: name,
      email: email,
      role: 'admin',
      status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    successDiv.textContent = 'Account created! Redirecting...';
    successDiv.style.display = 'block';
    
    await auth.signOut();
    setTimeout(() => showLogin(), 2000);
    
  } catch (error) {
    errorDiv.textContent = getErrorMessage(error);
    errorDiv.style.display = 'block';
  }
});

function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/user-not-found': return 'No account found with this email';
    case 'auth/wrong-password': return 'Invalid password';
    case 'auth/email-already-in-use': return 'Email already registered';
    case 'auth/invalid-email': return 'Invalid email';
    case 'auth/weak-password': return 'Password too weak';
    default: return error.message;
  }
}