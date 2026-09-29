import React, { useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Activity, Users, IndianRupee, Package, ArrowUpRight, TrendingUp, Clock, Gavel, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const SystemDashboard = () => {
  const { items, bids, dashboardStats, getHighestBid, refreshData, isLoading } = useAuction();

  // Basic Metrics from Backend
  const totalItems = items.length;
  const activeAuctions = dashboardStats?.activeAuctions || 0;
  const totalBids = dashboardStats?.totalBids || 0;
  const totalUsers = dashboardStats?.totalUsers || 0;
  const totalBidVolume = bids.reduce((acc, bid) => acc + bid.amount, 0);

  // Health Metrics (Distribution)
  const drafts = items.filter(i => i.status === 'DRAFT').length;
  const pending = dashboardStats?.pendingAuctions || 0;
  const completed = items.filter(i => i.status === 'COMPLETED').length;
  
  const draftPct = totalItems ? Math.round((drafts / totalItems) * 100) : 0;
  const pendingPct = totalItems ? Math.round((pending / totalItems) * 100) : 0;
  const activePct = totalItems ? Math.round((activeAuctions / totalItems) * 100) : 0;
  const completedPct = totalItems ? Math.round((completed / totalItems) * 100) : 0;

  // Top Auctions Leaderboard (Highest current bid or base price if active)
  const topAuctions = useMemo(() => {
    return items
      .filter(i => i.status === 'ACTIVE')
      .map(item => {
        const highestBid = getHighestBid(item.id);
        const currentPrice = highestBid ? highestBid.amount : item.basePrice;
        const totalItemBids = bids.filter(b => b.itemId === item.id).length;
        return { ...item, currentPrice, totalItemBids };
      })
      .sort((a, b) => b.currentPrice - a.currentPrice)
      .slice(0, 4);
  }, [items, bids, getHighestBid]);

  // Executive Metric Cards
  const stats = [
    { 
      name: 'Total Registered Users', 
      stat: totalUsers, 
      trend: '+12.5%',
      trendUp: true,
      icon: Package, 
      color: 'teal',
      gradient: 'bg-teal-500'
    },
    { 
      name: 'Live Auctions', 
      stat: activeAuctions, 
      trend: '+5.2%',
      trendUp: true,
      icon: Activity, 
      color: 'emerald',
      gradient: 'bg-emerald-400'
    },
    { 
      name: 'Total Bids Placed', 
      stat: totalBids, 
      trend: '+18.1%',
      trendUp: true,
      icon: Users, 
      color: 'pink',
      gradient: 'bg-pink-500'
    },
    { 
      name: 'Total Bid Volume', 
      stat: `₹${totalBidVolume.toLocaleString()}`, 
      trend: '+24.3%',
      trendUp: true,
      icon: IndianRupee, 
      color: 'amber',
      gradient: 'bg-amber-400'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <TrendingUp className="h-8 w-8 mr-3 text-teal-600" />
            Executive Dashboard
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
            Real-time analytics and global overview of platform health, auction performance, and bidding activity.
          </p>
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

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <div 
            key={item.name} 
            className="glass-panel overflow-hidden relative group p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${item.color}-200 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none`}></div>
            
            <div className="flex justify-between items-start relative z-10 mb-4">
              <div className={`p-3 ${item.gradient} rounded-2xl shadow-lg text-white`}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{item.name}</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{item.stat}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Spans 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Auction Health Widget */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center mb-6">
                <Activity className="h-5 w-5 mr-2 text-teal-500" />
                Global Platform Health
              </h3>
              
              <div className="mb-4 flex justify-between items-end text-sm">
                <span className="font-bold text-slate-700">Inventory Distribution</span>
                <span className="font-semibold text-slate-500">{totalItems} Total Items</span>
              </div>
              
              {/* CSS Progress Bar */}
              <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {draftPct > 0 && <div style={{ width: `${draftPct}%` }} className="bg-slate-400 transition-all duration-1000" title={`Drafts: ${draftPct}%`}></div>}
                {pendingPct > 0 && <div style={{ width: `${pendingPct}%` }} className="bg-amber-400 transition-all duration-1000 border-l border-white/20" title={`Pending: ${pendingPct}%`}></div>}
                {activePct > 0 && <div style={{ width: `${activePct}%` }} className="bg-emerald-500 transition-all duration-1000 border-l border-white/20" title={`Active: ${activePct}%`}></div>}
                {completedPct > 0 && <div style={{ width: `${completedPct}%` }} className="bg-teal-500 transition-all duration-1000 border-l border-white/20" title={`Completed: ${completedPct}%`}></div>}
              </div>
              
              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span>
                    Drafts
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">{drafts}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <div className="flex items-center text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2"></span>
                    Pending
                  </div>
                  <div className="text-lg font-extrabold text-amber-900">{pending}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <div className="flex items-center text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                    Active
                  </div>
                  <div className="text-lg font-extrabold text-emerald-900">{activeAuctions}</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                  <div className="flex items-center text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></span>
                    Completed
                  </div>
                  <div className="text-lg font-extrabold text-teal-900">{completed}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 bg-white/50 flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-teal-500" />
                Live Bid Activity
              </h3>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse-slow"></div>
                Real-time
              </span>
            </div>
            
            <div className="p-8 flex-grow">
              {bids.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <Gavel className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No bidding activity yet.</p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {bids.slice().reverse().slice(0, 6).map((bid, bidIdx) => {
                      const item = items.find(i => i.id === bid.itemId);
                      const isLast = bidIdx === Math.min(bids.length, 6) - 1;
                      
                      return (
                        <li key={bid.id}>
                          <div className="relative pb-8">
                            {!isLast ? (
                              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex items-start space-x-4">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center ring-4 ring-white shadow-sm z-10">
                                  <span className="text-teal-700 font-bold text-sm">
                                    {bid.bidderName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm font-bold text-slate-900">
                                    {bid.bidderName}
                                  </p>
                                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                                    {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Placed a bid of <span className="font-extrabold text-emerald-600">₹{bid.amount.toLocaleString()}</span> on
                                </p>
                                <p className="text-sm font-semibold text-teal-600 truncate mt-1">{item?.title || 'Unknown Item'}</p>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                View All Activity &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Spans 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Top Auctions Leaderboard */}
          <div className="glass-panel rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-6 border-b border-slate-100 bg-white/50">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-teal-500" />
                Top Active Auctions
              </h3>
            </div>
            
            <div className="flex-grow p-6 space-y-6 bg-slate-50/50">
              {topAuctions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pt-8">
                  <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No active auctions to display.</p>
                </div>
              ) : (
                topAuctions.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors group">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-teal-300 bg-teal-50">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">{item.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{item.totalItemBids} Bids Placed</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end pt-3 border-t border-slate-50">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Value</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{item.currentPrice.toLocaleString()}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        Rank #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
              <Link 
                to="/admin/lifecycle" 
                className="w-full inline-flex justify-center items-center px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-bold rounded-xl transition-colors"
              >
                Manage All Items
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;
