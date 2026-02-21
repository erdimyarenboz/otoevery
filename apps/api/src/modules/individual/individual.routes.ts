// @ts-nocheck
import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Iyzipay from 'iyzipay';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const iyzipay = new Iyzipay({
    apiKey: 'xZkX1peAGKS9kwbVdJJRyLsL0dzbBgNr',
    secretKey: 'FINORtVcdVsLz7LSbPb7pj2QiNJijI7e',
    uri: 'https://api.iyzipay.com',
});

const JWT_SECRET = process.env.JWT_SECRET || 'otoevery-secret-2024';

// ── REGISTER ────────────────────────────────────────────────────────────────

// POST /api/v1/individual/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalı' });
        }

        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Bu e-posta zaten kayıtlı' });
        }

        const hashedPw = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPw,
                role: 'INDIVIDUAL',
                creditBalance: 0,
                isActive: true,
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: 'INDIVIDUAL', companyId: null, serviceCenterId: null, vehicleId: null },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password: _pw, ...safeUser } = user;
        return res.status(201).json({ success: true, data: { user: safeUser, token } });
    } catch (err: any) {
        console.error('Individual register error:', err);
        return res.status(500).json({ success: false, message: 'Kayıt hatası: ' + err.message });
    }
});

// ── LOGIN ────────────────────────────────────────────────────────────────────

// POST /api/v1/individual/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-posta ve şifre zorunlu' });
        }

        const user = await prisma.user.findFirst({ where: { email, role: 'INDIVIDUAL' } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Hesabınız devre dışı' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Şifre hatalı' });
        }

        const token = jwt.sign(
            { userId: user.id, role: 'INDIVIDUAL', companyId: null, serviceCenterId: null, vehicleId: null },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password: _pw, ...safeUser } = user;
        return res.json({ success: true, data: { user: safeUser, token } });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ── ME ───────────────────────────────────────────────────────────────────────

// GET /api/v1/individual/me  — requires token
router.get('/me', async (req: AuthRequest, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Token gerekli' });

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, creditBalance: true, isActive: true, createdAt: true },
        });
        if (!user || !user.isActive) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        return res.json({ success: true, data: user });
    } catch (err: any) {
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
});

// ── PAYMENT INITIATE ─────────────────────────────────────────────────────────

// POST /api/v1/individual/payment/initiate
router.post('/payment/initiate', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Token gerekli' });

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });

        const { amount } = req.body;
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount < 500) {
            return res.status(400).json({ success: false, message: 'Minimum kredi yükleme tutarı 500₺' });
        }

        const conversationId = `OTOEVERY-${user.id.slice(0, 8)}-${Date.now()}`;
        const priceStr = parsedAmount.toFixed(2);

        // Create pending payment record
        const payment = await prisma.individualPayment.create({
            data: {
                userId: user.id,
                amount: parsedAmount,
                creditAmount: parsedAmount,
                conversationId,
                status: 'pending',
            },
        });

        const callbackUrl = `${process.env.API_BASE_URL || 'https://api.otoevery.com.tr'}/api/v1/individual/payment/callback`;

        const request = {
            locale: 'tr',
            conversationId,
            price: priceStr,
            paidPrice: priceStr,
            currency: 'TRY',
            basketId: payment.id,
            paymentGroup: 'PRODUCT',
            callbackUrl,
            enabledInstallments: ['1', '2', '3', '6'],
            buyer: {
                id: user.id,
                name: user.firstName,
                surname: user.lastName,
                email: user.email || `${user.id}@otoevery.com`,
                identityNumber: '11111111111',  // Required by iyzico
                registrationAddress: 'Türkiye',
                ip: req.ip || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
            },
            shippingAddress: {
                contactName: `${user.firstName} ${user.lastName}`,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Türkiye',
            },
            billingAddress: {
                contactName: `${user.firstName} ${user.lastName}`,
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Türkiye',
            },
            basketItems: [
                {
                    id: payment.id,
                    name: `OtoEvery Kredi - ₺${priceStr}`,
                    category1: 'Dijital Ürün',
                    itemType: 'VIRTUAL',
                    price: priceStr,
                },
            ],
        };

        iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
            if (err) {
                console.error('iyzico error:', err);
                return res.status(500).json({ success: false, message: 'Ödeme başlatılamadı: ' + JSON.stringify(err) });
            }
            if (result.status !== 'success') {
                return res.status(400).json({ success: false, message: result.errorMessage || 'iyzico hatası', data: result });
            }
            return res.json({
                success: true,
                data: {
                    checkoutFormContent: result.checkoutFormContent,
                    token: result.token,
                    tokenExpireTime: result.tokenExpireTime,
                    paymentId: payment.id,
                },
            });
        });
    } catch (err: any) {
        console.error('Payment initiate error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ── PAYMENT CALLBACK ─────────────────────────────────────────────────────────

// POST /api/v1/individual/payment/callback  — called by iyzico
router.post('/payment/callback', async (req: Request, res: Response) => {
    try {
        const { token, status } = req.body;
        if (!token) {
            return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=failed`);
        }

        iyzipay.checkoutForm.retrieve({ locale: 'tr', conversationId: '', token }, async (err: any, result: any) => {
            try {
                if (err || result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
                    console.error('Payment callback failed:', err || result);
                    // Find payment by iyzico token (conversationId approach)
                    return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=failed`);
                }

                const conversationId = result.conversationId;
                const payment = await prisma.individualPayment.findFirst({ where: { conversationId } });
                if (!payment) {
                    return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=failed`);
                }

                // If already processed, skip
                if (payment.status === 'success') {
                    return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=already`);
                }

                // Update payment record
                await prisma.individualPayment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'success',
                        iyzicoPaymentId: result.paymentId || result.basketId,
                    },
                });

                // Add credit to user
                await prisma.user.update({
                    where: { id: payment.userId },
                    data: { creditBalance: { increment: payment.creditAmount } },
                });

                return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=success&amount=${payment.creditAmount}`);
            } catch (innerErr: any) {
                console.error('Callback inner error:', innerErr);
                return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=error`);
            }
        });
    } catch (err: any) {
        console.error('Payment callback error:', err);
        return res.redirect(`${process.env.WEB_URL || 'https://otoevery.com.tr'}/individual/dashboard?payment=error`);
    }
});

// ── PAYMENT HISTORY ─────────────────────────────────────────────────────────

// GET /api/v1/individual/payment/history
router.get('/payment/history', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, message: 'Token gerekli' });

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const payments = await prisma.individualPayment.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: payments });
    } catch (err: any) {
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
});

export default router;
