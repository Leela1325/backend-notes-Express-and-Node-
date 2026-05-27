import express from 'express'
import getAllZones,{fetchZone, fetchZones, getAllZonesTicket, getZoneById, getZoneByIdTicket, getZoneCapacityStatus} from '../controllers/zone.controller.js'
import authorize from '../middlewares/authorization.middleware.js';

const router=express.Router()

// Admin + Staff
router.get("/ticket", authorize("admin", "staff"), getAllZonesTicket);
router.get("/ticket/:id", authorize("admin", "staff"), getZoneByIdTicket);

// Admin-only
router.get('/zone-supplier', authorize("admin"), fetchZones);
router.get('/zone-supplier/:zoneid', authorize("admin"), fetchZone);
router.get('/', authorize("admin"), getAllZones);
router.get('/:id', authorize("admin"), getZoneById);
router.get('/:id/capacity-status', authorize("admin"), getZoneCapacityStatus);

export default router