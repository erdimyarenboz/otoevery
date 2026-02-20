import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Extend Request to include user info
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        companyId?: string;
        serviceCenterId?: string;
        vehicleId?: string;
    };
}

// ── Authenticate JWT ────────────────────────────────────
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            companyId: decoded.companyId,
            serviceCenterId: decoded.serviceCenterId,
            vehicleId: decoded.vehicleId,
        };
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token' });
    }
}

// ── Role Guard ──────────────────────────────────────────
export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
        }
        next();
    };
}

export default { authenticate, requireRole };
