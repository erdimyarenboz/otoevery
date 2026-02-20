'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const TYPE_OPTIONS = [
    { value: 'wash', label: '🧽 Yıkama', color: '#06b6d4' },
    { value: 'maintenance', label: '🔧 Bakım', color: '#f59e0b' },
    { value: 'tire', label: '🛞 Lastik', color: '#10b981' },
    { value: 'both', label: '⭐ Hepsi', color: '#6366f1' },
];

interface Profile {
    id: string;
    name: string;
    address: string;
    type: string;
    phone: string;
    contactEmail: string;
    workingHours: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    iban: string | null;
    bankAccountName: string | null;
    bankName: string | null;
    paymentDay: number | null;
}

export default function ServiceProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [type, setType] = useState('both');
    const [description, setDescription] = useState('');
    const [iban, setIban] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankName, setBankName] = useState('');

    useEffect(() => {
        api.get('/api/v1/service/profile').then(r => {
            if (r.success && r.data) {
                const p = r.data;
                setProfile(p);
                setName(p.name || '');
                setAddress(p.address || '');
                setPhone(p.phone || '');
                setContactEmail(p.contactEmail || '');
                setWorkingHours(p.workingHours || '');
                setType(p.type || 'both');
                setDescription(p.description || '');
                setIban(p.iban || '');
                setBankAccountName(p.bankAccountName || '');
                setBankName(p.bankName || '');
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        const res = await api.put('/api/v1/service/profile', { name, address, phone, contactEmail, workingHours, type, description, iban, bankAccountName, bankName });
        if (res.success) {
            setProfile(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    // Calculate next payment date
    const getNextPaymentDate = () => {
        if (!profile?.paymentDay) return null;
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), profile.paymentDay);
        if (thisMonth > now) return thisMonth;
        return new Date(now.getFullYear(), now.getMonth() + 1, profile.paymentDay);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    const nextPayment = getNextPaymentDate();

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🏪 İşletme Profili</div>
                    <div className="page-description">Çalışma saati, adres, telefon, hizmet türü ve banka bilgilerinizi güncelleyin</div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 140 }}>
                    {saving ? '⏳ Kaydediliyor...' : saved ? '✅ Kaydedildi!' : '💾 Kaydet'}
                </button>
            </div>

            {saved && (
                <div style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)',
                    color: 'var(--success)', fontWeight: 500, fontSize: 14, marginBottom: 20,
                }}>
                    ✅ Profil başarıyla güncellendi! Anlaşmalı sürücüler ve yöneticiler bu bilgileri haritada görecektir.
                </div>
            )}

            {/* Payment Day Banner */}
            {profile?.paymentDay && (
                <div style={{
                    padding: '14px 20px', borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: 'var(--text-primary)', fontWeight: 500, fontSize: 14, marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span>📅 Sıradaki ödeme günü: <strong>Her ayın {profile.paymentDay}&apos;i</strong></span>
                    {nextPayment && (
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {nextPayment.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    )}
                </div>
            )}

            <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
                {/* Left — Main Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card animate-fadeIn">
                        <div className="card-header">
                            <span className="card-title">Genel Bilgiler</span>
                        </div>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">İşletme Adı</label>
                            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Servis merkezi adı" />
                        </div>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">Adres</label>
                            <textarea
                                className="form-input"
                                value={address} onChange={e => setAddress(e.target.value)}
                                placeholder="Tam adres yazın (haritada gözükecek)"
                                rows={3}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        <div className="grid grid-2" style={{ gap: 16, marginBottom: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Telefon</label>
                                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0216 XXX XXXX" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-posta</label>
                                <input className="form-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="info@example.com" type="email" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Çalışma Saatleri</label>
                            <input className="form-input" value={workingHours} onChange={e => setWorkingHours(e.target.value)} placeholder="Örn: 08:00 - 20:00 (Hafta içi), 09:00 - 18:00 (Cumartesi)" />
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                Sürücüler ve şirket yöneticileri bu bilgiyi haritada görecektir.
                            </div>
                        </div>
                    </div>

                    {/* Bank Info Card */}
                    <div className="card animate-fadeIn">
                        <div className="card-header">
                            <span className="card-title">🏦 Banka Bilgileri</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Hakediş ödemeleriniz bu hesaba yapılacaktır. Bilgileriniz yalnızca sistem yöneticisi tarafından görüntülenebilir.
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">IBAN</label>
                            <input
                                className="form-input"
                                value={iban}
                                onChange={e => setIban(e.target.value)}
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                            />
                        </div>

                        <div className="grid grid-2" style={{ gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Alıcı Adı Soyadı</label>
                                <input className="form-input" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Ad Soyad" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Banka Adı</label>
                                <input className="form-input" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Örn: Ziraat Bankası" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Service Type & Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card animate-fadeIn">
                        <div className="card-header">
                            <span className="card-title">Hizmet Türü</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {TYPE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setType(opt.value)}
                                    style={{
                                        padding: '16px 12px',
                                        border: type === opt.value ? `2px solid ${opt.color}` : '2px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        background: type === opt.value ? `${opt.color}15` : 'var(--bg-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                                        color: type === opt.value ? opt.color : 'var(--text-muted)',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                            Seçtiğiniz hizmet türüne göre haritada kategori filtrelerinde gözükeceksiniz.
                        </div>
                    </div>

                    <div className="card animate-fadeIn">
                        <div className="card-header">
                            <span className="card-title">İşletme Açıklaması</span>
                        </div>
                        <div className="form-group">
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="İşletmeniz hakkında kısa bir açıklama yazın. Ne üzerine çalıştığınızı, özel hizmetlerinizi belirtebilirsiniz.&#10;&#10;Örnek: 20 yıllık tecrübe ile profesyonel oto yıkama, iç temizlik, boya koruma ve seramik kaplama hizmeti sunuyoruz."
                                rows={5}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Current preview */}
                    <div className="card animate-fadeIn" style={{ background: 'var(--bg-elevated)' }}>
                        <div className="card-header">
                            <span className="card-title">👁️ Sürücüler Bunu Görecek</span>
                        </div>
                        <div style={{ padding: '4px 0' }}>
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                {TYPE_OPTIONS.find(t => t.value === type)?.label.split(' ')[0] || '⭐'} {name || 'İşletme Adı'}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>📍 {address || 'Adres belirtilmemiş'}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>📞 {phone || 'Telefon belirtilmemiş'}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>🕐 {workingHours || 'Çalışma saati belirtilmemiş'}</div>
                            {description && (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                                    {description}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <span className="badge" style={{
                                    background: `${TYPE_OPTIONS.find(t => t.value === type)?.color || '#6366f1'}15`,
                                    color: TYPE_OPTIONS.find(t => t.value === type)?.color || '#6366f1',
                                }}>
                                    {TYPE_OPTIONS.find(t => t.value === type)?.label || 'Hepsi'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
