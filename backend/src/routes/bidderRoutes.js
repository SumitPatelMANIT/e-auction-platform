import express from 'express';
import { getActiveAuctions, placeBid, getMyBids, registerForAuction, getMyRegistrations } from '../controllers/bidderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);
router.use(authorize('BIDDER', 'ADMIN')); // Admin might need to view these too

router.get('/auctions', getActiveAuctions);
router.post('/auctions/:id/register', registerForAuction);
router.post('/auctions/:id/bid', placeBid);
router.get('/my-bids', getMyBids);
router.get('/registrations', getMyRegistrations);

export default router;
