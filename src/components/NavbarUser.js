import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from '@docusaurus/Link';
import { useAuth } from '@site/src/context/AuthContext';

const C = {
  primary: '#546B41', mid: '#99AD7A', gold: '#C8873A',
  beige: '#DCCCAC', cream: '#FFF8EC', dark: '#3d4f30',
};

export default function NavbarUser() {
  const { user, logout, loading } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted || loading) return null;

  // Find navbar right items to inject into
  const navRight = document.querySelector('.navbar__items--right');
  if (!navRight) return null;

  const btnBase = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.2s',
  };

  const Widget = (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {user ? (
        <>
          {/* Avatar button */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              ...btnBase,
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.gold}, #E8A84E)`,
              color: C.dark, fontWeight: '800',
              fontSize: '0.85rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(200,135,58,0.4)',
            }}
            title={user.name}
          >
            {user.name?.[0]?.toUpperCase() || '?'}
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{
              position: 'absolute', top: '44px', right: 0,
              background: '#fff', border: `2px solid ${C.beige}`,
              borderRadius: '14px', minWidth: '200px',
              boxShadow: '0 12px 40px rgba(84,107,65,0.18)',
              zIndex: 9999, overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{
                padding: '14px 16px',
                background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                color: C.cream,
              }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '2px' }}>{user.email}</div>
              </div>

              {/* Menu items */}
              {[
                { label: '📊 My Progress',      href: '/dashboard' },
                { label: '💬 Chat History',     href: '/dashboard#chat' },
                { label: '🎯 Quiz Results',     href: '/dashboard#quiz' },
              ].map(item => (
                <a key={item.href} href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block', padding: '10px 16px',
                    color: '#2c3320', fontSize: '0.88rem',
                    fontWeight: '500', textDecoration: 'none',
                    borderBottom: `1px solid ${C.beige}`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(153,173,122,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.label}
                </a>
              ))}

              <button
                onClick={() => { logout(); setOpen(false); }}
                style={{
                  ...btnBase, display: 'block', width: '100%',
                  textAlign: 'left', padding: '10px 16px',
                  color: '#c0392b', fontSize: '0.88rem',
                  fontWeight: '600',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </>
      ) : (
        /* Guest — show Login + Signup buttons */
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a href="/login" style={{
            padding: '6px 14px', borderRadius: '20px',
            border: `1.5px solid rgba(220,204,172,0.6)`,
            color: C.cream, fontSize: '0.85rem', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,204,172,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Login
          </a>
          <a href="/signup" style={{
            padding: '6px 14px', borderRadius: '20px',
            background: `linear-gradient(135deg, ${C.gold}, #E8A84E)`,
            color: C.dark, fontSize: '0.85rem', fontWeight: '700',
            textDecoration: 'none', boxShadow: '0 2px 8px rgba(200,135,58,0.35)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Sign Up
          </a>
        </div>
      )}
    </div>
  );

  return createPortal(Widget, navRight);
}
