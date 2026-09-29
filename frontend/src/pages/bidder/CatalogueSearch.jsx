import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Search, Gavel, Clock, IndianRupee, Filter, Sparkles, Trophy, ArrowRight, X, RefreshCw } from 'lucide-react';

const CatalogueSearch = () => {
  const { items, getHighestBid, placeBid, currentUser, refreshData, isLoading, registrations, registerForAuctionId } = useAuction();
  const activeItems = items.filter(item => item.status === 'ACTIVE' || item.status === 'SCHEDULED');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidError, setBidError] = useState('');

  // Simple client-side filtering logic
  let filteredItems = activeItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (activeFilter === 'Ending Soon') {
    // Mock sort: assuming items with higher IDs or specific logic ends sooner.
    // For prototype, we'll just reverse the array as a visual cue that it filtered.
    filteredItems = [...filteredItems].reverse();
  } else if (activeFilter === 'High Value') {
    filteredItems = [...filteredItems].sort((a, b) => {
      const aPrice = getHighestBid(a.id)?.amount || a.basePrice;
      const bPrice = getHighestBid(b.id)?.amount || b.basePrice;
      return bPrice - aPrice;
    });
  }

  const handleOpenBidModal = (item) => {
    setSelectedItem(item);
    const highestBid = getHighestBid(item.id);
    const currentPrice = highestBid ? highestBid.amount : item.basePrice;
    setBidAmount(currentPrice + (item.minIncrement || 1));
    setBidError('');
    setIsModalOpen(true);
  };

  const handlePlaceBid = async (e) => {
    if (e) e.preventDefault();
    if (!bidAmount) return;
    
    try {
      setBidError('');
      // selectedItem.id is the item_id, but the backend requires the auction_id for bidding
      await placeBid(selectedItem.auction_id, Number(bidAmount));
      setIsModalOpen(false);
      setSelectedItem(null);
      setBidAmount('');
    } catch (err) {
      setBidError(err.message || 'Failed to place bid. Please try again.');
    }
  };

  const handleQuickBid = (increment) => {
    const highestBid = getHighestBid(selectedItem.id);
    const currentPrice = highestBid ? highestBid.amount : selectedItem.basePrice;
    setBidAmount(currentPrice + increment);
  };

  const filters = ['All', 'Ending Soon', 'High Value', 'Recently Added'];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* Immersive Hero Header */}
      <div className="glass-panel overflow-hidden border border-slate-200 shadow-sm rounded-3xl relative">
        <div className="absolute inset-0 bg-teal-900">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="absolute top-6 right-6 z-20 inline-flex items-center p-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all focus:outline-none disabled:opacity-50"
          title="Refresh Catalogue"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        
        <div className="relative p-8 md:p-12 lg:px-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-teal-300/30 bg-white/10 backdrop-blur-md text-teal-100 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-teal-300" />
            Premium Asset Catalogue
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Discover Exceptional Items
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mb-10">
            Browse our curated collection of high-value assets. Search, filter, and place your bids in real-time.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-3xl relative flex items-center shadow-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 focus-within:ring-2 focus-within:ring-teal-300 transition-all">
            <div className="pl-4 pr-2 pointer-events-none">
              <Search className="h-6 w-6 text-teal-200" />
            </div>
            <input
              type="text"
              className="w-full bg-transparent border-none text-white placeholder-teal-200 focus:outline-none focus:ring-0 text-lg px-2"
              placeholder="Search by title, description, or asset type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-white text-teal-900 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition-colors shadow-sm">
              Search
            </button>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center mr-2 text-teal-200">
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === filter 
                    ? 'bg-teal-500 text-white border border-teal-400 shadow-sm' 
                    : 'bg-white/10 text-teal-100 border border-white/20 hover:bg-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 glass-panel border border-slate-200 shadow-sm rounded-3xl">
            <div className="flex flex-col items-center">
               <div className="p-5 bg-slate-100 rounded-full mb-4">
                 <Search className="h-12 w-12 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-1">No Items Found</h3>
               <p className="text-sm font-medium text-slate-500">Try adjusting your search or filters.</p>
            </div>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const highestBid = getHighestBid(item.id);
            const currentPrice = highestBid ? highestBid.amount : item.basePrice;
            const isWinning = highestBid && highestBid.bidderId === currentUser.id;
            const isRegistered = registrations?.includes(item.auction_id);
            
            return (
              <div 
                key={item.id} 
                className={`glass-panel glass-panel-hover flex flex-col group overflow-hidden shadow-sm rounded-3xl ${
                  isWinning ? 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'border border-slate-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-w-4 aspect-h-3 bg-slate-100 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-64 group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-400">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/90 opacity-90 transition-opacity group-hover:opacity-100"></div>
                  
                  <div className="absolute bottom-5 left-5 right-5">
                     <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-teal-200 transition-colors">{item.title}</h3>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 border backdrop-blur-md shadow-sm ${item.status === 'ACTIVE' ? 'text-emerald-700 border-emerald-200' : 'text-blue-700 border-blue-200'}`}>
                      {item.status === 'ACTIVE' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse-slow"></div>}
                      {item.status === 'ACTIVE' ? 'Live' : 'Upcoming'}
                    </span>
                    {/* Real Countdown */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/70 text-white backdrop-blur-md">
                      <Clock className="h-3 w-3 mr-1" />
                      {(() => {
                        if (!item.auctionEnd) return "TBD";
                        const diff = new Date(item.auctionEnd) - new Date();
                        if (diff <= 0) return "Ended";
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
                        return `${hours}h ${minutes}m`;
                      })()}
                    </span>
                  </div>

                  {isWinning && (
                    <div className="absolute top-4 left-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg">
                        <Trophy className="h-3 w-3 mr-1" />
                        Winning
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between bg-white/80">
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">{item.description}</p>
                  
                  <div className="space-y-5 mt-auto">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <div>
                         <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-1">Current Bid</span>
                         <div className="font-extrabold text-teal-600 text-2xl leading-none">
                           ₹{currentPrice.toLocaleString()}
                         </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-1">Leading</span>
                        <div className={`text-sm font-semibold ${isWinning ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {highestBid ? (isWinning ? 'You' : highestBid.bidderName) : 'No Bids'}
                        </div>
                      </div>
                    </div>
                    
                    {!isRegistered ? (
                      <button
                        onClick={async () => {
                          try {
                            await registerForAuctionId(item.auction_id);
                            alert('Successfully registered for this auction!');
                          } catch (err) {
                            alert('Failed to register: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-teal-200 text-sm font-bold rounded-xl shadow-sm text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all group-hover:bg-teal-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_5px_15px_rgba(13,148,136,0.3)]"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Register for Auction
                      </button>
                    ) : item.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleOpenBidModal(item)}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-emerald-200 text-sm font-bold rounded-xl shadow-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        {isWinning ? 'Increase Bid' : 'Place Bid'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-slate-200 text-sm font-bold rounded-xl shadow-sm text-slate-500 bg-slate-50 cursor-not-allowed"
                      >
                        Registered - Starts Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Advanced Place Bid Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in-up border border-slate-200">
              
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button onClick={() => setIsModalOpen(false)} className="bg-white rounded-full p-1 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceBid}>
                <div className="px-6 pt-8 pb-6 sm:px-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 border border-cyan-200 mx-auto mb-4">
                    <Gavel className="h-8 w-8 text-cyan-600" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold text-slate-900" id="modal-title">
                      Place Your Bid
                    </h3>
                    <p className="text-sm font-semibold text-cyan-600 mt-1">{selectedItem.title}</p>
                    {bidError && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <p className="text-sm font-bold text-rose-600">{bidError}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    
                    {/* Price Context */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex justify-between items-center shadow-inner">
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Highest Bid</span>
                        <span className="text-2xl font-extrabold text-slate-900">
                          ₹{(getHighestBid(selectedItem.id)?.amount || selectedItem.basePrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Increment</span>
                        <span className="text-sm font-semibold text-slate-700">
                          ₹{(selectedItem.minIncrement || 1).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Custom Bid Input */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Your Bid Amount</label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <IndianRupee className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          required
                          min={(getHighestBid(selectedItem.id)?.amount || selectedItem.basePrice) + (selectedItem.minIncrement || 1)}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          className="block w-full pl-11 text-xl font-bold bg-white border border-slate-300 text-slate-900 rounded-xl p-4 focus:ring-cyan-500 focus:border-cyan-500 transition-colors shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Quick Bid Buttons */}
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Quick Bid Increments</span>
                      <div className="grid grid-cols-3 gap-3">
                        {[100, 500, 1000].map(inc => (
                          <button
                            key={inc}
                            type="button"
                            onClick={() => handleQuickBid(inc)}
                            className="py-2 px-3 border border-cyan-200 rounded-lg text-sm font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors"
                          >
                            +${inc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-slate-200">
                  <button type="submit" className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-[0_0_15px_rgba(147,51,234,0.3)] px-6 py-3 bg-cyan-600 text-base font-bold text-white  focus:outline-none transition-all transform hover:-translate-y-0.5 sm:ml-3 sm:w-auto">
                    Confirm Bid
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center items-center rounded-xl border border-slate-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogueSearch;

