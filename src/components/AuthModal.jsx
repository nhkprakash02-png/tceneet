'use client';

import React, { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile,
} from 'firebase/auth';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { uid } from '../lib/utils';
import { getAuthErrorMessage } from '../lib/authErrors';
import { fbAuth, googleProvider, DEMO_MODE } from '../firebase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_UNAVAILABLE = 'Sign-in is unavailable right now. Please try again in a moment.';

export function AccountModal() {
  const { user, setTab, closeModal, logout } = useApp();
  return (
    <Modal title="My Account">
      <p className="text-sm muted">Signed in as</p>
      <p className="font-semibold">{user.name}</p>
      <p className="text-xs muted">{user.email || user.phone}</p>
      <div className="flex gap-2 mt-5">
        <button onClick={() => { closeModal(); setTab('dashboard'); }} className="flex-1 btn-gold rounded-lg py-2.5 text-sm font-bold">Go to Dashboard</button>
        <button
          onClick={() => { logout(); closeModal(); setTab('home'); }}
          className="flex-1 btn-ghost rounded-lg py-2.5 text-sm font-bold"
        >Logout</button>
      </div>
    </Modal>
  );
}

// Every handler below only ever calls the raw Firebase Auth SDK functions and never touches
// `user`/`closeModal`/navigation directly (except for the forgot-password sub-view, which has
// no session to create). AppContext.jsx's onAuthStateChanged listener is the single place that
// turns "Firebase confirms someone is signed in" into "this app treats them as logged in" — for
// every method (Google popup, email/password login, or a brand-new email/password signup)
// uniformly. That's also what satisfies "redirect logged-in users away from login": the early
// `if (user) return <AccountModal />` below fires the instant that listener sets `user`.
export default function AuthModal() {
  const { user, closeModal, setPendingSignupProfile } = useApp();
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (user) return <AccountModal />;

  const switchView = (v) => { setView(v); setAuthError(''); setFieldErrors({}); };
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm';

  const googleSignIn = async () => {
    if (DEMO_MODE || !fbAuth) { setAuthError(AUTH_UNAVAILABLE); return; }
    setAuthError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(fbAuth, googleProvider);
      // AppContext's onAuthStateChanged listener takes it from here.
    } catch (e) {
      setAuthError(getAuthErrorMessage(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginUser = async () => {
    setAuthError('');
    if (DEMO_MODE || !fbAuth) { setAuthError(AUTH_UNAVAILABLE); return; }
    const email = (form.email || '').trim().toLowerCase();
    const password = form.password || '';
    if (!email || !password) { setAuthError('Please enter both email and password.'); return; }
    if (!EMAIL_RE.test(email)) { setAuthError('Please enter a valid email address.'); return; }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(fbAuth, email, password);
    } catch (e) {
      setAuthError(getAuthErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const validateSignup = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your full name.';
    if (!form.phone.trim()) errs.phone = 'Please enter your phone number.';
    if (!EMAIL_RE.test((form.email || '').trim())) errs.email = 'Please enter a valid email address.';
    if ((form.password || '').length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const signupUser = async () => {
    setAuthError('');
    if (DEMO_MODE || !fbAuth) { setAuthError(AUTH_UNAVAILABLE); return; }
    if (!validateSignup()) return;
    setSubmitting(true);
    // Stashed BEFORE the async call starts, so AppContext's onAuthStateChanged listener has it
    // ready the instant the new Firebase user is detected — see setPendingSignupProfile's own
    // comment in AppContext.jsx for why this avoids a redundant "complete your profile" prompt.
    setPendingSignupProfile({ name: form.name.trim(), phone: form.phone.trim() });
    try {
      const cred = await createUserWithEmailAndPassword(fbAuth, form.email.trim().toLowerCase(), form.password);
      try { await updateProfile(cred.user, { displayName: form.name.trim() }); } catch (e) { /* non-critical */ }
    } catch (e) {
      setPendingSignupProfile(null); // signup failed — don't let this leak into a later unrelated sign-in
      setAuthError(getAuthErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const openForgot = () => { setResetEmail(form.email); setResetError(''); setResetSent(false); setView('forgot'); };

  const sendReset = async () => {
    setResetError('');
    if (DEMO_MODE || !fbAuth) { setResetError(AUTH_UNAVAILABLE); return; }
    const email = resetEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) { setResetError('Please enter a valid email address.'); return; }
    setResetSubmitting(true);
    try {
      await sendPasswordResetEmail(fbAuth, email);
      setResetSent(true);
    } catch (e) {
      // Deliberately does NOT reveal whether this email is registered: an unregistered email
      // shows the exact same success state as a registered one. Only a genuinely malformed
      // email (which client-side validation above should already have caught) surfaces as an
      // error, and any other failure gets a generic message rather than Firebase's raw text.
      if (e.code === 'auth/user-not-found') setResetSent(true);
      else if (e.code === 'auth/invalid-email') setResetError('Please enter a valid email address.');
      else setResetError('Something went wrong. Please try again in a moment.');
    } finally {
      setResetSubmitting(false);
    }
  };

  if (view === 'forgot') {
    return (
      <Modal title="Reset Password">
        <button onClick={() => switchView('login')} className="text-xs muted flex items-center gap-1 mb-3 hover:text-current">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </button>
        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-sm font-semibold mb-1.5">Check your email</p>
            <p className="text-xs muted">If an account exists for <span className="font-medium">{resetEmail.trim()}</span>, we've sent a link to reset your password.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs muted">Enter your account email and we'll send you a link to reset your password.</p>
            <input type="email" placeholder="Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReset()} className={inputCls} />
            {resetError && <p className="text-xs text-red-400">{resetError}</p>}
            <button onClick={sendReset} disabled={resetSubmitting} className="w-full btn-gold rounded-lg py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {resetSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {resetSubmitting ? 'Sending…' : 'Send Reset Link'}
            </button>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal title="Student Account">
      <div className="flex gap-2 mb-4 card2 rounded-lg p-1">
        <button onClick={() => switchView('login')} className={`flex-1 rounded-md py-2 text-xs font-bold ${view === 'login' ? 'tab-active' : 'muted'}`}>Login</button>
        <button onClick={() => switchView('signup')} className={`flex-1 rounded-md py-2 text-xs font-bold ${view === 'signup' ? 'tab-active' : 'muted'}`}>Create Account</button>
      </div>

      {view === 'login' ? (
        <div className="space-y-4">
          <button onClick={googleSignIn} disabled={googleLoading} className="w-full flex items-center justify-center gap-2 border rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60" style={{ borderColor: 'var(--border)' }}>
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.6 6.5 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" /></svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs muted">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="space-y-3">
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => set({ email: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && loginUser()} className={inputCls} />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => set({ password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && loginUser()} className={inputCls} />
            <div className="text-right -mt-1.5">
              <button onClick={openForgot} className="text-xs gold-text font-semibold">Forgot password?</button>
            </div>
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button onClick={loginUser} disabled={submitting} className="w-full btn-gold rounded-lg py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Logging in…' : 'Login'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} />
            {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputCls} />
            {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={inputCls} />
            {fieldErrors.phone && <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <input type="password" placeholder="Password (min. 6 characters)" value={form.password} onChange={(e) => set({ password: e.target.value })} className={inputCls} />
            {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={(e) => set({ confirm: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && signupUser()} className={inputCls} />
            {fieldErrors.confirm && <p className="text-xs text-red-400 mt-1">{fieldErrors.confirm}</p>}
          </div>
          {authError && <p className="text-xs text-red-400">{authError}</p>}
          <button onClick={signupUser} disabled={submitting} className="w-full btn-gold rounded-lg py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </div>
      )}
    </Modal>
  );
}

export function GoogleRegisterModal({ profile }) {
  const { DB, saveDB, setUser, closeModal, setTab } = useApp();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const complete = () => {
    const name = (profile.name || '').trim();
    const email = profile.email || '';
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (DB.students.some((s) => (s.email || '').toLowerCase() === email.toLowerCase())) { setError('An account with this email already exists. Please login instead.'); return; }
    setSubmitting(true);
    const student = { id: uid('st'), uid: profile.uid, name, email, phone: phone.trim(), photoURL: profile.photoURL || '', address: '', joinDate: new Date().toISOString().slice(0, 10), registeredAt: new Date().toISOString(), paymentStatus: 'Not Enrolled', batch: '—', pendingReview: true };
    saveDB((prev) => ({ ...prev, students: [...prev.students, student] }));
    setUser(student); closeModal(); setTab('dashboard');
  };

  const inputCls = 'w-full rounded-lg px-3 py-2.5 text-sm';
  return (
    <Modal title="Complete Your Profile">
      <p className="text-xs muted mb-4">You're signed in with Google — just one more detail to finish setting up your account.</p>
      <div className="space-y-3">
        <input type="text" defaultValue={profile.name || ''} placeholder="Full Name" className={inputCls} disabled />
        <input type="email" defaultValue={profile.email || ''} readOnly placeholder="Email" className={`${inputCls} opacity-70 cursor-not-allowed`} />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && complete()} className={inputCls} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button onClick={complete} disabled={submitting} className="w-full btn-gold rounded-lg py-2.5 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Finishing up…' : 'Complete Registration'}
        </button>
      </div>
    </Modal>
  );
}
