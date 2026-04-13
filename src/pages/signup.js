import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useAuth } from '../context/AuthContext';
import styles from './auth.module.css';

export default function SignupPage() {
  const { signup, user } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up" description="Create your Physical AI Book account">
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>🚀</div>
            <h1 className={styles.authTitle}>Create Account</h1>
            <p className={styles.authSubtitle}>Join and track your learning journey</p>
          </div>

          {error && <div className={styles.authError}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Muhammad Hamza"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirm Password</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.authBtn} disabled={loading}>
              {loading ? '⏳ Creating account...' : 'Sign Up Free →'}
            </button>
          </form>

          <p className={styles.authSwitch}>
            Already have an account?{' '}
            <Link to="/login" className={styles.authLink}>Login</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
