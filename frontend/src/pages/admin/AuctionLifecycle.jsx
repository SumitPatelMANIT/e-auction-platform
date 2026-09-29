import React, { useState, useMemo } from 'react';
import { Calendar, IndianRupee, Package, Settings2, Clock, CheckCircle, Search, Filter, AlertCircle, ArrowRight, Eye } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

const AuctionLifecycle = () => {
  const { items, scheduleAuction, getHighestBid } = useAuction();
  
  const [activeTab, setActiveTab] = useState('PENDING_AUCTION');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    minIncrement: '',
  });

  const stats = useMemo(() => {
    const pending = items.filter(i => i.status === 'PENDING_AUCTION').length;
    const active = items.filter(i => i.status === 'ACTIVE').length;
    const completed = items.filter(i => i.status === 'COMPLETED').length;
    return { pending, active, completed };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.status === activeTab &&
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.seller.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, activeTab, searchTerm]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({ startDate: '', startTime: '', endDate: '', endTime: '', minIncrement: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem.auction_id) {
      alert("Error: Missing auction_id for this item.");
      return;
    }
    try {
      await scheduleAuction(selectedItem.auction_id, formData);
      alert("Auction scheduled successfully!");
      handleCloseModal();
    } catch (error) {
      alert("Failed to schedule auction: " + error.message);
    }
  };

  const tabs = [
    { id: 'PENDING_AUCTION', label: 'Awaiting Schedule', count: stats.pending, icon: Clock, color: 'amber' },
    { id: 'ACTIVE', label: 'Live Auctions', count: stats.active, icon: AlertCircle, color: 'emerald' },
    { id: 'COMPLETED', label: 'Completed', count: stats.completed, icon: CheckCircle, color: 'teal' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lifecycle Manager</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Control the end-to-end process of auction items. Review seller submissions, schedule live events, and monitor ongoing and concluded auctions.
          </p>
        </div>
        
        {/* Search */}
        <div className="w-full md:w-80 relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm"
            placeholder="Search items or sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? `bg-${tab.color}-50 border-${tab.color}-200 shadow-md ring-1 ring-${tab.color}-500/20` 
                  : 'glass-panel hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-20 pointer-events-none transition-colors duration-500 ${isActive ? `bg-${tab.color}-500` : 'bg-slate-300'}`}></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className={`p-4 rounded-2xl ${isActive ? `bg-${tab.color}-100 text-${tab.color}-600` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${isActive ? `text-${tab.color}-700` : 'text-slate-500'}`}>{tab.label}</p>
                  <p className={`text-3xl font-extrabold ${isActive ? `text-${tab.color}-900` : 'text-slate-900'}`}>{tab.count}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel overflow-hidden border border-slate-200 shadow-sm rounded-3xl">
        <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-slate-400" />
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
            {filteredItems.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details</th>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Seller</th>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {activeTab === 'ACTIVE' || activeTab === 'COMPLETED' ? 'Highest Bid' : 'Base Price'}
                </th>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status Details</th>
                <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/40 backdrop-blur-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Package className="h-10 w-10 text-slate-300" />
                      </div>
                      <p className="text-base font-bold text-slate-700">No items found</p>
                      <p className="text-sm mt-1">There are no items matching this criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const highestBid = getHighestBid(item.id);
                  const currentPrice = highestBid ? highestBid.amount : item.basePrice;

                  return (
                    <tr key={item.id} className="hover:bg-white transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-14 w-14 flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-teal-300 group-hover:shadow-md transition-all">
                            {item.imageUrl ? (
                               <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                               <Package className="h-6 w-6 text-teal-500" />
                            )}
                          </div>
                          <div className="ml-5">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 max-w-[200px]" title={item.title}>
                              {item.title}
                            </div>
                            <div className="text-xs font-medium text-slate-400 mt-0.5 font-mono">ID: {String(item.id).substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-700 bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-200">
                          {item.seller}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-lg font-extrabold text-slate-900">
                          ₹{currentPrice.toLocaleString()}
                        </div>
                        {highestBid && activeTab === 'ACTIVE' && (
                          <div className="text-xs font-bold text-teal-600 mt-1">
                            {highestBid.bidderName}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {activeTab === 'PENDING_AUCTION' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Needs Review
                          </span>
                        )}
                        {activeTab === 'ACTIVE' && (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm w-max">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse-slow"></div>
                              Live Event
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              Ends: {new Date(item.auctionEnd).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {activeTab === 'COMPLETED' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Auction Closed
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        {activeTab === 'PENDING_AUCTION' && (
                          <button
                            onClick={() => handleSelectItem(item)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                          >
                            <Settings2 className="h-4 w-4 mr-2" />
                            Schedule
                          </button>
                        )}
                        {activeTab === 'ACTIVE' && (
                          <button
                            onClick={() => alert('Monitor Dashboard Coming Soon!')}
                            className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Monitor
                          </button>
                        )}
                        {activeTab === 'COMPLETED' && (
                          <button
                            className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <IndianRupee className="h-4 w-4 mr-1" />
                            View Winner
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in-up border border-slate-200">
              
              <div className="bg-teal-50 px-8 py-6 border-b border-slate-100 flex items-center">
                 <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-teal-100 border border-teal-200 mr-4 shadow-inner">
                    <Calendar className="h-6 w-6 text-teal-600" aria-hidden="true" />
                 </div>
                 <div>
                    <h3 className="text-xl font-extrabold text-slate-900" id="modal-title">
                      Schedule Auction Event
                    </h3>
                    <p className="text-sm font-semibold text-teal-600 mt-0.5 line-clamp-1">{selectedItem.title}</p>
                 </div>
              </div>
              
              <div className="px-8 py-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex justify-between items-center shadow-inner">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Base Price</span>
                    <span className="text-xl font-extrabold text-slate-900">₹{selectedItem.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seller</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedItem.seller}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Start Time Config */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        required
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* End Time Config */}
                  <div className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        required
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="block w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Minimum Bid Increment */}
                  <div className="border-t border-slate-100 pt-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Bid Increment</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        name="minIncrement"
                        min="1"
                        required
                        placeholder="e.g., 50"
                        value={formData.minIncrement}
                        onChange={handleInputChange}
                        className="block w-full pl-11 bg-white border border-slate-300 text-slate-900 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm font-bold"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Determine the minimum jump between consecutive bids.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-slate-300 shadow-sm px-6 py-3 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-transparent shadow-[0_5px_15px_rgba(13,148,136,0.3)] px-6 py-3 bg-teal-600 text-sm font-bold text-white  transition-all transform hover:-translate-y-0.5 focus:outline-none"
                    >
                      Confirm Schedule
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionLifecycle;
