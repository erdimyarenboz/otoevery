import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import companyRoutes from './modules/company/company.routes';
import driverRoutes from './modules/driver/driver.routes';
import serviceRoutes from './modules/service/service.routes';
import mapRoutes from './modules/map/map.routes';
import { authenticate, requireRole } from './middleware/auth';

const app = express();

// ── Global Middleware ──────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Health ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/debug-env', async (_, res) => {
    const { PrismaClient } = require('@prisma/client');
    const testPrisma = new PrismaClient();
    try {
        const result = await testPrisma.$queryRaw`SELECT 1 as test`;
        return res.json({
            dbConnected: true,
            result,
            dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 50) + '...',
            dbUrlLength: process.env.DATABASE_URL?.length,
        });
    } catch (error: any) {
        return res.json({
            dbConnected: false,
            error: error.message,
            errorCode: error.code,
            errorName: error.constructor?.name,
            dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 50) + '...',
            dbUrlLength: process.env.DATABASE_URL?.length,
        });
    } finally {
        await testPrisma.$disconnect();
    }
});

// ── Public Routes ──────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ── Protected Routes ───────────────────────────────────
app.use('/api/v1/admin', authenticate, requireRole('SUPER_ADMIN'), adminRoutes);
app.use('/api/v1/company', authenticate, requireRole('COMPANY_MANAGER'), companyRoutes);
app.use('/api/v1/driver', authenticate, requireRole('DRIVER'), driverRoutes);
app.use('/api/v1/service', authenticate, requireRole('SERVICE_CENTER'), serviceRoutes);
app.use('/api/v1/map', authenticate, requireRole('DRIVER', 'COMPANY_MANAGER'), mapRoutes);

// ── 404 ────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

export default app;
