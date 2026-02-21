'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    plateNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    phone: string;
    createdAt: string;
    company: { id: string; name: string } | null;
    serviceCenter: { id: string; name: string } | null;
    vehicle: { id: string; plate: string; brand: string; model: string } | null;
}

interface Company { id: string; name: string; }

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    SUPER_ADMIN: { label: 'Süper Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    COMPANY_MANAGER: { label: 'Şirket Yöneticisi', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    DRIVER: { label: 'Sürücü', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    SERVICE_CENTER: { label: 'Servis', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showPwModal, setShowPwModal] = useState<User | null>(null);
    const [newPw, setNewPw] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '', lastName: '', email: '', plateNumber: '',
        password: '', role: 'COMPANY_MANAGER', phone: '', companyId: '',
    });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        const [uRes, cRes] = await Promise.all([
            api.get('/api/v1/admin/users'),
            api.get('/api/v1/admin/companies'),
        ]);
        if (uRes.success) setUsers(uRes.data);
        if (cRes.success) setCompanies(cRes.data);
        setLoading(false);
    };

    const addUser = async () => {
        if (!newUser.firstName || !newUser.lastName || !newUser.password || !newUser.role) return;
        setSaving(true);
        const payload: any = { ...newUser };
        if (newUser.role === 'DRIVER') { delete payload.email; }
        else { delete payload.plateNumber; }
        if (!payload.companyId) delete payload.companyId;
        const res = await api.post('/api/v1/admin/users', payload);
        if (res.success) {
            setShowAdd(false);
            setNewUser({ firstName: '', lastName: '', email: '', plateNumber: '', password: '', role: 'COMPANY_MANAGER', phone: '', companyId: '' });
            loadAll();
        }
        setSaving(false);
    };

    const changePassword = async () => {
        if (!showPwModal || !newPw) return;
        setPwSaving(true);
        const res = await api.put(`/api/v1/admin/users/${showPwModal.id}/password`, { password: newPw });
        if (res.success) { setShowPwModal(null); setNewPw(''); }
        setPwSaving(false);
    };

    const toggleActive = async (user: User) => {
        await api.put(`/api/v1/admin/users/${user.id}/status`, { isActive: !user.isActive });
        loadAll();
    };

    const filtered = users.filter(u => {
        const text = `${u.firstName} ${u.lastName} ${u.email || ''} ${u.plateNumber || ''} ${u.company?.name || ''}`.toLowerCase();
        const matchSearch = text.includes(search.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const grouped = {
        managers: filtered.filter(u => u.role === 'COMPANY_MANAGER'),
        drivers: filtered.filter(u => u.role === 'DRIVER'),
        service: filtered.filter(u => u.role === 'SERVICE_CENTER'),
        admin: filtered.filter(u => u.role === 'SUPER_ADMIN'),
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">👥 Kullanıcılar</div>
                    <div className="page-description">Yetkili ve sürücü yönetimi</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Kullanıcı Ekle</button>
            </div>

            {/* Stats */}
            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: '👥', value: users.length, label: 'Toplam', color: '#6366f1' },
                    { icon: '🏢', value: grouped.managers.length, label: 'Şirket Yöneticisi', color: '#6366f1' },
                    { icon: '🚗', value: grouped.drivers.length, label: 'Sürücü', color: '#10b981' },
                    { icon: '✅', value: users.filter(u => u.isActive).length, label: 'Aktif', color: '#06b6d4' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-color-bg': `${s.color}1a` } as React.CSSProperties}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="card" style={{ flex: 1, padding: '12px 16px' }}>
                    <input className="form-input" placeholder="🔍 İsim, e-posta, plaka veya şirket ara..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ margin: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, width: '100%', color: 'var(--text-primary)' }} />
                </div>
                <select className="form-input" style={{ margin: 0, width: 200 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="">Tüm Roller</option>
                    <option value="COMPANY_MANAGER">Şirket Yöneticisi</option>
                    <option value="DRIVER">Sürücü</option>
                    <option value="SERVICE_CENTER">Servis</option>
                    <option value="SUPER_ADMIN">Süper Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Giriş Bilgisi</th>
                                <th>Rol</th>
                                <th>Şirket / Bağlı</th>
                                <th>Araç</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const role = ROLE_LABELS[u.role] || { label: u.role, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.phone || '—'}</div>
                                        </td>
                                        <td>
                                            {u.email && <div style={{ fontSize: 13 }}>📧 {u.email}</div>}
                                            {u.plateNumber && <div style={{ fontSize: 13 }}>🚗 <span style={{ fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 4 }}>{u.plateNumber}</span></div>}
                                        </td>
                                        <td>
                                            <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: role.bg, color: role.color }}>
                                                {role.label}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            {u.company?.name || u.serviceCenter?.name || '—'}
                                        </td>
                                        <td style={{ fontSize: 13 }}>
                                            {u.vehicle
                                                ? <span style={{ fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1px 6px', borderRadius: 4 }}>{u.vehicle.plate}</span>
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            }
                                        </td>
                                        <td>
                                            <button onClick={() => toggleActive(u)} style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: u.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                                {u.isActive ? 'Aktif' : 'Pasif'}
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }}
                                                onClick={() => setShowPwModal(u)}>
                                                🔑 Şifre
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Kullanıcı bulunamadı</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Password Change Modal */}
            {showPwModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPwModal(null)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 400, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🔑 Şifre Değiştir</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{showPwModal.firstName} {showPwModal.lastName} — {showPwModal.email || showPwModal.plateNumber}</div>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Yeni şifre" style={{ margin: 0, paddingRight: 44 }}
                                value={newPw} onChange={e => setNewPw(e.target.value)} />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>
                                {showPw ? '🙈' : '👁'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => { setShowPwModal(null); setNewPw(''); }} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={changePassword} disabled={pwSaving || !newPw} style={{ flex: 1 }}>
                                {pwSaving ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowAdd(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>+ Yeni Kullanıcı</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Ad *</label>
                                    <input className="form-input" placeholder="Ad" style={{ margin: 0 }} value={newUser.firstName} onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Soyad *</label>
                                    <input className="form-input" placeholder="Soyad" style={{ margin: 0 }} value={newUser.lastName} onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Rol *</label>
                                <select className="form-input" style={{ margin: 0 }} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                                    <option value="COMPANY_MANAGER">Şirket Yöneticisi</option>
                                    <option value="DRIVER">Sürücü (Plaka ile giriş)</option>
                                    <option value="SERVICE_CENTER">Servis Merkezi</option>
                                </select>
                            </div>
                            {newUser.role === 'DRIVER' ? (
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Plaka *</label>
                                    <input className="form-input" placeholder="34 ABC 123" style={{ margin: 0, letterSpacing: 2, fontWeight: 700 }}
                                        value={newUser.plateNumber} onChange={e => setNewUser(p => ({ ...p, plateNumber: e.target.value.toUpperCase() }))} />
                                </div>
                            ) : (
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>E-posta *</label>
                                    <input className="form-input" type="email" placeholder="ad@sirket.com" style={{ margin: 0 }}
                                        value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
                                </div>
                            )}
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Telefon</label>
                                <input className="form-input" placeholder="0532 000 0000" style={{ margin: 0 }} value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            {(newUser.role === 'COMPANY_MANAGER' || newUser.role === 'DRIVER') && (
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Şirket</label>
                                    <select className="form-input" style={{ margin: 0 }} value={newUser.companyId} onChange={e => setNewUser(p => ({ ...p, companyId: e.target.value }))}>
                                        <option value="">— Şirket seçin —</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Şifre *</label>
                                <input className="form-input" type="password" placeholder="En az 6 karakter" style={{ margin: 0 }}
                                    value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={addUser} disabled={saving} style={{ flex: 1 }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
