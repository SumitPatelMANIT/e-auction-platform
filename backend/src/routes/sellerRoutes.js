import express from 'express';
import { getSellerItems, createItem, createAuction, deleteItem } from '../controllers/sellerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);
router.use(authorize('SELLER', 'ADMIN'));

router.route('/items')
  .get(getSellerItems)
  .post(createItem);

router.route('/items/:id')
  .delete(deleteItem);

router.post('/auctions', createAuction);

export default router;
