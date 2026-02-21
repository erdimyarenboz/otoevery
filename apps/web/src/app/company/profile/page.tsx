'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Profile {
    id: string;
    name: string;
    slug: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    taxOffice?: string;
    taxNumber?: string;
    creditBalance: number;
}

export default function CompanyProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [form, setForm] = useState({ address: '', contactEmail: '', contactPhone: '', taxOffice: '', taxNumber: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const res = await api.get('/api/v1/company/profile');
        if (res.success && res.data) {
            setProfile(res.data);
            setForm({
                address: res.data.address || '',
                contactEmail: res.data.contactEmail || '',
                contactPhone: res.data.contactPhone || '',
                taxOffice: res.data.taxOffice || '',
                taxNumber: res.data.taxNumber || '',
            });
        }
        setLoading(false);
    };

    const save = async () => {
        setSaving(true);
        const res = await api.put('/api/v1/company/profile', form);
        if (res.success) {
            setSaved(true);
            await loadProfile();
            setTimeout(() => setSaved(false), 2500);
        }
        setSaving(false);
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, color: 'var(--primary)' }} /></div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🏢 Şirket Profili</div>
                    <div className="page-description">Şirket bilgilerinizi görüntüleyin ve güncelleyin</div>
                </div>
            </div>

            <div style={{ maxWidth: 640 }}>
                {/* Read-only info */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>📋 Genel Bilgiler</div>
                    <div style={{ padding: '16px 20px' }}>
                        {[
                            ['Şirket Adı', profile?.name],
                            ['Kısa Ad (Slug)', profile?.slug],
                            ['Kredi Bakiyesi', `₺${(profile?.creditBalance || 0).toLocaleString('tr-TR')}`],
                        ].map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{l}</span>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{v || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editable fields */}
                <div className="card">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>✏️ Düzenlenebilir Bilgiler</div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Adres', key: 'address', placeholder: 'Şirket adresi' },
                            { label: 'İletişim E-posta', key: 'contactEmail', placeholder: 'info@sirket.com' },
                            { label: 'İletişim Telefon', key: 'contactPhone', placeholder: '0212 555 0000' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                                <input className="form-input" style={{ margin: 0 }} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                            </div>
                        ))}

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-muted)' }}>🧾 Vergi Bilgileri</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vergi Dairesi</label>
                                    <input className="form-input" style={{ margin: 0 }} placeholder="İstanbul Vergi Dairesi" value={form.taxOffice} onChange={e => setForm(p => ({ ...p, taxOffice: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vergi Numarası</label>
                                    <input className="form-input" style={{ margin: 0 }} placeholder="1234567890" value={form.taxNumber} onChange={e => setForm(p => ({ ...p, taxNumber: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ marginTop: 8 }}>
                            {saving ? 'Kaydediliyor...' : saved ? '✅ Kaydedildi!' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
