import cron from 'node-cron';
import prisma from './prisma.js';

export const startCronJobs = (io) => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Cron] Checking auction statuses...');
    const now = new Date();

    try {
      // 1. SCHEDULED -> ACTIVE
      // Find auctions that are SCHEDULED and their start_time has passed
      const auctionsToStart = await prisma.auction.findMany({
        where: {
          status: 'SCHEDULED',
          start_time: { lte: now }
        }
      });

      for (const auction of auctionsToStart) {
        await prisma.auction.update({
          where: { auction_id: auction.auction_id },
          data: { status: 'ACTIVE' }
        });
        await prisma.item.update({
          where: { item_id: auction.item_id },
          data: { status: 'IN_AUCTION' }
        });
        console.log(`[Cron] Auction ${auction.auction_id} is now ACTIVE.`);
        
        if (io) {
          io.emit('auction-status-update', { auction_id: auction.auction_id, status: 'ACTIVE' });
        }
      }

      // 2. ACTIVE -> CLOSED / UNSOLD
      // Find auctions that are ACTIVE and their end_time has passed
      const auctionsToEnd = await prisma.auction.findMany({
        where: {
          status: 'ACTIVE',
          end_time: { lte: now }
        },
        include: { bids: true }
      });

      for (const auction of auctionsToEnd) {
        const hasBids = auction.bids && auction.bids.length > 0;
        const newStatus = hasBids ? 'CLOSED' : 'UNSOLD';
        const newItemStatus = hasBids ? 'SOLD' : 'RETURNED';

        await prisma.auction.update({
          where: { auction_id: auction.auction_id },
          data: { status: newStatus }
        });
        await prisma.item.update({
          where: { item_id: auction.item_id },
          data: { status: newItemStatus }
        });
        
        // If there are bids, create an Order for the winner
        if (hasBids) {
          // Find the highest bid
          const highestBid = auction.bids.reduce((max, bid) => bid.bid_amount > max.bid_amount ? bid : max, auction.bids[0]);
          
          await prisma.order.create({
            data: {
              user_id: highestBid.user_id,
              auction_id: auction.auction_id,
              final_price: highestBid.bid_amount,
              order_status: 'PENDING_PAYMENT'
            }
          });
          console.log(`[Cron] Order created for Auction ${auction.auction_id} (Winner: User ${highestBid.user_id})`);
        }

        console.log(`[Cron] Auction ${auction.auction_id} is now ${newStatus}.`);

        if (io) {
          io.emit('auction-status-update', { auction_id: auction.auction_id, status: newStatus });
        }
      }

    } catch (error) {
      console.error('[Cron] Error updating auction statuses:', error);
    }
  });
};
