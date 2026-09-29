import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { apiFetch } from '../utils/api';

const AuctionContext = createContext();

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
  // 1. Current logged in user
  const [currentUser, setContextUser] = useState(() => {
    const saved = localStorage.getItem('mockCurrentUser');
    if (saved && saved !== 'undefined') {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('mockCurrentUser');
      }
    }
    return {
      id: null,
      name: 'Guest',
      role: 'GUEST'
    };
  });

  const setCurrentUser = (userOrUpdater) => {
    setContextUser((prevUser) => {
      const newUser = typeof userOrUpdater === 'function' ? userOrUpdater(prevUser) : userOrUpdater;
      localStorage.setItem('mockCurrentUser', JSON.stringify(newUser));
      return newUser;
    });
  };

  // 2. Data State
  const [items, setItems] = useState([]);
  const [bids, setBids] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null); // Added for admin
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen for new bids in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewBid = (newBid) => {
      // Add the new bid to our global bids array
      setBids((prev) => {
        // Prevent duplicate bids from being added
        if (prev.some(b => b.id === newBid.bid_id)) return prev;
        
        return [{
          id: newBid.bid_id,
          itemId: newBid.auction_id, // Adjust based on your schema structure
          auction_id: newBid.auction_id,
          amount: newBid.bid_amount,
          timestamp: newBid.bid_time,
          title: newBid.title
        }, ...prev];
      });

      // Update the auctions array so the "Highest Bid" changes immediately
      setAuctions((prevAuctions) => prevAuctions.map(a => {
        if (a.auction_id === newBid.auction_id) {
          return {
            ...a,
            bids: [newBid] // Overwrite with the latest highest bid
          };
        }
        return a;
      }));
    };

    const handleStatusUpdate = ({ auction_id, status }) => {
      // For items (Seller)
      setItems(prev => prev.map(item => {
        if (item.auction_id === auction_id || item.id === auction_id) {
          // Status from backend is for the AUCTION (e.g. 'CLOSED', 'UNSOLD', 'ACTIVE')
          // We map it to the Item status for the UI
          let newItemStatus = status;
          if (status === 'CLOSED') newItemStatus = 'SOLD';
          if (status === 'UNSOLD') newItemStatus = 'UNSOLD';
          return { ...item, status: newItemStatus };
        }
        return item;
      }));
      
      // For auctions (Admin/Bidder)
      setAuctions(prev => prev.map(a => 
        (a.auction_id === auction_id || a.id === auction_id) ? { ...a, status } : a
      ));
    };

    socket.on('new-bid', handleNewBid);
    socket.on('auction-status-update', handleStatusUpdate);

    return () => {
      socket.off('new-bid', handleNewBid);
      socket.off('auction-status-update', handleStatusUpdate);
    };
  }, [socket]);

  // Fetch data based on role
  const refreshData = useCallback(async () => {
    if (currentUser.role === 'GUEST') return;
    setIsLoading(true);
    try {
      const mapAuction = (a) => ({
          id: a.item_id, // For UI compatibility
          auction_id: a.auction_id,
          title: a.item?.title || 'Unknown Item',
          description: a.item?.description || '',
          seller: a.creator?.first_name || 'Seller',
          basePrice: a.item?.base_price || 0,
          status: a.status,
          auctionEnd: a.end_time,
          minIncrement: a.min_increment,
          imageUrl: 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=500&q=80',
          bids: a.bids || []
        });

        const mapItem = (i) => ({
          id: i.item_id,
          auction_id: i.auction?.auction_id,
          auctionEnd: i.auction?.end_time,
          title: i.title,
          description: i.description,
          seller: i.seller?.first_name ? `${i.seller.first_name} ${i.seller.last_name || ''}`.trim() : currentUser.name,
          basePrice: i.base_price,
          status: i.status === 'IN_AUCTION' ? 'ACTIVE' : 
                 (i.status === 'SCHEDULED' ? 'SCHEDULED' :
                 (i.status === 'PENDING' || i.status === 'PENDING_AUCTION' ? 'PENDING_AUCTION' : 
                 (i.status === 'AVAILABLE' ? 'DRAFT' : 
                 (i.status === 'SOLD' ? 'SOLD' : 
                 (i.status === 'RETURNED' ? 'UNSOLD' : i.status))))),
          imageUrl: i.image_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80'
        });

        if (currentUser.role === 'BIDDER') {
          const [activeAuctions, myBidsRes, userRegistrations] = await Promise.all([
            apiFetch('/bidder/auctions'),
            apiFetch('/bidder/my-bids'),
            apiFetch('/bidder/registrations').catch(() => []) // Handle cleanly if endpoint misses
          ]);
          setAuctions(activeAuctions.map(mapAuction));
          setRegistrations(userRegistrations.map(r => r.auction_id));
          
          setItems(activeAuctions.map(a => {
            const item = a.item || {};
            return {
              id: item.item_id,
              auction_id: a.auction_id,
              auctionEnd: a.end_time,
              title: item.title,
              description: item.description,
              seller: 'Seller', // Fallback since bidder auctions query doesn't include seller details
              basePrice: item.base_price,
              status: a.status === 'SCHEDULED' ? 'SCHEDULED' : 'ACTIVE',
              imageUrl: item.image_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80'
            };
          }));
          
          setBids(myBidsRes.map(b => ({
            id: b.bid_id,
            itemId: b.auction?.item_id,
            auction_id: b.auction_id,
            amount: b.bid_amount,
            timestamp: b.bid_time,
            title: b.auction?.item?.title,
            bidderId: b.user_id || currentUser.id,
            bidderName: 'You'
          })));

          // Extract items from bids (to include past/completed auctions)
          const biddedItemsMap = new Map();
          const extraBids = [];
          
          myBidsRes.forEach(b => {
            if (b.auction && b.auction.item && !biddedItemsMap.has(b.auction.item_id)) {
              biddedItemsMap.set(b.auction.item_id, {
                id: b.auction.item_id,
                auction_id: b.auction_id,
                auctionEnd: b.auction.end_time,
                title: b.auction.item.title,
                description: b.auction.item.description,
                seller: 'Seller',
                basePrice: b.auction.item.base_price,
                status: b.auction.status === 'SCHEDULED' ? 'SCHEDULED' : (b.auction.status === 'ACTIVE' ? 'ACTIVE' : 'COMPLETED'),
                imageUrl: b.auction.item.image_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80'
              });
              
              // Also map the overall highest bid for this auction if it's not by this user
              if (b.auction.bids && b.auction.bids.length > 0) {
                const highestBid = b.auction.bids[0];
                if (highestBid.user_id !== currentUser.id) {
                  extraBids.push({
                    id: highestBid.bid_id,
                    itemId: b.auction.item_id,
                    auction_id: b.auction_id,
                    amount: highestBid.bid_amount,
                    timestamp: highestBid.bid_time,
                    title: b.auction.item.title,
                    bidderId: highestBid.user_id,
                    bidderName: 'Someone Else'
                  });
                }
              }
            }
          });
          
          setBids(prev => [...prev, ...extraBids]);
          
          setItems(prevItems => {
            const itemsMap = new Map(prevItems.map(i => [i.id, i]));
            biddedItemsMap.forEach((val, key) => itemsMap.set(key, val)); // Overwrite/add
            return Array.from(itemsMap.values());
          });
          
        } else if (currentUser.role === 'SELLER') {
          const sellerItems = await apiFetch('/seller/items');
          setItems(sellerItems.map(mapItem));
          
          const sellerBids = [];
          sellerItems.forEach(item => {
            if (item.auction && item.auction.bids) {
              item.auction.bids.forEach(b => {
                sellerBids.push({
                  id: b.bid_id,
                  itemId: item.item_id,
                  auction_id: item.auction.auction_id,
                  amount: b.bid_amount,
                  timestamp: b.bid_time,
                  title: item.title,
                  bidderId: b.user_id,
                  bidderName: b.user ? `${b.user.first_name} ${b.user.last_name || ''}`.trim() : 'Bidder'
                });
              });
            }
          });
          console.log('[fetchData] sellerBids created:', sellerBids);
          setBids(sellerBids);
        } else if (currentUser.role === 'ADMIN') {
          const [allAuctions, allItems, allBids, stats] = await Promise.all([
            apiFetch('/admin/auctions'),
            apiFetch('/admin/items'),
            apiFetch('/admin/bids'),
            apiFetch('/admin/dashboard')
          ]);
          setAuctions(allAuctions.map(mapAuction));
          setItems(allItems.map(mapItem));
          setDashboardStats(stats);
          setBids(allBids.map(b => ({
            id: b.bid_id,
            itemId: b.auction?.item_id,
            auction_id: b.auction_id,
            amount: b.bid_amount,
            timestamp: b.bid_time,
            title: b.auction?.item?.title,
            bidderName: b.user ? `${b.user.first_name} ${b.user.last_name || ''}`.trim() : 'Bidder'
          })));
        }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- ACTIONS ---

  const addItem = async (newItemData) => {
    try {
      const payload = {
        title: newItemData.title,
        description: newItemData.description,
        base_price: newItemData.basePrice,
        image_url: newItemData.imageUrl,
      };
      const createdItem = await apiFetch('/seller/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      const mappedItem = {
        id: createdItem.item_id,
        title: createdItem.title,
        description: createdItem.description,
        seller: currentUser.name,
        basePrice: createdItem.base_price,
        status: createdItem.status === 'IN_AUCTION' ? 'ACTIVE' : (createdItem.status === 'PENDING' ? 'PENDING_AUCTION' : (createdItem.status === 'AVAILABLE' ? 'DRAFT' : createdItem.status)),
        imageUrl: createdItem.image_url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80'
      };

      setItems(prev => [mappedItem, ...prev]);
      return mappedItem;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await apiFetch(`/seller/items/${itemId}`, {
        method: 'DELETE',
      });
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const submitItemForAuction = async (itemId) => {
    try {
      const payload = {
        item_id: itemId,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 86400000 * 7).toISOString(),
        min_increment: 100,
      };
      
      const newAuction = await apiFetch('/seller/auctions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Update local item status
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'PENDING_AUCTION', auction: newAuction } : item
      ));
      return newAuction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const scheduleAuction = async (auctionId, scheduleData) => {
    try {
      const startIso = scheduleData?.startDate && scheduleData?.startTime 
        ? new Date(`${scheduleData.startDate}T${scheduleData.startTime}`).toISOString() 
        : undefined;
      const endIso = scheduleData?.endDate && scheduleData?.endTime 
        ? new Date(`${scheduleData.endDate}T${scheduleData.endTime}`).toISOString() 
        : undefined;

      // Determine if it should be ACTIVE now or SCHEDULED for later
      const now = new Date();
      const startTime = new Date(startIso);
      const newStatus = startTime <= now ? 'ACTIVE' : 'SCHEDULED';

      // For Admin: approve auction
      const updated = await apiFetch(`/admin/auctions/${auctionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: newStatus,
          start_time: startIso,
          end_time: endIso,
          min_increment: scheduleData?.minIncrement
        })
      });
      
      setAuctions(prev => prev.map(a => 
        a.auction_id === auctionId ? { ...a, status: newStatus } : a
      ));
      setItems(prev => prev.map(item => 
        item.auction_id === auctionId ? { ...item, status: newStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING_AUCTION', auctionEnd: endIso || item.auctionEnd } : item
      ));
      return updated;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const registerForAuctionId = async (auctionId) => {
    try {
      await apiFetch(`/bidder/auctions/${auctionId}/register`, {
        method: 'POST'
      });
      setRegistrations(prev => [...prev, auctionId]);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const placeBid = async (auctionId, amount) => {
    try {
      const bid = await apiFetch(`/bidder/auctions/${auctionId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ bid_amount: amount })
      });
      const formattedBid = {
        id: bid.bid_id,
        itemId: auctions.find(a => a.auction_id === auctionId)?.item?.item_id,
        auction_id: bid.auction_id,
        amount: bid.bid_amount,
        timestamp: bid.bid_time,
        title: auctions.find(a => a.auction_id === auctionId)?.item?.title,
        bidderId: currentUser.id,
        bidderName: 'You'
      };
      
      setBids(prev => [formattedBid, ...prev]);
      
      // Update the local auction's highest bid so UI reflects it immediately
      setAuctions(prev => prev.map(a => {
        if (a.auction_id === auctionId) {
          return {
            ...a,
            bids: [bid] // Since we only take 1 highest bid usually
          };
        }
        return a;
      }));
      return bid;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // --- HELPERS (Adapted for new schema structures) ---
  
  const getHighestBid = (auctionId) => {
    const auction = auctions.find(a => a.auction_id === auctionId || a.id === auctionId); // Fallback for old mock IDs
    
    // Check if the backend gave us nested bids
    if (auction && auction.bids && auction.bids.length > 0) {
      return {
        amount: auction.bids[0].bid_amount,
        bidderName: 'Highest Bidder',
        bidderId: auction.bids[0].user_id
      };
    }
    
    // Check local bids state
    const auctionBids = bids.filter(b => String(b.auction_id) === String(auctionId) || String(b.itemId) === String(auctionId));
    if (auctionBids.length === 0) {
      console.log(`[getHighestBid] No bids found for auctionId=${auctionId}. local bids count: ${bids.length}`);
      return null;
    }
    const highest = auctionBids.reduce((max, bid) => Number(bid.amount) > Number(max.amount) ? bid : max, auctionBids[0]);
    return { amount: Number(highest.amount), bidderName: highest.bidderName || 'You', bidderId: highest.bidderId };
  };

  const getUserBids = (userId) => {
    return bids; // Backend already filters this
  };

  const getSellerItems = (sellerId) => {
    return items; // Backend already filters this
  };

  const contextValue = {
    currentUser,
    setCurrentUser,
    items,
    bids,
    auctions,
    dashboardStats, // Exposed stats
    isLoading,
    addItem,
    deleteItem,
    submitItemForAuction,
    scheduleAuction,
    registerForAuctionId,
    placeBid,
    getHighestBid,
    getUserBids,
    getSellerItems,
    registrations, // Expose registrations
    socket, // Expose socket so components can join/leave auction rooms
    refreshData, // Expose for manual refreshing
  };

  return (
    <AuctionContext.Provider value={contextValue}>
      {children}
    </AuctionContext.Provider>
  );
};
