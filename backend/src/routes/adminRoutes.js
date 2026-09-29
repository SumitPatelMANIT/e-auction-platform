import express from 'express';
import { getDashboardStats, getAllAuctions, updateAuctionStatus, getAllItems, getAllBids } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/auctions', getAllAuctions);
router.patch('/auctions/:id/status', updateAuctionStatus);
router.get('/items', getAllItems);
router.get('/bids', getAllBids);

export default router;
