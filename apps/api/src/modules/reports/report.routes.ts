import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { getTenantId } from '../../middleware/tenant';
import prisma from '../../config/database';

export const reportRouter = Router();

// GET /reports/dashboard — Main dashboard summary
reportRouter.get('/dashboard', requirePermission('reports:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const [
            totalVehicles, activeVehicles, totalEmployees,
            activeAssignments, pendingRequests, unpaidPenalties,
            expiringDocuments, anomalyFuels,
        ] = await Promise.all([
            prisma.vehicle.count({ where: { tenantId, deletedAt: null } }),
            prisma.vehicle.count({ where: { tenantId, status: 'active', deletedAt: null } }),
            prisma.employee.count({ where: { tenantId, status: 'active', deletedAt: null } }),
            prisma.assignment.count({ where: { tenantId, status: 'active', deletedAt: null } }),
            prisma.request.count({ where: { tenantId, status: { in: ['pending_approval', 'level1_approved'] }, deletedAt: null } }),
            prisma.penalty.count({ where: { tenantId, status: 'unpaid', deletedAt: null } }),
            prisma.document.count({ where: { tenantId, deletedAt: null, expiryDate: { lte: new Date(Date.now() + 30 * 86400000), gte: new Date() } } }),
            prisma.fuelEntry.count({ where: { tenantId, isAnomaly: true, deletedAt: null } }),
        ]);

        res.json({
            success: true,
            data: { totalVehicles, activeVehicles, totalEmployees, activeAssignments, pendingRequests, unpaidPenalties, expiringDocuments, anomalyFuels },
        });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Dashboard verisi alınamadı' } }); }
});

// GET /reports/cost-summary
reportRouter.get('/cost-summary', requirePermission('reports:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

        const [fuelTotal, expenseTotal, penaltyTotal, rentalTotal] = await Promise.all([
            prisma.fuelEntry.aggregate({ where: { tenantId, deletedAt: null, fillDate: { gte: startDate, lte: endDate } }, _sum: { totalAmount: true } }),
            prisma.expense.aggregate({ where: { tenantId, deletedAt: null, expenseDate: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
            prisma.penalty.aggregate({ where: { tenantId, deletedAt: null, penaltyDate: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
            prisma.rentalInvoice.aggregate({ where: { tenantId, invoiceDate: { gte: startDate, lte: endDate } }, _sum: { totalAmount: true } }),
        ]);

        res.json({
            success: true,
            data: {
                fuel: Number(fuelTotal._sum.totalAmount || 0),
                expenses: Number(expenseTotal._sum.amount || 0),
                penalties: Number(penaltyTotal._sum.amount || 0),
                rental: Number(rentalTotal._sum.totalAmount || 0),
                total: Number(fuelTotal._sum.totalAmount || 0) + Number(expenseTotal._sum.amount || 0) + Number(penaltyTotal._sum.amount || 0) + Number(rentalTotal._sum.totalAmount || 0),
                period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            },
        });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Maliyet özeti alınamadı' } }); }
});

// GET /reports/vehicle-cost/:vehicleId
reportRouter.get('/vehicle-cost/:vehicleId', requirePermission('reports:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const vehicleId = req.params.vehicleId;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

        const [fuel, expenses, penalties] = await Promise.all([
            prisma.fuelEntry.aggregate({ where: { tenantId, vehicleId, deletedAt: null, fillDate: { gte: startDate, lte: endDate } }, _sum: { totalAmount: true, liters: true }, _count: true }),
            prisma.expense.aggregate({ where: { tenantId, vehicleId, deletedAt: null, expenseDate: { gte: startDate, lte: endDate } }, _sum: { amount: true }, _count: true }),
            prisma.penalty.aggregate({ where: { tenantId, vehicleId, deletedAt: null, penaltyDate: { gte: startDate, lte: endDate } }, _sum: { amount: true }, _count: true }),
        ]);

        res.json({
            success: true,
            data: {
                vehicleId,
                fuel: { amount: Number(fuel._sum.totalAmount || 0), liters: Number(fuel._sum.liters || 0), count: fuel._count },
                expenses: { amount: Number(expenses._sum.amount || 0), count: expenses._count },
                penalties: { amount: Number(penalties._sum.amount || 0), count: penalties._count },
            },
        });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç maliyet verisi alınamadı' } }); }
});
