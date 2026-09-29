import prisma from '../utils/prisma.js';

// Trigger nodemon restart
// @desc    Get all items for a seller
// @route   GET /api/seller/items
// @access  Private/Seller
export const getSellerItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { seller_id: req.user.user_id },
      include: {
        catalogue: true,
        auction: {
          include: { bids: { include: { user: true } } }
        },
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/seller/items
// @access  Private/Seller
export const createItem = async (req, res) => {
  const { catalogue_id, title, description, base_price, image_url } = req.body;

  try {
    const item = await prisma.item.create({
      data: {
        seller_id: req.user.user_id,
        catalogue_id: catalogue_id ? parseInt(catalogue_id) : null,
        title,
        description,
        base_price: parseFloat(base_price),
        status: 'AVAILABLE',
        image_url: image_url || null,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an auction for an item
// @route   POST /api/seller/auctions
// @access  Private/Seller
export const createAuction = async (req, res) => {
  const { item_id, start_time, end_time, min_increment } = req.body;

  try {
    // Verify item belongs to seller
    const item = await prisma.item.findUnique({
      where: { item_id: parseInt(item_id) },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to auction this item' });
    }

    if (item.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Item is not available for auction' });
    }

    // Create auction
    const auction = await prisma.auction.create({
      data: {
        item_id: parseInt(item_id),
        creator_id: req.user.user_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        min_increment: parseFloat(min_increment),
        status: 'PENDING_APPROVAL', // Admin might need to approve
      },
    });

    // Update item status
    await prisma.item.update({
      where: { item_id: parseInt(item_id) },
      data: { status: 'PENDING' },
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/seller/items/:id
// @access  Private/Seller
export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { item_id: parseInt(id) },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    if (item.status === 'IN_AUCTION' || item.status === 'SOLD') {
      return res.status(400).json({ message: 'Cannot delete an item that is in auction or sold' });
    }

    await prisma.item.delete({
      where: { item_id: parseInt(id) },
    });

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
