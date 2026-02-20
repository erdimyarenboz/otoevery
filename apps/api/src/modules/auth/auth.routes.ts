import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// POST /api/v1/auth/login
// Supports two login modes:
//   1) { email, password }           → Super Admin, Company Manager, Service Center
//   2) { plateNumber, password }     → Driver
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, plateNumber, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: 'Şifre gerekli' });
        }

        let user;

        if (plateNumber) {
            // Driver login via plate number
            user = await prisma.user.findUnique({
                where: { plateNumber },
                include: {
                    company: true,
                    vehicle: true,
                },
            });
        } else if (email) {
            // Email login for admin, company manager, service center
            user = await prisma.user.findUnique({
                where: { email },
                include: {
                    company: true,
                    serviceCenter: true,
                },
            });
        } else {
            return res.status(400).json({ success: false, message: 'Email veya plaka numarası gerekli' });
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Hesap devre dışı' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Geçersiz şifre' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                companyId: user.companyId,
                serviceCenterId: user.serviceCenterId,
                vehicleId: user.vehicleId,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as any
        );

        // Build safe user object (no password)
        const { password: _pw, ...safeUser } = user;

        return res.json({
            success: true,
            data: {
                token,
                user: safeUser,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// GET /api/v1/auth/me — Get current user
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token gerekli' });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                company: true,
                serviceCenter: true,
                vehicle: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        const { password: _pw, ...safeUser } = user;
        return res.json({ success: true, data: safeUser });
    } catch (error: any) {
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
});

export default router;
