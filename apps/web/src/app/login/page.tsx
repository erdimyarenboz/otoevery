'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const ROLE_REDIRECTS: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  COMPANY_MANAGER: '/company',
  DRIVER: '/driver',
  SERVICE_CENTER: '/service',
};

export default function CompanyLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login({ email, password });
    if (res.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      router.push(ROLE_REDIRECTS[user.role] || '/company');
    } else {
      setError(res.message || 'E-posta veya şifre hatalı');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-card">
        {/* Logo */}
        <Link href="/" className="auth-logo">
          <img src="/logo.png" alt="OtoEvery" style={{ height: 56 }} />
        </Link>

        <div className="auth-header">
          <div className="auth-type-badge">🏢 Şirket Girişi</div>
          <h1 className="auth-title">Hoş Geldiniz</h1>
          <p className="auth-subtitle">Şirket panelinize giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>E-posta Adresi</label>
            <input
              type="email"
              placeholder="ad@sirketiniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label>Şifre</label>
            <div className="auth-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>
        </form>

        <div className="auth-divider"><span>diğer giriş seçenekleri</span></div>

        <div className="auth-other-logins">
          <Link href="/login/service" className="auth-link-btn">
            🔧 Oto Servis Girişi
          </Link>
          <Link href="/login/driver" className="auth-link-btn">
            🚗 Sürücü Girişi (Plaka)
          </Link>
        </div>

        <Link href="/" className="auth-back">← Ana Sayfaya Dön</Link>
      </div>

      <style>{authStyles}</style>
    </div>
  );
}

const authStyles = `
.auth-page {
  min-height: 100vh;
  background: #080b14;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.auth-glow-1 {
  position: fixed; top: -200px; left: -200px;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.auth-glow-2 {
  position: fixed; bottom: -200px; right: -200px;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #1a1d27;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 40px;
  position: relative;
  z-index: 1;
}
.auth-logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; margin-bottom: 32px;
}
.auth-logo-icon {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 900; color: white;
}
.auth-logo-text {
  font-size: 20px; font-weight: 800;
  background: linear-gradient(135deg, #818cf8, #06b6d4);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; letter-spacing: -0.03em;
}
.auth-header { margin-bottom: 28px; }
.auth-type-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 100px;
  font-size: 12px; font-weight: 600; color: #818cf8;
  margin-bottom: 12px;
}
.auth-title {
  font-size: 26px; font-weight: 800; color: #f1f5f9;
  letter-spacing: -0.03em; margin-bottom: 4px;
}
.auth-subtitle { font-size: 14px; color: #64748b; }
.auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.auth-field { display: flex; flex-direction: column; gap: 6px; }
.auth-field label { font-size: 13px; font-weight: 500; color: #94a3b8; }
.auth-field input {
  padding: 12px 16px;
  background: #13151e;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 14px; font-family: inherit;
  outline: none; transition: all 0.2s;
}
.auth-field input:focus {
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.auth-field input::placeholder { color: #334155; }
.auth-pw-wrap { position: relative; }
.auth-pw-wrap input { width: 100%; padding-right: 44px; }
.auth-pw-wrap button {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.5;
  color: #94a3b8;
}
.auth-error {
  padding: 10px 14px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  color: #f87171; font-size: 13px;
}
.auth-btn {
  padding: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(99,102,241,0.3);
}
.auth-btn:hover { background: linear-gradient(135deg, #4f46e5, #4338ca); transform: translateY(-1px); }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.auth-divider {
  text-align: center; position: relative; margin-bottom: 16px;
}
.auth-divider::before {
  content: ''; position: absolute; top: 50%; left: 0; right: 0;
  height: 1px; background: rgba(255,255,255,0.06);
}
.auth-divider span {
  position: relative; background: #1a1d27; padding: 0 12px;
  font-size: 12px; color: #334155;
}
.auth-other-logins {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;
}
.auth-link-btn {
  display: block; padding: 12px 16px; text-align: center;
  background: #13151e; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; color: #94a3b8; font-size: 14px; font-weight: 500;
  text-decoration: none; transition: all 0.2s;
}
.auth-link-btn:hover {
  border-color: rgba(255,255,255,0.15); color: #f1f5f9;
  background: #1e2130;
}
.auth-back {
  display: block; text-align: center; font-size: 13px; color: #475569;
  text-decoration: none; transition: color 0.2s;
}
.auth-back:hover { color: #94a3b8; }
`;
