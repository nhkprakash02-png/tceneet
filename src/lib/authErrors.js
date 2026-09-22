// Firebase Auth throws errors as `{ code: 'auth/xxx', message: '...' }`. The `message` is
// Firebase's own internal wording (verbose, sometimes technical, inconsistent tone) — never show
// it to a student directly. This maps the error codes that actually show up in normal use to
// short, friendly text instead. Anything not listed falls back to a safe generic message rather
// than leaking raw Firebase text.
const MESSAGES = {
  // Login
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/user-not-found': 'No account found with this email. Please sign up first.',
  // Modern Firebase Auth returns this single generic code for BOTH a wrong password and an
  // unregistered email, specifically so a login form can't be used to probe which emails are
  // registered — keep that same ambiguity here rather than trying to guess which one it was.
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',

  // Signup
  'auth/email-already-in-use': 'An account with this email already exists. Please login instead.',
  'auth/weak-password': 'Password should be at least 6 characters.',

  // Shared
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error — please check your connection and try again.',

  // Google popup sign-in
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': "Your browser blocked the sign-in popup. Please allow popups for this site and try again.",
  'auth/unauthorized-domain': "Google sign-in failed: this website's domain isn't yet authorized in Firebase. Please contact the site admin.",
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method. Try logging in with your email and password instead.',
};

export function getAuthErrorMessage(error) {
  const code = error?.code || '';
  return MESSAGES[code] || 'Something went wrong. Please try again.';
}
