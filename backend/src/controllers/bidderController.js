import prisma from '../utils/prisma.js';

// @desc    Get all active auctions (Catalogue)
// @route   GET /api/bidder/auctions
// @access  Private/Bidder
export const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        status: { in: ['ACTIVE', 'SCHEDULED'] },
        end_time: {
          gt: new Date(), // only auctions that haven't ended yet
        },
      },
      include: {
        item: {
          include: {
            catalogue: true,
          }
        },
        bids: {
          orderBy: {
            bid_amount: 'desc',
          },
          take: 1, // Only get the highest bid
        },
      },
    });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a bid on an auction
// @route   POST /api/bidder/auctions/:id/bid
// @access  Private/Bidder
export const placeBid = async (req, res) => {
  const auction_id = parseInt(req.params.id);
  const { bid_amount } = req.body;
  const io = req.app.get('io');

  try {
    const auction = await prisma.auction.findUnique({
      where: { auction_id },
      include: {
        bids: {
          orderBy: { bid_amount: 'desc' },
          take: 1,
        },
        item: true,
      },
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if the user is registered for this auction
    const registration = await prisma.auctionRegistration.findUnique({
      where: {
        user_id_auction_id: {
          user_id: req.user.user_id,
          auction_id: auction_id,
        },
      },
    });

    if (!registration) {
      return res.status(403).json({ message: 'You must register for this auction before placing a bid.' });
    }

    if (auction.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (new Date() > new Date(auction.end_time)) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    const currentHighestBid = auction.bids.length > 0 ? auction.bids[0].bid_amount : auction.item.base_price;
    const minRequiredBid = currentHighestBid + auction.min_increment;

    if (parseFloat(bid_amount) < minRequiredBid) {
      return res.status(400).json({ 
        message: `Bid amount must be at least ${minRequiredBid}` 
      });
    }

    const newBid = await prisma.bid.create({
      data: {
        user_id: req.user.user_id,
        auction_id,
        bid_amount: parseFloat(bid_amount),
      },
      include: {
        user: {
          select: { first_name: true, last_name: true }
        }
      }
    });

    // Emit the new bid to all clients
    io.emit('new-bid', {
      ...newBid,
      title: auction.item.title,
      bidderName: req.user.first_name + ' ' + req.user.last_name
    });

    res.status(201).json(newBid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids placed by the current user
// @route   GET /api/bidder/my-bids
// @access  Private/Bidder
export const getMyBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { user_id: req.user.user_id },
      include: {
        auction: {
          include: {
            item: true,
            bids: {
              orderBy: { bid_amount: 'desc' },
              take: 1,
            }
          }
        }
      },
      orderBy: { bid_time: 'desc' },
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for an auction
// @route   POST /api/bidder/auctions/:id/register
// @access  Private/Bidder
export const registerForAuction = async (req, res) => {
  const auction_id = parseInt(req.params.id);
  const user_id = req.user.user_id;

  try {
    const auction = await prisma.auction.findUnique({
      where: { auction_id },
    });

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if already registered
    const existingRegistration = await prisma.auctionRegistration.findUnique({
      where: {
        user_id_auction_id: { user_id, auction_id },
      },
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this auction.' });
    }

    const registration = await prisma.auctionRegistration.create({
      data: {
        user_id,
        auction_id,
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's registrations
// @route   GET /api/bidder/registrations
// @access  Private/Bidder
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.auctionRegistration.findMany({
      where: { user_id: req.user.user_id },
      include: {
        auction: {
          include: {
            item: true,
          }
        }
      }
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
