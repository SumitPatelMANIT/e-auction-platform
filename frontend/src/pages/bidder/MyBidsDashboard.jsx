import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Trophy, AlertCircle, Gavel, Package, ArrowUpRight, Activity, IndianRupee, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBidsDashboard = () => {
  const { currentUser, getUserBids, items, getHighestBid, refreshData, isLoading, registrations } = useAuction();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'PAST'
  
  const userBids = getUserBids(currentUser.id);
  
  // Get unique items the user has bid on OR registered for
  const biddedItemIds = [...new Set([
    ...userBids.map(bid => bid.itemId),
    ...items.filter(i => registrations?.includes(i.auction_id)).map(i => i.id)
  ])];
  
  const biddedItemsDetails = biddedItemIds.map(itemId => {
    const item = items.find(i => i.id === itemId);
    const highestBid = getHighestBid(itemId);
    const userItemBids = userBids.filter(b => b.itemId === itemId);
    const userHighestBid = userItemBids.length > 0 
      ? userItemBids.reduce((max, bid) => bid.amount > max.amount ? bid : max, userItemBids[0])
      : null;
      
    const isWinning = highestBid && highestBid.bidderId === currentUser.id;
    
    return {
      item,
      userHighestBid,
      highestBid,
      isWinning,
    };
  }).filter(detail => detail.item); // Remove null items

  const activeBids = biddedItemsDetails.filter(d => d.item.status === 'ACTIVE');
  const pastBids = biddedItemsDetails.filter(d => d.item.status === 'COMPLETED' || d.item.status === 'SOLD' || d.item.status === 'UNSOLD' || d.item.status === 'CLOSED');
  
  const displayBids = activeTab === 'ACTIVE' ? activeBids : pastBids;

  // Stats calculation
  const totalWinning = activeBids.filter(d => d.isWinning).length;
  const totalOutbid = activeBids.filter(d => !d.isWinning && d.userHighestBid).length;
  
  const totalPastWon = pastBids.filter(d => d.isWinning).length;
  const totalPastLost = pastBids.filter(d => !d.isWinning && d.userHighestBid).length;

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bids Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Monitor your bidding activity, track auction status, and quickly respond to outbids.</p>
        </div>
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2.5 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} aria-hidden="true" />
        </button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-teal-50 opacity-50"></div>
          <div className="p-4 bg-teal-100 rounded-2xl mr-5 relative z-10 group-hover:scale-110 transition-transform">
            <Activity className="h-8 w-8 text-teal-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{activeTab === 'ACTIVE' ? 'Active Auctions' : 'Completed Auctions'}</p>
            <p className="text-3xl font-extrabold text-slate-900">{activeTab === 'ACTIVE' ? activeBids.length : pastBids.length}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-2 border-emerald-100 bg-emerald-50/30 shadow-sm flex items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="p-4 bg-emerald-100 rounded-2xl mr-5 relative z-10 group-hover:scale-110 transition-transform">
            <Trophy className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{activeTab === 'ACTIVE' ? 'Winning Now' : 'Auctions Won'}</p>
            <p className="text-3xl font-extrabold text-emerald-700">{activeTab === 'ACTIVE' ? totalWinning : totalPastWon}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-2 border-rose-100 bg-rose-50/30 shadow-sm flex items-center relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="p-4 bg-rose-100 rounded-2xl mr-5 relative z-10 group-hover:scale-110 transition-transform">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{activeTab === 'ACTIVE' ? 'Outbid' : 'Auctions Lost'}</p>
            <p className="text-3xl font-extrabold text-rose-700">{activeTab === 'ACTIVE' ? totalOutbid : totalPastLost}</p>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="glass-panel border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        
        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 pt-4 flex space-x-8">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'ACTIVE' 
                ? 'border-teal-600 text-teal-700' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Active Bids
          </button>
          <button
            onClick={() => setActiveTab('PAST')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'PAST' 
                ? 'border-teal-600 text-teal-700' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Past Bids
          </button>
        </div>

        {displayBids.length === 0 ? (
          <div className="py-24 text-center text-slate-500 bg-white/50">
            <div className="flex flex-col items-center">
               <div className="p-6 bg-slate-100 rounded-full mb-6">
                 <Gavel className="h-12 w-12 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab.toLowerCase()} bids found.</h3>
               <p className="text-sm font-medium mb-6">Head over to the catalogue to find premium items to bid on.</p>
               <button 
                onClick={() => navigate('/bidder/catalogue')}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors"
               >
                 Browse Catalogue
                 <ArrowRight className="ml-2 h-4 w-4" />
               </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Your Highest Bid</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{activeTab === 'ACTIVE' ? 'Current Highest' : 'Final Amount'}</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Bid Status</th>
                  <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayBids.map(({ item, userHighestBid, highestBid, isWinning }) => {
                  return (
                    <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-teal-300 group-hover:shadow-md transition-all">
                            {item.imageUrl ? (
                               <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                               <Package className="h-6 w-6 text-teal-500" />
                            )}
                          </div>
                          <div className="ml-5">
                            <div className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{item.title}</div>
                            <div className="text-xs font-medium text-slate-400 mt-1">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg text-slate-900 font-extrabold">
                          {userHighestBid ? `₹${userHighestBid.amount.toLocaleString()}` : <span className="text-sm font-medium text-slate-400">Not Bidded Yet</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-base font-bold text-slate-500">
                          ₹{highestBid ? highestBid.amount.toLocaleString() : item.basePrice.toLocaleString()}
                        </div>
                        {activeTab === 'PAST' && highestBid && !isWinning && (
                          <div className="text-xs font-medium text-slate-400 mt-1">
                            Won by: <span className="text-teal-500 font-bold">{highestBid.bidderName || `Bidder #${highestBid.bidderId}`}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {isWinning && activeTab === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                            <Trophy className="mr-2 h-4 w-4 text-emerald-600" />
                            Winning
                          </span>
                        ) : isWinning && activeTab === 'PAST' ? (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-teal-100 text-teal-800 shadow-sm border border-teal-200">
                            <Trophy className="mr-2 h-4 w-4 text-teal-600" />
                            Winner
                          </span>
                        ) : !userHighestBid ? (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-blue-100 text-blue-800 shadow-sm border border-blue-200">
                            <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
                            Registered
                          </span>
                        ) : activeTab === 'PAST' ? (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800 shadow-sm border border-slate-200">
                            <AlertCircle className="mr-2 h-4 w-4 text-slate-600" />
                            Lost
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-rose-100 text-rose-800 shadow-sm border border-rose-200">
                            <AlertCircle className="mr-2 h-4 w-4 text-rose-600" />
                            Outbid
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        {activeTab === 'ACTIVE' && !isWinning ? (
                           <button 
                             onClick={() => navigate('/bidder/catalogue')}
                             className="inline-flex items-center justify-center px-4 py-2 border border-teal-200 shadow-sm text-sm font-bold rounded-xl text-teal-700 bg-white hover:bg-teal-50 hover:border-teal-300 transition-colors"
                           >
                             {userHighestBid ? 'Increase Bid' : 'Place Bid'}
                             <ArrowUpRight className="ml-2 h-4 w-4" />
                           </button>
                        ) : activeTab === 'ACTIVE' && isWinning ? (
                           <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse-slow"></div>
                             Live Now
                           </span>
                        ) : activeTab === 'PAST' && isWinning ? (
                           <span className="text-teal-600 font-extrabold text-sm uppercase tracking-wider bg-teal-50 px-4 py-2 rounded-xl border border-teal-200">
                             Won Auction
                           </span>
                        ) : (
                           <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">
                             Closed
                           </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBidsDashboard;

