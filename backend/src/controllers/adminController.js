import prisma from '../utils/prisma.js';

// @desc    Get system dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeAuctions = await prisma.auction.count({
      where: { status: 'ACTIVE' },
    });
    const pendingAuctions = await prisma.auction.count({
      where: { status: 'PENDING_APPROVAL' },
    });
    const totalBids = await prisma.bid.count();

    res.json({
      totalUsers,
      activeAuctions,
      pendingAuctions,
      totalBids,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all auctions (for lifecycle management)
// @route   GET /api/admin/auctions
// @access  Private/Admin
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      include: {
        item: true,
        creator: {
          select: { first_name: true, last_name: true, email: true },
        },
      },
      orderBy: { start_time: 'desc' },
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update auction status
// @route   PATCH /api/admin/auctions/:id/status
// @access  Private/Admin
export const updateAuctionStatus = async (req, res) => {
  const auction_id = parseInt(req.params.id);
  const { status, start_time, end_time, min_increment } = req.body;

  try {
    const validStatuses = ['PENDING', 'SCHEDULED', 'ACTIVE', 'CLOSED', 'UNSOLD', 'REJECTED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const dataToUpdate = { status };
    if (start_time) dataToUpdate.start_time = new Date(start_time);
    if (end_time) dataToUpdate.end_time = new Date(end_time);
    if (min_increment) dataToUpdate.min_increment = Number(min_increment);

    const auction = await prisma.auction.update({
      where: { auction_id },
      data: dataToUpdate,
    });

    // Sync the item status
    let itemStatus = 'PENDING_AUCTION';
    if (status === 'SCHEDULED') {
      itemStatus = 'SCHEDULED'; // Scheduled to start
    } else if (status === 'ACTIVE') {
      itemStatus = 'IN_AUCTION';
    } else if (status === 'REJECTED') {
      itemStatus = 'AVAILABLE';
    } else if (status === 'CLOSED') {
      itemStatus = 'SOLD';
    } else if (status === 'UNSOLD') {
      itemStatus = 'RETURNED';
    }

    await prisma.item.update({
      where: { item_id: auction.item_id },
      data: { status: itemStatus },
    });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private/Admin
export const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        seller: {
          select: { first_name: true, last_name: true, email: true },
        },
        auction: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids
// @route   GET /api/admin/bids
// @access  Private/Admin
export const getAllBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true },
        },
        auction: {
          include: {
            item: true
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
