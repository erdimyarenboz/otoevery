// @ts-nocheck
import { Router, Request, Response } from 'express';
import Iyzipay from 'iyzipay';

const router = Router();

const iyzipay = new Iyzipay({
    apiKey: 'xZkX1peAGKS9kwbVdJJRyLsL0dzbBgNr',
    secretKey: 'FINORtVcdVsLz7LSbPb7pj2QiNJijI7e',
    uri: 'https://api.iyzipay.com',
});

// Plan definitions (single source of truth)
const PLANS: Record<string, { name: string; pricePerVehicle: number; accessFee: number }> = {
    baslangic: { name: 'Başlangıç Paketi', pricePerVehicle: 299, accessFee: 0 },
    profesyonel: { name: 'Profesyonel Paket', pricePerVehicle: 499, accessFee: 999 },
};

// POST /api/v1/pricing/checkout
// Body: { planId, vehicleCount, name, surname, email, phone, company? }
router.post('/checkout', async (req: Request, res: Response) => {
    try {
        const { planId, vehicleCount, name, surname, email, phone, company } = req.body;

        if (!planId || !vehicleCount || !name || !surname || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Tüm zorunlu alanlar doldurulmalıdır.' });
        }

        const plan = PLANS[planId];
        if (!plan) {
            return res.status(400).json({ success: false, message: 'Geçersiz paket seçimi.' });
        }

        const count = parseInt(vehicleCount, 10);
        if (isNaN(count) || count < 1) {
            return res.status(400).json({ success: false, message: 'Geçersiz araç sayısı.' });
        }

        const totalAmount = plan.pricePerVehicle * count + plan.accessFee;
        const priceStr = totalAmount.toFixed(2);
        const conversationId = `PRICING-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const callbackUrl = `${process.env.WEB_URL || 'https://otoevery.com.tr'}/?payment=result`;

        const request = {
            locale: 'tr',
            conversationId,
            price: priceStr,
            paidPrice: priceStr,
            currency: 'TRY',
            basketId: conversationId,
            paymentGroup: 'PRODUCT',
            callbackUrl,
            enabledInstallments: ['1', '2', '3', '6', '9', '12'],
            buyer: {
                id: conversationId,
                name,
                surname,
                email,
                identityNumber: '11111111111',
                registrationAddress: 'Türkiye',
                ip: req.ip || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                gsmNumber: phone,
            },
            shippingAddress: {
                contactName: `${name} ${surname}`,
                city: 'Istanbul',
                country: 'Turkey',
                address: company || 'Türkiye',
            },
            billingAddress: {
                contactName: `${name} ${surname}`,
                city: 'Istanbul',
                country: 'Turkey',
                address: company || 'Türkiye',
            },
            basketItems: [
                {
                    id: `${planId}-${count}arac`,
                    name: `${plan.name} - ${count} Araç`,
                    category1: 'SaaS Abonelik',
                    itemType: 'VIRTUAL',
                    price: (plan.pricePerVehicle * count).toFixed(2),
                },
                ...(plan.accessFee > 0
                    ? [{
                        id: `${planId}-erisim`,
                        name: `${plan.name} - Sistem Erişim Bedeli`,
                        category1: 'SaaS Abonelik',
                        itemType: 'VIRTUAL',
                        price: plan.accessFee.toFixed(2),
                    }]
                    : []),
            ],
        };

        iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
            if (err) {
                console.error('Pricing iyzico error:', err);
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
                    totalAmount,
                    planName: plan.name,
                },
            });
        });
    } catch (err: any) {
        console.error('Pricing checkout error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
