// @ts-nocheck
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/map/service-centers
// Returns contracted service centers for the current user's company
// Available for: DRIVER, COMPANY_MANAGER
router.get('/service-centers', async (req: AuthRequest, res: Response) => {
    let companyId = req.user!.companyId;

    // If driver, get companyId from vehicle
    if (!companyId && req.user!.vehicleId) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: req.user!.vehicleId } });
        companyId = vehicle?.companyId || null;
    }

    if (!companyId) {
        return res.status(400).json({ success: false, message: 'Şirket bilgisi bulunamadı' });
    }

    // Get agreements for this company (active ones)
    const agreements = await prisma.agreement.findMany({
        where: { companyId, isActive: true },
        include: {
            serviceCenter: true,
        },
    });

    // Map to service center data with agreement info
    const serviceCenters = agreements.map(a => ({
        id: a.serviceCenter.id,
        name: a.serviceCenter.name,
        address: a.serviceCenter.address,
        type: a.serviceCenter.type,
        latitude: a.serviceCenter.latitude,
        longitude: a.serviceCenter.longitude,
        phone: a.serviceCenter.phone,
        contactEmail: a.serviceCenter.contactEmail,
        workingHours: a.serviceCenter.workingHours,
        description: a.serviceCenter.description,
        // Agreement details
        discountRate: a.discountRate,
        monthlyLimit: a.monthlyLimit,
        agreementId: a.id,
    }));

    return res.json({ success: true, data: serviceCenters });
});

export default router;
