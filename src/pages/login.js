import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useAuth } from '../context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const { login, user } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login" description="Login to Physical AI Book">
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>🤖</div>
            <h1 className={styles.authTitle}>Welcome Back</h1>
            <p className={styles.authSubtitle}>Login to track your progress</p>
          </div>

          {error && <div className={styles.authError}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.authBtn} disabled={loading}>
              {loading ? '⏳ Logging in...' : 'Login →'}
            </button>
          </form>

          <p className={styles.authSwitch}>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.authLink}>Sign up free</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
